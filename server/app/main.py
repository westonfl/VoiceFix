from pathlib import Path
from collections import defaultdict, deque
import hmac
import json
import logging
import os
import shutil
import tempfile
import time
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .analyzer import analyze_samples
from .audio import AudioDecodeError, decode_audio
from .chat import (
    ChatServiceUnavailable,
    generate_chat_reply,
    generate_chat_reply_stream,
    require_nvidia_api_key,
)
from .models import ChatRequest, ChatResponse, DrillId, Language, MonthOneAnalysisResponse, TakeKind


logger = logging.getLogger("uvicorn.error")
app = FastAPI(title="Rehear Analysis Server", version="0.1.0")
MAX_AUDIO_BYTES = int(os.getenv("MAX_AUDIO_BYTES", str(10 * 1024 * 1024)))
RATE_LIMIT_PER_MINUTE = int(os.getenv("RATE_LIMIT_PER_MINUTE", "60"))
REHEAR_API_KEY = os.getenv("REHEAR_API_KEY", "").strip()
ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv(
        "ALLOWED_ORIGINS",
        "http://localhost:8081,http://127.0.0.1:8081",
    ).split(",")
    if origin.strip()
]
request_times: dict[str, deque[float]] = defaultdict(deque)
SUPPORTED_DRILLS = [
    "sustained_hiss",
    "gentle_hum",
    "soft_hum_start",
    "mmm_resonance",
    "fah_vah_resonance",
    "hum_to_ah",
    "short_tone_hold",
]
LEGACY_DRILL_ALIASES = ["soft_hiss", "resonance_vowel", "short_tone"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def client_identifier(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for", "").split(",", 1)[0].strip()
    if forwarded:
        return forwarded
    return request.client.host if request.client else "unknown"


@app.middleware("http")
async def protect_api(request: Request, call_next):
    if not request.url.path.startswith("/api/"):
        return await call_next(request)

    if REHEAR_API_KEY and not hmac.compare_digest(
        request.headers.get("x-rehear-api-key", ""), REHEAR_API_KEY
    ):
        return JSONResponse(status_code=401, content={"detail": "Unauthorized"})

    now = time.monotonic()
    key = client_identifier(request)
    timestamps = request_times[key]
    while timestamps and timestamps[0] <= now - 60:
        timestamps.popleft()
    if len(timestamps) >= RATE_LIMIT_PER_MINUTE:
        return JSONResponse(
            status_code=429,
            content={"detail": "Too many requests. Try again shortly."},
            headers={"Retry-After": "60"},
        )
    timestamps.append(now)

    return await call_next(request)


def json_response_with_cors(status_code: int, content: dict[str, object]) -> JSONResponse:
    response = JSONResponse(status_code=status_code, content=content)
    return response


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning("validation_error path=%s errors=%s", request.url.path, exc.errors())
    return json_response_with_cors(status_code=422, content={"detail": exc.errors(), "supportedDrills": SUPPORTED_DRILLS, "legacyAliases": LEGACY_DRILL_ALIASES})


@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException) -> JSONResponse:
    logger.warning("http_error path=%s status=%s detail=%s", request.url.path, exc.status_code, exc.detail)
    return json_response_with_cors(status_code=exc.status_code, content={"detail": exc.detail, "supportedDrills": SUPPORTED_DRILLS, "legacyAliases": LEGACY_DRILL_ALIASES})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    logger.exception("server_error path=%s", request.url.path)
    return json_response_with_cors(
        status_code=500,
        content={"detail": "Internal server error. Check Railway logs for server_error.", "supportedDrills": SUPPORTED_DRILLS, "legacyAliases": LEGACY_DRILL_ALIASES},
    )


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "rehear-analysis-server",
        "version": app.version,
        "supportedDrills": SUPPORTED_DRILLS,
        "legacyAliases": LEGACY_DRILL_ALIASES,
        "ffmpegAvailable": shutil.which("ffmpeg") is not None,
    }


@app.post("/api/chat", response_model=ChatResponse)
async def coach_chat(request: ChatRequest) -> ChatResponse:
    try:
        return await generate_chat_reply(request)
    except ChatServiceUnavailable as exc:
        logger.warning("chat_unavailable detail=%s", exc)
        raise HTTPException(status_code=503, detail="Coach service unavailable. Try again later.") from exc


@app.post("/api/chat/stream")
async def coach_chat_stream(request: ChatRequest) -> StreamingResponse:
    try:
        require_nvidia_api_key()
    except ChatServiceUnavailable as exc:
        logger.warning("chat_stream_unavailable detail=%s", exc)
        raise HTTPException(status_code=503, detail="Coach service unavailable. Try again later.") from exc

    async def event_stream():
        # Flush headers immediately so clients and proxies know the SSE request is alive.
        yield ": connected\n\n"
        try:
            async for delta in generate_chat_reply_stream(request):
                yield f"data: {json.dumps({'delta': delta})}\n\n"
            yield f"data: {json.dumps({'done': True})}\n\n"
        except ChatServiceUnavailable as exc:
            logger.warning("chat_stream_unavailable detail=%s", exc)
            yield f"data: {json.dumps({'error': 'Coach service unavailable. Try again later.'})}\n\n"

    return StreamingResponse(
        event_stream(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )


@app.post("/api/month-one/analyze", response_model=MonthOneAnalysisResponse)
async def analyze_month_one(
    audio: Annotated[UploadFile, File()],
    drill_id: Annotated[DrillId, Form()],
    language: Annotated[Language, Form()] = "en",
    take_kind: Annotated[TakeKind, Form()] = "first",
    previous_metrics_json: Annotated[str | None, Form()] = None,
) -> MonthOneAnalysisResponse:
    suffix = Path(audio.filename or "take.audio").suffix or ".audio"

    with tempfile.NamedTemporaryFile(suffix=suffix, delete=True) as temp_file:
        audio_bytes = await audio.read(MAX_AUDIO_BYTES + 1)
        if len(audio_bytes) > MAX_AUDIO_BYTES:
            raise HTTPException(
                status_code=413,
                detail=f"Audio file exceeds the {MAX_AUDIO_BYTES // (1024 * 1024)} MB limit.",
            )
        temp_file.write(audio_bytes)
        temp_file.flush()

        try:
            samples = decode_audio(Path(temp_file.name))
        except AudioDecodeError as exc:
            raise HTTPException(status_code=422, detail=str(exc)) from exc

    response = analyze_samples(
        samples=samples,
        drill_id=drill_id,
        language=language,
        previous_metrics_json=previous_metrics_json if take_kind == "retry" else None,
    )

    logger.info(
        "analysis_response drill=%s take=%s language=%s quality=%s duration=%.2fs steadiness=%.2f fade=%.2f resonance=%.2f forward=%.2f throat=%.2f pitch=%s feedback=%r comparison=%r safety=%s",
        response.drillId,
        take_kind,
        language,
        response.quality,
        response.metrics.durationSec,
        response.metrics.loudnessSteadiness,
        response.metrics.fadeAmount,
        response.metrics.resonanceScore,
        response.metrics.forwardEnergyRatio,
        response.metrics.throatEnergyRatio,
        None if response.metrics.pitchStability is None else round(response.metrics.pitchStability, 2),
        response.feedback.oneThingToTry,
        None if response.comparison is None else response.comparison.summary,
        ",".join(response.safetyFlags),
    )

    return response

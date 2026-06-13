from pathlib import Path
import logging
import shutil
import tempfile
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.exceptions import HTTPException as StarletteHTTPException

from .analyzer import analyze_samples
from .audio import AudioDecodeError, decode_audio
from .models import DrillId, Language, MonthOneAnalysisResponse, TakeKind


logger = logging.getLogger("uvicorn.error")
app = FastAPI(title="VoiceFix Analysis Server", version="0.1.0")
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
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


def json_response_with_cors(status_code: int, content: dict[str, object]) -> JSONResponse:
    response = JSONResponse(status_code=status_code, content=content)
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "*"
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
        "service": "voicefix-analysis-server",
        "version": app.version,
        "supportedDrills": SUPPORTED_DRILLS,
        "legacyAliases": LEGACY_DRILL_ALIASES,
        "ffmpegAvailable": shutil.which("ffmpeg") is not None,
    }


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
        temp_file.write(await audio.read())
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

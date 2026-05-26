from pathlib import Path
import logging
import tempfile
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from .analyzer import analyze_samples
from .audio import AudioDecodeError, decode_audio
from .models import DrillId, Language, MonthOneAnalysisResponse, TakeKind


logger = logging.getLogger("uvicorn.error")
app = FastAPI(title="VoiceFix Analysis Server", version="0.1.0")
SUPPORTED_DRILLS = ["soft_hiss", "gentle_hum", "mmm_resonance", "hum_to_ah", "short_tone", "resonance_vowel"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError) -> JSONResponse:
    logger.warning("validation_error path=%s errors=%s", request.url.path, exc.errors())
    return JSONResponse(status_code=422, content={"detail": exc.errors(), "supportedDrills": SUPPORTED_DRILLS})


@app.get("/health")
def health() -> dict[str, object]:
    return {
        "status": "ok",
        "service": "voicefix-analysis-server",
        "version": app.version,
        "supportedDrills": SUPPORTED_DRILLS,
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

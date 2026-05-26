from pathlib import Path
import logging
import tempfile
from typing import Annotated

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from .analyzer import analyze_samples
from .audio import AudioDecodeError, decode_audio
from .models import DrillId, Language, MonthOneAnalysisResponse, TakeKind


logger = logging.getLogger("uvicorn.error")
app = FastAPI(title="VoiceFix Analysis Server", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "voicefix-analysis-server"}


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

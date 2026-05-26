from typing import Literal

from pydantic import BaseModel, Field


DrillId = Literal["soft_hiss", "gentle_hum", "mmm_resonance", "hum_to_ah", "short_tone", "resonance_vowel"]
Language = Literal["en", "ko"]
TakeKind = Literal["first", "retry"]
Quality = Literal["usable", "too_short", "too_quiet", "clipped", "noisy", "unsupported"]


class MonthOneMetrics(BaseModel):
    durationSec: float = Field(ge=0)
    rmsDb: float
    loudnessSteadiness: float = Field(ge=0, le=1)
    fadeAmount: float = Field(ge=0, le=1)
    clippingRatio: float = Field(ge=0, le=1)
    silenceRatio: float = Field(ge=0, le=1)
    pitchStability: float | None = Field(default=None, ge=0, le=1)
    spectralCentroid: float = Field(ge=0)
    brightness: float = Field(ge=0, le=1)
    harmonicClarity: float = Field(ge=0, le=1)
    onsetAbruptness: float = Field(ge=0, le=1)
    burstRatio: float = Field(ge=0)
    resonanceScore: float = Field(ge=0, le=1)
    resonanceStability: float = Field(ge=0, le=1)
    forwardEnergyRatio: float = Field(ge=0, le=1)
    throatEnergyRatio: float = Field(ge=0, le=1)
    humToVowelContinuity: float | None = Field(default=None, ge=0, le=1)


class Feedback(BaseModel):
    whatWeHeard: str
    whatItOftenMeans: str
    oneThingToTry: str
    retryGoal: str


class Comparison(BaseModel):
    summary: str
    improved: bool
    changedMetrics: dict[str, float]


class MonthOneAnalysisResponse(BaseModel):
    drillId: DrillId
    quality: Quality
    metrics: MonthOneMetrics
    feedback: Feedback
    comparison: Comparison | None = None
    safetyFlags: list[str]

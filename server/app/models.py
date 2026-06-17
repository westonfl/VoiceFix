from typing import Literal

from pydantic import BaseModel, Field


DrillId = Literal[
    "sustained_hiss",
    "gentle_hum",
    "soft_hum_start",
    "mmm_resonance",
    "fah_vah_resonance",
    "hum_to_ah",
    "short_tone_hold",
    # Compatibility aliases for older mobile builds and manual tests.
    "soft_hiss",
    "resonance_vowel",
    "short_tone",
]
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


ChatRole = Literal["user", "assistant"]


class ChatMessage(BaseModel):
    role: ChatRole
    content: str = Field(min_length=1, max_length=2400)


class ChatContext(BaseModel):
    currentWeekNumber: int | None = Field(default=None, ge=1, le=12)
    currentDayNumber: int | None = Field(default=None, ge=1, le=7)
    currentExerciseTitle: str | None = Field(default=None, max_length=120)


class ChatRequest(BaseModel):
    language: str = Field(default="en", min_length=2, max_length=16)
    messages: list[ChatMessage] = Field(min_length=1, max_length=16)
    context: ChatContext | None = None


class ChatResponse(BaseModel):
    reply: str
    model: str

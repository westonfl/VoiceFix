from .features import classify_quality, extract_metrics
from .feedback import build_comparison, build_feedback, safety_flags
from .models import DrillId, Language, MonthOneAnalysisResponse


DRILL_ALIASES: dict[str, DrillId] = {
    "soft_hiss": "sustained_hiss",
    "resonance_vowel": "fah_vah_resonance",
    "short_tone": "short_tone_hold",
}


def canonical_drill_id(drill_id: DrillId) -> DrillId:
    return DRILL_ALIASES.get(drill_id, drill_id)  # type: ignore[return-value]


def analyze_samples(
    samples,
    drill_id: DrillId,
    language: Language,
    previous_metrics_json: str | None = None,
) -> MonthOneAnalysisResponse:
    canonical_drill = canonical_drill_id(drill_id)
    metrics = extract_metrics(samples)
    quality = classify_quality(metrics)
    feedback = build_feedback(canonical_drill, metrics, quality, language)
    comparison = build_comparison(previous_metrics_json, metrics, language)

    return MonthOneAnalysisResponse(
        drillId=canonical_drill,
        quality=quality,
        metrics=metrics,
        feedback=feedback,
        comparison=comparison,
        safetyFlags=safety_flags(metrics, quality),
    )

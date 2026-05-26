from .features import classify_quality, extract_metrics
from .feedback import build_comparison, build_feedback, safety_flags
from .models import DrillId, Language, MonthOneAnalysisResponse


def analyze_samples(
    samples,
    drill_id: DrillId,
    language: Language,
    previous_metrics_json: str | None = None,
) -> MonthOneAnalysisResponse:
    metrics = extract_metrics(samples)
    quality = classify_quality(metrics)
    feedback = build_feedback(drill_id, metrics, quality, language)
    comparison = build_comparison(previous_metrics_json, metrics, language)

    return MonthOneAnalysisResponse(
        drillId=drill_id,
        quality=quality,
        metrics=metrics,
        feedback=feedback,
        comparison=comparison,
        safetyFlags=safety_flags(metrics, quality),
    )

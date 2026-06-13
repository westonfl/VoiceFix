import numpy as np

from app.audio import SAMPLE_RATE
from app.analyzer import analyze_samples
from app.features import classify_quality, extract_metrics


def tone(duration: float = 3.0, frequency: float = 180.0, amplitude: float = 0.18) -> np.ndarray:
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)
    return (amplitude * np.sin(2 * np.pi * frequency * t)).astype(np.float32)


def harmonic_tone(duration: float, partials: list[tuple[float, float]]) -> np.ndarray:
    t = np.linspace(0, duration, int(SAMPLE_RATE * duration), endpoint=False)
    samples = np.zeros_like(t)
    for frequency, amplitude in partials:
        samples += amplitude * np.sin(2 * np.pi * frequency * t)
    return samples.astype(np.float32)


def test_silence_is_too_quiet():
    samples = np.zeros(SAMPLE_RATE * 3, dtype=np.float32)
    metrics = extract_metrics(samples)

    assert classify_quality(metrics) == "too_quiet"


def test_short_clip_is_too_short():
    samples = tone(duration=0.5)
    metrics = extract_metrics(samples)

    assert classify_quality(metrics) == "too_short"


def test_clipped_clip_is_flagged():
    samples = np.clip(tone(duration=3.0, amplitude=2.0), -1.0, 1.0)
    metrics = extract_metrics(samples)

    assert classify_quality(metrics) == "clipped"


def test_stable_hum_has_pitch_stability():
    samples = tone(duration=3.0)
    metrics = extract_metrics(samples)

    assert metrics.pitchStability is not None
    assert metrics.pitchStability > 0.7


def test_resonant_hum_scores_higher_than_low_heavy_hum():
    low_heavy = harmonic_tone(3.0, [(160, 0.22), (320, 0.06), (640, 0.02)])
    resonant = harmonic_tone(3.0, [(160, 0.12), (640, 0.08), (1280, 0.08), (2080, 0.05)])

    low_metrics = extract_metrics(low_heavy)
    resonant_metrics = extract_metrics(resonant)

    assert resonant_metrics.resonanceScore > low_metrics.resonanceScore
    assert resonant_metrics.forwardEnergyRatio > low_metrics.forwardEnergyRatio
    assert low_metrics.throatEnergyRatio > resonant_metrics.throatEnergyRatio


def test_hum_to_vowel_continuity_detects_spectral_shift():
    hum = harmonic_tone(1.5, [(180, 0.12), (720, 0.08), (1440, 0.08)])
    open_vowel_shift = harmonic_tone(1.5, [(180, 0.2), (360, 0.06), (520, 0.02)])
    samples = np.concatenate([hum, open_vowel_shift])

    metrics = extract_metrics(samples)

    assert metrics.humToVowelContinuity is not None
    assert metrics.humToVowelContinuity < 0.8


def test_fading_hiss_feedback_mentions_ending():
    rng = np.random.default_rng(seed=12)
    samples = rng.normal(0, 0.12, SAMPLE_RATE * 4).astype(np.float32)
    samples *= np.linspace(1.0, 0.12, samples.size).astype(np.float32)

    response = analyze_samples(samples, "sustained_hiss", "en")

    assert response.quality == "usable"
    assert "end" in response.feedback.retryGoal.lower() or "faded" in response.feedback.whatWeHeard.lower()


def test_retry_comparison_uses_previous_metrics():
    first = extract_metrics(tone(duration=3.0, amplitude=0.18) * np.linspace(1.0, 0.3, SAMPLE_RATE * 3))
    retry = tone(duration=3.0, amplitude=0.15)

    response = analyze_samples(retry, "gentle_hum", "en", previous_metrics_json=first.model_dump_json())

    assert response.comparison is not None
    assert "loudnessSteadinessDelta" in response.comparison.changedMetrics
    assert "resonanceScoreDelta" in response.comparison.changedMetrics

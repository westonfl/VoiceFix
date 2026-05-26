import math

import librosa
import numpy as np

from .audio import SAMPLE_RATE
from .models import MonthOneMetrics, Quality


FRAME_LENGTH = 1024
HOP_LENGTH = 256
EPS = 1e-8


def _clamp(value: float, low: float = 0.0, high: float = 1.0) -> float:
    return max(low, min(high, value))


def _safe_rms_db(rms: float) -> float:
    return 20 * math.log10(max(rms, EPS))


def _frame_rms(samples: np.ndarray) -> np.ndarray:
    if samples.size < FRAME_LENGTH:
        return np.array([float(np.sqrt(np.mean(np.square(samples))) if samples.size else 0.0)])

    return librosa.feature.rms(y=samples, frame_length=FRAME_LENGTH, hop_length=HOP_LENGTH)[0]


def _active_rms(frame_rms: np.ndarray) -> np.ndarray:
    if frame_rms.size == 0:
        return frame_rms

    threshold = max(float(np.max(frame_rms)) * 0.12, 0.002)
    active = frame_rms[frame_rms >= threshold]
    return active if active.size else frame_rms


def _steadiness(active: np.ndarray) -> float:
    if active.size < 2:
        return 0.0

    coeff_var = float(np.std(active) / max(np.mean(active), EPS))
    return _clamp(1.0 - coeff_var)


def _fade_amount(active: np.ndarray) -> float:
    if active.size < 4:
        return 0.0

    segment = max(1, active.size // 4)
    start = float(np.mean(active[:segment]))
    end = float(np.mean(active[-segment:]))
    if start <= EPS:
        return 0.0

    return _clamp((start - end) / start)


def _onset_abruptness(active: np.ndarray) -> float:
    if active.size < 4:
        return 0.0

    peak = float(np.max(active))
    early = float(np.max(active[: max(2, active.size // 6)]))
    median = float(np.median(active))
    if peak <= EPS:
        return 0.0

    return _clamp((early - median) / peak)


def _burst_ratio(active: np.ndarray) -> float:
    if active.size < 4:
        return 1.0

    early = float(np.mean(active[: max(2, active.size // 6)]))
    median = float(np.median(active))
    return max(0.0, early / max(median, EPS))


def _pitch_stability(samples: np.ndarray) -> float | None:
    if samples.size < SAMPLE_RATE:
        return None

    try:
        pitch = librosa.yin(samples, fmin=70, fmax=700, sr=SAMPLE_RATE, frame_length=FRAME_LENGTH, hop_length=HOP_LENGTH)
    except Exception:
        return None

    pitch = pitch[np.isfinite(pitch)]
    pitch = pitch[(pitch >= 70) & (pitch <= 700)]
    if pitch.size < 5:
        return None

    median_pitch = float(np.median(pitch))
    cents = 1200 * np.log2(pitch / max(median_pitch, EPS))
    spread = float(np.std(cents))
    return _clamp(1.0 - spread / 150.0)


def _spectral_band_features(samples: np.ndarray) -> tuple[float, float, float, float | None]:
    spectrum = np.abs(librosa.stft(samples, n_fft=FRAME_LENGTH, hop_length=HOP_LENGTH)) ** 2
    if spectrum.size == 0:
        return 0.0, 0.0, 0.0, None

    freqs = librosa.fft_frequencies(sr=SAMPLE_RATE, n_fft=FRAME_LENGTH)
    total_energy_by_frame = np.sum(spectrum, axis=0) + EPS
    active_frames = total_energy_by_frame > max(float(np.max(total_energy_by_frame)) * 0.08, EPS)
    if np.any(active_frames):
        spectrum = spectrum[:, active_frames]
        total_energy_by_frame = total_energy_by_frame[active_frames]

    def band_ratio(low: float, high: float) -> np.ndarray:
        band = (freqs >= low) & (freqs < high)
        return np.sum(spectrum[band, :], axis=0) / total_energy_by_frame

    throat_band = band_ratio(80, 450)
    resonance_band = band_ratio(450, 2500)
    forward_band = band_ratio(1200, 3200)
    harsh_band = band_ratio(3200, 7600)

    forward_ratio = _clamp(float(np.mean(forward_band)))
    throat_ratio = _clamp(float(np.mean(throat_band)))
    resonance_ratio = _clamp(float(np.mean(resonance_band)))
    harsh_ratio = _clamp(float(np.mean(harsh_band)))

    resonance_stability = _clamp(1.0 - float(np.std(resonance_band) / max(np.mean(resonance_band), EPS)))
    balanced_forward = _clamp(forward_ratio / 0.22)
    low_throat_penalty = _clamp(1.0 - throat_ratio / 0.55)
    harsh_penalty = _clamp(1.0 - harsh_ratio / 0.18)
    resonance_score = _clamp(
        0.36 * resonance_ratio / 0.55
        + 0.26 * resonance_stability
        + 0.22 * balanced_forward
        + 0.16 * min(low_throat_penalty, harsh_penalty)
    )

    continuity = None
    if resonance_band.size >= 8:
        midpoint = resonance_band.size // 2
        early = float(np.mean(resonance_band[:midpoint]))
        late = float(np.mean(resonance_band[midpoint:]))
        continuity = _clamp(1.0 - abs(late - early) / max(early, late, EPS))

    return resonance_score, resonance_stability, forward_ratio, throat_ratio, continuity


def extract_metrics(samples: np.ndarray) -> MonthOneMetrics:
    duration_sec = float(samples.size / SAMPLE_RATE)
    rms = float(np.sqrt(np.mean(np.square(samples))) if samples.size else 0.0)
    frame_rms = _frame_rms(samples)
    active = _active_rms(frame_rms)

    centroid = librosa.feature.spectral_centroid(y=samples, sr=SAMPLE_RATE, n_fft=FRAME_LENGTH, hop_length=HOP_LENGTH)[0]
    centroid_mean = float(np.mean(centroid)) if centroid.size else 0.0
    brightness = _clamp(centroid_mean / 5000.0)

    flatness = librosa.feature.spectral_flatness(y=samples, n_fft=FRAME_LENGTH, hop_length=HOP_LENGTH)[0]
    harmonic_clarity = _clamp(1.0 - float(np.mean(flatness)) * 4.0) if flatness.size else 0.0
    resonance_score, resonance_stability, forward_ratio, throat_ratio, continuity = _spectral_band_features(samples)

    silence_threshold = max(float(np.max(frame_rms)) * 0.08 if frame_rms.size else 0.0, 0.0015)
    silence_ratio = float(np.mean(frame_rms < silence_threshold)) if frame_rms.size else 1.0

    return MonthOneMetrics(
        durationSec=round(duration_sec, 3),
        rmsDb=round(_safe_rms_db(rms), 3),
        loudnessSteadiness=round(_steadiness(active), 3),
        fadeAmount=round(_fade_amount(active), 3),
        clippingRatio=round(float(np.mean(np.abs(samples) >= 0.98)) if samples.size else 0.0, 5),
        silenceRatio=round(_clamp(silence_ratio), 3),
        pitchStability=_pitch_stability(samples),
        spectralCentroid=round(centroid_mean, 3),
        brightness=round(brightness, 3),
        harmonicClarity=round(harmonic_clarity, 3),
        onsetAbruptness=round(_onset_abruptness(active), 3),
        burstRatio=round(_burst_ratio(active), 3),
        resonanceScore=round(resonance_score, 3),
        resonanceStability=round(resonance_stability, 3),
        forwardEnergyRatio=round(forward_ratio, 3),
        throatEnergyRatio=round(throat_ratio, 3),
        humToVowelContinuity=None if continuity is None else round(continuity, 3),
    )


def classify_quality(metrics: MonthOneMetrics) -> Quality:
    if metrics.durationSec < 1.0:
        return "too_short"

    if metrics.rmsDb < -46:
        return "too_quiet"

    if metrics.clippingRatio > 0.02:
        return "clipped"

    if metrics.silenceRatio > 0.72:
        return "noisy"

    return "usable"

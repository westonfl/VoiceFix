import io

import numpy as np
from fastapi.testclient import TestClient
from scipy.io import wavfile

from app.audio import SAMPLE_RATE
from app.main import app


client = TestClient(app)


def wav_bytes(samples: np.ndarray) -> bytes:
    buffer = io.BytesIO()
    wavfile.write(buffer, SAMPLE_RATE, samples.astype(np.float32))
    buffer.seek(0)
    return buffer.read()


def test_health():
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json()["status"] == "ok"


def test_month_one_analyze_accepts_wav():
    t = np.linspace(0, 3.0, SAMPLE_RATE * 3, endpoint=False)
    samples = 0.15 * np.sin(2 * np.pi * 180 * t)

    response = client.post(
        "/api/month-one/analyze",
        data={"drill_id": "gentle_hum", "language": "en", "take_kind": "first"},
        files={"audio": ("hum.wav", wav_bytes(samples), "audio/wav")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["drillId"] == "gentle_hum"
    assert "metrics" in body
    assert "feedback" in body


def test_resonance_vowel_drill_is_supported():
    t = np.linspace(0, 3.0, SAMPLE_RATE * 3, endpoint=False)
    samples = 0.12 * np.sin(2 * np.pi * 180 * t) + 0.08 * np.sin(2 * np.pi * 1440 * t)

    response = client.post(
        "/api/month-one/analyze",
        data={"drill_id": "resonance_vowel", "language": "en", "take_kind": "first"},
        files={"audio": ("vah.wav", wav_bytes(samples), "audio/wav")},
    )

    assert response.status_code == 200
    assert response.json()["drillId"] == "resonance_vowel"


def test_unsupported_drill_is_rejected():
    samples = np.zeros(SAMPLE_RATE * 2, dtype=np.float32)

    response = client.post(
        "/api/month-one/analyze",
        data={"drill_id": "not_a_drill", "language": "en", "take_kind": "first"},
        files={"audio": ("empty.wav", wav_bytes(samples), "audio/wav")},
    )

    assert response.status_code == 422


def test_missing_audio_is_rejected():
    response = client.post(
        "/api/month-one/analyze",
        data={"drill_id": "soft_hiss", "language": "en", "take_kind": "first"},
    )

    assert response.status_code == 422


def test_too_short_audio_returns_structured_quality():
    samples = np.zeros(int(SAMPLE_RATE * 0.4), dtype=np.float32)

    response = client.post(
        "/api/month-one/analyze",
        data={"drill_id": "soft_hiss", "language": "en", "take_kind": "first"},
        files={"audio": ("short.wav", wav_bytes(samples), "audio/wav")},
    )

    assert response.status_code == 200
    assert response.json()["quality"] == "too_short"

import io
import json

import numpy as np
from fastapi.testclient import TestClient
from scipy.io import wavfile

from app import chat as chat_module
from app import main as main_module
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


def test_api_key_is_required_when_configured(monkeypatch):
    monkeypatch.setattr(main_module, "REHEAR_API_KEY", "test-client-key")

    unauthorized = client.post(
        "/api/chat",
        json={"messages": [{"role": "user", "content": "Help"}]},
    )
    authorized = client.post(
        "/api/chat",
        headers={"X-Rehear-API-Key": "test-client-key"},
        json={"messages": [{"role": "user", "content": "Help"}]},
    )

    assert unauthorized.status_code == 401
    assert authorized.status_code == 503


def test_api_rate_limit(monkeypatch):
    monkeypatch.setattr(main_module, "RATE_LIMIT_PER_MINUTE", 1)
    headers = {"X-Forwarded-For": "rate-limit-test"}

    first = client.post(
        "/api/chat",
        headers=headers,
        json={"messages": [{"role": "user", "content": "Help"}]},
    )
    limited = client.post(
        "/api/chat",
        headers=headers,
        json={"messages": [{"role": "user", "content": "Help again"}]},
    )

    assert first.status_code == 503
    assert limited.status_code == 429
    assert limited.headers["retry-after"] == "60"


def test_chat_rejects_empty_messages():
    response = client.post(
        "/api/chat",
        json={"language": "en", "messages": []},
    )

    assert response.status_code == 422


def test_chat_requires_nvidia_api_key(monkeypatch):
    monkeypatch.delenv("NVIDIA_API_KEY", raising=False)

    response = client.post(
        "/api/chat",
        json={
            "language": "en",
            "messages": [{"role": "user", "content": "How do I keep a hiss steady?"}],
        },
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "Coach service unavailable. Try again later."


def test_chat_returns_mocked_nvidia_reply(monkeypatch):
    seen: dict[str, object] = {}

    async def fake_completion(payload: dict[str, object], api_key: str) -> dict[str, object]:
        seen["payload"] = payload
        seen["api_key"] = api_key
        return {"choices": [{"message": {"content": "Try a smaller hiss and stop before squeezing."}}]}

    monkeypatch.setenv("NVIDIA_API_KEY", "test-key")
    monkeypatch.setattr(chat_module, "request_nvidia_completion", fake_completion)

    response = client.post(
        "/api/chat",
        json={
            "language": "en",
            "messages": [{"role": "user", "content": "How do I keep a hiss steady?"}],
            "context": {
                "currentWeekNumber": 1,
                "currentDayNumber": 1,
                "currentExerciseTitle": "Soft hiss baseline",
            },
        },
    )

    assert response.status_code == 200
    assert response.json() == {
        "reply": "Try a smaller hiss and stop before squeezing.",
        "model": "nvidia/nemotron-3-super-120b-a12b",
    }
    assert seen["api_key"] == "test-key"
    payload = seen["payload"]
    assert isinstance(payload, dict)
    assert payload["model"] == "nvidia/nemotron-3-super-120b-a12b"
    assert payload["max_tokens"] == 320
    assert payload["stream"] is False
    assert payload["temperature"] == 1.0
    assert payload["top_p"] == 0.95
    assert payload["chat_template_kwargs"] == {"enable_thinking": False}


def test_chat_upstream_error_returns_503(monkeypatch):
    async def fake_completion(payload: dict[str, object], api_key: str) -> dict[str, object]:
        raise chat_module.ChatServiceUnavailable("upstream failed")

    monkeypatch.setenv("NVIDIA_API_KEY", "test-key")
    monkeypatch.setattr(chat_module, "request_nvidia_completion", fake_completion)

    response = client.post(
        "/api/chat",
        json={
            "language": "en",
            "messages": [{"role": "user", "content": "Can you help?"}],
        },
    )

    assert response.status_code == 503
    assert response.json()["detail"] == "Coach service unavailable. Try again later."


def test_chat_stream_returns_sse_deltas(monkeypatch):
    seen: dict[str, object] = {}

    async def fake_stream(payload: dict[str, object], api_key: str):
        seen["payload"] = payload
        yield "Try a "
        yield "**smaller** hiss."

    monkeypatch.setenv("NVIDIA_API_KEY", "test-key")
    monkeypatch.setattr(chat_module, "stream_nvidia_completion", fake_stream)

    response = client.post(
        "/api/chat/stream",
        json={
            "language": "en",
            "messages": [{"role": "user", "content": "How do I keep a hiss steady?"}],
        },
    )

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/event-stream")
    events = [
        json.loads(line.removeprefix("data: "))
        for line in response.text.splitlines()
        if line.startswith("data: ")
    ]
    assert "".join(event.get("delta", "") for event in events) == "Try a **smaller** hiss."
    assert events[-1] == {"done": True}
    payload = seen["payload"]
    assert isinstance(payload, dict)
    assert payload["stream"] is True


def test_chat_stream_falls_back_before_emitting_content(monkeypatch):
    seen_models: list[str] = []

    async def fake_stream(payload: dict[str, object], api_key: str):
        model = str(payload["model"])
        seen_models.append(model)
        if model == "nvidia/nemotron-3-super-120b-a12b":
            raise chat_module.ChatServiceUnavailable("primary timed out")
        yield "Fallback worked."

    monkeypatch.setenv("NVIDIA_API_KEY", "test-key")
    monkeypatch.setattr(chat_module, "stream_nvidia_completion", fake_stream)

    response = client.post(
        "/api/chat/stream",
        json={
            "language": "en",
            "messages": [{"role": "user", "content": "Can you help?"}],
        },
    )

    assert response.status_code == 200
    assert "Fallback worked." in response.text
    assert seen_models == [
        "nvidia/nemotron-3-super-120b-a12b",
        "google/gemma-3n-e4b-it",
    ]
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


def test_month_one_analyze_rejects_oversized_audio(monkeypatch):
    monkeypatch.setattr(main_module, "MAX_AUDIO_BYTES", 16)
    samples = np.zeros(SAMPLE_RATE, dtype=np.float32)

    response = client.post(
        "/api/month-one/analyze",
        data={"drill_id": "gentle_hum", "language": "en", "take_kind": "first"},
        files={"audio": ("large.wav", wav_bytes(samples), "audio/wav")},
    )

    assert response.status_code == 413


def test_each_month_one_exercise_analyzer_is_supported():
    supported_drills = [
        "sustained_hiss",
        "gentle_hum",
        "soft_hum_start",
        "mmm_resonance",
        "fah_vah_resonance",
        "hum_to_ah",
        "short_tone_hold",
    ]
    t = np.linspace(0, 3.0, SAMPLE_RATE * 3, endpoint=False)
    samples = 0.12 * np.sin(2 * np.pi * 180 * t) + 0.08 * np.sin(2 * np.pi * 1440 * t)

    for drill_id in supported_drills:
        response = client.post(
            "/api/month-one/analyze",
            data={"drill_id": drill_id, "language": "en", "take_kind": "first"},
            files={"audio": ("take.wav", wav_bytes(samples), "audio/wav")},
        )

        assert response.status_code == 200
        assert response.json()["drillId"] == drill_id


def test_legacy_drill_alias_returns_canonical_drill_id():
    t = np.linspace(0, 3.0, SAMPLE_RATE * 3, endpoint=False)
    samples = 0.12 * np.sin(2 * np.pi * 180 * t) + 0.08 * np.sin(2 * np.pi * 1440 * t)

    response = client.post(
        "/api/month-one/analyze",
        data={"drill_id": "resonance_vowel", "language": "en", "take_kind": "first"},
        files={"audio": ("vah.wav", wav_bytes(samples), "audio/wav")},
    )

    assert response.status_code == 200
    assert response.json()["drillId"] == "fah_vah_resonance"


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
        data={"drill_id": "sustained_hiss", "language": "en", "take_kind": "first"},
    )

    assert response.status_code == 422


def test_too_short_audio_returns_structured_quality():
    samples = np.zeros(int(SAMPLE_RATE * 0.4), dtype=np.float32)

    response = client.post(
        "/api/month-one/analyze",
        data={"drill_id": "sustained_hiss", "language": "en", "take_kind": "first"},
        files={"audio": ("short.wav", wav_bytes(samples), "audio/wav")},
    )

    assert response.status_code == 200
    assert response.json()["quality"] == "too_short"

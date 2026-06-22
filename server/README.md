# Rehear Analysis Server

FastAPI service for Month 1 breath and resonance analysis. The engine uses signal heuristics only; it does not diagnose breathing mechanics, vocal anatomy, or medical conditions.

## Run

```bash
export NVIDIA_API_KEY=your_nvidia_api_key
export REHEAR_API_KEY=a_long_random_value
export ALLOWED_ORIGINS=https://your-web-app.example
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The Expo app defaults to `http://127.0.0.1:8000`. Override with `EXPO_PUBLIC_ANALYSIS_SERVER_URL`.

The Coach endpoints proxy requests to NVIDIA NIM. The default model is
`nvidia/nemotron-3-super-120b-a12b`, with `google/gemma-3n-e4b-it` as a
timeout fallback. Override them with `NVIDIA_CHAT_MODEL` and
`NVIDIA_CHAT_FALLBACK_MODEL`.
`POST /api/chat` returns JSON for compatibility; `POST /api/chat/stream` returns
the NVIDIA token stream as server-sent events containing `delta`, `done`, or
`error` payloads and flushes the connection immediately.
Keep `NVIDIA_API_KEY` only on the server; do not put it in Expo `.env` files.
Set `REHEAR_API_KEY` to require `X-Rehear-API-Key` on API requests, and put the
same value in the mobile app's `EXPO_PUBLIC_REHEAR_API_KEY`. This protects
against casual abuse; use per-user authentication or platform attestation for
strong abuse prevention. `RATE_LIMIT_PER_MINUTE` defaults to 60 and
`MAX_AUDIO_BYTES` defaults to 10 MB.

## Test

```bash
uv run pytest
```

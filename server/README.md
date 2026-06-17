# VoiceFix Analysis Server

FastAPI service for Month 1 breath and resonance analysis. The engine uses signal heuristics only; it does not diagnose breathing mechanics, vocal anatomy, or medical conditions.

## Run

```bash
export NVIDIA_API_KEY=your_nvidia_api_key
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The Expo app defaults to `http://127.0.0.1:8000`. Override with `EXPO_PUBLIC_ANALYSIS_SERVER_URL`.

The Coach endpoints proxy requests to NVIDIA NIM with `google/gemma-4-31b-it`.
`POST /api/chat` returns JSON for compatibility; `POST /api/chat/stream` returns
normalized server-sent events containing `delta`, `done`, or `error` payloads.
Keep `NVIDIA_API_KEY` only on the server; do not put it in Expo `.env` files.

## Test

```bash
uv run pytest
```

# VoiceFix Analysis Server

FastAPI service for Month 1 breath and resonance analysis. The engine uses signal heuristics only; it does not diagnose breathing mechanics, vocal anatomy, or medical conditions.

## Run

```bash
uv sync
uv run uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The Expo app defaults to `http://127.0.0.1:8000`. Override with `EXPO_PUBLIC_ANALYSIS_SERVER_URL`.

## Test

```bash
uv run pytest
```

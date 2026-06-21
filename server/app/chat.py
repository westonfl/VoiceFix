import json
import logging
import os
import time
from collections.abc import AsyncIterator
from typing import Any

import httpx

from .models import ChatRequest, ChatResponse


logger = logging.getLogger("uvicorn.error")

NVIDIA_CHAT_COMPLETIONS_URL = "https://integrate.api.nvidia.com/v1/chat/completions"
NVIDIA_CHAT_MODEL = os.getenv(
    "NVIDIA_CHAT_MODEL", "nvidia/nemotron-3-super-120b-a12b"
)
NVIDIA_CHAT_FALLBACK_MODEL = os.getenv(
    "NVIDIA_CHAT_FALLBACK_MODEL", "google/gemma-3n-e4b-it"
)
NVIDIA_CHAT_CONNECT_TIMEOUT_SEC = 10.0
NVIDIA_CHAT_READ_TIMEOUT_SEC = 25.0

REHEAR_SYSTEM_PROMPT = """You are Rehear Coach, a calm, precise singing-practice assistant inside the Rehear app.

Stay in scope: beginner singing practice, voice warmups, airflow, resonance, pitch practice, habit building, interpreting Rehear app steps, and making practice feel safer and less embarrassing.
Do not answer unrelated general questions. Briefly redirect them back to Rehear practice.
Do not diagnose medical issues, anatomy, injury, breathing disorders, or vocal pathology. If the user mentions pain, throat injury, breathing trouble, dizziness, or persistent hoarseness, tell them to stop the exercise and consider a qualified voice teacher, clinician, or medical professional.
Use plain language, gentle uncertainty, and short actionable steps. Avoid shame, hype, karaoke imagery, and fake medical precision.
Prefer one or two practical cues the user can try today.
"""


class ChatServiceUnavailable(Exception):
    """Raised when the coach service cannot produce a safe response."""


def require_nvidia_api_key() -> str:
    api_key = os.getenv("NVIDIA_API_KEY")
    if not api_key:
        raise ChatServiceUnavailable("NVIDIA_API_KEY is not configured.")
    return api_key


def build_context_prompt(request: ChatRequest) -> str:
    context = request.context
    if context is None:
        return f"User app language: {request.language}."

    parts = [f"User app language: {request.language}."]
    if context.currentWeekNumber is not None:
        parts.append(f"Current week: {context.currentWeekNumber}.")
    if context.currentDayNumber is not None:
        parts.append(f"Current day: {context.currentDayNumber}.")
    if context.currentExerciseTitle:
        parts.append(f"Current exercise: {context.currentExerciseTitle}.")

    return " ".join(parts)


async def request_nvidia_completion(payload: dict[str, Any], api_key: str) -> dict[str, Any]:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "application/json",
        "Content-Type": "application/json",
    }

    timeout = httpx.Timeout(
        connect=NVIDIA_CHAT_CONNECT_TIMEOUT_SEC,
        read=NVIDIA_CHAT_READ_TIMEOUT_SEC,
        write=NVIDIA_CHAT_CONNECT_TIMEOUT_SEC,
        pool=NVIDIA_CHAT_CONNECT_TIMEOUT_SEC,
    )
    started_at = time.monotonic()
    logger.info("nvidia_chat_request model=%s", payload.get("model"))

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(
            NVIDIA_CHAT_COMPLETIONS_URL,
            headers=headers,
            json=payload,
        )

    logger.info(
        "nvidia_chat_response status=%s elapsed_sec=%.2f",
        response.status_code,
        time.monotonic() - started_at,
    )

    if response.status_code >= 400:
        logger.warning(
            "nvidia_chat_error status=%s body=%s",
            response.status_code,
            response.text[:600],
        )
        raise ChatServiceUnavailable("NVIDIA chat service returned an error.")

    return response.json()


async def stream_nvidia_completion(
    payload: dict[str, Any], api_key: str
) -> AsyncIterator[str]:
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Accept": "text/event-stream",
        "Content-Type": "application/json",
    }
    timeout = httpx.Timeout(
        connect=NVIDIA_CHAT_CONNECT_TIMEOUT_SEC,
        read=NVIDIA_CHAT_READ_TIMEOUT_SEC,
        write=NVIDIA_CHAT_CONNECT_TIMEOUT_SEC,
        pool=NVIDIA_CHAT_CONNECT_TIMEOUT_SEC,
    )
    started_at = time.monotonic()
    logger.info("nvidia_chat_stream_request model=%s", payload.get("model"))

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            async with client.stream(
                "POST",
                NVIDIA_CHAT_COMPLETIONS_URL,
                headers=headers,
                json=payload,
            ) as response:
                if response.status_code >= 400:
                    body = (await response.aread()).decode(errors="replace")
                    logger.warning(
                        "nvidia_chat_stream_error model=%s status=%s body=%s",
                        payload.get("model"),
                        response.status_code,
                        body[:600],
                    )
                    raise ChatServiceUnavailable("NVIDIA chat service returned an error.")

                async for line in response.aiter_lines():
                    if not line.startswith("data:"):
                        continue

                    data = line.removeprefix("data:").strip()
                    if not data or data == "[DONE]":
                        continue

                    try:
                        event = json.loads(data)
                        delta = event["choices"][0]["delta"].get("content")
                    except (KeyError, IndexError, TypeError, json.JSONDecodeError):
                        logger.warning("nvidia_chat_stream_malformed data=%s", data[:300])
                        continue

                    if isinstance(delta, str) and delta:
                        yield delta
    except ChatServiceUnavailable:
        raise
    except httpx.HTTPError as exc:
        logger.warning(
            "nvidia_chat_stream_network_error model=%s error=%r",
            payload.get("model"),
            exc,
        )
        raise ChatServiceUnavailable("NVIDIA chat service could not be reached.") from exc
    finally:
        logger.info(
            "nvidia_chat_stream_finished model=%s elapsed_sec=%.2f",
            payload.get("model"),
            time.monotonic() - started_at,
        )


def extract_reply(response_json: dict[str, Any]) -> str:
    choices = response_json.get("choices")
    if not isinstance(choices, list) or not choices:
        raise ChatServiceUnavailable("NVIDIA chat response was missing choices.")

    message = choices[0].get("message")
    if not isinstance(message, dict):
        raise ChatServiceUnavailable("NVIDIA chat response was missing a message.")

    content = message.get("content")
    if not isinstance(content, str) or not content.strip():
        raise ChatServiceUnavailable("NVIDIA chat response was empty.")

    return content.strip()


async def generate_chat_reply(request: ChatRequest) -> ChatResponse:
    api_key = require_nvidia_api_key()
    last_error: Exception | None = None

    for model in chat_models():
        payload = build_chat_payload(request, stream=False, model=model)
        try:
            response_json = await request_nvidia_completion(payload, api_key)
            return ChatResponse(reply=extract_reply(response_json), model=model)
        except (ChatServiceUnavailable, httpx.HTTPError) as exc:
            last_error = exc
            logger.warning("nvidia_chat_model_failed model=%s error=%r", model, exc)

    raise ChatServiceUnavailable("All NVIDIA chat models were unavailable.") from last_error


def chat_models() -> list[str]:
    return list(dict.fromkeys([NVIDIA_CHAT_MODEL, NVIDIA_CHAT_FALLBACK_MODEL]))


def build_chat_payload(
    request: ChatRequest, *, stream: bool, model: str | None = None
) -> dict[str, Any]:
    selected_model = model or NVIDIA_CHAT_MODEL
    messages = [
        {
            "role": "system",
            "content": f"{REHEAR_SYSTEM_PROMPT}\n{build_context_prompt(request)}",
        },
        *[message.model_dump() for message in request.messages],
    ]
    payload: dict[str, Any] = {
        "model": selected_model,
        "messages": messages,
        "max_tokens": 320,
        "temperature": 0.2,
        "top_p": 0.7,
        "stream": stream,
    }
    if selected_model in {
        "google/gemma-4-31b-it",
        "nvidia/nemotron-3-super-120b-a12b",
    }:
        payload["temperature"] = 1.0
        payload["top_p"] = 0.95
        payload["chat_template_kwargs"] = {"enable_thinking": False}
    return payload


async def generate_chat_reply_stream(request: ChatRequest) -> AsyncIterator[str]:
    api_key = require_nvidia_api_key()
    last_error: Exception | None = None

    for model in chat_models():
        emitted_content = False
        payload = build_chat_payload(request, stream=True, model=model)
        try:
            async for delta in stream_nvidia_completion(payload, api_key):
                emitted_content = True
                yield delta
            if emitted_content:
                return
            raise ChatServiceUnavailable("NVIDIA chat response was empty.")
        except ChatServiceUnavailable as exc:
            last_error = exc
            if emitted_content:
                raise
            logger.warning("nvidia_chat_stream_fallback from_model=%s", model)

    raise ChatServiceUnavailable("All NVIDIA chat models were unavailable.") from last_error

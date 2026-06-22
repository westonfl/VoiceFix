import { fetch } from "expo/fetch";

import { getAnalysisServerUrl, getApiHeaders } from "@/constants/env";

import type { MainAppLanguage } from "./localization";

// Keep the client deadline above the server's 90-second NVIDIA read timeout.
const COACH_CHAT_TIMEOUT_MS = 100_000;

export type CoachChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export type CoachChatContext = {
  currentWeekNumber: number;
  currentDayNumber: number;
  currentExerciseTitle?: string;
};

export type CoachChatResponse = {
  reply: string;
  model: string;
};

type CoachStreamEvent = {
  delta?: string;
  done?: boolean;
  error?: string;
};

export class CoachChatError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = "CoachChatError";
  }
}

function isAbortError(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "name" in error &&
    error.name === "AbortError"
  );
}

export async function askCoach(input: {
  language: MainAppLanguage;
  messages: CoachChatMessage[];
  context: CoachChatContext;
}): Promise<CoachChatResponse> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), COACH_CHAT_TIMEOUT_MS);
  const url = `${getAnalysisServerUrl()}/api/chat`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getApiHeaders(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!response.ok) {
      let detail: unknown;
      try {
        detail = await response.json();
      } catch {
        detail = await response.text();
      }

      throw new CoachChatError(
        `Coach returned ${response.status}`,
        response.status,
        detail,
      );
    }

    return (await response.json()) as CoachChatResponse;
  } catch (error) {
    if (isAbortError(error)) {
      throw new CoachChatError(
        `Coach timed out after ${COACH_CHAT_TIMEOUT_MS / 1000}s`,
        undefined,
        { timeoutMs: COACH_CHAT_TIMEOUT_MS, url },
      );
    }

    if (error instanceof CoachChatError) {
      throw error;
    }

    throw new CoachChatError("Could not reach the Rehear coach.", undefined, {
      url,
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function streamCoach(
  input: {
    language: MainAppLanguage;
    messages: CoachChatMessage[];
    context: CoachChatContext;
  },
  onDelta: (delta: string) => void,
): Promise<void> {
  const controller = new AbortController();
  let timeout: ReturnType<typeof setTimeout> | undefined;
  const url = `${getAnalysisServerUrl()}/api/chat/stream`;
  const armTimeout = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(() => controller.abort(), COACH_CHAT_TIMEOUT_MS);
  };
  armTimeout();

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        ...getApiHeaders(),
        Accept: "text/event-stream",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
      signal: controller.signal,
    });

    if (!response.ok) {
      const detail = await response.text();
      throw new CoachChatError(
        `Coach returned ${response.status}`,
        response.status,
        detail,
      );
    }

    if (!response.body) {
      throw new CoachChatError("Coach returned no response stream.");
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = "";
    let receivedContent = false;
    let receivedDone = false;

    while (!receivedDone) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      armTimeout();
      buffer += decoder.decode(value, { stream: true });

      const events = buffer.split("\n\n");
      buffer = events.pop() ?? "";
      for (const rawEvent of events) {
        const data = rawEvent
          .split("\n")
          .find((line) => line.startsWith("data:"))
          ?.slice(5)
          .trim();
        if (!data) {
          continue;
        }

        const event = JSON.parse(data) as CoachStreamEvent;
        if (event.error) {
          throw new CoachChatError(event.error, 503);
        }
        if (event.delta) {
          receivedContent = true;
          onDelta(event.delta);
        }
        if (event.done) {
          receivedDone = true;
          break;
        }
      }
    }

    if (!receivedDone || !receivedContent) {
      throw new CoachChatError("Coach response ended unexpectedly.");
    }
  } catch (error) {
    if (isAbortError(error)) {
      throw new CoachChatError(
        `Coach timed out after ${COACH_CHAT_TIMEOUT_MS / 1000}s without data`,
        undefined,
        { timeoutMs: COACH_CHAT_TIMEOUT_MS, url },
      );
    }
    if (error instanceof CoachChatError) {
      throw error;
    }
    throw new CoachChatError("Could not reach the Rehear coach.", undefined, {
      url,
    });
  } finally {
    if (timeout) {
      clearTimeout(timeout);
    }
  }
}

import { getAnalysisServerUrl } from "@/constants/env";

import type { MainAppLanguage } from "./localization";

const COACH_CHAT_TIMEOUT_MS = 45_000;

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

    throw new CoachChatError("Could not reach the VoiceFix coach.", undefined, {
      url,
    });
  } finally {
    clearTimeout(timeout);
  }
}

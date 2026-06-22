import { getAnalysisServerUrl, getApiHeaders } from '@/constants/env';

import type { MainAppLanguage } from './localization';

const ANALYSIS_REQUEST_TIMEOUT_MS = 90_000;
const ANALYSIS_REQUEST_ATTEMPTS = 3;
const ANALYSIS_RETRY_DELAY_MS = 900;

export type MonthOneDrillId =
  | 'sustained_hiss'
  | 'gentle_hum'
  | 'soft_hum_start'
  | 'mmm_resonance'
  | 'fah_vah_resonance'
  | 'hum_to_ah'
  | 'short_tone_hold';
export type AnalysisQuality = 'usable' | 'too_short' | 'too_quiet' | 'clipped' | 'noisy' | 'unsupported';

export type MonthOneMetrics = {
  durationSec: number;
  rmsDb: number;
  loudnessSteadiness: number;
  fadeAmount: number;
  clippingRatio: number;
  silenceRatio: number;
  pitchStability: number | null;
  spectralCentroid: number;
  brightness: number;
  harmonicClarity: number;
  onsetAbruptness: number;
  burstRatio: number;
  resonanceScore: number;
  resonanceStability: number;
  forwardEnergyRatio: number;
  throatEnergyRatio: number;
  humToVowelContinuity: number | null;
};

export type MonthOneAnalysisResponse = {
  drillId: MonthOneDrillId;
  quality: AnalysisQuality;
  metrics: MonthOneMetrics;
  feedback: {
    whatWeHeard: string;
    whatItOftenMeans: string;
    oneThingToTry: string;
    retryGoal: string;
  };
  comparison: {
    summary: string;
    improved: boolean;
    changedMetrics: Record<string, number>;
  } | null;
  safetyFlags: string[];
};

export class AnalysisServerError extends Error {
  constructor(
    message: string,
    readonly status?: number,
    readonly detail?: unknown,
  ) {
    super(message);
    this.name = 'AnalysisServerError';
  }
}

function isAbortError(error: unknown) {
  return (
    typeof error === 'object' &&
    error !== null &&
    'name' in error &&
    error.name === 'AbortError'
  );
}

function isNetworkError(error: unknown) {
  return !(error instanceof AnalysisServerError) && !isAbortError(error);
}

function describeError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

function delay(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type AnalyzeTakeInput = {
  uri: string;
  drillId: MonthOneDrillId;
  language: MainAppLanguage;
  takeKind: 'first' | 'retry';
  previousMetrics?: MonthOneMetrics;
};

function analysisServerLanguage(language: MainAppLanguage) {
  return language === 'ko' ? 'ko' : 'en';
}

function buildAnalysisFormData(input: AnalyzeTakeInput) {
  const formData = new FormData();
  formData.append('audio', {
    uri: input.uri,
    name: `${input.drillId}-${input.takeKind}.m4a`,
    type: 'audio/m4a',
  } as unknown as Blob);
  formData.append('drill_id', input.drillId);
  formData.append('language', analysisServerLanguage(input.language));
  formData.append('take_kind', input.takeKind);

  if (input.previousMetrics) {
    formData.append('previous_metrics_json', JSON.stringify(input.previousMetrics));
  }

  return formData;
}

export function monthOneDrillForWeek(weekNumber: number): MonthOneDrillId | null {
  if (weekNumber === 1) {
    return 'sustained_hiss';
  }

  if (weekNumber === 2) {
    return 'gentle_hum';
  }

  if (weekNumber === 3) {
    return 'mmm_resonance';
  }

  if (weekNumber === 4) {
    return 'hum_to_ah';
  }

  return null;
}

export async function analyzeMonthOneTake(input: AnalyzeTakeInput): Promise<MonthOneAnalysisResponse> {
  const url = `${getAnalysisServerUrl()}/api/month-one/analyze`;
  let lastNetworkError: unknown;

  for (let attempt = 1; attempt <= ANALYSIS_REQUEST_ATTEMPTS; attempt += 1) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), ANALYSIS_REQUEST_TIMEOUT_MS);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: getApiHeaders(),
        body: buildAnalysisFormData(input),
        signal: controller.signal,
      });

      if (!response.ok) {
        let detail: unknown;
        try {
          detail = await response.json();
        } catch {
          detail = await response.text();
        }

        throw new AnalysisServerError(`Analysis server returned ${response.status}`, response.status, detail);
      }

      return (await response.json()) as MonthOneAnalysisResponse;
    } catch (error) {
      if (isAbortError(error)) {
        throw new AnalysisServerError(
          `Analysis server timed out after ${ANALYSIS_REQUEST_TIMEOUT_MS / 1000}s`,
          undefined,
          { timeoutMs: ANALYSIS_REQUEST_TIMEOUT_MS, url },
        );
      }

      if (!isNetworkError(error)) {
        throw error;
      }

      lastNetworkError = error;

      if (attempt < ANALYSIS_REQUEST_ATTEMPTS) {
        await delay(ANALYSIS_RETRY_DELAY_MS * attempt);
        continue;
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  throw new AnalysisServerError(
    `Could not connect to analysis server after ${ANALYSIS_REQUEST_ATTEMPTS} attempts`,
    undefined,
    {
      attempts: ANALYSIS_REQUEST_ATTEMPTS,
      cause: describeError(lastNetworkError),
      url,
    },
  );
}

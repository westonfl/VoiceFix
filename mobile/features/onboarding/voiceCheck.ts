import {
  AnalysisServerError,
  analyzeMonthOneTake,
  type MonthOneAnalysisResponse,
  type MonthOneDrillId,
} from '@/features/prototype/serverAnalysis';

import type { Language } from './types';

export type OnboardingRecordingScreenId =
  | 'ONB-18'
  | 'ONB-19'
  | 'ONB-20'
  | 'ONB-21'
  | 'ONB-22';

const DRILL_BY_SCREEN: Record<OnboardingRecordingScreenId, MonthOneDrillId> = {
  'ONB-18': 'sustained_hiss',
  'ONB-19': 'gentle_hum',
  'ONB-20': 'short_tone_hold',
  'ONB-21': 'hum_to_ah',
  'ONB-22': 'hum_to_ah',
};

export type VoiceCheckResult = {
  analysis?: MonthOneAnalysisResponse;
  durationMs: number;
  message: string;
  saved: boolean;
};

export function getOnboardingDrillId(screenId: string): MonthOneDrillId | null {
  return DRILL_BY_SCREEN[screenId as OnboardingRecordingScreenId] ?? null;
}

export function onboardingAnalysisLanguage(language: Language): 'en' | 'ko' {
  return language === 'ko' ? 'ko' : 'en';
}

export async function analyzeOnboardingTake(
  screenId: string,
  uri: string,
  language: Language,
): Promise<VoiceCheckResult> {
  const drillId = getOnboardingDrillId(screenId);
  if (!drillId) {
    throw new Error(`Unknown onboarding recording screen: ${screenId}`);
  }

  const analysis = await analyzeMonthOneTake({
    uri,
    drillId,
    language: onboardingAnalysisLanguage(language),
    takeKind: 'first',
  });

  return {
    analysis,
    durationMs: Math.round(analysis.metrics.durationSec * 1000),
    message:
      analysis.quality === 'usable'
        ? analysis.feedback.whatWeHeard
        : analysis.feedback.oneThingToTry,
    saved: true,
  };
}

export function analysisFailureMessage(error: unknown, language: Language) {
  const ko = language === 'ko';

  if (error instanceof AnalysisServerError) {
    const detail = extractAnalysisErrorDetail(error.detail);

    if (error.status) {
      return ko
        ? `분석 요청이 거부되었습니다. 다시 녹음해보세요.${detail ? ` ${detail}` : ''}`
        : `The analysis request was rejected. Record again.${detail ? ` ${detail}` : ''}`;
    }

    if (error.message.includes('timed out')) {
      return ko
        ? '분석 시간이 너무 오래 걸렸습니다. 다시 시도하세요.'
        : 'Analysis took too long. Try again.';
    }

    return ko
      ? '분석 서버 연결에 실패했습니다. 네트워크를 확인하고 다시 시도하세요.'
      : 'Could not reach the analysis server. Check the network and try again.';
  }

  return ko
    ? '녹음을 분석하지 못했습니다. 다시 시도하세요.'
    : 'Could not analyze the recording. Try again.';
}

function extractAnalysisErrorDetail(detail: unknown) {
  if (typeof detail === 'string') {
    return detail;
  }

  if (
    typeof detail === 'object' &&
    detail !== null &&
    'detail' in detail &&
    typeof detail.detail === 'string'
  ) {
    return detail.detail;
  }

  return null;
}

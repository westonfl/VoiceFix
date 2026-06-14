import type { MainAppLanguage } from '@/features/prototype/localization';
import type { MonthOneDrillId } from '@/features/prototype/serverAnalysis';

export type LiveMeterSample = {
  t: number;
  level: number;
};

export type LiveSessionQuality = 'good' | 'quiet' | 'unsteady' | 'short';

export type LiveSessionResult = {
  score: number;
  stars: number;
  primaryMetric: {
    label: string;
    value: number;
    verdict: string;
  };
  quality: LiveSessionQuality;
  steadiness: number;
  avgLevel: number;
  durationMs: number;
};

const MIN_USEFUL_LEVEL = 0.08;
const GOOD_LEVEL = 0.22;

export function normalizeMetering(metering?: number): number {
  if (metering === undefined || Number.isNaN(metering)) {
    return 0;
  }

  const clamped = Math.max(-60, Math.min(0, metering));
  return (clamped + 60) / 60;
}

function computeSteadiness(samples: LiveMeterSample[]): number {
  if (samples.length < 4) {
    return 0;
  }

  const active = samples.filter((sample) => sample.level > 0.04);
  if (active.length < 4) {
    return 0;
  }

  const mean = active.reduce((sum, sample) => sum + sample.level, 0) / active.length;
  const variance =
    active.reduce((sum, sample) => sum + (sample.level - mean) ** 2, 0) / active.length;
  const stdDev = Math.sqrt(variance);
  const relativeStd = mean > 0 ? stdDev / mean : 1;

  return Math.max(0, Math.min(1, 1 - relativeStd * 2.4));
}

function metricCopy(
  drillId: MonthOneDrillId,
  language: MainAppLanguage,
): { label: string; good: string; quiet: string; unsteady: string; short: string } {
  const isKo = language === 'ko';

  if (drillId === 'sustained_hiss') {
    return {
      label: isKo ? '호흡 정확도' : 'Breath accuracy',
      good: isKo ? '호흡이 고르고 안정적이에요.' : 'Your breath looks steady.',
      quiet: isKo ? '소리가 너무 작아요.' : 'Your breath is too quiet.',
      unsteady: isKo ? '호흡이 들쭉날쭉해요.' : 'Your breath is off.',
      short: isKo ? '조금 더 길게 이어 보세요.' : 'Try to hold it a little longer.',
    };
  }

  return {
    label: isKo ? '훈련 정확도' : 'Training accuracy',
    good: isKo ? '좋은 테이크예요.' : 'Solid take.',
    quiet: isKo ? '마이크에 더 가까이, 작은 소리로.' : 'Move closer with a smaller sound.',
    unsteady: isKo ? '조금 더 일정하게 유지해 보세요.' : 'Try to keep it more even.',
    short: isKo ? '조금 더 길게 이어 보세요.' : 'Try to hold it a little longer.',
  };
}

export function computeLiveSessionResult({
  samples,
  durationMs,
  drillId,
  language,
  targetDurationMs,
}: {
  samples: LiveMeterSample[];
  durationMs: number;
  drillId: MonthOneDrillId;
  language: MainAppLanguage;
  targetDurationMs: number;
}): LiveSessionResult {
  const activeSamples = samples.filter((sample) => sample.level > 0.03);
  const avgLevel =
    activeSamples.length > 0
      ? activeSamples.reduce((sum, sample) => sum + sample.level, 0) / activeSamples.length
      : 0;
  const steadiness = computeSteadiness(samples);
  const durationRatio = Math.min(1, durationMs / Math.max(targetDurationMs, 1));
  const levelScore =
    avgLevel < MIN_USEFUL_LEVEL
      ? avgLevel / MIN_USEFUL_LEVEL * 0.35
      : Math.min(1, avgLevel / GOOD_LEVEL);
  const accuracy = Math.round(
    (steadiness * 0.55 + levelScore * 0.3 + durationRatio * 0.15) * 100,
  );

  let quality: LiveSessionQuality = 'good';
  if (durationMs < targetDurationMs * 0.45) {
    quality = 'short';
  } else if (avgLevel < MIN_USEFUL_LEVEL) {
    quality = 'quiet';
  } else if (steadiness < 0.52) {
    quality = 'unsteady';
  }

  const stars =
    accuracy >= 82 ? 3 : accuracy >= 62 ? 2 : accuracy >= 38 ? 1 : 0;
  const score = Math.round(accuracy * 72 + durationRatio * 280 + steadiness * 120);
  const copy = metricCopy(drillId, language);
  const verdict =
    quality === 'short'
      ? copy.short
      : quality === 'quiet'
        ? copy.quiet
        : quality === 'unsteady'
          ? copy.unsteady
          : copy.good;

  return {
    score,
    stars,
    primaryMetric: {
      label: copy.label,
      value: accuracy,
      verdict,
    },
    quality,
    steadiness,
    avgLevel,
    durationMs,
  };
}

export function exerciseSoundCue(exerciseId: string): string {
  const cues: Record<string, string> = {
    'sustained-hiss': 'Sss',
    'gentle-hum': 'Hmm',
    'soft-hum-start': 'Hmm',
    'mmm-resonance': 'Mmm',
    'fah-vah-resonance': 'Fah',
    'hum-to-ah': 'Ah',
    'short-tone': 'Hmm',
  };

  return cues[exerciseId] ?? 'Hmm';
}

export function exerciseCategoryLabel(
  category: string,
  language: MainAppLanguage,
): string {
  const isKo = language === 'ko';
  const labels: Record<string, string> = {
    breathing: isKo ? '호흡' : 'Breathing',
    tone: isKo ? '톤' : 'Tone',
    resonance: isKo ? '공명' : 'Resonance',
    integration: isKo ? '통합' : 'Integration',
  };

  return labels[category] ?? category;
}

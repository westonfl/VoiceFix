import type { MainAppLanguage } from './localization';
import type { MonthOneDrillId, MonthOneAnalysisResponse, MonthOneMetrics } from './serverAnalysis';

export type MetricStatus = 'good' | 'watch' | 'neutral';

export type AnalysisMetricItem = {
  value: string;
  label: string;
  description: string;
  goodTarget: string;
  status: MetricStatus;
};

type MetricKey =
  | 'loudness_steadiness'
  | 'volume_steadiness'
  | 'ending_hold'
  | 'start_push'
  | 'pitch_hold'
  | 'easy_start'
  | 'resonance_score'
  | 'resonance_stability'
  | 'forward_energy'
  | 'brightness'
  | 'hum_to_vowel_continuity'
  | 'duration_sec';

type MetricDefinition = {
  label: { en: string; ko: string };
  description: { en: string; ko: string };
  goodTarget: { en: string; ko: string };
  evaluate: (rawValue: number | null, drillId: MonthOneDrillId) => MetricStatus;
};

function copy(
  en: string,
  ko: string,
  language: MainAppLanguage,
) {
  return language === 'ko' ? ko : en;
}

function percentMetric(value: number | undefined | null) {
  return typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a';
}

function formatDebugMetric(value: number | undefined | null) {
  return typeof value === 'number' ? value.toFixed(2) : 'n/a';
}

function percentStatus(
  value: number | null,
  minimum: number,
  direction: 'higher' | 'lower' = 'higher',
): MetricStatus {
  if (value === null) {
    return 'neutral';
  }

  if (direction === 'higher') {
    return value >= minimum ? 'good' : 'watch';
  }

  return value <= minimum ? 'good' : 'watch';
}

function ratioStatus(value: number | null, maximum: number): MetricStatus {
  if (value === null) {
    return 'neutral';
  }

  return value <= maximum ? 'good' : 'watch';
}

const metricDefinitions: Record<MetricKey, MetricDefinition> = {
  loudness_steadiness: {
    label: { en: 'steadiness', ko: '고른 흐름' },
    description: {
      en: 'How evenly your volume stayed from start to finish.',
      ko: '시작부터 끝까지 음량이 얼마나 고르게 유지됐는지 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 45% or higher',
      ko: '45% 이상을 목표로 하세요',
    },
    evaluate: (value) => percentStatus(value, 0.45),
  },
  volume_steadiness: {
    label: { en: 'volume', ko: '음량' },
    description: {
      en: 'How evenly your hum or tone stayed in size through the take.',
      ko: '허밍이나 톤의 크기가 테이크 내내 얼마나 고르게 유지됐는지 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 46% or higher',
      ko: '46% 이상을 목표로 하세요',
    },
    evaluate: (value, drillId) =>
      percentStatus(value, drillId === 'short_tone_hold' ? 0.48 : 0.46),
  },
  ending_hold: {
    label: { en: 'ending', ko: '끝 유지' },
    description: {
      en: 'How well you held volume into the final part of the take.',
      ko: '테이크 마지막까지 음량을 얼마나 잘 유지했는지 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 45% or higher',
      ko: '45% 이상을 목표로 하세요',
    },
    evaluate: (value, drillId) => {
      const minimum = drillId === 'sustained_hiss' || drillId === 'hum_to_ah' ? 0.58 : 0.45;
      return percentStatus(value, minimum);
    },
  },
  start_push: {
    label: { en: 'start push', ko: '시작 압력' },
    description: {
      en: 'How much louder the first moment was versus the rest. Lower is gentler.',
      ko: '첫 순간이 나머지보다 얼마나 컸는지 보여줍니다. 낮을수록 부드럽습니다.',
    },
    goodTarget: {
      en: 'Aim for 1.45 or lower',
      ko: '1.45 이하를 목표로 하세요',
    },
    evaluate: (value, drillId) => {
      const maximum = drillId === 'soft_hum_start' ? 1.35 : 1.45;
      return ratioStatus(value, maximum);
    },
  },
  pitch_hold: {
    label: { en: 'pitch hold', ko: '음 유지' },
    description: {
      en: 'How steadily your pitch stayed on one note.',
      ko: '한 음을 얼마나 안정적으로 유지했는지 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 45% or higher',
      ko: '45% 이상을 목표로 하세요',
    },
    evaluate: (value, drillId) => {
      const minimum = drillId === 'short_tone_hold' ? 0.5 : 0.45;
      return percentStatus(value, minimum);
    },
  },
  easy_start: {
    label: { en: 'easy start', ko: '부드러운 시작' },
    description: {
      en: 'How softly the sound arrived at the beginning.',
      ko: '소리가 시작할 때 얼마나 부드럽게 들어왔는지 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 55% or higher',
      ko: '55% 이상을 목표로 하세요',
    },
    evaluate: (value) => percentStatus(value, 0.55),
  },
  resonance_score: {
    label: { en: 'mmm ring', ko: 'mmm 울림' },
    description: {
      en: 'How much buzz or ring the app detected in the sound.',
      ko: '앱이 감지한 울림이나 공명감의 정도를 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 42% or higher',
      ko: '42% 이상을 목표로 하세요',
    },
    evaluate: (value) => percentStatus(value, 0.42),
  },
  resonance_stability: {
    label: { en: 'stability', ko: '안정성' },
    description: {
      en: 'How consistent the resonance color stayed through the take.',
      ko: '테이크 내내 울림의 색이 얼마나 일정했는지 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 45% or higher',
      ko: '45% 이상을 목표로 하세요',
    },
    evaluate: (value) => percentStatus(value, 0.45),
  },
  forward_energy: {
    label: { en: 'forward', ko: '앞쪽 울림' },
    description: {
      en: 'How much energy sat in the forward, brighter part of the sound.',
      ko: '소리의 앞쪽, 밝은 영역에 에너지가 얼마나 실렸는지 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 12% or higher',
      ko: '12% 이상을 목표로 하세요',
    },
    evaluate: (value) => percentStatus(value, 0.12),
  },
  brightness: {
    label: { en: 'brightness', ko: '밝기' },
    description: {
      en: 'How bright or sharp the vowel sounded. Clear is good; extra sharpness can mean pushing.',
      ko: '모음이 얼마나 밝거나 날카롭게 들렸는지 보여줍니다. 선명함은 좋지만, 너무 높으면 밀어낸 신호일 수 있습니다.',
    },
    goodTarget: {
      en: 'Aim for 72% or lower',
      ko: '72% 이하를 목표로 하세요',
    },
    evaluate: (value) => percentStatus(value, 0.72, 'lower'),
  },
  hum_to_vowel_continuity: {
    label: { en: 'connection', ko: '연결' },
    description: {
      en: 'How connected the hum feeling stayed when you opened to the vowel.',
      ko: '허밍에서 모음으로 열 때 허밍의 느낌이 얼마나 이어졌는지 보여줍니다.',
    },
    goodTarget: {
      en: 'Aim for 48% or higher',
      ko: '48% 이상을 목표로 하세요',
    },
    evaluate: (value) => percentStatus(value, 0.48),
  },
  duration_sec: {
    label: { en: 'seconds', ko: '초' },
    description: {
      en: 'How long the usable part of the recording lasted.',
      ko: '분석에 사용된 녹음 길이입니다.',
    },
    goodTarget: {
      en: 'Hold through the full cue',
      ko: '전체 큐를 끝까지 유지하세요',
    },
    evaluate: () => 'neutral',
  },
};

function buildMetricItem(
  key: MetricKey,
  rawValue: number | null,
  displayValue: string,
  drillId: MonthOneDrillId,
  language: MainAppLanguage,
  labelOverride?: { en: string; ko: string },
  goodTargetOverride?: { en: string; ko: string },
): AnalysisMetricItem {
  const definition = metricDefinitions[key];
  const label = labelOverride ?? definition.label;
  const goodTarget = goodTargetOverride ?? definition.goodTarget;

  return {
    value: displayValue,
    label: copy(label.en, label.ko, language),
    description: copy(definition.description.en, definition.description.ko, language),
    goodTarget: copy(goodTarget.en, goodTarget.ko, language),
    status: definition.evaluate(rawValue, drillId),
  };
}

function metricSetForDrill(
  drillId: MonthOneDrillId,
  metrics: MonthOneMetrics,
  language: MainAppLanguage,
): AnalysisMetricItem[] {
  switch (drillId) {
    case 'sustained_hiss':
      return [
        buildMetricItem(
          'loudness_steadiness',
          metrics.loudnessSteadiness,
          percentMetric(metrics.loudnessSteadiness),
          drillId,
          language,
        ),
        buildMetricItem(
          'ending_hold',
          1 - metrics.fadeAmount,
          percentMetric(1 - metrics.fadeAmount),
          drillId,
          language,
        ),
        buildMetricItem(
          'start_push',
          metrics.burstRatio,
          formatDebugMetric(metrics.burstRatio),
          drillId,
          language,
        ),
      ];
    case 'gentle_hum':
      return [
        buildMetricItem(
          'pitch_hold',
          metrics.pitchStability,
          percentMetric(metrics.pitchStability),
          drillId,
          language,
        ),
        buildMetricItem(
          'volume_steadiness',
          metrics.loudnessSteadiness,
          percentMetric(metrics.loudnessSteadiness),
          drillId,
          language,
        ),
        buildMetricItem(
          'easy_start',
          1 - metrics.onsetAbruptness,
          percentMetric(1 - metrics.onsetAbruptness),
          drillId,
          language,
        ),
      ];
    case 'soft_hum_start':
      return [
        buildMetricItem(
          'easy_start',
          1 - metrics.onsetAbruptness,
          percentMetric(1 - metrics.onsetAbruptness),
          drillId,
          language,
        ),
        buildMetricItem(
          'start_push',
          metrics.burstRatio,
          formatDebugMetric(metrics.burstRatio),
          drillId,
          language,
        ),
        buildMetricItem(
          'loudness_steadiness',
          metrics.loudnessSteadiness,
          percentMetric(metrics.loudnessSteadiness),
          drillId,
          language,
          { en: 'even hum', ko: '고른 허밍' },
        ),
      ];
    case 'mmm_resonance':
      return [
        buildMetricItem(
          'resonance_score',
          metrics.resonanceScore,
          percentMetric(metrics.resonanceScore),
          drillId,
          language,
        ),
        buildMetricItem(
          'resonance_stability',
          metrics.resonanceStability,
          percentMetric(metrics.resonanceStability),
          drillId,
          language,
        ),
        buildMetricItem(
          'forward_energy',
          metrics.forwardEnergyRatio,
          percentMetric(metrics.forwardEnergyRatio),
          drillId,
          language,
        ),
      ];
    case 'fah_vah_resonance':
      return [
        buildMetricItem(
          'resonance_score',
          metrics.resonanceScore,
          percentMetric(metrics.resonanceScore),
          drillId,
          language,
          { en: 'vowel ring', ko: '모음 울림' },
        ),
        buildMetricItem(
          'forward_energy',
          metrics.forwardEnergyRatio,
          percentMetric(metrics.forwardEnergyRatio),
          drillId,
          language,
        ),
        buildMetricItem(
          'brightness',
          metrics.brightness,
          percentMetric(metrics.brightness),
          drillId,
          language,
        ),
      ];
    case 'hum_to_ah':
      return [
        buildMetricItem(
          'hum_to_vowel_continuity',
          metrics.humToVowelContinuity,
          percentMetric(metrics.humToVowelContinuity),
          drillId,
          language,
        ),
        buildMetricItem(
          'loudness_steadiness',
          metrics.loudnessSteadiness,
          percentMetric(metrics.loudnessSteadiness),
          drillId,
          language,
        ),
        buildMetricItem(
          'ending_hold',
          1 - metrics.fadeAmount,
          percentMetric(1 - metrics.fadeAmount),
          drillId,
          language,
        ),
      ];
    case 'short_tone_hold':
      return [
        buildMetricItem(
          'pitch_hold',
          metrics.pitchStability,
          percentMetric(metrics.pitchStability),
          drillId,
          language,
        ),
        buildMetricItem(
          'volume_steadiness',
          metrics.loudnessSteadiness,
          percentMetric(metrics.loudnessSteadiness),
          drillId,
          language,
          undefined,
          { en: 'Aim for 48% or higher', ko: '48% 이상을 목표로 하세요' },
        ),
        buildMetricItem(
          'ending_hold',
          1 - metrics.fadeAmount,
          percentMetric(1 - metrics.fadeAmount),
          drillId,
          language,
        ),
      ];
    default:
      return [
        buildMetricItem(
          'loudness_steadiness',
          metrics.loudnessSteadiness,
          percentMetric(metrics.loudnessSteadiness),
          drillId,
          language,
        ),
        buildMetricItem(
          'ending_hold',
          1 - metrics.fadeAmount,
          percentMetric(1 - metrics.fadeAmount),
          drillId,
          language,
        ),
        buildMetricItem(
          'duration_sec',
          metrics.durationSec,
          formatDebugMetric(metrics.durationSec),
          drillId,
          language,
        ),
      ];
  }
}

export function analysisMetricItems(
  analysis: MonthOneAnalysisResponse,
  language: MainAppLanguage,
): AnalysisMetricItem[] {
  return metricSetForDrill(analysis.drillId, analysis.metrics, language);
}

export function metricGuideTitle(language: MainAppLanguage) {
  return copy('What these numbers mean', '이 숫자들의 의미', language);
}

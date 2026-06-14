import type { MainAppLanguage } from './localization';
import type { MonthOneAnalysisResponse } from './serverAnalysis';

export type AnalysisMetricItem = {
  value: string;
  label: string;
};

function formatDebugMetric(value: number | undefined | null) {
  return typeof value === 'number' ? value.toFixed(2) : 'n/a';
}

function percentMetric(value: number | undefined | null) {
  return typeof value === 'number' ? `${Math.round(value * 100)}%` : 'n/a';
}

function metricLabel(en: string, ko: string, language: MainAppLanguage) {
  return language === 'ko' ? ko : en;
}

export function analysisMetricItems(
  analysis: MonthOneAnalysisResponse,
  language: MainAppLanguage,
): AnalysisMetricItem[] {
  const metrics = analysis.metrics;

  switch (analysis.drillId) {
    case 'sustained_hiss':
      return [
        {
          value: percentMetric(metrics.loudnessSteadiness),
          label: metricLabel('steadiness', '고른 흐름', language),
        },
        {
          value: percentMetric(1 - metrics.fadeAmount),
          label: metricLabel('ending', '끝 유지', language),
        },
        {
          value: formatDebugMetric(metrics.burstRatio),
          label: metricLabel('start push', '시작 압력', language),
        },
      ];
    case 'gentle_hum':
      return [
        {
          value: percentMetric(metrics.pitchStability),
          label: metricLabel('pitch hold', '음 유지', language),
        },
        {
          value: percentMetric(metrics.loudnessSteadiness),
          label: metricLabel('volume', '음량', language),
        },
        {
          value: percentMetric(1 - metrics.onsetAbruptness),
          label: metricLabel('easy start', '부드러운 시작', language),
        },
      ];
    case 'soft_hum_start':
      return [
        {
          value: percentMetric(1 - metrics.onsetAbruptness),
          label: metricLabel('easy start', '부드러운 시작', language),
        },
        {
          value: formatDebugMetric(metrics.burstRatio),
          label: metricLabel('start push', '시작 압력', language),
        },
        {
          value: percentMetric(metrics.loudnessSteadiness),
          label: metricLabel('even hum', '고른 허밍', language),
        },
      ];
    case 'mmm_resonance':
      return [
        {
          value: percentMetric(metrics.resonanceScore),
          label: metricLabel('mmm ring', 'mmm 울림', language),
        },
        {
          value: percentMetric(metrics.resonanceStability),
          label: metricLabel('stability', '안정성', language),
        },
        {
          value: percentMetric(metrics.forwardEnergyRatio),
          label: metricLabel('forward', '앞쪽 울림', language),
        },
      ];
    case 'fah_vah_resonance':
      return [
        {
          value: percentMetric(metrics.resonanceScore),
          label: metricLabel('vowel ring', '모음 울림', language),
        },
        {
          value: percentMetric(metrics.forwardEnergyRatio),
          label: metricLabel('forward', '앞쪽 울림', language),
        },
        {
          value: percentMetric(metrics.brightness),
          label: metricLabel('brightness', '밝기', language),
        },
      ];
    case 'hum_to_ah':
      return [
        {
          value: percentMetric(metrics.humToVowelContinuity),
          label: metricLabel('connection', '연결', language),
        },
        {
          value: percentMetric(metrics.loudnessSteadiness),
          label: metricLabel('steadiness', '안정성', language),
        },
        {
          value: percentMetric(1 - metrics.fadeAmount),
          label: metricLabel('ending', '끝 유지', language),
        },
      ];
    case 'short_tone_hold':
      return [
        {
          value: percentMetric(metrics.pitchStability),
          label: metricLabel('pitch hold', '음 유지', language),
        },
        {
          value: percentMetric(metrics.loudnessSteadiness),
          label: metricLabel('volume', '음량', language),
        },
        {
          value: percentMetric(1 - metrics.fadeAmount),
          label: metricLabel('ending', '끝 유지', language),
        },
      ];
    default:
      return [
        {
          value: percentMetric(metrics.loudnessSteadiness),
          label: metricLabel('steadiness', '안정성', language),
        },
        {
          value: percentMetric(1 - metrics.fadeAmount),
          label: metricLabel('ending', '끝 유지', language),
        },
        {
          value: formatDebugMetric(metrics.durationSec),
          label: metricLabel('seconds', '초', language),
        },
      ];
  }
}

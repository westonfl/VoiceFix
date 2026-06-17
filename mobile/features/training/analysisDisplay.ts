import type { ComponentProps } from 'react';
import type MaterialIcons from '@expo/vector-icons/MaterialIcons';

import type { MainAppLanguage } from '@/features/prototype/localization';
import type { AnalysisQuality } from '@/features/prototype/serverAnalysis';

type IconName = ComponentProps<typeof MaterialIcons>['name'];

type QualityDisplay = {
  headline: string;
  icon: IconName;
  tone: 'success' | 'warning' | 'neutral';
};

function qualityCopy(
  en: string,
  ko: string,
  language: MainAppLanguage,
) {
  return language === 'ko' ? ko : en;
}

export function qualityDisplay(
  quality: AnalysisQuality,
  language: MainAppLanguage,
): QualityDisplay {
  switch (quality) {
    case 'usable':
      return {
        headline: qualityCopy(
          'Clear enough to analyze',
          '분석하기에 충분히 선명합니다',
          language,
        ),
        icon: 'check-circle',
        tone: 'success',
      };
    case 'noisy':
      return {
        headline: qualityCopy(
          'Too much noise or silence',
          '소음이나 무음이 너무 많습니다',
          language,
        ),
        icon: 'graphic-eq',
        tone: 'warning',
      };
    case 'too_short':
      return {
        headline: qualityCopy(
          'Take was too short',
          '녹음이 너무 짧습니다',
          language,
        ),
        icon: 'timer-off',
        tone: 'warning',
      };
    case 'too_quiet':
      return {
        headline: qualityCopy(
          'Take was too quiet',
          '녹음이 너무 작습니다',
          language,
        ),
        icon: 'volume-off',
        tone: 'warning',
      };
    case 'clipped':
      return {
        headline: qualityCopy(
          'Audio clipped or pushed',
          '오디오가 깨지거나 과하게 밀렸습니다',
          language,
        ),
        icon: 'warning',
        tone: 'warning',
      };
    case 'unsupported':
      return {
        headline: qualityCopy(
          'Could not read this take',
          '이 녹음을 읽을 수 없습니다',
          language,
        ),
        icon: 'error-outline',
        tone: 'warning',
      };
    default: {
      const fallback = quality as AnalysisQuality;
      return {
        headline: fallback.replaceAll('_', ' '),
        icon: 'info-outline',
        tone: 'neutral',
      };
    }
  }
}

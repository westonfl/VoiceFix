import { StyleSheet, Text, View } from 'react-native';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { SignalWave } from '@/features/onboarding/components';
import type { MainAppLanguage } from '@/features/prototype/localization';

type TrainingAnalyzingScreenProps = {
  language: MainAppLanguage;
};

export function TrainingAnalyzingScreen({ language }: TrainingAnalyzingScreenProps) {
  return (
    <View style={styles.screen} accessibilityRole="progressbar">
      <SignalWave active />
      <Text style={styles.title}>{language === 'ko' ? '분석 중' : 'Analyzing'}</Text>
      <Text style={styles.body}>
        {language === 'ko'
          ? '녹음을 검토하고 있습니다.'
          : 'Reviewing your take…'}
      </Text>
      <View style={styles.dots}>
        <View style={styles.dot} />
        <View style={styles.dot} />
        <View style={styles.dot} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    alignItems: 'center',
    flex: 1,
    gap: 16,
    justifyContent: 'center',
    minHeight: 560,
    paddingHorizontal: 24,
  },
  title: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '900',
    letterSpacing: -0.5,
  },
  body: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
    textAlign: 'center',
  },
  dots: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    backgroundColor: theme.textSubtle,
    borderRadius: 999,
    height: 8,
    opacity: 0.35,
    width: 8,
  },
});

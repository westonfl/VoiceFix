import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { RehearTheme as theme } from '@/constants/theme';
import { SignalWave } from '@/features/onboarding/components';
import type { mainAppText } from '@/features/prototype/localization';

import { LoadingDots } from './LoadingDots';

type TrainingAnalyzingScreenProps = {
  text: (typeof mainAppText)['en']['today'];
};

export function TrainingAnalyzingScreen({ text }: TrainingAnalyzingScreenProps) {
  const titlePulse = useSharedValue(0);

  useEffect(() => {
    titlePulse.value = withRepeat(
      withSequence(
        withTiming(1, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration: 1400, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [titlePulse]);

  const titleStyle = useAnimatedStyle(() => ({
    opacity: 0.72 + titlePulse.value * 0.28,
  }));

  const bodyStyle = useAnimatedStyle(() => ({
    opacity: 0.55 + titlePulse.value * 0.25,
  }));

  return (
    <View style={styles.screen} accessibilityRole="progressbar">
      <SignalWave active />
      <Animated.Text style={[styles.title, titleStyle]}>{text.analyzing}</Animated.Text>
      <Animated.Text style={[styles.body, bodyStyle]}>{text.analyzingBody}</Animated.Text>
      <LoadingDots />
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
});

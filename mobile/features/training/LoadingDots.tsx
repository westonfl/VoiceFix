import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

import { VoiceFixTheme as theme } from '@/constants/theme';

function LoadingDot({ delay }: { delay: number }) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withDelay(
      delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: 420, easing: Easing.inOut(Easing.sin) }),
          withTiming(0.25, { duration: 420, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [delay, progress]);

  const style = useAnimatedStyle(() => ({
    opacity: 0.25 + progress.value * 0.75,
    transform: [{ scale: 0.82 + progress.value * 0.28 }],
  }));

  return <Animated.View style={[styles.dot, style]} />;
}

export function LoadingDots() {
  return (
    <View style={styles.row}>
      <LoadingDot delay={0} />
      <LoadingDot delay={140} />
      <LoadingDot delay={280} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dot: {
    backgroundColor: theme.textSubtle,
    borderRadius: 999,
    height: 8,
    width: 8,
  },
});

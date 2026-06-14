import type { CardGradientVariant } from '@/features/onboarding/cardGradientBackground';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

import { ExerciseOrbMesh } from '@/features/training/ExerciseOrbMesh';

const ORB_SIZE = 260;
const MIN_SCALE = 0.76;
const MAX_SCALE = 1.18;

type LiveVoiceOrbProps = {
  level: number;
  active?: boolean;
  gradient: CardGradientVariant;
};

export function LiveVoiceOrb({ level, active = true, gradient }: LiveVoiceOrbProps) {
  const levelValue = useSharedValue(level);

  useEffect(() => {
    levelValue.value = withTiming(Math.max(0, Math.min(1, level)), {
      duration: 100,
      easing: Easing.out(Easing.cubic),
    });
  }, [level, levelValue]);

  const orbStyle = useAnimatedStyle(() => ({
    transform: [
      {
        scale: MIN_SCALE + levelValue.value * (MAX_SCALE - MIN_SCALE),
      },
    ],
  }));

  return (
    <View style={styles.wrap}>
      <Animated.View style={[styles.orb, orbStyle]}>
        <View style={styles.inner}>
          <ExerciseOrbMesh active={active} size={ORB_SIZE} variant={gradient} />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 320,
    width: '100%',
  },
  orb: {
    borderRadius: ORB_SIZE / 2,
    height: ORB_SIZE,
    width: ORB_SIZE,
  },
  inner: {
    borderRadius: ORB_SIZE / 2,
    height: ORB_SIZE,
    overflow: 'hidden',
    width: ORB_SIZE,
  },
});

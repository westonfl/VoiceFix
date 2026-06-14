import { memo, useEffect, useMemo } from 'react';
import { Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

type ParticleSpec = {
  id: number;
  left: number;
  top: number;
  size: number;
  opacity: number;
  driftX: number;
  driftY: number;
  duration: number;
  delay: number;
};

function FloatingParticle({
  spec,
  active,
}: {
  spec: ParticleSpec;
  active: boolean;
}) {
  const progress = useSharedValue(0);

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }

    progress.value = withDelay(
      spec.delay,
      withRepeat(
        withSequence(
          withTiming(1, { duration: spec.duration, easing: Easing.inOut(Easing.sin) }),
          withTiming(0, { duration: spec.duration, easing: Easing.inOut(Easing.sin) }),
        ),
        -1,
        false,
      ),
    );
  }, [active, progress, spec.delay, spec.duration]);

  const style = useAnimatedStyle(() => ({
    opacity: spec.opacity * (0.35 + progress.value * 0.65),
    transform: [
      { translateX: progress.value * spec.driftX },
      { translateY: progress.value * spec.driftY },
      { scale: 0.85 + progress.value * 0.25 },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.particle,
        {
          height: spec.size,
          left: spec.left,
          top: spec.top,
          width: spec.size,
        },
        style,
      ]}
    />
  );
}

export const LiveSessionParticles = memo(function LiveSessionParticles({
  active = true,
}: {
  active?: boolean;
}) {
  const particles = useMemo<ParticleSpec[]>(
    () =>
      Array.from({ length: 28 }, (_, index) => ({
        id: index,
        left: Math.random() * (SCREEN_WIDTH - 12),
        top: Math.random() * (SCREEN_HEIGHT - 12),
        size: 2.5 + Math.random() * 3.5,
        opacity: 0.18 + Math.random() * 0.28,
        driftX: (Math.random() - 0.5) * 36,
        driftY: -18 - Math.random() * 32,
        duration: 3200 + Math.random() * 4200,
        delay: Math.random() * 1800,
      })),
    [],
  );

  return (
    <View pointerEvents="none" style={styles.host}>
      {particles.map((spec) => (
        <FloatingParticle key={spec.id} active={active} spec={spec} />
      ))}
    </View>
  );
});

const styles = StyleSheet.create({
  host: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  particle: {
    backgroundColor: '#8A8A9A',
    borderRadius: 999,
    position: 'absolute',
  },
});

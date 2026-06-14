import { LinearGradient } from 'expo-linear-gradient';
import { memo, useEffect, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Defs, RadialGradient, Rect, Stop } from 'react-native-svg';

import {
  GradientGrainOverlay,
  getCardGradientPreset,
  type CardGradientVariant,
} from '@/features/onboarding/cardGradientBackground';

type GradientLayer = ReturnType<typeof getCardGradientPreset>['layers'][number];

const DRIFT_SPECS = [
  { dx: 22, dy: -18 },
  { dx: -20, dy: 14 },
  { dx: 16, dy: 22 },
  { dx: -18, dy: -16 },
] as const;

const DriftingGradientLayer = memo(function DriftingGradientLayer({
  active,
  index,
  layer,
  size,
}: {
  active: boolean;
  index: number;
  layer: GradientLayer;
  size: number;
}) {
  const progress = useSharedValue(0);
  const drift = DRIFT_SPECS[index % DRIFT_SPECS.length];
  const layerSize = size * 1.4;
  const offset = (size - layerSize) / 2;
  const duration = 2400 + index * 500;

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }

    progress.value = withRepeat(
      withSequence(
        withTiming(1, { duration, easing: Easing.inOut(Easing.sin) }),
        withTiming(0, { duration, easing: Easing.inOut(Easing.sin) }),
      ),
      -1,
      false,
    );
  }, [active, duration, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: progress.value * drift.dx },
      { translateY: progress.value * drift.dy },
    ],
  }));

  return (
    <Animated.View
      style={[
        styles.driftLayer,
        {
          height: layerSize,
          left: offset,
          top: offset,
          width: layerSize,
        },
        animatedStyle,
      ]}
    >
      <LinearGradient
        colors={[...layer.colors]}
        end={layer.end}
        locations={layer.locations ? [...layer.locations] : undefined}
        start={layer.start}
        style={StyleSheet.absoluteFill}
      />
    </Animated.View>
  );
});

function OrbDepthRim({ size }: { size: number }) {
  const id = useId().replace(/:/g, '');
  const specId = `${id}-spec`;
  const rimId = `${id}-rim`;

  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill}>
      <Svg height={size} width={size}>
        <Defs>
          <RadialGradient cx="36%" cy="32%" id={specId} r="48%">
            <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.32" />
            <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient cx="52%" cy="58%" id={rimId} r="72%">
            <Stop offset="70%" stopColor="#1A1028" stopOpacity="0" />
            <Stop offset="100%" stopColor="#1A1028" stopOpacity="0.22" />
          </RadialGradient>
        </Defs>
        <Rect fill={`url(#${rimId})`} height={size} width={size} />
        <Rect fill={`url(#${specId})`} height={size} width={size} />
      </Svg>
    </View>
  );
}

export const ExerciseOrbMesh = memo(function ExerciseOrbMesh({
  active = true,
  size,
  variant,
}: {
  active?: boolean;
  size: number;
  variant: CardGradientVariant;
}) {
  const preset = getCardGradientPreset(variant);

  return (
    <View style={{ width: size, height: size }}>
      <View style={[StyleSheet.absoluteFill, { backgroundColor: preset.base }]} />
      {preset.layers.map((layer, index) => (
        <DriftingGradientLayer
          key={`${variant}-${index}`}
          active={active}
          index={index}
          layer={layer}
          size={size}
        />
      ))}
      <OrbDepthRim size={size} />
      <GradientGrainOverlay />
    </View>
  );
});

const styles = StyleSheet.create({
  driftLayer: {
    position: 'absolute',
  },
});

import { LinearGradient } from 'expo-linear-gradient';
import { memo, useId } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Defs, FeTurbulence, Filter, Rect } from 'react-native-svg';

export type CardGradientVariant = 'breath' | 'integration' | 'neutral' | 'resonance' | 'tone';

type GradientLayer = {
  colors: readonly [string, string, ...string[]];
  start: { x: number; y: number };
  end: { x: number; y: number };
  locations?: readonly [number, number, ...number[]];
};

type GradientPreset = {
  base: string;
  layers: GradientLayer[];
};

const CARD_GRADIENTS: Record<CardGradientVariant, GradientPreset> = {
  breath: {
    base: '#F7FAFF',
    layers: [
      {
        colors: ['rgba(168, 220, 245, 0.92)', 'rgba(168, 220, 245, 0)', 'rgba(168, 220, 245, 0)'],
        start: { x: 0, y: 0 },
        end: { x: 0.85, y: 0.75 },
        locations: [0, 0.45, 1],
      },
      {
        colors: ['rgba(255, 244, 196, 0.88)', 'rgba(255, 244, 196, 0)', 'rgba(255, 244, 196, 0)'],
        start: { x: 0, y: 1 },
        end: { x: 0.7, y: 0.2 },
        locations: [0, 0.5, 1],
      },
      {
        colors: ['rgba(196, 236, 214, 0.72)', 'rgba(196, 236, 214, 0)', 'rgba(196, 236, 214, 0)'],
        start: { x: 1, y: 0.35 },
        end: { x: 0.15, y: 0.9 },
        locations: [0, 0.42, 1],
      },
      {
        colors: ['rgba(228, 210, 255, 0.38)', 'rgba(228, 210, 255, 0)'],
        start: { x: 1, y: 0 },
        end: { x: 0.4, y: 0.55 },
      },
    ],
  },
  tone: {
    base: '#FFFAF2',
    layers: [
      {
        colors: ['rgba(255, 238, 170, 0.95)', 'rgba(255, 238, 170, 0)', 'rgba(255, 238, 170, 0)'],
        start: { x: 0, y: 0 },
        end: { x: 0.75, y: 0.65 },
        locations: [0, 0.48, 1],
      },
      {
        colors: ['rgba(255, 196, 148, 0.82)', 'rgba(255, 196, 148, 0)', 'rgba(255, 196, 148, 0)'],
        start: { x: 0.55, y: 0.35 },
        end: { x: 1, y: 1 },
        locations: [0, 0.52, 1],
      },
      {
        colors: ['rgba(255, 248, 228, 0.9)', 'rgba(255, 248, 228, 0)'],
        start: { x: 0, y: 0.85 },
        end: { x: 0.85, y: 0.1 },
      },
      {
        colors: ['rgba(210, 228, 245, 0.28)', 'rgba(210, 228, 245, 0)'],
        start: { x: 1, y: 0 },
        end: { x: 0.35, y: 0.4 },
      },
    ],
  },
  resonance: {
    base: '#F6F0FF',
    layers: [
      {
        colors: ['rgba(210, 188, 255, 0.9)', 'rgba(210, 188, 255, 0)', 'rgba(210, 188, 255, 0)'],
        start: { x: 0.5, y: 0.5 },
        end: { x: 1, y: 1 },
        locations: [0, 0.55, 1],
      },
      {
        colors: ['rgba(170, 210, 255, 0.72)', 'rgba(170, 210, 255, 0)', 'rgba(170, 210, 255, 0)'],
        start: { x: 0, y: 0 },
        end: { x: 0.8, y: 0.55 },
        locations: [0, 0.45, 1],
      },
      {
        colors: ['rgba(255, 220, 175, 0.62)', 'rgba(255, 220, 175, 0)'],
        start: { x: 0, y: 1 },
        end: { x: 0.65, y: 0.25 },
      },
      {
        colors: ['rgba(245, 240, 255, 0.95)', 'rgba(245, 240, 255, 0)'],
        start: { x: 0.75, y: 0.15 },
        end: { x: 0.1, y: 0.85 },
      },
    ],
  },
  integration: {
    base: '#F8FFF9',
    layers: [
      {
        colors: ['rgba(186, 240, 210, 0.9)', 'rgba(186, 240, 210, 0)', 'rgba(186, 240, 210, 0)'],
        start: { x: 0, y: 0 },
        end: { x: 0.75, y: 0.7 },
        locations: [0, 0.5, 1],
      },
      {
        colors: ['rgba(180, 220, 255, 0.78)', 'rgba(180, 220, 255, 0)', 'rgba(180, 220, 255, 0)'],
        start: { x: 1, y: 0 },
        end: { x: 0.2, y: 0.65 },
        locations: [0, 0.48, 1],
      },
      {
        colors: ['rgba(255, 242, 175, 0.85)', 'rgba(255, 242, 175, 0)'],
        start: { x: 1, y: 1 },
        end: { x: 0.25, y: 0.35 },
      },
      {
        colors: ['rgba(240, 210, 255, 0.35)', 'rgba(240, 210, 255, 0)'],
        start: { x: 0, y: 0.75 },
        end: { x: 0.55, y: 0.1 },
      },
    ],
  },
  neutral: {
    base: '#F4F4F8',
    layers: [
      {
        colors: ['rgba(255, 255, 255, 0.95)', 'rgba(255, 255, 255, 0)', 'rgba(255, 255, 255, 0)'],
        start: { x: 0, y: 0 },
        end: { x: 0.85, y: 0.85 },
        locations: [0, 0.42, 1],
      },
      {
        colors: ['rgba(220, 218, 235, 0.55)', 'rgba(220, 218, 235, 0)'],
        start: { x: 1, y: 1 },
        end: { x: 0.15, y: 0.2 },
      },
    ],
  },
};

export function getCardGradientPreset(variant: CardGradientVariant) {
  return CARD_GRADIENTS[variant];
}

const GrainOverlay = memo(function GrainOverlay() {
  const filterId = useId().replace(/:/g, '');

  return (
    <View pointerEvents="none" style={styles.grain}>
      <Svg height="100%" width="100%">
        <Defs>
          <Filter id={filterId}>
            <FeTurbulence baseFrequency="0.85" numOctaves="4" stitchTiles="stitch" type="fractalNoise" />
          </Filter>
        </Defs>
        <Rect filter={`url(#${filterId})`} height="100%" opacity={0.11} width="100%" />
      </Svg>
    </View>
  );
});

export function CardGradientBackground({
  muted = false,
  variant = 'integration',
}: {
  muted?: boolean;
  variant?: CardGradientVariant;
}) {
  const preset = CARD_GRADIENTS[variant];

  return (
    <View pointerEvents="none" style={[styles.root, muted && styles.muted]}>
      <View style={[styles.base, { backgroundColor: preset.base }]} />
      {preset.layers.map((layer, index) => (
        <LinearGradient
          key={`${variant}-${index}`}
          colors={[...layer.colors]}
          end={layer.end}
          locations={layer.locations ? [...layer.locations] : undefined}
          start={layer.start}
          style={StyleSheet.absoluteFill}
        />
      ))}
      <GrainOverlay />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  base: {
    ...StyleSheet.absoluteFillObject,
  },
  grain: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.9,
  },
  muted: {
    opacity: 0.56,
  },
});

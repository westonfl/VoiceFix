import { memo, useEffect, useId, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, {
  Easing,
  type SharedValue,
  useAnimatedProps,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';
import Svg, {
  Circle,
  Defs,
  FeTurbulence,
  Filter,
  G,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import type { CardGradientVariant } from '@/features/onboarding/cardGradientBackground';
import { getCardGradientPreset } from '@/features/onboarding/cardGradientBackground';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

type WanderStep = {
  x: number;
  y: number;
  duration: number;
};

export type MeshBlob = {
  color: string;
  radius: number;
  ix: number;
  iy: number;
};

type MeshGradientSurfaceProps = {
  size: number;
  blobs: MeshBlob[];
  active?: boolean;
  grain?: 'none' | 'normal' | 'heavy';
  surfaceId?: string;
  baseColor?: string;
  depth?: boolean;
  motion?: 'calm' | 'lively';
};

function buildWanderSequence(
  size: number,
  steps: number,
  marginRatio = 0.1,
  durationRange: [number, number] = [2000, 6500],
): WanderStep[] {
  const margin = size * marginRatio;
  const span = size - margin * 2;

  return Array.from({ length: steps }, () => ({
    x: margin + Math.random() * span,
    y: margin + Math.random() * span,
    duration: durationRange[0] + Math.random() * (durationRange[1] - durationRange[0]),
  }));
}

function wander(x: SharedValue<number>, y: SharedValue<number>, sequence: WanderStep[]) {
  const timing = {
    easing: Easing.inOut(Easing.sin),
  };

  x.value = withRepeat(
    withSequence(
      ...sequence.map((step) =>
        withTiming(step.x, {
          duration: step.duration,
          ...timing,
        }),
      ),
    ),
    -1,
    true,
  );
  y.value = withRepeat(
    withSequence(
      ...sequence.map((step) =>
        withTiming(step.y, {
          duration: step.duration,
          ...timing,
        }),
      ),
    ),
    -1,
    true,
  );
}

/**
 * Grain blended into the mesh colors (soft-light), not a gray sheet on top.
 */
const MeshNoiseLayer = memo(function MeshNoiseLayer({
  intensity = 'normal',
  filterId,
}: {
  intensity?: 'normal' | 'heavy';
  filterId: string;
}) {
  const heavy = intensity === 'heavy';

  return (
    <View
      pointerEvents="none"
      style={[
        styles.noiseBlend,
        heavy ? styles.noiseBlendHeavy : styles.noiseBlendNormal,
      ]}
    >
      <Svg height="100%" width="100%">
        <Defs>
          <Filter id={filterId}>
            <FeTurbulence
              baseFrequency={heavy ? '0.62' : '0.78'}
              numOctaves="4"
              stitchTiles="stitch"
              type="fractalNoise"
            />
          </Filter>
        </Defs>
        <Rect fill="#A0A0A8" filter={`url(#${filterId})`} height="100%" width="100%" />
      </Svg>
    </View>
  );
});

function MeshBlobCircle({
  gradId,
  radius,
  x,
  y,
}: {
  gradId: string;
  radius: number;
  x: SharedValue<number>;
  y: SharedValue<number>;
}) {
  const animatedProps = useAnimatedProps(() => ({
    cx: x.value,
    cy: y.value,
  }));

  return (
    <AnimatedCircle animatedProps={animatedProps} fill={`url(#${gradId})`} r={radius} />
  );
}

function MeshDepthLighting({ idPrefix, size }: { idPrefix: string; size: number }) {
  const rimId = `${idPrefix}-depth-rim`;
  const specId = `${idPrefix}-depth-spec`;
  const coreId = `${idPrefix}-depth-core`;
  const hotId = `${idPrefix}-depth-hot`;

  return (
    <G>
      <Defs>
        <RadialGradient cx="52%" cy="58%" id={rimId} r="72%">
          <Stop offset="55%" stopColor="#1A1028" stopOpacity="0" />
          <Stop offset="88%" stopColor="#1A1028" stopOpacity="0.38" />
          <Stop offset="100%" stopColor="#0A0612" stopOpacity="0.52" />
        </RadialGradient>
        <RadialGradient cx="36%" cy="30%" id={specId} r="52%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.82" />
          <Stop offset="28%" stopColor="#FFFFFF" stopOpacity="0.34" />
          <Stop offset="62%" stopColor="#FFFFFF" stopOpacity="0.06" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient cx="50%" cy="78%" id={coreId} r="58%">
          <Stop offset="0%" stopColor="#2A1838" stopOpacity="0.1" />
          <Stop offset="55%" stopColor="#2A1838" stopOpacity="0.04" />
          <Stop offset="100%" stopColor="#2A1838" stopOpacity="0" />
        </RadialGradient>
        <RadialGradient cx="40%" cy="34%" id={hotId} r="22%">
          <Stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.95" />
          <Stop offset="45%" stopColor="#FFFFFF" stopOpacity="0.35" />
          <Stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Rect fill={`url(#${rimId})`} height={size} width={size} />
      <Rect fill={`url(#${coreId})`} height={size} width={size} />
      <Rect fill={`url(#${specId})`} height={size} width={size} />
      <Circle
        cx={size * 0.4}
        cy={size * 0.34}
        fill={`url(#${hotId})`}
        r={size * 0.19}
      />
    </G>
  );
}

export function MeshGradientSurface({
  size,
  blobs,
  active = true,
  grain = 'normal',
  surfaceId,
  baseColor = '#F8F4FF',
  depth = false,
  motion = 'calm',
}: MeshGradientSurfaceProps) {
  const idPrefix = surfaceId ?? useId().replace(/:/g, '');
  const coarseNoiseId = `${idPrefix}-noise-coarse`;
  const fineNoiseId = `${idPrefix}-noise-fine`;
  const lively = motion === 'lively';

  const wanderSeqs = useMemo(
    () =>
      blobs.map((_, index) =>
        buildWanderSequence(
          size,
          lively ? 6 + (index % 3) : 5 + (index % 4),
          lively ? 0.02 : 0.06 + (index % 3) * 0.03,
          lively ? [900, 2200] : [2000, 6500],
        ),
      ),
    [blobs, lively, size],
  );

  const posX0 = useSharedValue(blobs[0].ix * size);
  const posY0 = useSharedValue(blobs[0].iy * size);
  const posX1 = useSharedValue(blobs[1].ix * size);
  const posY1 = useSharedValue(blobs[1].iy * size);
  const posX2 = useSharedValue(blobs[2].ix * size);
  const posY2 = useSharedValue(blobs[2].iy * size);
  const posX3 = useSharedValue(blobs[3].ix * size);
  const posY3 = useSharedValue(blobs[3].iy * size);
  const posX4 = useSharedValue(blobs[4].ix * size);
  const posY4 = useSharedValue(blobs[4].iy * size);
  const posX5 = useSharedValue(blobs[5].ix * size);
  const posY5 = useSharedValue(blobs[5].iy * size);

  const positions = [
    { x: posX0, y: posY0 },
    { x: posX1, y: posY1 },
    { x: posX2, y: posY2 },
    { x: posX3, y: posY3 },
    { x: posX4, y: posY4 },
    { x: posX5, y: posY5 },
  ];

  useEffect(() => {
    if (!active) {
      return;
    }

    blobs.forEach((blob, index) => {
      const pos = positions[index];
      if (!pos) {
        return;
      }

      pos.x.value = blob.ix * size;
      pos.y.value = blob.iy * size;
      wander(pos.x, pos.y, wanderSeqs[index]);
    });
  }, [active, blobs, size, wanderSeqs]);

  return (
    <View style={[styles.surface, { width: size, height: size }]}>
      <Svg height={size} width={size}>
        <Defs>
          {blobs.map((blob, index) => {
            const gradId = `${idPrefix}-grad-${index}`;
            return (
              <RadialGradient key={gradId} cx="50%" cy="50%" id={gradId} r="50%">
                <Stop offset="0%" stopColor={blob.color} stopOpacity="1" />
                <Stop
                  offset={lively ? '28%' : '38%'}
                  stopColor={blob.color}
                  stopOpacity={lively ? '0.78' : '0.72'}
                />
                <Stop
                  offset={lively ? '52%' : '72%'}
                  stopColor={blob.color}
                  stopOpacity={lively ? '0.12' : '0.2'}
                />
                <Stop offset="100%" stopColor={blob.color} stopOpacity="0" />
              </RadialGradient>
            );
          })}
        </Defs>

        <G>
          <Rect fill={baseColor} height={size} width={size} />

          {blobs.map((blob, index) => {
            const pos = positions[index];
            if (!pos) {
              return null;
            }

            return (
              <MeshBlobCircle
                key={`${idPrefix}-blob-${index}`}
                gradId={`${idPrefix}-grad-${index}`}
                radius={blob.radius}
                x={pos.x}
                y={pos.y}
              />
            );
          })}
        </G>

        {depth ? <MeshDepthLighting idPrefix={idPrefix} size={size} /> : null}
      </Svg>

      {grain !== 'none' ? (
        <>
          <MeshNoiseLayer filterId={coarseNoiseId} intensity={grain} />
          {grain === 'heavy' ? (
            <MeshNoiseLayer filterId={fineNoiseId} intensity="normal" />
          ) : null}
        </>
      ) : null}
    </View>
  );
}

const BLOB_LAYOUT = [
  { radius: 0.48, ix: 0.36, iy: 0.32 },
  { radius: 0.45, ix: 0.64, iy: 0.56 },
  { radius: 0.43, ix: 0.26, iy: 0.66 },
  { radius: 0.4, ix: 0.74, iy: 0.26 },
  { radius: 0.38, ix: 0.52, iy: 0.46 },
  { radius: 0.36, ix: 0.42, iy: 0.2 },
] as const;

function rgbaToHex(color: string): string {
  const match = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
  if (!match) {
    return color.startsWith('#') ? color : '#D4BCFF';
  }

  const toHex = (value: string) => Number(value).toString(16).padStart(2, '0');
  return `#${toHex(match[1])}${toHex(match[2])}${toHex(match[3])}`;
}

function vibranceHex(hex: string, amount = 1.18): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  const mid = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
  const push = (channel: number) =>
    Math.min(255, Math.max(0, Math.round(mid + (channel - mid) * amount)));
  const toHex = (value: number) => value.toString(16).padStart(2, '0');

  return `#${toHex(push(r))}${toHex(push(g))}${toHex(push(b))}`;
}

export function meshBlobsFromGradientVariant(
  variant: CardGradientVariant,
  size = 220,
): { blobs: MeshBlob[]; baseColor: string } {
  const preset = getCardGradientPreset(variant);

  const blobs = BLOB_LAYOUT.map((layout, index) => {
    const layer = preset.layers[index % preset.layers.length];
    const color = vibranceHex(rgbaToHex(layer.colors[0]));
    const ix = layer.start.x * 0.55 + layout.ix * 0.45;
    const iy = layer.start.y * 0.55 + layout.iy * 0.45;

    return {
      color,
      radius: layout.radius * size,
      ix: Math.min(0.88, Math.max(0.12, ix)),
      iy: Math.min(0.88, Math.max(0.12, iy)),
    };
  });

  return { blobs, baseColor: preset.base };
}

const styles = StyleSheet.create({
  surface: {
    overflow: 'hidden',
  },
  noiseBlend: {
    ...StyleSheet.absoluteFillObject,
    mixBlendMode: 'soft-light',
  },
  noiseBlendNormal: {
    opacity: 0.42,
  },
  noiseBlendHeavy: {
    opacity: 0.58,
  },
});

export type { CardGradientVariant };

import { MaterialIcons } from "@expo/vector-icons";
import { useEffect } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withDelay,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";

import { RehearTheme as theme } from "@/constants/theme";

import {
  CardGradientBackground,
  type CardGradientVariant,
} from "./cardGradientBackground";
import type { IconName, OnboardingOption } from "./types";

export { CardGradientBackground, type CardGradientVariant };

const waveform = [
  24, 52, 36, 78, 44, 92, 58, 34, 72, 102, 48, 30, 66, 42, 84, 38,
];

export function StudioMark({ large = false }: { large?: boolean }) {
  return (
    <View style={[styles.mark, large && styles.markLarge]}>
      <View style={styles.markGlow} />
      <MaterialIcons
        name="graphic-eq"
        size={large ? 40 : 26}
        color={theme.primaryBright}
      />
    </View>
  );
}

function WaveBar({
  baseHeight,
  index,
  active,
}: {
  baseHeight: number;
  index: number;
  active: boolean;
}) {
  const progress = useSharedValue(0);
  const accent = index === 9 || index === 14;

  useEffect(() => {
    if (!active) {
      progress.value = 0;
      return;
    }

    progress.value = withDelay(
      index * 55,
      withRepeat(
        withSequence(
          withTiming(1, {
            duration: 360 + (index % 5) * 40,
            easing: Easing.inOut(Easing.sin),
          }),
          withTiming(0, {
            duration: 360 + (index % 5) * 40,
            easing: Easing.inOut(Easing.sin),
          }),
        ),
        -1,
        false,
      ),
    );
  }, [active, index, progress]);

  const animatedStyle = useAnimatedStyle(() => ({
    height: active
      ? Math.max(18, baseHeight * (0.48 + progress.value * 0.52))
      : Math.max(16, baseHeight * 0.62),
    opacity: active
      ? 0.42 + progress.value * (accent ? 0.54 : 0.38)
      : 0.36,
  }));

  return (
    <Animated.View
      style={[
        styles.waveBar,
        {
          backgroundColor: accent ? theme.energy : theme.primaryBright,
        },
        animatedStyle,
      ]}
    />
  );
}

export function SignalWave({ active = false }: { active?: boolean }) {
  return (
    <View style={styles.wave}>
      {waveform.map((height, index) => (
        <WaveBar key={`${height}-${index}`} active={active} baseHeight={height} index={index} />
      ))}
    </View>
  );
}

export function ScreenHeader({
  eyebrow,
  title,
  body,
}: {
  eyebrow: string;
  title: string;
  body?: string;
}) {
  return (
    <View style={styles.headerCopy}>
      <View style={styles.speechBubbleRow}>
        <View style={styles.speechTailSlot}>
          <View style={styles.speechTail} />
        </View>
        <View style={styles.speechBubble}>
          <Text style={styles.title}>{title}</Text>
        </View>
      </View>
      <Text style={styles.eyebrow}>{eyebrow}</Text>
      {body ? <Text style={styles.body}>{body}</Text> : null}
    </View>
  );
}

export function PrimaryButton({
  label,
  icon = "arrow-forward",
  disabled = false,
  variant = "integration",
  onPress,
}: {
  label: string;
  icon?: IconName;
  disabled?: boolean;
  variant?: CardGradientVariant;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryButtonPressed,
        disabled && styles.disabled,
      ]}
    >
      <CardGradientBackground variant={variant} />
      <Text style={styles.primaryButtonText}>{label}</Text>
      <MaterialIcons name={icon} size={20} color={theme.textMuted} />
    </Pressable>
  );
}

export function SecondaryButton({
  label,
  onPress,
}: {
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={styles.secondaryButton}
    >
      <Text style={styles.secondaryButtonText}>{label}</Text>
    </Pressable>
  );
}

export function OptionCard({
  option,
  selected,
  onPress,
}: {
  option: OnboardingOption;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.option,
        selected && styles.optionSelected,
        pressed && styles.optionPressed,
      ]}
    >
      <View style={[styles.optionIcon, selected && styles.optionIconSelected]}>
        <MaterialIcons
          name={option.icon}
          size={22}
          color={selected ? theme.backgroundDeep : theme.primaryBright}
        />
      </View>
      <View style={styles.optionText}>
        <Text style={styles.optionLabel}>{option.label}</Text>
        <Text style={styles.optionDetail}>{option.detail}</Text>
      </View>
      <MaterialIcons
        name={selected ? "check-circle" : "radio-button-unchecked"}
        size={22}
        color={selected ? theme.success : theme.textSubtle}
      />
    </Pressable>
  );
}

export function InfoList({
  items,
}: {
  items: Array<string | { label: string; detail: string; icon: IconName }>;
}) {
  return (
    <View style={styles.infoList}>
      {items.map((item, index) => {
        const value =
          typeof item === "string"
            ? { label: item, detail: "", icon: "check" as IconName }
            : item;
        return (
          <View key={`${value.label}-${index}`} style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <MaterialIcons
                name={value.icon}
                size={18}
                color={theme.primaryBright}
              />
            </View>
            <View style={styles.infoText}>
              <Text style={styles.infoLabel}>{value.label}</Text>
              {value.detail ? (
                <Text style={styles.infoDetail}>{value.detail}</Text>
              ) : null}
            </View>
          </View>
        );
      })}
    </View>
  );
}

export function Pill({
  label,
  tone = "signal",
}: {
  label: string;
  tone?: "signal" | "violet" | "green" | "amber";
}) {
  const color =
    tone === "violet"
      ? theme.journal
      : tone === "green"
        ? theme.success
        : tone === "amber"
          ? theme.warning
          : theme.primaryBright;

  return (
    <View style={[styles.pill, { borderColor: color }]}>
      <Text style={[styles.pillText, { color }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  mark: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 24,
    height: 56,
    justifyContent: "center",
    overflow: "hidden",
    width: 56,
  },
  markLarge: {
    borderRadius: 44,
    height: 112,
    width: 112,
  },
  markGlow: {
    backgroundColor: "transparent",
    borderRadius: 999,
    height: 120,
    position: "absolute",
    width: 120,
  },
  wave: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    height: 112,
    justifyContent: "center",
  },
  waveBar: {
    borderRadius: 999,
    width: 6,
  },
  headerCopy: {
    gap: 18,
  },
  eyebrow: {
    color: theme.textSubtle,
    fontSize: 16,
    fontWeight: "800",
    letterSpacing: 0,
    textAlign: "center",
  },
  speechBubbleRow: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    maxWidth: "88%",
  },
  speechTailSlot: {
    alignSelf: "stretch",
    justifyContent: "center",
    width: 0,
    zIndex: 1,
  },
  speechBubble: {
    backgroundColor: theme.text,
    borderRadius: 42,
    flex: 1,
    minHeight: 108,
    overflow: "visible",
    paddingHorizontal: 32,
    paddingVertical: 28,
  },
  speechTail: {
    backgroundColor: theme.text,
    height: 18,
    left: -9,
    position: "absolute",
    transform: [{ rotate: "45deg" }],
    width: 18,
  },
  title: {
    color: theme.background,
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 39,
  },
  body: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderColor: "rgba(69, 69, 77, 0.38)",
    borderRadius: 30,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 64,
    overflow: "hidden",
    paddingHorizontal: 18,
  },
  primaryButtonPressed: {
    opacity: 0.76,
  },
  primaryButtonText: {
    color: theme.textMuted,
    fontSize: 20,
    fontWeight: "900",
    zIndex: 1,
  },
  disabled: {
    opacity: 0.42,
  },
  secondaryButton: {
    alignItems: "center",
    borderRadius: 30,
    justifyContent: "center",
    minHeight: 54,
    paddingHorizontal: 16,
  },
  secondaryButtonText: {
    color: theme.textSubtle,
    fontSize: 18,
    fontWeight: "800",
  },
  option: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderColor: "transparent",
    borderRadius: 24,
    borderWidth: 2,
    flexDirection: "row",
    gap: 16,
    minHeight: 92,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  optionSelected: {
    backgroundColor: theme.background,
    borderColor: theme.text,
  },
  optionPressed: {
    transform: [{ scale: 0.99 }],
  },
  optionIcon: {
    alignItems: "center",
    backgroundColor: "transparent",
    borderRadius: 18,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  optionIconSelected: {
    backgroundColor: theme.text,
  },
  optionText: {
    flex: 1,
    gap: 4,
  },
  optionLabel: {
    color: theme.text,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 26,
  },
  optionDetail: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 19,
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 24,
    flexDirection: "row",
    gap: 12,
    padding: 18,
  },
  infoIcon: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 16,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  infoText: {
    flex: 1,
    gap: 3,
  },
  infoLabel: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
  },
  infoDetail: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  pill: {
    alignSelf: "flex-start",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 6,
  },
  pillText: {
    fontSize: 12,
    fontWeight: "700",
  },
});

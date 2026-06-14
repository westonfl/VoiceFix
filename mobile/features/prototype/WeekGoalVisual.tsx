import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { StyleSheet, View } from "react-native";

import { VoiceFixTheme as theme } from "@/constants/theme";
import {
  CardGradientBackground,
  type CardGradientVariant,
} from "@/features/onboarding/components";

type WeekGoalVisualProps = {
  weekNumber: number;
  compact?: boolean;
  locked?: boolean;
};

export function WeekGoalVisual({
  weekNumber,
  compact = false,
  locked = false,
}: WeekGoalVisualProps) {
  const sizeStyle = compact ? styles.compact : styles.hero;
  const gradientVariant = getWeekGradient(weekNumber, locked);

  if (locked) {
    return (
      <View style={[styles.frame, sizeStyle, styles.lockedFrame]}>
        <View style={[styles.lockBadge, compact && styles.lockBadgeCompact]}>
          <MaterialIcons
            name="lock"
            size={compact ? 18 : 22}
            color={theme.text}
          />
        </View>
      </View>
    );
  }

  if (weekNumber === 1) {
    return (
      <View style={[styles.frame, sizeStyle]}>
        <CardGradientBackground muted variant={gradientVariant} />
        <View style={styles.breathTrack} />
        <View style={styles.breathDots}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[styles.airDot, { opacity: 0.35 + index * 0.2 }]}
            />
          ))}
        </View>
      </View>
    );
  }

  if (weekNumber === 2) {
    return (
      <View style={[styles.frame, sizeStyle]}>
        <CardGradientBackground muted variant={gradientVariant} />
        <View style={styles.onsetRow}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[styles.ghostMark, { width: 12 + index * 8 }]}
            />
          ))}
          <View style={styles.soundCore} />
        </View>
      </View>
    );
  }

  if (weekNumber === 3) {
    return (
      <View style={[styles.frame, sizeStyle]}>
        <CardGradientBackground muted variant={gradientVariant} />
        <View style={styles.resonanceCenter} />
        <View style={styles.resonanceArc}>
          {[0, 1, 2, 3, 4, 5, 6].map((index) => (
            <View
              key={index}
              style={[
                styles.resonanceDot,
                { transform: [{ translateY: Math.abs(index - 3) * 7 }] },
              ]}
            />
          ))}
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.frame, sizeStyle]}>
      <CardGradientBackground muted variant={gradientVariant} />
      <View style={styles.bridgeRow}>
        <View style={styles.bridgeLine} />
        <View style={styles.bridgePulse} />
        <View style={styles.bridgeOpen} />
      </View>
    </View>
  );
}

function getWeekGradient(
  weekNumber: number,
  locked: boolean,
): CardGradientVariant {
  if (locked) {
    return "neutral";
  }

  if (weekNumber === 1) {
    return "breath";
  }

  if (weekNumber === 2) {
    return "tone";
  }

  if (weekNumber === 3) {
    return "resonance";
  }

  return "integration";
}

const styles = StyleSheet.create({
  frame: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 28,
    justifyContent: "center",
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 22,
  },
  hero: {
    height: 138,
    width: "100%",
  },
  compact: {
    height: 82,
    width: "100%",
  },
  lockedFrame: {
    backgroundColor: theme.surfaceRaised,
    shadowOpacity: 0,
  },
  lockBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.14)",
    borderRadius: 999,
    height: 44,
    justifyContent: "center",
    width: 44,
  },
  lockBadgeCompact: {
    height: 38,
    width: 38,
  },
  breathTrack: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 6,
    width: "72%",
  },
  breathDots: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  airDot: {
    backgroundColor: theme.textMuted,
    borderRadius: 999,
    height: 6,
    width: 6,
  },
  onsetRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
  },
  ghostMark: {
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    borderRadius: 999,
    height: 6,
    width: 22,
  },
  soundCore: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 8,
    width: 54,
  },
  resonanceCenter: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 16,
    width: 16,
  },
  resonanceArc: {
    flexDirection: "row",
    gap: 8,
    position: "absolute",
    top: "36%",
  },
  resonanceDot: {
    backgroundColor: "rgba(0, 0, 0, 0.18)",
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  bridgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  bridgeLine: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 6,
    width: 56,
  },
  bridgePulse: {
    borderColor: theme.text,
    borderRadius: 14,
    borderWidth: 5,
    height: 28,
    width: 28,
  },
  bridgeOpen: {
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    borderRadius: 999,
    height: 6,
    width: 76,
  },
});

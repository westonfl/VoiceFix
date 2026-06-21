import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import type { ComponentProps } from "react";
import { useMemo, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, {
  Defs,
  LinearGradient as SvgLinearGradient,
  Path,
  Stop,
} from "react-native-svg";

import { CloseIconButton, headerIconButtonStyles } from "@/constants/headerButtons";
import { RehearTheme as theme } from "@/constants/theme";
import { mainAppText } from "@/features/prototype/localization";
import { isMonthlyTestPassed, usePrototype } from "@/features/prototype/state";

type AchievementKind = "exercise" | "goal" | "streak" | "pitch" | "month";

const ACHIEVEMENT_COLUMNS = 3;
const ACHIEVEMENT_GRID_GAP = 12;
const ACHIEVEMENT_PANEL_PADDING = 14;
const SCREEN_HORIZONTAL_PADDING = 20;
const BADGE_VIEWBOX_SIZE = 120;
const BADGE_HEX_VERTICES = [
  { x: 60, y: 10 },
  { x: 110, y: 37 },
  { x: 110, y: 83 },
  { x: 60, y: 110 },
  { x: 10, y: 83 },
  { x: 10, y: 37 },
] as const;
const BADGE_HEX_PATH = roundedPolygonPath(BADGE_HEX_VERTICES, 10);

type Achievement = {
  id: string;
  title: string;
  earnedDescription: string;
  lockedDescription: string;
  goal: number;
  progress: number;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  kind: AchievementKind;
};

export default function MilestonesScreen() {
  const { state } = usePrototype();
  const { width: windowWidth } = useWindowDimensions();
  const text = mainAppText[state.language];
  const [selectedAchievementId, setSelectedAchievementId] = useState<
    string | null
  >(null);
  const achievements = useMemo(() => buildAchievements(state), [state]);
  const selectedAchievement =
    achievements.find((achievement) => achievement.id === selectedAchievementId) ??
    null;
  const { achievementTileWidth, achievementBadgeSize } = useMemo(() => {
    const panelWidth = windowWidth - SCREEN_HORIZONTAL_PADDING * 2;
    const innerWidth = panelWidth - ACHIEVEMENT_PANEL_PADDING * 2;
    const tileWidth =
      (innerWidth - ACHIEVEMENT_GRID_GAP * (ACHIEVEMENT_COLUMNS - 1)) /
      ACHIEVEMENT_COLUMNS;
    const badgeSize = Math.min(88, Math.round(tileWidth * 0.88));

    return {
      achievementTileWidth: tileWidth,
      achievementBadgeSize: badgeSize,
    };
  }, [windowWidth]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{text.tabs.journal}</Text>
          <Text style={styles.body}>{text.journal.body}</Text>
        </View>

        <View style={styles.summaryStrip}>
          <SummaryMetric label="Exercises" value={getExerciseProgress(state)} />
          <SummaryMetric
            label="Goals"
            value={getDailyGoalProgress(state)}
          />
          <SummaryMetric label="Streak" value={state.streak.current} />
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>{text.journal.title}</Text>
        </View>

        <View style={styles.achievementPanel}>
          {achievements.map((achievement) => (
            <AchievementTile
              achievement={achievement}
              badgeSize={achievementBadgeSize}
              key={achievement.id}
              onPress={() => setSelectedAchievementId(achievement.id)}
              tileWidth={achievementTileWidth}
            />
          ))}
        </View>
      </ScrollView>

      <AchievementSheet
        achievement={selectedAchievement}
        onClose={() => setSelectedAchievementId(null)}
      />
    </SafeAreaView>
  );
}

function buildAchievements(
  state: ReturnType<typeof usePrototype>["state"],
): Achievement[] {
  const exerciseProgress = getExerciseProgress(state);
  const dailyGoalProgress = getDailyGoalProgress(state);
  const pitchPerfectProgress = hasPitchPerfectClip(state) ? 1 : 0;
  const monthProgress = isMonthlyTestPassed(state.monthlyTests, 1) ? 1 : 0;

  return [
    makeAchievement({
      id: "exercise-10",
      title: "10 Exercises",
      description: "completing 10 exercises",
      goal: 10,
      progress: exerciseProgress,
      icon: "mic",
      kind: "exercise",
    }),
    makeAchievement({
      id: "exercise-100",
      title: "100 Exercises",
      description: "completing 100 exercises",
      goal: 100,
      progress: exerciseProgress,
      icon: "mic",
      kind: "exercise",
    }),
    makeAchievement({
      id: "exercise-1000",
      title: "1000 Exercises",
      description: "completing 1000 exercises",
      goal: 1000,
      progress: exerciseProgress,
      icon: "mic",
      kind: "exercise",
    }),
    makeAchievement({
      id: "goal-10",
      title: "10 Daily Goals",
      description: "finishing 10 daily goals",
      goal: 10,
      progress: dailyGoalProgress,
      icon: "check",
      kind: "goal",
    }),
    makeAchievement({
      id: "goal-100",
      title: "100 Daily Goals",
      description: "finishing 100 daily goals",
      goal: 100,
      progress: dailyGoalProgress,
      icon: "check",
      kind: "goal",
    }),
    makeAchievement({
      id: "goal-1000",
      title: "1000 Daily Goals",
      description: "finishing 1000 daily goals",
      goal: 1000,
      progress: dailyGoalProgress,
      icon: "check",
      kind: "goal",
    }),
    makeAchievement({
      id: "streak-7",
      title: "7-Day Streak",
      description: "practicing for 7 days in a row",
      goal: 7,
      progress: state.streak.current,
      icon: "local-fire-department",
      kind: "streak",
    }),
    makeAchievement({
      id: "streak-30",
      title: "30-Day Streak",
      description: "practicing for 30 days in a row",
      goal: 30,
      progress: state.streak.current,
      icon: "local-fire-department",
      kind: "streak",
    }),
    makeAchievement({
      id: "streak-365",
      title: "365-Day Streak",
      description: "practicing for 365 days in a row",
      goal: 365,
      progress: state.streak.current,
      icon: "local-fire-department",
      kind: "streak",
    }),
    makeAchievement({
      id: "pitch-perfect",
      title: "Pitch Perfect",
      description: "recording a stable pitch check",
      goal: 1,
      progress: pitchPerfectProgress,
      icon: "tune",
      kind: "pitch",
    }),
    makeAchievement({
      id: "month-one",
      title: "Month 1 Complete",
      description: "passing the Month 1 checkpoint",
      goal: 1,
      progress: monthProgress,
      icon: "workspace-premium",
      kind: "month",
    }),
  ];
}

function makeAchievement({
  id,
  title,
  description,
  goal,
  progress,
  icon,
  kind,
}: {
  id: string;
  title: string;
  description: string;
  goal: number;
  progress: number;
  icon: ComponentProps<typeof MaterialIcons>["name"];
  kind: AchievementKind;
}): Achievement {
  const cappedProgress = Math.min(progress, goal);

  return {
    id,
    title,
    earnedDescription: `Earned for ${description}.`,
    lockedDescription: `${toImperativePhrase(description)} to earn this badge.`,
    goal,
    progress: cappedProgress,
    icon,
    kind,
  };
}

function getExerciseProgress(state: ReturnType<typeof usePrototype>["state"]) {
  return state.savedClips.length;
}

function getDailyGoalProgress(state: ReturnType<typeof usePrototype>["state"]) {
  return state.savedClips.filter((clip) => clip.dailyGoalMet).length;
}

function hasPitchPerfectClip(state: ReturnType<typeof usePrototype>["state"]) {
  return state.savedClips.some((clip) => {
    const pitchScore = clip.analysisMetrics?.pitchScore;
    const pitchAccuracy = clip.analysisMetrics?.pitchAccuracy;

    return (
      (typeof pitchScore === "number" && pitchScore >= 0.9) ||
      (typeof pitchAccuracy === "number" && pitchAccuracy >= 90)
    );
  });
}

function SummaryMetric({ label, value }: { label: string; value: number }) {
  return (
    <View style={styles.summaryMetric}>
      <Text style={styles.summaryValue}>{value}</Text>
      <Text style={styles.summaryLabel}>{label}</Text>
    </View>
  );
}

function AchievementTile({
  achievement,
  badgeSize,
  onPress,
  tileWidth,
}: {
  achievement: Achievement;
  badgeSize: number;
  onPress: () => void;
  tileWidth: number;
}) {
  const earned = achievement.progress >= achievement.goal;

  return (
    <Pressable
      accessibilityLabel={`${achievement.title}, ${earned ? "earned" : "locked"}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.achievementTile,
        { width: tileWidth },
        pressed && styles.achievementTilePressed,
      ]}
    >
      <View style={[styles.badgeSlot, { height: badgeSize, width: badgeSize }]}>
        <BadgeHex achievement={achievement} size={badgeSize} />
      </View>
      <Text style={styles.achievementLabel} numberOfLines={2}>
        {achievement.title}
      </Text>
    </Pressable>
  );
}

function AchievementSheet({
  achievement,
  onClose,
}: {
  achievement: Achievement | null;
  onClose: () => void;
}) {
  const earned = achievement
    ? achievement.progress >= achievement.goal
    : false;
  const remaining = achievement
    ? Math.max(0, achievement.goal - achievement.progress)
    : 0;

  return (
    <Modal
      animationType="fade"
      transparent
      visible={Boolean(achievement)}
      onRequestClose={onClose}
    >
      <Pressable style={styles.sheetBackdrop} onPress={onClose}>
        <Pressable style={styles.sheet}>
          {achievement ? (
            <>
              <CloseIconButton
                accessibilityLabel="Close achievement"
                onPress={onClose}
                style={headerIconButtonStyles.sheetCloseButton}
              />

              <BadgeHex achievement={achievement} size={188} />
              <Text style={styles.sheetTitle}>{achievement.title}</Text>
              <View style={styles.sheetMessage}>
                <Text style={styles.sheetMessageText}>
                  {earned
                    ? achievement.earnedDescription
                    : achievement.lockedDescription}
                </Text>
              </View>
              {!earned && remaining > 0 ? (
                <Text style={styles.progressText}>
                  {achievement.progress} of {achievement.goal} complete
                </Text>
              ) : null}
            </>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function BadgeHex({
  achievement,
  size,
}: {
  achievement: Achievement;
  size: number;
}) {
  const earned = achievement.progress >= achievement.goal;
  const iconSize = Math.round(size * 0.34);

  return (
    <View style={[styles.badgeWrap, { height: size, width: size }]}>
      <Svg
        height={size}
        width={size}
        viewBox={`0 0 ${BADGE_VIEWBOX_SIZE} ${BADGE_VIEWBOX_SIZE}`}
      >
        <Defs>
          <SvgLinearGradient
            id={`badgeGradient-${achievement.id}`}
            x1="0"
            y1="0"
            x2="1"
            y2="1"
          >
            <Stop offset="0" stopColor="#DBFFE4" />
            <Stop offset="0.32" stopColor="#FFF8D8" />
            <Stop offset="0.62" stopColor="#DDF4FF" />
            <Stop offset="1" stopColor="#FFE2F7" />
          </SvgLinearGradient>
        </Defs>
        <Path
          d={BADGE_HEX_PATH}
          fill={
            earned ? `url(#badgeGradient-${achievement.id})` : theme.surface
          }
          stroke={earned ? theme.text : "#DFDFE9"}
          strokeLinejoin="round"
          strokeWidth={earned ? 7 : 6}
        />
      </Svg>
      <View style={styles.badgeIconLayer}>
        <MaterialIcons
          name={achievement.icon}
          size={iconSize}
          color={earned ? theme.text : "#DFDFE9"}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.background,
    flex: 1,
  },
  content: {
    gap: 22,
    paddingHorizontal: 20,
    paddingBottom: 116,
    paddingTop: 14,
  },
  header: {
    gap: 8,
  },
  title: {
    color: theme.text,
    fontSize: 40,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 46,
  },
  body: {
    color: theme.textMuted,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 22,
  },
  summaryStrip: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    padding: 10,
  },
  summaryMetric: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 8,
    flex: 1,
    minHeight: 68,
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  summaryValue: {
    color: theme.text,
    fontSize: 23,
    fontWeight: "900",
  },
  summaryLabel: {
    color: theme.textMuted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2,
  },
  sectionHeader: {
    marginTop: 8,
  },
  sectionTitle: {
    color: theme.text,
    fontSize: 24,
    fontWeight: "900",
  },
  achievementPanel: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: ACHIEVEMENT_GRID_GAP,
    paddingHorizontal: ACHIEVEMENT_PANEL_PADDING,
    paddingVertical: 20,
  },
  achievementTile: {
    alignItems: "center",
    gap: 8,
  },
  badgeSlot: {
    alignItems: "center",
    justifyContent: "center",
  },
  achievementTilePressed: {
    opacity: 0.68,
    transform: [{ scale: 0.98 }],
  },
  achievementLabel: {
    color: theme.text,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 15,
    minHeight: 31,
    textAlign: "center",
  },
  badgeWrap: {
    alignItems: "center",
    justifyContent: "center",
  },
  badgeIconLayer: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
  },
  sheetBackdrop: {
    backgroundColor: "rgba(0, 0, 0, 0.16)",
    flex: 1,
    justifyContent: "flex-end",
  },
  sheet: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    gap: 24,
    minHeight: 520,
    paddingHorizontal: 24,
    paddingBottom: 42,
    paddingTop: 78,
  },
  sheetTitle: {
    color: theme.text,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 38,
    textAlign: "center",
  },
  sheetMessage: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 8,
    maxWidth: 330,
    paddingHorizontal: 20,
    paddingVertical: 20,
    width: "86%",
  },
  sheetMessageText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 22,
    textAlign: "center",
  },
  progressText: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: "800",
  },
});

function toImperativePhrase(description: string): string {
  const [firstWord, ...rest] = description.split(" ");
  const imperativeByGerund: Record<string, string> = {
    completing: "Complete",
    finishing: "Finish",
    passing: "Pass",
    practicing: "Practice",
    recording: "Record",
  };
  const imperative =
    imperativeByGerund[firstWord] ??
    `${firstWord.charAt(0).toUpperCase()}${firstWord.slice(1)}`;

  return `${imperative} ${rest.join(" ")}`;
}

function roundedPolygonPath(
  vertices: ReadonlyArray<{ x: number; y: number }>,
  cornerRadius: number,
): string {
  const count = vertices.length;
  let path = "";

  for (let index = 0; index < count; index += 1) {
    const previous = vertices[(index - 1 + count) % count];
    const current = vertices[index];
    const next = vertices[(index + 1) % count];

    const incoming = {
      x: current.x - previous.x,
      y: current.y - previous.y,
    };
    const outgoing = {
      x: next.x - current.x,
      y: next.y - current.y,
    };
    const incomingLength = Math.hypot(incoming.x, incoming.y);
    const outgoingLength = Math.hypot(outgoing.x, outgoing.y);
    const incomingTrim = Math.min(cornerRadius, incomingLength / 2);
    const outgoingTrim = Math.min(cornerRadius, outgoingLength / 2);

    const start = {
      x: current.x - (incoming.x / incomingLength) * incomingTrim,
      y: current.y - (incoming.y / incomingLength) * incomingTrim,
    };
    const end = {
      x: current.x + (outgoing.x / outgoingLength) * outgoingTrim,
      y: current.y + (outgoing.y / outgoingLength) * outgoingTrim,
    };

    path +=
      index === 0
        ? `M ${start.x} ${start.y} `
        : `L ${start.x} ${start.y} `;
    path += `Q ${current.x} ${current.y} ${end.x} ${end.y} `;
  }

  return `${path}Z`;
}

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VoiceFixTheme as theme } from "@/constants/theme";
import {
  curriculum,
  getPhaseLabel,
  type CurriculumPhase,
  type CurriculumWeek,
} from "@/features/prototype/curriculum";
import {
  displayPhase,
  displayWeek,
  fillTemplate,
  mainAppText,
} from "@/features/prototype/localization";
import {
  isMonthlyTestPassed,
  usePrototype,
} from "@/features/prototype/state";
import { WeekGoalVisual } from "@/features/prototype/WeekGoalVisual";

const phases: CurriculumPhase[] = ["foundation", "control", "songs"];

export default function JourneyScreen() {
  const { state } = usePrototype();
  const text = mainAppText[state.language];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>{text.journey.kicker}</Text>
        </View>

        {phases.map((phase) => {
          const weeks = curriculum.filter((week) => week.phase === phase);
          const meta = getPhaseMeta(phase);
          const monthNumber =
            phase === "foundation" ? 1 : phase === "control" ? 2 : 3;
          const testPassed = isMonthlyTestPassed(
            state.monthlyTests,
            monthNumber,
          );

          if (phase !== "foundation") {
            return (
              <View key={phase} style={styles.phaseBlock}>
                <View style={styles.categoryPill}>
                  <MaterialIcons
                    name={meta.icon}
                    size={20}
                    color={theme.text}
                  />
                  <Text style={styles.categoryText}>
                    {displayPhase(getPhaseLabel(phase), state.language)}
                  </Text>
                  <Text style={styles.categoryMeta}>
                    {text.common.week} {weeks[0].weekNumber}-
                    {weeks[weeks.length - 1].weekNumber}
                  </Text>
                </View>
                <View style={styles.comingSoonCard}>
                  <View style={styles.comingSoonVisual}>
                    <WeekGoalVisual
                      weekNumber={weeks[0].weekNumber}
                      compact
                      locked
                    />
                  </View>
                  <View style={styles.comingSoonCopy}>
                    <Text style={styles.comingSoonTitle}>
                      {text.journey.comingSoon}
                    </Text>
                  </View>
                </View>
              </View>
            );
          }

          return (
            <View key={phase} style={styles.phaseBlock}>
              <View style={styles.categoryPill}>
                <MaterialIcons name={meta.icon} size={20} color={theme.text} />
                <Text style={styles.categoryText}>
                  {displayPhase(getPhaseLabel(phase), state.language)}
                </Text>
                <Text style={styles.categoryMeta}>
                  {text.common.week} {weeks[0].weekNumber}-
                  {weeks[weeks.length - 1].weekNumber}
                </Text>
              </View>

              <View style={styles.monthCard}>
                {weeks.map((week, index) => {
                  const weekDisplay = displayWeek(week, state.language);
                  const isCurrent = week.weekNumber === state.currentWeekNumber;
                  const isReview = week.weekNumber < state.currentWeekNumber;
                  const isNext =
                    week.weekNumber === state.currentWeekNumber + 1;
                  const stateLabel = isReview
                    ? text.journey.review
                    : isCurrent
                      ? text.journey.current
                      : isNext
                        ? text.journey.next
                        : null;

                  return (
                    <WeekListRow
                      key={week.weekNumber}
                      week={week}
                      title={weekDisplay.title}
                      stateLabel={stateLabel}
                      isCurrent={isCurrent}
                      showDivider={index < weeks.length - 1}
                      text={text}
                      weekLabel={`${text.common.week} ${week.weekNumber}`}
                      onPress={() => router.push(`/week/${week.weekNumber}`)}
                    />
                  );
                })}
                <TestingCenterRow
                  month={1}
                  text={text}
                  passed={testPassed}
                />
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}

function WeekListRow({
  week,
  title,
  stateLabel,
  isCurrent,
  showDivider,
  text,
  weekLabel,
  onPress,
}: {
  week: CurriculumWeek;
  title: string;
  stateLabel: string | null;
  isCurrent: boolean;
  showDivider: boolean;
  text: (typeof mainAppText)["en"];
  weekLabel: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityHint={text.journey.openWeekPlan}
      accessibilityLabel={`${weekLabel}: ${title}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.weekRow,
        isCurrent && styles.weekRowCurrent,
        pressed && styles.weekRowPressed,
      ]}
    >
      <View style={[styles.weekBadge, isCurrent && styles.weekBadgeCurrent]}>
        <Text
          style={[
            styles.weekBadgeText,
            isCurrent && styles.weekBadgeTextCurrent,
          ]}
        >
          {week.weekNumber}
        </Text>
      </View>
      <View style={styles.weekRowCopy}>
        <Text
          style={[styles.weekRowTitle, isCurrent && styles.weekRowTitleCurrent]}
          numberOfLines={2}
        >
          {title}
        </Text>
        <Text
          style={[styles.weekRowMeta, isCurrent && styles.weekRowMetaCurrent]}
        >
          {stateLabel ? `${weekLabel} · ${stateLabel}` : weekLabel}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={theme.textSubtle} />
      {showDivider ? <View style={styles.weekRowDivider} /> : null}
    </Pressable>
  );
}

function TestingCenterRow({
  month,
  text,
  passed = false,
}: {
  month: number;
  text: (typeof mainAppText)["en"];
  passed?: boolean;
}) {
  const title = fillTemplate(text.journey.testingCenterTitle, { month });

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() =>
        router.push({
          pathname: "/testing-center/[month]",
          params: { month: `${month}` },
        })
      }
      style={({ pressed }) => [
        styles.weekRow,
        styles.testingRow,
        pressed && styles.weekRowPressed,
      ]}
    >
      <View
        style={[
          styles.weekBadge,
          passed ? styles.weekBadgeCurrent : styles.testingBadge,
        ]}
      >
        <MaterialIcons
          name={passed ? "check" : "science"}
          size={passed ? 20 : 18}
          color={passed ? theme.background : theme.primaryBright}
        />
      </View>
      <View style={styles.weekRowCopy}>
        <Text style={styles.weekRowTitle}>{title}</Text>
        <Text style={styles.weekRowMeta}>
          {passed
            ? text.journey.monthlyCheckpointPassed
            : text.journey.monthlyCheckpoint}
        </Text>
      </View>
      <MaterialIcons name="chevron-right" size={20} color={theme.textSubtle} />
    </Pressable>
  );
}

function getPhaseMeta(phase: CurriculumPhase): {
  icon: ComponentProps<typeof MaterialIcons>["name"];
} {
  if (phase === "foundation") {
    return { icon: "air" };
  }

  if (phase === "control") {
    return { icon: "tune" };
  }

  return { icon: "library-music" };
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.backgroundDeep,
    flex: 1,
  },
  content: {
    gap: 18,
    padding: 20,
    paddingBottom: 116,
  },
  header: {
    paddingTop: 12,
  },
  title: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "800",
    lineHeight: 38,
  },
  phaseBlock: {
    gap: 14,
  },
  categoryPill: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    paddingHorizontal: 4,
  },
  categoryText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  categoryMeta: {
    color: theme.textSubtle,
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right",
    textTransform: "uppercase",
  },
  monthCard: {
    backgroundColor: theme.surface,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    overflow: "hidden",
  },
  weekRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    minHeight: 72,
    paddingHorizontal: 16,
    paddingVertical: 14,
    position: "relative",
  },
  weekRowCurrent: {
    backgroundColor: "rgba(0, 0, 0, 0.04)",
  },
  weekRowPressed: {
    backgroundColor: theme.surfacePressed,
  },
  weekRowDivider: {
    backgroundColor: "rgba(0, 0, 0, 0.08)",
    bottom: 0,
    height: 1,
    left: 64,
    position: "absolute",
    right: 16,
  },
  weekBadge: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 14,
    height: 36,
    justifyContent: "center",
    width: 36,
  },
  weekBadgeCurrent: {
    backgroundColor: theme.text,
  },
  testingBadge: {
    backgroundColor: theme.primarySoft,
  },
  weekBadgeText: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "900",
  },
  weekBadgeTextCurrent: {
    color: theme.background,
  },
  weekRowCopy: {
    flex: 1,
    gap: 3,
    minWidth: 0,
  },
  weekRowTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
    lineHeight: 21,
  },
  weekRowTitleCurrent: {
    fontWeight: "900",
  },
  weekRowMeta: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  weekRowMetaCurrent: {
    color: theme.textMuted,
    fontWeight: "800",
  },
  testingRow: {
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    borderTopWidth: 1,
  },
  comingSoonCard: {
    alignItems: "center",
    backgroundColor: theme.surface,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    flexDirection: "row",
    gap: 14,
    minHeight: 86,
    padding: 16,
    opacity: 0.72,
  },
  comingSoonVisual: {
    width: 104,
  },
  comingSoonCopy: {
    flex: 1,
    gap: 5,
  },
  comingSoonTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
  },
});

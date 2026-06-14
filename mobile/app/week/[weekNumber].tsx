import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { router, useLocalSearchParams } from "expo-router";
import type { ComponentProps } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { VoiceFixTheme as theme } from "@/constants/theme";
import { getPhaseLabel, getWeek } from "@/features/prototype/curriculum";
import {
  displayPhase,
  displaySessionText,
  displayWeek,
  fillTemplate,
  mainAppText,
} from "@/features/prototype/localization";
import { usePrototype } from "@/features/prototype/state";

export default function WeekPlanScreen() {
  const { weekNumber } = useLocalSearchParams<{ weekNumber?: string }>();
  const { state } = usePrototype();
  const text = mainAppText[state.language];
  const parsedWeekNumber = Number(weekNumber);
  const week = getWeek(
    Number.isFinite(parsedWeekNumber)
      ? parsedWeekNumber
      : state.currentWeekNumber,
  );
  const weekDisplay = displayWeek(week, state.language);
  const phaseLabel = displayPhase(getPhaseLabel(week.phase), state.language);
  const labels = {
    weekMeta: `${text.common.week} ${week.weekNumber} · ${phaseLabel}`,
    successCheck: text.journey.successCheck,
    practice: text.journey.practice,
    focus: text.journey.focus,
    how: text.journey.how,
    schedule: text.journey.schedule,
    scheduleBody: text.journey.scheduleBody,
    today: `${text.common.day} ${state.currentDayNumber}`,
    safety: text.journey.safetyRules,
  };
  const isCurrentWeek = week.weekNumber === state.currentWeekNumber;
  const isComingSoon = week.weekNumber > 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.topBar}>
          <IconButton
            label={text.today.back}
            name="arrow-back"
            onPress={() => router.back()}
          />
          <Text style={styles.weekMeta}>{labels.weekMeta}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{weekDisplay.title}</Text>
          {!isComingSoon ? (
            <Text style={styles.weekGoal}>
              {displaySessionText(week.goal, state.language)}
            </Text>
          ) : (
            <Text style={styles.body}>{text.journey.monthOneOnly}</Text>
          )}
        </View>

        {isComingSoon ? (
          <View style={styles.panelCard}>
            <View style={styles.panelHeader}>
              <MaterialIcons
                name="lock"
                size={20}
                color={theme.primaryBright}
              />
              <Text style={styles.panelTitle}>{text.journey.comingSoon}</Text>
            </View>
            <Text style={styles.panelBody}>{text.journey.comingSoonBody}</Text>
          </View>
        ) : (
          <>
            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{labels.successCheck}</Text>
              <Text style={styles.panelLead}>
                {displaySessionText(week.checkpoint, state.language)}
              </Text>
            </View>

            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{labels.practice}</Text>
              <View style={styles.exerciseList}>
                {week.exercises.map((exercise, index) => (
                  <View key={exercise.id} style={styles.exerciseCard}>
                    <View style={styles.exerciseTopRow}>
                      <View style={styles.exerciseNumber}>
                        <Text style={styles.exerciseNumberText}>
                          {index + 1}
                        </Text>
                      </View>
                      <Text style={styles.exerciseTitle}>
                        {displaySessionText(exercise.title, state.language)}
                      </Text>
                    </View>
                    <LabeledLine
                      label={labels.focus}
                      text={displaySessionText(exercise.goal, state.language)}
                    />
                    <LabeledLine
                      label={labels.how}
                      text={displaySessionText(
                        exercise.instruction,
                        state.language,
                      )}
                    />
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.panelCard}>
              <Text style={styles.panelTitle}>{labels.schedule}</Text>
              <Text style={styles.panelBody}>{labels.scheduleBody}</Text>
              {isCurrentWeek ? (
                <Text style={styles.todayLabel}>
                  {fillTemplate(text.journey.currentDay, { day: labels.today })}
                </Text>
              ) : null}
              <View style={styles.dayChipRow}>
                {Array.from({ length: 7 }, (_, index) => {
                  const day = index + 1;
                  const isToday =
                    isCurrentWeek && day === state.currentDayNumber;
                  return (
                    <View
                      key={day}
                      style={[styles.dayChip, isToday && styles.dayChipActive]}
                    >
                      <Text
                        style={[
                          styles.dayChipText,
                          isToday && styles.dayChipTextActive,
                        ]}
                      >
                        {text.common.day} {day}
                      </Text>
                    </View>
                  );
                })}
              </View>
            </View>

            <View style={styles.safetyPanel}>
              <MaterialIcons
                name="health-and-safety"
                size={18}
                color={theme.textSubtle}
              />
              <View style={styles.safetyCopy}>
                <Text style={styles.safetyTitle}>{labels.safety}</Text>
                <Text style={styles.safetyText}>
                  {week.safetyRules
                    .map((rule) =>
                      displaySessionText(rule, state.language).replaceAll(
                        "_",
                        " ",
                      ),
                    )
                    .join(" • ")}
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

function LabeledLine({ label, text }: { label: string; text: string }) {
  return (
    <View style={styles.labeledLine}>
      <Text style={styles.labeledLineLabel}>{label}</Text>
      <Text style={styles.labeledLineText}>{text}</Text>
    </View>
  );
}

function IconButton({
  label,
  name,
  onPress,
}: {
  label: string;
  name: ComponentProps<typeof MaterialIcons>["name"];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.iconButton,
        pressed && styles.iconButtonPressed,
      ]}
    >
      <MaterialIcons name={name} size={22} color={theme.text} />
    </Pressable>
  );
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
  topBar: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 24,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42,
  },
  iconButtonPressed: {
    backgroundColor: theme.surfacePressed,
  },
  header: {
    gap: 8,
  },
  weekMeta: {
    color: theme.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  title: {
    color: theme.text,
    fontSize: 32,
    fontWeight: "900",
    lineHeight: 38,
  },
  weekGoal: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  body: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  panelCard: {
    backgroundColor: theme.surface,
    borderColor: "rgba(0, 0, 0, 0.08)",
    borderRadius: 24,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  panelHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  panelTitle: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  panelLead: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "800",
    lineHeight: 26,
  },
  panelBody: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 22,
  },
  exerciseList: {
    gap: 12,
    marginTop: 4,
  },
  exerciseCard: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 18,
    gap: 10,
    padding: 14,
  },
  exerciseTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
  },
  exerciseNumber: {
    alignItems: "center",
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 28,
    justifyContent: "center",
    width: 28,
  },
  exerciseNumberText: {
    color: theme.background,
    fontSize: 13,
    fontWeight: "900",
  },
  exerciseTitle: {
    color: theme.text,
    flex: 1,
    fontSize: 17,
    fontWeight: "900",
    lineHeight: 22,
  },
  labeledLine: {
    gap: 3,
  },
  labeledLineLabel: {
    color: theme.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  labeledLineText: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
  },
  todayLabel: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "800",
  },
  dayChipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  dayChip: {
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 24,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  dayChipActive: {
    borderColor: theme.primaryBright,
  },
  dayChipText: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  dayChipTextActive: {
    color: theme.primaryBright,
  },
  safetyPanel: {
    alignItems: "flex-start",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 18,
    flexDirection: "row",
    gap: 10,
    padding: 14,
  },
  safetyCopy: {
    flex: 1,
    gap: 4,
  },
  safetyTitle: {
    color: theme.textSubtle,
    fontSize: 10,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  safetyText: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

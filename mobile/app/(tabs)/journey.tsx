import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { curriculum, getPhaseLabel, type CurriculumPhase } from '@/features/prototype/curriculum';
import { displayPhase, displayWeek, mainAppText } from '@/features/prototype/localization';
import { usePrototype } from '@/features/prototype/state';

const phases: CurriculumPhase[] = ['foundation', 'control', 'songs'];

export default function JourneyScreen() {
  const { state } = usePrototype();
  const text = mainAppText[state.language];

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{text.journey.kicker}</Text>
          <Text style={styles.title}>{text.journey.title}</Text>
          <Text style={styles.body}>{text.journey.body}</Text>
        </View>

        <View style={styles.progressPanel}>
          <Text style={styles.panelTitle}>{text.journey.currentPlacement}</Text>
          <Text style={styles.currentWeek}>{text.common.week} {state.currentWeekNumber}</Text>
          <Text style={styles.body}>{state.placement ? text.today.placementReason : text.journey.completeOnboarding}</Text>
        </View>

        {phases.map((phase) => {
          const weeks = curriculum.filter((week) => week.phase === phase);
          return (
            <View key={phase} style={styles.phaseBlock}>
              <View style={styles.phaseHead}>
                <Text style={styles.phaseTitle}>{displayPhase(getPhaseLabel(phase), state.language)}</Text>
                <Text style={styles.phaseMeta}>
                  {text.common.week} {weeks[0].weekNumber}-{weeks[weeks.length - 1].weekNumber}
                </Text>
              </View>

              <View style={styles.weekList}>
                {weeks.map((week) => {
                  const weekDisplay = displayWeek(week, state.language);
                  const stateLabel = week.weekNumber < state.currentWeekNumber ? text.journey.review : week.weekNumber === state.currentWeekNumber ? text.journey.current : text.journey.locked;
                  const isCurrent = week.weekNumber === state.currentWeekNumber;
                  return (
                    <View key={week.weekNumber} style={[styles.weekRow, isCurrent && styles.weekRowActive]}>
                      <View style={[styles.weekNumber, isCurrent && styles.weekNumberActive]}>
                        <Text style={[styles.weekNumberText, isCurrent && styles.weekNumberTextActive]}>{week.weekNumber}</Text>
                      </View>
                      <View style={styles.weekCopy}>
                        <Text style={styles.weekTitle}>{weekDisplay.title}</Text>
                        <Text style={styles.weekGoal}>{weekDisplay.goal}</Text>
                      </View>
                      <Text style={[styles.stateLabel, isCurrent && styles.stateLabelActive]}>{stateLabel}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          );
        })}

        <View style={styles.note}>
          <MaterialIcons name="published-with-changes" size={20} color={theme.warning} />
          <Text style={styles.noteText}>{text.journey.note}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
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
  header: {
    gap: 9,
    paddingTop: 12,
  },
  kicker: {
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  title: {
    color: theme.text,
    fontSize: 32,
    fontWeight: '800',
    lineHeight: 38,
  },
  body: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  progressPanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
    padding: 16,
  },
  panelTitle: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  currentWeek: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '800',
  },
  phaseBlock: {
    gap: 12,
  },
  phaseHead: {
    gap: 3,
  },
  phaseTitle: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  phaseMeta: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: '700',
  },
  weekList: {
    gap: 8,
  },
  weekRow: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 86,
    padding: 12,
  },
  weekRowActive: {
    backgroundColor: theme.primarySoft,
    borderColor: 'rgba(50, 230, 226, 0.55)',
  },
  weekNumber: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderRadius: 18,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  weekNumberActive: {
    backgroundColor: theme.primaryBright,
  },
  weekNumberText: {
    color: theme.textMuted,
    fontSize: 14,
    fontWeight: '800',
  },
  weekNumberTextActive: {
    color: theme.backgroundDeep,
  },
  weekCopy: {
    flex: 1,
    gap: 3,
  },
  weekTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '800',
  },
  weekGoal: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  stateLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  stateLabelActive: {
    color: theme.primaryBright,
  },
  note: {
    alignItems: 'flex-start',
    backgroundColor: 'rgba(244, 184, 94, 0.1)',
    borderColor: 'rgba(244, 184, 94, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  noteText: {
    color: theme.text,
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
});

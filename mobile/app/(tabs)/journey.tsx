import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { curriculum, getPhaseLabel, type CurriculumPhase } from '@/features/prototype/curriculum';
import { displayPhase, displayWeek, mainAppText } from '@/features/prototype/localization';
import { usePrototype } from '@/features/prototype/state';
import { WeekGoalVisual } from '@/features/prototype/WeekGoalVisual';

const phases: CurriculumPhase[] = ['foundation', 'control', 'songs'];

export default function JourneyScreen() {
  const { state } = usePrototype();
  const text = mainAppText[state.language];
  const screenTitle = state.language === 'ko' ? '훈련 목록' : 'Exercises';
  const screenBody = state.language === 'ko'
    ? '지금은 1개월 호흡과 공명 훈련에 집중합니다. 2-3개월 훈련은 곧 열립니다.'
    : 'For now, VoiceFix focuses on Month 1 breath and resonance. Months 2-3 are locked and coming soon.';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>{text.journey.kicker}</Text>
          <Text style={styles.title}>{screenTitle}</Text>
          <Text style={styles.body}>{screenBody}</Text>
        </View>

        <View style={styles.progressPanel}>
          <Text style={styles.panelTitle}>{text.journey.currentPlacement}</Text>
          <Text style={styles.currentWeek}>{text.common.week} {state.currentWeekNumber}</Text>
          <Text style={styles.body}>{state.placement ? text.today.placementReason : text.journey.completeOnboarding}</Text>
        </View>

        {phases.map((phase) => {
          const weeks = curriculum.filter((week) => week.phase === phase);
          const meta = getPhaseMeta(phase);
          const monthNumber = phase === 'foundation' ? 1 : phase === 'control' ? 2 : 3;
          const testPassed = state.monthlyTests[`${monthNumber}`]?.status === 'passed';

          if (phase !== 'foundation') {
            return (
              <View key={phase} style={styles.phaseBlock}>
                <View style={styles.categoryPill}>
                  <MaterialIcons name={meta.icon} size={20} color={theme.text} />
                  <Text style={styles.categoryText}>{displayPhase(getPhaseLabel(phase), state.language)}</Text>
                  <Text style={styles.categoryMeta}>
                    {text.common.week} {weeks[0].weekNumber}-{weeks[weeks.length - 1].weekNumber}
                  </Text>
                </View>
                <View style={styles.comingSoonCard}>
                  <View style={styles.comingSoonVisual}>
                    <WeekGoalVisual weekNumber={weeks[0].weekNumber} compact locked />
                  </View>
                  <View style={styles.comingSoonCopy}>
                    <Text style={styles.comingSoonTitle}>{state.language === 'ko' ? '곧 열립니다' : 'Coming soon'}</Text>
                  </View>
                </View>
              </View>
            );
          }

          return (
            <View key={phase} style={styles.phaseBlock}>
              <View style={styles.categoryPill}>
                <MaterialIcons name={meta.icon} size={20} color={theme.text} />
                <Text style={styles.categoryText}>{displayPhase(getPhaseLabel(phase), state.language)}</Text>
                <Text style={styles.categoryMeta}>
                  {text.common.week} {weeks[0].weekNumber}-{weeks[weeks.length - 1].weekNumber}
                </Text>
              </View>

              <View style={styles.exerciseGrid}>
                {weeks.map((week) => {
                  const weekDisplay = displayWeek(week, state.language);
                  const stateLabel = week.weekNumber < state.currentWeekNumber ? text.journey.review : week.weekNumber === state.currentWeekNumber ? text.journey.current : state.language === 'ko' ? '다음' : 'Next';
                  const isCurrent = week.weekNumber === state.currentWeekNumber;
                  const isLocked = false;
                  const isReview = week.weekNumber < state.currentWeekNumber;
                  return (
                    <Pressable
                      key={week.weekNumber}
                      accessibilityHint={state.language === 'ko' ? '이번 주 목표와 훈련을 엽니다' : 'Opens this week’s target and exercises'}
                      accessibilityLabel={`${text.common.week} ${week.weekNumber}: ${weekDisplay.title}`}
                      accessibilityRole="button"
                      onPress={() => router.push(`/week/${week.weekNumber}`)}
                      style={({ pressed }) => [
                        styles.exerciseCard,
                        isCurrent && styles.exerciseCardActive,
                        isLocked && styles.exerciseCardLocked,
                        pressed && styles.exerciseCardPressed,
                      ]}>
                      <View style={styles.exerciseVisual}>
                        <WeekGoalVisual weekNumber={week.weekNumber} compact />
                        {isReview ? (
                          <View style={styles.reviewBadge}>
                            <MaterialIcons name="replay" size={17} color={theme.text} />
                          </View>
                        ) : null}
                      </View>
                      <View style={styles.cardMetaRow}>
                        <Text style={[styles.weekNumberText, isCurrent && styles.weekNumberTextActive]}>{text.common.week} {week.weekNumber}</Text>
                        <Text style={[styles.stateLabel, isCurrent && styles.stateLabelActive]}>{stateLabel}</Text>
                      </View>
                      <Text style={styles.weekTitle}>{weekDisplay.title}</Text>
                    </Pressable>
                  );
                })}
              </View>
              <TestingCenterCard month={1} language={state.language} passed={testPassed} />
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

function TestingCenterCard({
  month,
  language,
  passed = false,
}: {
  month: number;
  language: string;
  passed?: boolean;
}) {
  const title = language === 'ko' ? `${month}개월 테스트 센터` : `Month ${month} Testing Center`;

  return (
    <Pressable
      accessibilityRole="button"
      onPress={() => router.push(`/testing-center/${month}`)}
      style={({ pressed }) => [styles.testingCard, passed && styles.testingCardPassed, pressed && styles.exerciseCardPressed]}>
      <View style={styles.testingIcon}>
        <MaterialIcons name={passed ? 'verified' : 'science'} size={22} color={passed ? theme.success : theme.primaryBright} />
      </View>
      <View style={styles.testingCopy}>
        <Text style={styles.testingTitle}>{title}</Text>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={theme.textSubtle} />
    </Pressable>
  );
}

function getPhaseMeta(phase: CurriculumPhase): { icon: ComponentProps<typeof MaterialIcons>['name'] } {
  if (phase === 'foundation') {
    return { icon: 'air' };
  }

  if (phase === 'control') {
    return { icon: 'tune' };
  }

  return { icon: 'library-music' };
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
    gap: 14,
  },
  categoryPill: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
    paddingHorizontal: 4,
  },
  categoryText: {
    color: theme.text,
    fontSize: 18,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  categoryMeta: {
    color: theme.textSubtle,
    flex: 1,
    fontSize: 12,
    fontWeight: '800',
    textAlign: 'right',
    textTransform: 'uppercase',
  },
  exerciseGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 14,
  },
  comingSoonCard: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 18,
    borderWidth: 1,
    flexDirection: 'row',
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
    fontWeight: '900',
  },
  testingCard: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 64,
    padding: 14,
  },
  testingCardPassed: {
    borderColor: 'rgba(100, 217, 154, 0.38)',
  },
  testingIcon: {
    alignItems: 'center',
    backgroundColor: theme.primarySoft,
    borderRadius: 18,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  testingCopy: {
    flex: 1,
    gap: 4,
  },
  testingTitle: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '900',
  },
  exerciseCard: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.11)',
    borderRadius: 22,
    borderWidth: 1,
    gap: 9,
    minHeight: 156,
    padding: 13,
    width: '48%',
  },
  exerciseCardActive: {
    backgroundColor: 'rgba(50, 230, 226, 0.14)',
    borderColor: 'rgba(50, 230, 226, 0.52)',
  },
  exerciseCardLocked: {
    opacity: 0.58,
  },
  exerciseCardPressed: {
    backgroundColor: theme.surfacePressed,
    transform: [{ scale: 0.98 }],
  },
  exerciseVisual: {
    borderRadius: 18,
    height: 82,
    overflow: 'hidden',
    position: 'relative',
  },
  reviewBadge: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 10, 16, 0.72)',
    borderRadius: 999,
    height: 30,
    justifyContent: 'center',
    position: 'absolute',
    right: 8,
    top: 8,
    width: 30,
  },
  exerciseLine: {
    backgroundColor: theme.text,
    borderRadius: 999,
    height: 4,
    width: 38,
  },
  exerciseDotLine: {
    backgroundColor: theme.textSubtle,
    borderRadius: 999,
    height: 4,
    width: 38,
  },
  exerciseLineActive: {
    backgroundColor: theme.primaryBright,
  },
  exerciseLineLocked: {
    backgroundColor: 'rgba(184, 199, 211, 0.35)',
  },
  cardMetaRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  weekNumberText: {
    color: theme.textSubtle,
    flexShrink: 1,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  weekNumberTextActive: {
    color: theme.primaryBright,
  },
  weekTitle: {
    color: theme.text,
    fontSize: 17,
    fontWeight: '900',
    lineHeight: 21,
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

import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { router, useLocalSearchParams } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { getPhaseLabel, getWeek } from '@/features/prototype/curriculum';
import { displayPhase, displaySessionText, displayWeek, mainAppText } from '@/features/prototype/localization';
import { usePrototype } from '@/features/prototype/state';

export default function WeekPlanScreen() {
  const { weekNumber } = useLocalSearchParams<{ weekNumber?: string }>();
  const { state } = usePrototype();
  const text = mainAppText[state.language];
  const parsedWeekNumber = Number(weekNumber);
  const week = getWeek(Number.isFinite(parsedWeekNumber) ? parsedWeekNumber : state.currentWeekNumber);
  const weekDisplay = displayWeek(week, state.language);
  const phaseLabel = displayPhase(getPhaseLabel(week.phase), state.language);
  const targetTitle = state.language === 'ko' ? '목표 결과' : 'Target result';
  const coreTitle = state.language === 'ko' ? '핵심 훈련' : 'Core exercises';
  const dailyRepeatTitle = state.language === 'ko' ? '매일 반복' : 'Daily repeat';
  const dailyRepeatBody = state.language === 'ko'
    ? '1-7일차 모두 아래 훈련을 같은 목표로 연습합니다.'
    : 'Days 1-7 use these same exercises toward the same weekly target.';
  const isComingSoon = week.weekNumber > 4;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <IconButton label={state.language === 'ko' ? '뒤로' : 'Back'} name="arrow-back" onPress={() => router.back()} />
          <Text style={styles.kicker}>{phaseLabel}</Text>
        </View>

        <View style={styles.header}>
          <Text style={styles.title}>{text.common.week} {week.weekNumber}: {weekDisplay.title}</Text>
          {isComingSoon ? (
            <Text style={styles.body}>{state.language === 'ko' ? '현재는 1개월 호흡과 공명 훈련만 사용할 수 있습니다.' : 'For now, only Month 1 breath and resonance training is available.'}</Text>
          ) : null}
        </View>

        {isComingSoon ? (
          <View style={styles.summaryPanel}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="lock" size={22} color={theme.primaryBright} />
              <Text style={styles.panelTitle}>{state.language === 'ko' ? '곧 열립니다' : 'Coming soon'}</Text>
            </View>
            <Text style={styles.checkpointText}>
              {state.language === 'ko'
                ? '1개월 훈련과 분석 엔진을 먼저 완성한 뒤 이 달을 열겠습니다.'
                : 'We will open this month after the Month 1 practice and analysis engine is complete.'}
            </Text>
          </View>
        ) : (
          <View style={styles.summaryPanel}>
            <View style={styles.summaryHeader}>
              <MaterialIcons name="flag" size={22} color={theme.primaryBright} />
              <Text style={styles.panelTitle}>{targetTitle}</Text>
            </View>
            <Text style={styles.checkpointText}>{displaySessionText(week.checkpoint, state.language)}</Text>
          </View>
        )}

        {!isComingSoon ? (
          <View style={styles.corePanel}>
            <View style={styles.sectionHeader}>
              <MaterialIcons name="fitness-center" size={20} color={theme.text} />
              <Text style={styles.panelTitle}>{coreTitle}</Text>
            </View>
            <View style={styles.exerciseList}>
              {week.exercises.map((exercise, index) => (
                <View key={exercise.id} style={styles.exerciseCard}>
                <View style={styles.exerciseNumber}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={styles.exerciseCopy}>
                  <Text style={styles.exerciseText}>{displaySessionText(exercise.title, state.language)}</Text>
                  <Text style={styles.exerciseDetail}>{displaySessionText(exercise.goal, state.language)}</Text>
                  <Text style={styles.exerciseDetail}>{displaySessionText(exercise.instruction, state.language)}</Text>
                </View>
              </View>
              ))}
            </View>
          </View>
        ) : null}

        {!isComingSoon ? <View style={styles.repeatPanel}>
          <View style={styles.sectionHeader}>
            <MaterialIcons name="repeat" size={20} color={theme.warning} />
            <Text style={styles.panelTitle}>{dailyRepeatTitle}</Text>
          </View>
          <Text style={styles.repeatText}>{dailyRepeatBody}</Text>
          <View style={styles.dayChipRow}>
            {Array.from({ length: 7 }, (_, index) => {
              const day = index + 1;
              const isToday = week.weekNumber === state.currentWeekNumber && day === state.currentDayNumber;
              return (
                <View key={day} style={[styles.dayChip, isToday && styles.dayChipActive]}>
                  <Text style={[styles.dayChipText, isToday && styles.dayChipTextActive]}>{text.common.day} {day}</Text>
                </View>
              );
            })}
          </View>
        </View> : null}

        {!isComingSoon ? <View style={styles.safetyPanel}>
          <MaterialIcons name="health-and-safety" size={20} color={theme.success} />
          <View style={styles.safetyCopy}>
            <Text style={styles.safetyTitle}>{state.language === 'ko' ? '안전 규칙' : 'Safety rules'}</Text>
            <Text style={styles.safetyText}>{week.safetyRules.map((rule) => displaySessionText(rule, state.language).replaceAll('_', ' ')).join(' • ')}</Text>
          </View>
        </View> : null}
      </ScrollView>
    </SafeAreaView>
  );
}

function IconButton({
  label,
  name,
  onPress,
}: {
  label: string;
  name: ComponentProps<typeof MaterialIcons>['name'];
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={label}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.iconButton, pressed && styles.iconButtonPressed]}>
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
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  iconButtonPressed: {
    backgroundColor: theme.surfacePressed,
  },
  kicker: {
    color: theme.primaryBright,
    flex: 1,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  header: {
    gap: 9,
  },
  title: {
    color: theme.text,
    fontSize: 30,
    fontWeight: '900',
    lineHeight: 36,
  },
  body: {
    color: theme.textMuted,
    fontSize: 15,
    lineHeight: 23,
  },
  summaryPanel: {
    backgroundColor: 'rgba(50, 230, 226, 0.12)',
    borderColor: 'rgba(50, 230, 226, 0.4)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  summaryHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 10,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  checkpointText: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
  corePanel: {
    gap: 12,
  },
  sectionHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 9,
  },
  exerciseList: {
    gap: 10,
  },
  exerciseCard: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    padding: 13,
  },
  exerciseNumber: {
    alignItems: 'center',
    backgroundColor: theme.primaryBright,
    borderRadius: 8,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  exerciseNumberText: {
    color: theme.backgroundDeep,
    fontSize: 15,
    fontWeight: '900',
  },
  exerciseCopy: {
    flex: 1,
    gap: 4,
  },
  exerciseText: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '900',
    lineHeight: 20,
  },
  exerciseDetail: {
    color: theme.textSubtle,
    fontSize: 13,
    lineHeight: 18,
  },
  repeatPanel: {
    backgroundColor: 'rgba(244, 184, 94, 0.1)',
    borderColor: 'rgba(244, 184, 94, 0.28)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 14,
  },
  repeatText: {
    color: theme.text,
    fontSize: 14,
    lineHeight: 20,
  },
  dayChipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dayChip: {
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 8,
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
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  dayChipTextActive: {
    color: theme.primaryBright,
  },
  safetyPanel: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(100, 217, 154, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 10,
    padding: 14,
  },
  safetyCopy: {
    flex: 1,
    gap: 4,
  },
  safetyTitle: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '900',
  },
  safetyText: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
});

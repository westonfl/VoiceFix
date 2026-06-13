import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, AppState, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';
import { SignalWave } from '@/features/onboarding/components';
import { buildMvpFeedback, compareTakes, formatDuration } from '@/features/prototype/analysis';
import { curriculum, getWeek, TOTAL_JOURNEY_DAYS, type CurriculumExercise } from '@/features/prototype/curriculum';
import { displaySessionText, displayWeek, mainAppText } from '@/features/prototype/localization';
import { analyzeMonthOneTake, type MonthOneAnalysisResponse } from '@/features/prototype/serverAnalysis';
import { usePrototype } from '@/features/prototype/state';

type SessionStep = 'intro' | 'record' | 'feedback' | 'retry' | 'summary';
type RecordedTake = {
  uri?: string;
  durationMs: number;
};

type TodayExerciseCard = {
  id: string;
  title: string;
  detail: string;
  goal: string;
  instruction: string;
  analysisDrillId: CurriculumExercise['analysisDrillId'];
  visual: CurriculumExercise['visual'];
  icon: ComponentProps<typeof MaterialIcons>['name'];
};

const DAILY_RECORDED_TARGET_MS = 10 * 60 * 1000;
const SPACE = 5;

function orderExercises(exercises: string[], savedOrder?: string[]) {
  const validExercises = new Set(exercises);
  const ordered = savedOrder?.filter((exercise) => validExercises.has(exercise)) ?? [];
  const missing = exercises.filter((exercise) => !ordered.includes(exercise));

  return [...ordered, ...missing];
}

export default function TodayScreen() {
  const { state, isHydrated, completeOnboarding, completeSession, reorderWeekExercise } = usePrototype();
  const audioRecorder = useAudioRecorder(RecordingPresets.LOW_QUALITY);
  const recorderState = useAudioRecorderState(audioRecorder);
  const [sessionStep, setSessionStep] = useState<SessionStep>('intro');
  const [sessionOpen, setSessionOpen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [activeTake, setActiveTake] = useState<'first' | 'retry' | null>(null);
  const [firstTake, setFirstTake] = useState<RecordedTake | null>(null);
  const [retryTake, setRetryTake] = useState<RecordedTake | null>(null);
  const [firstAnalysis, setFirstAnalysis] = useState<MonthOneAnalysisResponse | null>(null);
  const [retryAnalysis, setRetryAnalysis] = useState<MonthOneAnalysisResponse | null>(null);
  const [analysisPending, setAnalysisPending] = useState(false);
  const [analysisSource, setAnalysisSource] = useState<'server' | 'fallback' | null>(null);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [activeTrainingMs, setActiveTrainingMs] = useState(0);
  const [completionMessage, setCompletionMessage] = useState<string | null>(null);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([]);
  const [completedRecordedMs, setCompletedRecordedMs] = useState(0);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(state.currentWeekNumber);
  const goalFade = useRef(new Animated.Value(0)).current;
  const recordingStartedAtRef = useRef<number | null>(null);
  const displayedWeek = getWeek(selectedWeekNumber);
  const todaySession = displayedWeek.dailySessions[state.currentDayNumber - 1] ?? displayedWeek.dailySessions[0];
  const text = mainAppText[state.language];
  const displayCurrentWeek = displayWeek(displayedWeek, state.language);
  const forYouTitle = state.language === 'ko' ? '추천 훈련' : 'For You';
  const forYouSubtitle = state.language === 'ko' ? '오늘 목표에 맞춘 개인 훈련 카드' : 'Personalized picks for your singing goal';
  const selectableWeeks = curriculum.filter((week) => week.exercises.length > 0);
  const orderedExerciseIds = orderExercises(displayedWeek.exercises.map((exercise) => exercise.id), state.exerciseOrdersByWeek[`${displayedWeek.weekNumber}`]);
  const orderedExerciseUnits = orderedExerciseIds
    .map((id) => displayedWeek.exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is CurriculumExercise => Boolean(exercise));
  const todayExerciseCards: TodayExerciseCard[] = orderedExerciseUnits.map((exercise) => ({
    id: exercise.id,
    title: displaySessionText(exercise.title, state.language),
    detail: displaySessionText(exercise.instruction, state.language),
    goal: displaySessionText(exercise.goal, state.language),
    instruction: displaySessionText(exercise.instruction, state.language),
    analysisDrillId: exercise.analysisDrillId,
    visual: exercise.visual,
    icon: getExerciseIcon(exercise),
  }));
  const currentExercise = todayExerciseCards[activeExerciseIndex] ?? todayExerciseCards[0];
  const dailyGoalTotal = todayExerciseCards.length;
  const currentExercisePairComplete = Boolean(firstTake && retryTake);
  const pendingCompletedCount = completedExerciseIds.includes(currentExercise?.id ?? '') || !currentExercisePairComplete ? 0 : 1;
  const dailyGoalCompleted = state.completedToday ? dailyGoalTotal : Math.min(dailyGoalTotal, completedExerciseIds.length + pendingCompletedCount);
  const savedTodayClip = state.savedClips.find((clip) => clip.weekNumber === displayedWeek.weekNumber && clip.dayNumber === state.currentDayNumber);
  const currentRecordedMs = (firstTake?.durationMs ?? 0) + (retryTake?.durationMs ?? 0);
  const recordedPracticeMs = completedRecordedMs + (completedExerciseIds.includes(currentExercise?.id ?? '') ? 0 : currentRecordedMs);
  const displayedGoalRecordedMs = savedTodayClip?.recordedPracticeMs ?? recordedPracticeMs;
  const allExercisesRecorded = dailyGoalCompleted >= dailyGoalTotal && dailyGoalTotal > 0;
  const allGoalTargetsAchieved = state.completedToday || (allExercisesRecorded && displayedGoalRecordedMs >= DAILY_RECORDED_TARGET_MS);
  const dailyCompletionReady = allExercisesRecorded && recordedPracticeMs >= DAILY_RECORDED_TARGET_MS;
  const fallbackFeedback = useMemo(() => buildMvpFeedback(firstTake ?? { durationMs: 0 }, state.language), [firstTake, state.language]);
  const feedback = firstAnalysis
    ? {
        observation: firstAnalysis.feedback.whatWeHeard,
        interpretation: firstAnalysis.feedback.whatItOftenMeans,
        cue: firstAnalysis.feedback.oneThingToTry,
      }
    : fallbackFeedback;
  const monthOneDrillId = currentExercise?.analysisDrillId ?? todaySession.analysisDrillId;

  useEffect(() => {
    if (!state.onboardingComplete) {
      return;
    }

    async function prepareAudio() {
      const status = await AudioModule.requestRecordingPermissionsAsync();
      if (!status.granted) {
        setPermissionDenied(true);
        return;
      }

      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });
    }

    prepareAudio().catch(() => {
      setRecordingError(text.today.micSetupFailed);
    });
  }, [state.onboardingComplete, text.today.micSetupFailed]);

  useEffect(() => {
    setSelectedWeekNumber(state.currentWeekNumber);
  }, [state.currentWeekNumber]);

  useEffect(() => {
    if (!sessionOpen) {
      return;
    }

    let lastTick = Date.now();
    const subscription = AppState.addEventListener('change', (nextState) => {
      lastTick = Date.now();
      if (nextState !== 'active') {
        setCompletionMessage(null);
      }
    });
    const interval = setInterval(() => {
      const now = Date.now();
      if (AppState.currentState === 'active') {
        setActiveTrainingMs((current) => current + now - lastTick);
      }
      lastTick = now;
    }, 1000);

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [sessionOpen]);

  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingScreen}>
          <SignalWave active />
          <Text style={styles.body}>{text.common.loading}</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!state.onboardingComplete) {
    return <OnboardingFlow onComplete={completeOnboarding} />;
  }

  function openGoalModal() {
    setGoalModalVisible(true);
    goalFade.setValue(0);
    Animated.timing(goalFade, {
      duration: 180,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  function closeGoalModal() {
    Animated.timing(goalFade, {
      duration: 140,
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setGoalModalVisible(false);
      }
    });
  }

  async function startRecording(take: 'first' | 'retry') {
    if (permissionDenied) {
      Alert.alert(text.today.micUnavailableTitle, text.today.micUnavailableBody);
      return;
    }

    try {
      setRecordingError(null);
      setActiveTake(take);
      await audioRecorder.prepareToRecordAsync();
      audioRecorder.record();
      recordingStartedAtRef.current = Date.now();
    } catch {
      setActiveTake(null);
      recordingStartedAtRef.current = null;
      setRecordingError(text.today.recordStartFailed);
    }
  }

  async function stopRecording(take: 'first' | 'retry') {
    try {
      const measuredDurationMs = recordingStartedAtRef.current ? Date.now() - recordingStartedAtRef.current : 0;
      const durationMs = Math.max(recorderState.durationMillis, measuredDurationMs);
      await audioRecorder.stop();
      const recordedTake = {
        durationMs,
        uri: audioRecorder.uri ?? undefined,
      };

      if (take === 'first') {
        setFirstTake(recordedTake);
        setSessionStep('feedback');
        setFirstAnalysis(null);
        setRetryAnalysis(null);
        setAnalysisSource(null);
        void analyzeFirstTake(recordedTake);
      } else {
        setRetryTake(recordedTake);
        await analyzeRetryTake(recordedTake);
        setSessionStep('summary');
      }
    } catch {
      setRecordingError(text.today.recordSaveFailed);
    } finally {
      setActiveTake(null);
      recordingStartedAtRef.current = null;
    }
  }

  function startTrainingSession() {
    setSessionOpen(true);
    setSessionStep('intro');
    setActiveExerciseIndex(0);
    setCompletedExerciseIds([]);
    setCompletedRecordedMs(0);
    setFirstTake(null);
    setRetryTake(null);
    setFirstAnalysis(null);
    setRetryAnalysis(null);
    setAnalysisSource(null);
    setCompletionMessage(null);
    setActiveTrainingMs(0);
  }

  function closeTrainingSession() {
    setSessionOpen(false);
    setSessionStep('intro');
    setActiveExerciseIndex(0);
    setCompletedExerciseIds([]);
    setCompletedRecordedMs(0);
    setFirstTake(null);
    setRetryTake(null);
    setFirstAnalysis(null);
    setRetryAnalysis(null);
    setAnalysisSource(null);
    setCompletionMessage(null);
    setActiveTrainingMs(0);
  }

  function completeTrainingIfReady() {
    if (!currentExercise) {
      setCompletionMessage(state.language === 'ko' ? '오늘 사용할 수 있는 훈련이 없습니다.' : 'No exercise is available for today.');
      return;
    }

    const currentAlreadyCompleted = completedExerciseIds.includes(currentExercise.id);
    const nextCompletedIds = currentExercisePairComplete && !currentAlreadyCompleted
      ? [...completedExerciseIds, currentExercise.id]
      : completedExerciseIds;
    const nextRecordedPracticeMs = currentExercisePairComplete && !currentAlreadyCompleted
      ? completedRecordedMs + currentRecordedMs
      : recordedPracticeMs;
    const nextExerciseIndex = activeExerciseIndex + 1;

    if (!currentExercisePairComplete) {
      setCompletionMessage(state.language === 'ko' ? '이 훈련의 첫 테이크와 재시도를 모두 녹음해야 합니다.' : 'Record the first take and retry for this exercise.');
      return;
    }

    if (nextExerciseIndex < todayExerciseCards.length && !currentAlreadyCompleted) {
      setCompletedExerciseIds(nextCompletedIds);
      setCompletedRecordedMs(nextRecordedPracticeMs);
      setActiveExerciseIndex(nextExerciseIndex);
      setFirstTake(null);
      setRetryTake(null);
      setFirstAnalysis(null);
      setRetryAnalysis(null);
      setAnalysisSource(null);
      setCompletionMessage(null);
      setSessionStep('intro');
      return;
    }

    const allNextExercisesRecorded = nextCompletedIds.length >= dailyGoalTotal && dailyGoalTotal > 0;
    const nextDailyCompletionReady = allNextExercisesRecorded && nextRecordedPracticeMs >= DAILY_RECORDED_TARGET_MS;

    if (!nextDailyCompletionReady) {
      const missingRecordedMs = Math.max(0, DAILY_RECORDED_TARGET_MS - nextRecordedPracticeMs);
      const pieces = [
        !allNextExercisesRecorded ? state.language === 'ko' ? '모든 훈련의 첫 테이크와 재시도를 녹음해야 합니다.' : 'Record first take and retry for every exercise.' : null,
        missingRecordedMs > 0 ? state.language === 'ko' ? `녹음 시간이 ${formatTimer(missingRecordedMs)} 더 필요합니다.` : `Record ${formatTimer(missingRecordedMs)} more audio.` : null,
      ].filter(Boolean);
      setCompletionMessage(pieces.join(' '));
      return;
    }

    const comparisonText = retryAnalysis?.comparison?.summary ?? (firstTake && retryTake ? compareTakes(firstTake, retryTake, state.language) : text.today.savedFallback);
    completeSession({
      title: `${displayedWeek.title} - ${currentExercise.title}`,
      firstTakeUri: firstTake?.uri,
      retryTakeUri: retryTake?.uri,
      firstDurationMs: firstTake?.durationMs ?? 0,
      retryDurationMs: retryTake?.durationMs ?? 0,
      activeTrainingMs,
      recordedPracticeMs: nextRecordedPracticeMs,
      dailyGoalMet: true,
      observation: feedback.observation,
      comparison: comparisonText,
      createdAt: new Date().toISOString(),
      analysisMetrics: retryAnalysis?.metrics ?? firstAnalysis?.metrics,
    });
    closeTrainingSession();
  }

  async function analyzeFirstTake(take: RecordedTake) {
    const drillId = monthOneDrillId;
    if (!take.uri || !drillId) {
      setAnalysisSource('fallback');
      return;
    }

    try {
      setAnalysisPending(true);
      const analysis = await analyzeMonthOneTake({
        uri: take.uri,
        drillId,
        language: state.language,
        takeKind: 'first',
      });
      setFirstAnalysis(analysis);
      setAnalysisSource('server');
    } catch {
      setAnalysisSource('fallback');
    } finally {
      setAnalysisPending(false);
    }
  }

  async function analyzeRetryTake(take: RecordedTake) {
    const drillId = monthOneDrillId;
    if (!take.uri || !drillId) {
      setAnalysisSource('fallback');
      return null;
    }

    try {
      setAnalysisPending(true);
      const analysis = await analyzeMonthOneTake({
        uri: take.uri,
        drillId,
        language: state.language,
        takeKind: 'retry',
        previousMetrics: firstAnalysis?.metrics,
      });
      setRetryAnalysis(analysis);
      setAnalysisSource('server');
      return analysis;
    } catch {
      setAnalysisSource('fallback');
      return null;
    } finally {
      setAnalysisPending(false);
    }
  }

  if (sessionOpen) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.sessionTop}>
            <Pressable
              accessibilityRole="button"
              onPress={closeTrainingSession}
              style={styles.iconButton}>
              <MaterialIcons name="close" size={22} color={theme.text} />
            </Pressable>
            <Text style={styles.kicker}>{text.today.trainingSession}</Text>
          </View>

          {sessionStep === 'intro' ? (
            <View style={styles.stack}>
              <Text style={styles.title}>{currentExercise ? `${currentExercise.title}: ${displayCurrentWeek.title}` : displayCurrentWeek.title}</Text>
              <Text style={styles.body}>{currentExercise?.goal ?? text.today.introBody}</Text>
              <SessionCard icon={currentExercise?.icon ?? 'graphic-eq'} title={text.today.warmUp} detail={currentExercise?.instruction ?? text.today.introBody} />
              <SessionCard icon="mic" title={text.today.mainDrill} detail={currentExercise?.title ?? displaySessionText(todaySession.drill, state.language)} />
              <SessionCard icon="refresh" title={text.today.retryRule} detail={text.today.retryRuleDetail} />
              <PrimaryAction label={text.today.startRecording} icon="fiber-manual-record" onPress={() => setSessionStep('record')} />
            </View>
          ) : null}

          {sessionStep === 'record' ? (
            <View style={styles.stack}>
              <Text style={styles.title}>{text.today.recordFirstTake}</Text>
              <Text style={styles.body}>{currentExercise?.instruction ?? displaySessionText(todaySession.focus, state.language)}. {text.today.storesLocally}</Text>
              <View style={styles.recordPanel}>
                <SignalWave active />
                <Text style={styles.recordLabel}>{currentExercise?.title ?? displaySessionText(todaySession.drill, state.language)}</Text>
                <Text style={styles.durationText}>{activeTake === 'first' ? formatDuration(recorderState.durationMillis) : text.today.readyToRecord}</Text>
              </View>
              {recordingError ? <Text style={styles.errorText}>{recordingError}</Text> : null}
              <PrimaryAction
                label={activeTake === 'first' && recorderState.isRecording ? text.today.stopFirstTake : text.today.startFirstTake}
                icon={activeTake === 'first' && recorderState.isRecording ? 'stop' : 'fiber-manual-record'}
                onPress={() => {
                  if (activeTake === 'first' && recorderState.isRecording) {
                    stopRecording('first');
                    return;
                  }

                  startRecording('first');
                }}
              />
            </View>
          ) : null}

          {sessionStep === 'feedback' ? (
            <View style={styles.stack}>
              <Text style={styles.title}>{text.today.oneThing}</Text>
              {analysisPending ? <Text style={styles.body}>{text.settings.waitingForAnalysis}</Text> : null}
              {firstAnalysis ? (
                <AnalysisPanel analysis={firstAnalysis} title={text.settings.firstAnalysisTitle} text={text} />
              ) : (
                <>
                  <FeedbackBlock label={text.today.whatWeHeard} detail={feedback.observation} />
                  <FeedbackBlock label={text.today.whatItMeans} detail={feedback.interpretation} />
                  <FeedbackBlock label={text.today.oneFix} detail={feedback.cue} />
                </>
              )}
              {analysisSource === 'fallback' ? <Text style={styles.analysisNote}>{text.settings.localFallbackUsed}</Text> : null}
              <PrimaryAction label={text.today.retrySameDrill} icon="refresh" onPress={() => setSessionStep('retry')} />
            </View>
          ) : null}

          {sessionStep === 'retry' ? (
            <View style={styles.stack}>
              <Text style={styles.title}>{text.today.retryUnchanged}</Text>
              <Text style={styles.body}>{text.today.retryBody}</Text>
              <View style={styles.recordPanel}>
                <SignalWave active />
                <Text style={styles.recordLabel}>{currentExercise ? `${currentExercise.title} · ${text.today.secondTakeComparison}` : text.today.secondTakeComparison}</Text>
                <Text style={styles.durationText}>{activeTake === 'retry' ? formatDuration(recorderState.durationMillis) : text.today.readyToRetry}</Text>
              </View>
              {recordingError ? <Text style={styles.errorText}>{recordingError}</Text> : null}
              <PrimaryAction
                label={activeTake === 'retry' && recorderState.isRecording ? text.today.stopRetry : text.today.startRetry}
                icon={activeTake === 'retry' && recorderState.isRecording ? 'stop' : 'fiber-manual-record'}
                onPress={() => {
                  if (activeTake === 'retry' && recorderState.isRecording) {
                    stopRecording('retry');
                    return;
                  }

                  startRecording('retry');
                }}
              />
            </View>
          ) : null}

          {sessionStep === 'summary' ? (
            <View style={styles.stack}>
              <Text style={styles.title}>{text.today.dayComplete}</Text>
              <Text style={styles.body}>{retryAnalysis?.comparison?.summary ?? (firstTake && retryTake ? compareTakes(firstTake, retryTake, state.language) : text.today.savedFallback)}</Text>
              {retryAnalysis ? <AnalysisPanel analysis={retryAnalysis} title={text.settings.retryAnalysisTitle} text={text} /> : null}
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{text.today.recordedTakes}</Text>
                <Metric value={formatDuration(firstTake?.durationMs ?? 0)} label={text.common.firstTake} />
                <Metric value={formatDuration(retryTake?.durationMs ?? 0)} label={text.common.retry} />
              </View>
              <View style={styles.summaryGrid}>
                <Metric value={`${state.streak.current}`} label={text.common.dayStreak} />
                <Metric value={state.streak.monthlyGraceUsed ? '0' : '1'} label={text.common.graceDay} />
                <Metric value={`${state.journeyDay}`} label={`${text.common.of} ${TOTAL_JOURNEY_DAYS}`} />
              </View>
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{state.language === 'ko' ? '오늘 훈련 증거' : 'Daily training proof'}</Text>
                <Metric value={formatTimer(recordedPracticeMs)} label={state.language === 'ko' ? '녹음 시간' : 'recorded audio'} />
                <Metric value={currentExercisePairComplete ? '2/2' : firstTake ? '1/2' : '0/2'} label={state.language === 'ko' ? '테이크' : 'takes'} />
                <Text style={styles.analysisNote}>
                  {state.language === 'ko'
                    ? `완료 기준: 오늘 녹음 ${formatTimer(DAILY_RECORDED_TARGET_MS)}, 모든 훈련의 첫 테이크와 재시도.`
                    : `Completion rule: ${formatTimer(DAILY_RECORDED_TARGET_MS)} recorded audio today, first take and retry for every exercise.`}
                </Text>
                {completionMessage ? <Text style={styles.errorText}>{completionMessage}</Text> : null}
              </View>
              <PrimaryAction
                label={dailyCompletionReady ? text.today.backToToday : activeExerciseIndex < todayExerciseCards.length - 1 && currentExercisePairComplete ? state.language === 'ko' ? '다음 훈련' : 'Next exercise' : state.language === 'ko' ? '완료 기준 확인' : 'Check completion rule'}
                icon={dailyCompletionReady ? 'home' : activeExerciseIndex < todayExerciseCards.length - 1 && currentExercisePairComplete ? 'navigate-next' : 'timer'}
                onPress={completeTrainingIfReady}
              />
            </View>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <Text style={styles.title}>{forYouTitle}</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={state.language === 'ko' ? '오늘 목표 보기' : 'Show daily goal'}
              onPress={openGoalModal}
              style={({ pressed }) => [styles.goalIconButton, pressed && styles.goalIconButtonPressed]}>
              <MaterialIcons name={allGoalTargetsAchieved ? 'check-circle' : 'track-changes'} size={24} color={allGoalTargetsAchieved ? theme.success : theme.primaryBright} />
            </Pressable>
          </View>
          <View style={styles.forYouLine}>
            <MaterialIcons name="auto-awesome" size={26} color={theme.primaryBright} />
            <Text style={styles.forYouSubtitle}>{forYouSubtitle}</Text>
          </View>
          <View style={styles.headerStats}>
            <HeaderStat icon="local-fire-department" value={`${state.streak.current}`} label={text.common.streak} />
            <HeaderStat
              icon="shield"
              value={state.streak.monthlyGraceUsed ? text.common.used : text.common.ready}
              label={text.common.grace}
            />
          </View>
        </View>

        <ForYouStack
          dayLabel={`${text.common.day} ${state.currentDayNumber}`}
          selectedWeekNumber={selectedWeekNumber}
          weeks={selectableWeeks}
          exercises={todayExerciseCards}
          language={state.language}
          onSelectWeek={(weekNumber) => {
            setSelectedWeekNumber(weekNumber);
            setActiveExerciseIndex(0);
          }}
          onMoveExercise={(fromIndex, toIndex) => reorderWeekExercise(displayedWeek.weekNumber, fromIndex, toIndex)}
          onPressExercise={startTrainingSession}
        />

        {state.placement ? (
          <View style={styles.note}>
            <MaterialIcons name="route" size={20} color={theme.warning} />
            <Text style={styles.noteText}>{text.today.placementReason}</Text>
          </View>
        ) : null}
      </ScrollView>
      <DailyGoalModal
        visible={goalModalVisible}
        completed={dailyGoalCompleted}
        total={dailyGoalTotal}
        activeMs={displayedGoalRecordedMs}
        activeTargetMs={DAILY_RECORDED_TARGET_MS}
        language={state.language}
        fade={goalFade}
        onClose={closeGoalModal}
      />
    </SafeAreaView>
  );
}

function HeaderStat({
  icon,
  value,
  label,
}: {
  icon: ComponentProps<typeof MaterialIcons>['name'];
  value: string;
  label: string;
}) {
  return (
    <View style={styles.headerStat}>
      <MaterialIcons name={icon} size={17} color={theme.primaryBright} />
      <Text style={styles.headerStatValue}>{value}</Text>
      <Text style={styles.headerStatLabel}>{label}</Text>
    </View>
  );
}

function getExerciseIcon(exercise: CurriculumExercise): ComponentProps<typeof MaterialIcons>['name'] {
  if (exercise.category === 'breathing') {
    return 'air';
  }

  if (exercise.category === 'resonance') {
    return 'graphic-eq';
  }

  if (exercise.category === 'integration') {
    return 'compare-arrows';
  }

  return 'mic';
}

function ForYouStack({
  dayLabel,
  selectedWeekNumber,
  weeks,
  exercises,
  language,
  onSelectWeek,
  onMoveExercise,
  onPressExercise,
}: {
  dayLabel: string;
  selectedWeekNumber: number;
  weeks: typeof curriculum;
  exercises: TodayExerciseCard[];
  language: string;
  onSelectWeek: (weekNumber: number) => void;
  onMoveExercise: (fromIndex: number, toIndex: number) => void;
  onPressExercise: () => void;
}) {
  const visibleExercises = exercises.slice(0, 5);
  const [activeExercise, ...backExercises] = visibleExercises;
  const peekStep = 34;
  const frontOffset = backExercises.length > 0 ? backExercises.length * peekStep + SPACE * 2 : 0;
  const deckHeight = frontOffset + 260;

  return (
    <View style={styles.pickStack}>
      <Text style={styles.dayLabel}>{dayLabel}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.weekSelector}>
        {weeks.map((week) => {
          const selected = week.weekNumber === selectedWeekNumber;

          return (
            <Pressable
              key={week.weekNumber}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelectWeek(week.weekNumber)}
              style={({ pressed }) => [styles.weekChip, selected && styles.weekChipActive, pressed && styles.weekChipPressed]}>
              <Text style={[styles.weekChipText, selected && styles.weekChipTextActive]}>
                {language === 'ko' ? `${week.weekNumber}주` : `Week ${week.weekNumber}`}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={[styles.exerciseDeck, { height: deckHeight }]}>
        {backExercises.map((exercise, index) => {
          const top = (backExercises.length - index - 1) * peekStep;
          const inset = (backExercises.length - index) * SPACE * 2;

          return (
            <Pressable
              key={exercise.id}
              accessibilityLabel={language === 'ko' ? `${exercise.title} 보기` : `Show ${exercise.title}`}
              accessibilityRole="button"
              onPress={() => onMoveExercise(index + 1, 0)}
              style={({ pressed }) => [
                styles.deckBackCard,
                {
                  left: inset,
                  right: inset,
                  top,
                  zIndex: 10 - index,
                },
                pressed && styles.deckBackCardPressed,
              ]}>
              <View style={styles.deckBackHeader}>
                <MaterialIcons name={exercise.icon} size={18} color={theme.textSubtle} />
                <Text numberOfLines={1} style={styles.deckBackTitle}>{exercise.title}</Text>
              </View>
            </Pressable>
          );
        })}

        {activeExercise ? (
          <Pressable
            key={activeExercise.id}
            accessibilityLabel={language === 'ko' ? `${activeExercise.title} 시작` : `Start ${activeExercise.title}`}
            accessibilityRole="button"
            onPress={onPressExercise}
            style={({ pressed }) => [
              styles.exerciseBlockCard,
              styles.deckFrontCard,
              { top: frontOffset },
              pressed && styles.exerciseBlockPressed,
            ]}>
              <TaskCardContent exercise={activeExercise} index={0} language={language} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ExercisePattern({ visual, muted = false }: { visual: TodayExerciseCard['visual']; muted?: boolean }) {
  const color = muted ? 'rgba(184, 199, 211, 0.36)' : theme.text;
  const patterns: Record<TodayExerciseCard['visual'], number[]> = {
    sustain: [0, 0, 0, 0, 0],
    pulse: [0, 10, 0, 10, 0],
    flat: [0, 0, 0, 0],
    arc: [14, 6, 0, 6, 14],
    rise: [18, 12, 6, 0],
    fall: [0, 6, 12, 18],
    wave: [10, 0, 10, 0, 10],
  };

  return (
    <View style={styles.patternRow}>
      {patterns[visual].map((offset, index) => (
        <View key={`${visual}-${index}`} style={[styles.patternMark, { backgroundColor: color, transform: [{ translateY: offset }] }]} />
      ))}
    </View>
  );
}

function TaskCardContent({
  exercise,
  index,
  language,
  muted = false,
}: {
  exercise: TodayExerciseCard;
  index: number;
  language: string;
  muted?: boolean;
}) {
  return (
    <View style={styles.taskCardInner}>
      <View style={styles.exerciseCardHeader}>
        <View style={styles.pickExerciseIcon}>
          <MaterialIcons name={exercise.icon} size={18} color={muted ? theme.textSubtle : theme.primaryBright} />
        </View>
        <Text style={[styles.pickExerciseKicker, muted && styles.pickExerciseMuted]}>{language === 'ko' ? '훈련' : 'Task'} {index + 1}</Text>
      </View>
      <ExercisePattern visual={exercise.visual} muted={muted} />
      <Text style={[styles.pickExerciseTitle, muted && styles.pickExerciseMuted]}>{exercise.title}</Text>
    </View>
  );
}

function DailyGoalCard({
  completed,
  total,
  activeMs,
  activeTargetMs,
  language,
  onClose,
}: {
  completed: number;
  total: number;
  activeMs: number;
  activeTargetMs: number;
  language: string;
  onClose: () => void;
}) {
  const timeProgress = Math.min(1, activeMs / activeTargetMs);
  const title = language === 'ko' ? '오늘 목표' : 'Daily Goal';
  const timeLabel = language === 'ko' ? '녹음 시간' : 'Recorded audio';
  const exerciseLabel = language === 'ko' ? '훈련' : 'Exercises';
  const timeRingColor = timeProgress >= 1 ? 'rgba(100, 217, 154, 0.66)' : `rgba(50, 230, 226, ${0.22 + timeProgress * 0.5})`;

  return (
    <View style={styles.dailyGoalCard}>
      <View style={styles.goalHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        <Pressable accessibilityRole="button" onPress={onClose} style={styles.goalInlineClose}>
          <MaterialIcons name="close" size={22} color={theme.text} />
        </Pressable>
      </View>

      <View style={styles.goalMeterRow}>
        <View style={styles.goalMeter}>
          <View style={[styles.goalRing, completed >= total && styles.goalRingComplete]}>
            <Text style={styles.goalRingValue}>{completed}</Text>
            <Text style={styles.goalRingTotal}>/{total}</Text>
          </View>
          <Text style={styles.goalMeterLabel}>{exerciseLabel}</Text>
        </View>

        <View style={styles.goalMeter}>
          <View style={[styles.goalRing, { borderColor: timeRingColor }]}>
            <Text style={styles.goalTimeCircleValue}>{formatTimer(activeMs)}</Text>
            <Text style={styles.goalTimeCircleTotal}>/ {formatTimer(activeTargetMs)}</Text>
          </View>
          <Text style={styles.goalMeterLabel}>{timeLabel}</Text>
        </View>
      </View>
    </View>
  );
}

function DailyGoalModal({
  visible,
  completed,
  total,
  activeMs,
  activeTargetMs,
  language,
  fade,
  onClose,
}: {
  visible: boolean;
  completed: number;
  total: number;
  activeMs: number;
  activeTargetMs: number;
  language: string;
  fade: Animated.Value;
  onClose: () => void;
}) {
  const sheetY = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [18, 0],
  });

  return (
    <Modal animationType="none" transparent visible={visible} onRequestClose={onClose}>
      <Animated.View style={[styles.modalFadeLayer, { opacity: fade }]}>
        <Pressable accessibilityRole="button" style={styles.modalBackdrop} onPress={onClose}>
          <Pressable style={styles.goalModalContent}>
            <Animated.View style={[styles.goalModalSheet, { transform: [{ translateY: sheetY }] }]}>
              <ScrollView style={styles.goalModalScroll} contentContainerStyle={styles.goalModalScrollContent} showsVerticalScrollIndicator={false}>
                <DailyGoalCard completed={completed} total={total} activeMs={activeMs} activeTargetMs={activeTargetMs} language={language} onClose={onClose} />
              </ScrollView>
            </Animated.View>
          </Pressable>
        </Pressable>
      </Animated.View>
    </Modal>
  );
}

function formatDebugMetric(value: number | undefined | null) {
  return typeof value === 'number' ? value.toFixed(2) : 'n/a';
}

function formatTimer(durationMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, '0');
  return `${minutes}:${seconds}`;
}

function PrimaryAction({ label, icon, onPress }: { label: string; icon: ComponentProps<typeof MaterialIcons>['name']; onPress: () => void }) {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.primaryButton, pressed && styles.primaryPressed]}>
      <Text style={styles.primaryText}>{label}</Text>
      <MaterialIcons name={icon} size={22} color={theme.backgroundDeep} />
    </Pressable>
  );
}

function SessionCard({ icon, title, detail }: { icon: ComponentProps<typeof MaterialIcons>['name']; title: string; detail: string }) {
  return (
    <View style={styles.sessionCard}>
      <View style={styles.sessionIcon}>
        <MaterialIcons name={icon} size={20} color={theme.primaryBright} />
      </View>
      <View style={styles.sessionCopy}>
        <Text style={styles.sessionTitle}>{title}</Text>
        <Text style={styles.sessionDetail}>{detail}</Text>
      </View>
    </View>
  );
}

function FeedbackBlock({ label, detail }: { label: string; detail: string }) {
  return (
    <View style={styles.feedbackBlock}>
      <Text style={styles.feedbackLabel}>{label}</Text>
      <Text style={styles.feedbackDetail}>{detail}</Text>
    </View>
  );
}

function AnalysisPanel({ analysis, title, text }: { analysis: MonthOneAnalysisResponse; title: string; text: typeof mainAppText.en }) {
  const safetyText = analysis.safetyFlags.length > 0 ? analysis.safetyFlags.join(', ').replaceAll('_', ' ') : null;

  return (
    <View style={styles.analysisPanel}>
      <View style={styles.analysisHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        <View style={styles.analysisPills}>
          <Text style={styles.analysisPill}>{analysis.quality.replaceAll('_', ' ')}</Text>
          <Text style={styles.analysisPill}>{analysis.drillId.replaceAll('_', ' ')}</Text>
        </View>
      </View>

      <View style={styles.analysisMetrics}>
        <Metric value={formatDebugMetric(analysis.metrics.resonanceScore)} label="resonance" />
        <Metric value={formatDebugMetric(analysis.metrics.forwardEnergyRatio)} label="forward" />
        <Metric value={formatDebugMetric(analysis.metrics.throatEnergyRatio)} label="throat" />
      </View>

      <AnalysisLine label={text.today.whatWeHeard} detail={analysis.feedback.whatWeHeard} />
      <AnalysisLine label={text.today.whatItMeans} detail={analysis.feedback.whatItOftenMeans} />
      <AnalysisLine label={text.today.oneFix} detail={analysis.feedback.oneThingToTry} />
      <AnalysisLine label={text.today.retryRule} detail={analysis.feedback.retryGoal} />
      {analysis.comparison ? <AnalysisLine label={text.today.secondTakeComparison} detail={analysis.comparison.summary} /> : null}
      {safetyText ? <Text style={styles.analysisSafety}>{safetyText}</Text> : null}
    </View>
  );
}

function AnalysisLine({ label, detail }: { label: string; detail: string }) {
  return (
    <View style={styles.analysisLine}>
      <Text style={styles.feedbackLabel}>{label}</Text>
      <Text style={styles.feedbackDetail}>{detail}</Text>
    </View>
  );
}

function Metric({ value, label }: { value: string; label: string }) {
  return (
    <View style={styles.metric}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.backgroundDeep,
    flex: 1,
  },
  content: {
    gap: SPACE * 5,
    paddingHorizontal: SPACE * 6,
    paddingTop: SPACE * 3,
    paddingBottom: 116,
  },
  loadingScreen: {
    alignItems: 'center',
    flex: 1,
    gap: 18,
    justifyContent: 'center',
    padding: 24,
  },
  stack: {
    gap: 16,
  },
  header: {
    gap: SPACE * 4,
    paddingTop: SPACE,
  },
  headerTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACE * 2,
    justifyContent: 'space-between',
  },
  goalIconButton: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.28)',
    borderRadius: 24,
    borderWidth: 1,
    height: 48,
    justifyContent: 'center',
    width: 48,
  },
  goalIconButtonPressed: {
    backgroundColor: theme.surfacePressed,
  },
  sessionTop: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
    paddingTop: 8,
  },
  iconButton: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 18,
    borderWidth: 1,
    height: 42,
    justifyContent: 'center',
    width: 42,
  },
  kicker: {
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0,
    textTransform: 'uppercase',
  },
  title: {
    color: theme.text,
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0,
    lineHeight: 38,
  },
  body: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  forYouLine: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACE * 2,
  },
  forYouSubtitle: {
    color: theme.text,
    flex: 1,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 24,
  },
  headerStats: {
    flexDirection: 'row',
    gap: SPACE * 2,
  },
  headerStat: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    flexDirection: 'row',
    gap: SPACE,
    minHeight: 44,
    paddingHorizontal: SPACE * 2,
  },
  headerStatValue: {
    color: theme.text,
    fontSize: 14,
    fontWeight: '900',
  },
  headerStatLabel: {
    color: theme.textSubtle,
    flex: 1,
    fontSize: 11,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  pickStack: {
    gap: SPACE * 2,
  },
  dayLabel: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '900',
    lineHeight: 27,
    paddingHorizontal: SPACE,
  },
  weekSelector: {
    gap: SPACE,
    paddingHorizontal: SPACE,
    paddingVertical: SPACE,
  },
  weekChip: {
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    minHeight: 38,
    paddingHorizontal: SPACE * 3,
    justifyContent: 'center',
  },
  weekChipActive: {
    borderColor: theme.primaryBright,
  },
  weekChipPressed: {
    backgroundColor: theme.surfacePressed,
  },
  weekChipText: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  weekChipTextActive: {
    color: theme.primaryBright,
  },
  exerciseDeck: {
    marginTop: SPACE,
    position: 'relative',
  },
  exerciseBlockCard: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.18)',
    borderRadius: 22,
    borderWidth: 1,
    minHeight: 236,
    overflow: 'hidden',
    padding: SPACE * 5,
    position: 'relative',
  },
  exerciseBlockPressed: {
    backgroundColor: theme.surfacePressed,
  },
  deckBackCard: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(184, 199, 211, 0.1)',
    borderRadius: 22,
    borderWidth: 1,
    height: 104,
    overflow: 'hidden',
    paddingHorizontal: SPACE * 5,
    paddingTop: SPACE * 4,
    position: 'absolute',
    shadowColor: '#000000',
    shadowOffset: { height: 16, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 22,
  },
  deckBackCardPressed: {
    backgroundColor: theme.surfacePressed,
  },
  deckBackHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACE * 2,
  },
  deckBackTitle: {
    color: theme.textSubtle,
    flex: 1,
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  deckFrontCard: {
    left: 0,
    minHeight: 260,
    position: 'absolute',
    right: 0,
    zIndex: 20,
  },
  patternRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 5,
    height: 72,
    justifyContent: 'center',
    marginTop: SPACE * 4,
  },
  patternMark: {
    borderRadius: 999,
    height: 7,
    width: 42,
  },
  taskCardInner: {
    flex: 1,
    justifyContent: 'space-between',
    minHeight: 186,
  },
  pickExerciseIcon: {
    alignItems: 'center',
    backgroundColor: theme.primarySoft,
    borderRadius: 14,
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  exerciseCardHeader: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: SPACE * 2,
  },
  pickExerciseKicker: {
    color: theme.primaryBright,
    fontSize: 15,
    fontWeight: '900',
    textTransform: 'uppercase',
  },
  pickExerciseTitle: {
    color: theme.text,
    fontSize: 28,
    fontWeight: '900',
    lineHeight: 34,
    marginTop: SPACE * 3,
  },
  pickExerciseMuted: {
    color: theme.textSubtle,
  },
  dailyGoalCard: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    gap: SPACE * 4,
    minHeight: 250,
    paddingHorizontal: SPACE * 4,
    paddingVertical: SPACE * 5,
  },
  goalHeader: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  goalMeterRow: {
    alignItems: 'flex-start',
    alignSelf: 'stretch',
    flexDirection: 'row',
    gap: SPACE * 3,
    justifyContent: 'center',
    paddingTop: SPACE * 2,
  },
  goalMeter: {
    alignItems: 'center',
    flex: 1,
    gap: SPACE * 3,
    minWidth: 0,
  },
  goalRing: {
    alignItems: 'center',
    borderColor: 'rgba(184, 199, 211, 0.22)',
    borderRadius: 48,
    borderWidth: 8,
    flexDirection: 'row',
    height: 96,
    justifyContent: 'center',
    width: 96,
  },
  goalRingComplete: {
    borderColor: 'rgba(100, 217, 154, 0.66)',
  },
  goalRingValue: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '900',
  },
  goalRingTotal: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 5,
  },
  goalTimeCircleValue: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '900',
  },
  goalTimeCircleTotal: {
    color: theme.textMuted,
    fontSize: 9,
    fontWeight: '800',
    marginTop: 2,
  },
  goalMeterLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  modalFadeLayer: {
    flex: 1,
  },
  modalBackdrop: {
    alignItems: 'center',
    backgroundColor: 'rgba(7, 10, 16, 0.72)',
    flex: 1,
    justifyContent: 'center',
    padding: 12,
  },
  goalModalContent: {
    maxHeight: '92%',
    maxWidth: 340,
    width: '100%',
  },
  goalModalSheet: {
    gap: SPACE * 1.5,
    maxHeight: '100%',
    width: '100%',
  },
  goalModalScroll: {
    flexGrow: 0,
    width: '100%',
  },
  goalModalScrollContent: {
    paddingBottom: SPACE,
  },
  goalInlineClose: {
    alignItems: 'center',
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(184, 199, 211, 0.16)',
    borderRadius: 18,
    borderWidth: 1,
    height: 36,
    justifyContent: 'center',
    width: 36,
  },
  heroPanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    overflow: 'hidden',
    padding: 18,
  },
  heroMeta: {
    gap: 4,
  },
  summaryGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  metric: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 78,
    padding: 12,
  },
  metricValue: {
    color: theme.text,
    fontSize: 22,
    fontWeight: '800',
  },
  metricLabel: {
    color: theme.textSubtle,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 5,
    textTransform: 'uppercase',
  },
  panel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 12,
    padding: 16,
  },
  panelHead: {
    gap: 4,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  panelSub: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: '700',
  },
  sessionCard: {
    alignItems: 'center',
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.1)',
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: 'row',
    gap: 12,
    minHeight: 76,
    padding: 13,
  },
  sessionIcon: {
    alignItems: 'center',
    backgroundColor: theme.primarySoft,
    borderRadius: 18,
    height: 40,
    justifyContent: 'center',
    width: 40,
  },
  sessionCopy: {
    flex: 1,
    gap: 3,
  },
  sessionTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: '800',
  },
  sessionDetail: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
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
  primaryButton: {
    alignItems: 'center',
    backgroundColor: theme.primary,
    borderRadius: 12,
    flexDirection: 'row',
    gap: 10,
    justifyContent: 'center',
    minHeight: 56,
    paddingHorizontal: 18,
  },
  primaryPressed: {
    backgroundColor: theme.primaryPressed,
  },
  primaryText: {
    color: theme.backgroundDeep,
    fontSize: 16,
    fontWeight: '800',
  },
  recordPanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.22)',
    borderRadius: 8,
    borderWidth: 1,
    padding: 18,
  },
  recordLabel: {
    color: theme.text,
    fontSize: 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  durationText: {
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: '800',
    marginTop: 10,
    textAlign: 'center',
    textTransform: 'uppercase',
  },
  errorText: {
    color: theme.caution,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 20,
  },
  analysisNote: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  analysisPanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: 'rgba(50, 230, 226, 0.24)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 13,
    padding: 16,
  },
  analysisHeader: {
    gap: 10,
  },
  analysisPills: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  analysisPill: {
    backgroundColor: theme.primarySoft,
    borderColor: 'rgba(50, 230, 226, 0.24)',
    borderRadius: 999,
    borderWidth: 1,
    color: theme.primaryBright,
    fontSize: 12,
    fontWeight: '800',
    overflow: 'hidden',
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: 'uppercase',
  },
  analysisMetrics: {
    flexDirection: 'row',
    gap: 8,
  },
  analysisLine: {
    borderTopColor: 'rgba(184, 199, 211, 0.12)',
    borderTopWidth: 1,
    gap: 5,
    paddingTop: 12,
  },
  analysisSafety: {
    color: theme.warning,
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 19,
  },
  feedbackBlock: {
    backgroundColor: theme.surface,
    borderColor: 'rgba(184, 199, 211, 0.12)',
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    padding: 15,
  },
  feedbackLabel: {
    color: theme.primaryBright,
    fontSize: 13,
    fontWeight: '800',
    textTransform: 'uppercase',
  },
  feedbackDetail: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
});

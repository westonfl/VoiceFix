import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import {
  AudioModule,
  RecordingPresets,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
} from 'expo-audio';
import type { ComponentProps } from 'react';
import { useEffect, useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { VoiceFixTheme as theme } from '@/constants/theme';
import { OnboardingFlow } from '@/features/onboarding/OnboardingFlow';
import { SignalWave } from '@/features/onboarding/components';
import { buildMvpFeedback, compareTakes, formatDuration } from '@/features/prototype/analysis';
import { getPhaseLabel } from '@/features/prototype/curriculum';
import { displayPhase, displayPreferenceValue, displaySessionText, displayWeek, mainAppText } from '@/features/prototype/localization';
import { analyzeMonthOneTake, monthOneDrillForWeek, type MonthOneAnalysisResponse } from '@/features/prototype/serverAnalysis';
import { usePrototype } from '@/features/prototype/state';

type SessionStep = 'intro' | 'record' | 'feedback' | 'retry' | 'summary';
type RecordedTake = {
  uri?: string;
  durationMs: number;
};

export default function TodayScreen() {
  const { state, currentWeek, isHydrated, completeOnboarding, completeSession } = usePrototype();
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
  const todaySession = currentWeek.dailySessions[state.currentDayNumber - 1] ?? currentWeek.dailySessions[0];
  const text = mainAppText[state.language];
  const displayCurrentWeek = displayWeek(currentWeek, state.language);
  const fallbackFeedback = useMemo(() => buildMvpFeedback(firstTake ?? { durationMs: 0 }, state.language), [firstTake, state.language]);
  const feedback = firstAnalysis
    ? {
        observation: firstAnalysis.feedback.whatWeHeard,
        interpretation: firstAnalysis.feedback.whatItOftenMeans,
        cue: firstAnalysis.feedback.oneThingToTry,
      }
    : fallbackFeedback;
  const monthOneDrillId = monthOneDrillForWeek(currentWeek.weekNumber);

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
    } catch {
      setActiveTake(null);
      setRecordingError(text.today.recordStartFailed);
    }
  }

  async function stopRecording(take: 'first' | 'retry') {
    try {
      const durationMs = recorderState.durationMillis;
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
        const retryServerAnalysis = await analyzeRetryTake(recordedTake);
        const comparisonText = retryServerAnalysis?.comparison?.summary ?? compareTakes(firstTake ?? { durationMs: 0 }, recordedTake, state.language);
        setSessionStep('summary');
        completeSession({
          title: `${currentWeek.title} - ${todaySession.role}`,
          firstTakeUri: firstTake?.uri,
          retryTakeUri: recordedTake.uri,
          firstDurationMs: firstTake?.durationMs ?? 0,
          retryDurationMs: recordedTake.durationMs,
          observation: feedback.observation,
          comparison: comparisonText,
          createdAt: new Date().toISOString(),
          analysisMetrics: retryServerAnalysis?.metrics ?? firstAnalysis?.metrics,
        });
      }
    } catch {
      setRecordingError(text.today.recordSaveFailed);
    } finally {
      setActiveTake(null);
    }
  }

  async function analyzeFirstTake(take: RecordedTake) {
    if (!take.uri || !monthOneDrillId) {
      setAnalysisSource('fallback');
      return;
    }

    try {
      setAnalysisPending(true);
      const analysis = await analyzeMonthOneTake({
        uri: take.uri,
        drillId: monthOneDrillId,
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
    if (!take.uri || !monthOneDrillId) {
      setAnalysisSource('fallback');
      return null;
    }

    try {
      setAnalysisPending(true);
      const analysis = await analyzeMonthOneTake({
        uri: take.uri,
        drillId: monthOneDrillId,
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
              onPress={() => {
                setSessionOpen(false);
                setSessionStep('intro');
              }}
              style={styles.iconButton}>
              <MaterialIcons name="close" size={22} color={theme.text} />
            </Pressable>
            <Text style={styles.kicker}>{text.today.trainingSession}</Text>
          </View>

          {sessionStep === 'intro' ? (
            <View style={styles.stack}>
              <Text style={styles.title}>{displaySessionText(todaySession.role, state.language)}: {displayCurrentWeek.title}</Text>
              <Text style={styles.body}>{text.today.introBody}</Text>
              <SessionCard icon="graphic-eq" title={text.today.warmUp} detail={displaySessionText(currentWeek.coreExercises[0], state.language)} />
              <SessionCard icon="mic" title={text.today.mainDrill} detail={displaySessionText(todaySession.drill, state.language)} />
              <SessionCard icon="refresh" title={text.today.retryRule} detail={text.today.retryRuleDetail} />
              <PrimaryAction label={text.today.startRecording} icon="fiber-manual-record" onPress={() => setSessionStep('record')} />
            </View>
          ) : null}

          {sessionStep === 'record' ? (
            <View style={styles.stack}>
              <Text style={styles.title}>{text.today.recordFirstTake}</Text>
              <Text style={styles.body}>{displaySessionText(todaySession.focus, state.language)}. {text.today.storesLocally}</Text>
              <View style={styles.recordPanel}>
                <SignalWave active />
                <Text style={styles.recordLabel}>{displaySessionText(todaySession.drill, state.language)}</Text>
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
              {analysisPending ? <Text style={styles.body}>{state.language === 'ko' ? '서버 분석을 기다리는 중입니다. 곧 한 가지 힌트를 보여드립니다.' : 'Waiting for server analysis. One cue will appear shortly.'}</Text> : null}
              <FeedbackBlock label={text.today.whatWeHeard} detail={feedback.observation} />
              <FeedbackBlock label={text.today.whatItMeans} detail={feedback.interpretation} />
              <FeedbackBlock label={text.today.oneFix} detail={feedback.cue} />
              {analysisSource === 'fallback' ? <Text style={styles.analysisNote}>{state.language === 'ko' ? '서버에 연결할 수 없어 기기 내 기본 피드백을 사용했습니다.' : 'Server unavailable, so VoiceFix used the local fallback.'}</Text> : null}
              <PrimaryAction label={text.today.retrySameDrill} icon="refresh" onPress={() => setSessionStep('retry')} />
            </View>
          ) : null}

          {sessionStep === 'retry' ? (
            <View style={styles.stack}>
              <Text style={styles.title}>{text.today.retryUnchanged}</Text>
              <Text style={styles.body}>{text.today.retryBody}</Text>
              <View style={styles.recordPanel}>
                <SignalWave active />
                <Text style={styles.recordLabel}>{text.today.secondTakeComparison}</Text>
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
              <View style={styles.panel}>
                <Text style={styles.panelTitle}>{text.today.recordedTakes}</Text>
                <Metric value={formatDuration(firstTake?.durationMs ?? 0)} label={text.common.firstTake} />
                <Metric value={formatDuration(retryTake?.durationMs ?? 0)} label={text.common.retry} />
              </View>
              <View style={styles.summaryGrid}>
                <Metric value={`${state.streak.current}`} label={text.common.dayStreak} />
                <Metric value={state.streak.monthlyGraceUsed ? '0' : '1'} label={text.common.graceDay} />
                <Metric value={`${state.journeyDay}`} label={`${text.common.of} 180`} />
              </View>
              <PrimaryAction
                label={text.today.backToToday}
                icon="home"
                onPress={() => {
                  setSessionOpen(false);
                  setSessionStep('intro');
                  setFirstTake(null);
                  setRetryTake(null);
                  setFirstAnalysis(null);
                  setRetryAnalysis(null);
                  setAnalysisSource(null);
                }}
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
          <Text style={styles.kicker}>{text.common.day} {state.journeyDay} {text.common.of} 180</Text>
          <Text style={styles.title}>{displayCurrentWeek.title}</Text>
          <Text style={styles.body}>{displayCurrentWeek.goal}</Text>
        </View>

        <View style={styles.heroPanel}>
          <View style={styles.heroMeta}>
            <Text style={styles.phase}>{displayPhase(getPhaseLabel(currentWeek.phase), state.language)}</Text>
            <Text style={styles.week}>{text.common.week} {currentWeek.weekNumber} · {text.common.day} {state.currentDayNumber}</Text>
          </View>
          <SignalWave active />
        </View>

        <View style={styles.summaryGrid}>
          <Metric value={`${state.streak.current}`} label={text.common.streak} />
          <Metric value={state.streak.monthlyGraceUsed ? text.common.used : text.common.ready} label={text.common.grace} />
          <Metric value={displayPreferenceValue(state.sessionLength, state.language)} label={text.common.today} />
        </View>

        <View style={styles.panel}>
          <View style={styles.panelHead}>
            <Text style={styles.panelTitle}>{text.today.todaysSession}</Text>
            <Text style={styles.panelSub}>{displaySessionText(todaySession.role, state.language)}</Text>
          </View>
          {currentWeek.coreExercises.slice(0, 3).map((exercise, index) => (
            <SessionCard key={exercise} icon={index === 0 ? 'air' : index === 1 ? 'graphic-eq' : 'refresh'} title={`${index + 1}. ${displaySessionText(exercise, state.language)}`} detail={index === 2 ? text.today.recordCueRetry : displaySessionText(todaySession.focus, state.language)} />
          ))}
        </View>

        {state.placement ? (
          <View style={styles.note}>
            <MaterialIcons name="route" size={20} color={theme.warning} />
            <Text style={styles.noteText}>{state.language === 'ko' ? text.today.placementReason : state.placement.reason}</Text>
          </View>
        ) : null}

        <PrimaryAction label={state.completedToday ? text.today.practiceAgain : text.today.startTraining} icon="play-arrow" onPress={() => setSessionOpen(true)} />
      </ScrollView>
    </SafeAreaView>
  );
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
    gap: 18,
    padding: 20,
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
    gap: 9,
    paddingTop: 12,
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
  phase: {
    color: theme.text,
    fontSize: 20,
    fontWeight: '800',
  },
  week: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: '700',
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

import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import {
  AudioModule,
  setAudioModeAsync,
  useAudioRecorder,
  useAudioRecorderState,
  type AudioRecorder,
  type RecorderState,
} from "expo-audio";
import Constants from "expo-constants";
import { Image } from "expo-image";
import type { ComponentProps } from "react";
import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

import { CloseIconButton, headerIconButtonStyles } from "@/constants/headerButtons";
import { VoiceFixTheme as theme } from "@/constants/theme";
import { OnboardingFlow } from "@/features/onboarding/OnboardingFlow";
import {
  CardGradientBackground,
  SignalWave,
  type CardGradientVariant,
} from "@/features/onboarding/components";
import { analysisMetricItems, metricGuideTitle } from "@/features/prototype/analysisMetrics";
import { AnalysisMetricCard } from "@/features/training/AnalysisMetricCard";
import {
  curriculum,
  getExerciseById,
  getWeek,
  type CurriculumExercise,
} from "@/features/prototype/curriculum";
import {
  displaySessionText,
  fillTemplate,
  mainAppText,
  type MainAppLanguage,
} from "@/features/prototype/localization";
import {
  analyzeMonthOneTake,
  type MonthOneAnalysisResponse,
} from "@/features/prototype/serverAnalysis";
import { usePrototype } from "@/features/prototype/state";
import type { LiveMeterSample } from "@/features/training/liveAnalysis";
import { TrainingAnalyzingScreen } from "@/features/training/TrainingAnalyzingScreen";
import { LoadingDots } from "@/features/training/LoadingDots";
import { TrainingDetailScreen } from "@/features/training/TrainingDetailScreen";
import { TrainingLiveSession } from "@/features/training/TrainingLiveSession";
import { TrainingResultsScreen } from "@/features/training/TrainingResultsScreen";
import { getExerciseIllustration } from "@/features/training/exerciseIllustrations";
import {
  TRAINING_METER_INTERVAL_MS,
  TRAINING_RECORDING_OPTIONS,
} from "@/features/training/recording";

type SessionStep = "detail" | "live" | "analyzing" | "results";
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
  category: CurriculumExercise["category"];
  analysisDrillId: CurriculumExercise["analysisDrillId"];
  visual: CurriculumExercise["visual"];
  icon: ComponentProps<typeof MaterialIcons>["name"];
  gradient: CardGradientVariant;
};

const DAILY_RECORDED_TARGET_MS = 10 * 60 * 1000;
const SPACE = 5;

function orderExercises(exercises: string[], savedOrder?: string[]) {
  const validExercises = new Set(exercises);
  const ordered =
    savedOrder?.filter((exercise) => validExercises.has(exercise)) ?? [];
  const missing = exercises.filter((exercise) => !ordered.includes(exercise));

  return [...ordered, ...missing];
}

export default function TodayScreen() {
  const { state, isHydrated, completeOnboarding, reorderWeekExercise } =
    usePrototype();
  const audioRecorder = useAudioRecorder(TRAINING_RECORDING_OPTIONS);
  const recorderState = useAudioRecorderState(
    audioRecorder,
    TRAINING_METER_INTERVAL_MS,
  );
  const [sessionStep, setSessionStep] = useState<SessionStep>("detail");
  const [sessionOpen, setSessionOpen] = useState(false);
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [firstTake, setFirstTake] = useState<RecordedTake | null>(null);
  const [liveSessionKey, setLiveSessionKey] = useState(0);
  const [firstAnalysis, setFirstAnalysis] =
    useState<MonthOneAnalysisResponse | null>(null);
  const [retryAnalysis, setRetryAnalysis] =
    useState<MonthOneAnalysisResponse | null>(null);
  const [analysisSource, setAnalysisSource] = useState<
    "server" | "fallback" | null
  >(null);
  const [goalModalVisible, setGoalModalVisible] = useState(false);
  const [activeExerciseIndex, setActiveExerciseIndex] = useState(0);
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>(
    [],
  );
  const [completedRecordedMs, setCompletedRecordedMs] = useState(0);
  const [selectedWeekNumber, setSelectedWeekNumber] = useState(
    state.currentWeekNumber,
  );
  const [selectedDayNumber, setSelectedDayNumber] = useState(
    state.currentDayNumber,
  );
  const goalFade = useRef(new Animated.Value(0)).current;
  const displayedWeek = getWeek(selectedWeekNumber);
  const todaySession =
    displayedWeek.dailySessions[selectedDayNumber - 1] ??
    displayedWeek.dailySessions[0];
  const text = mainAppText[state.language];
  const forYouTitle = text.today.forYouTitle;
  const forYouSubtitle = text.today.forYouSubtitle;
  const selectableWeeks = curriculum.filter(
    (week) => week.exercises.length > 0,
  );
  const orderedExerciseIds = orderExercises(
    displayedWeek.exercises.map((exercise) => exercise.id),
    state.exerciseOrdersByWeek[`${displayedWeek.weekNumber}`],
  );
  const orderedExerciseUnits = orderedExerciseIds
    .map((id) => displayedWeek.exercises.find((exercise) => exercise.id === id))
    .filter((exercise): exercise is CurriculumExercise => Boolean(exercise));
  const todaySessionExercise = todaySession.exerciseId
    ? getExerciseById(todaySession.exerciseId)
    : undefined;
  const dailyExerciseUnits = todaySessionExercise
    ? [todaySessionExercise]
    : orderedExerciseUnits;
  const todayExerciseCards: TodayExerciseCard[] = dailyExerciseUnits.map(
    (exercise) => ({
      id: exercise.id,
      title: displaySessionText(
        todaySessionExercise ? todaySession.drill : exercise.title,
        state.language,
      ),
      detail: displaySessionText(
        todaySessionExercise
          ? (todaySession.goal ?? todaySession.focus)
          : exercise.instruction,
        state.language,
      ),
      goal: displaySessionText(
        todaySessionExercise
          ? (todaySession.goal ?? exercise.goal)
          : exercise.goal,
        state.language,
      ),
      instruction: displaySessionText(
        todaySessionExercise
          ? (todaySession.instruction ?? exercise.instruction)
          : exercise.instruction,
        state.language,
      ),
      category: exercise.category,
      analysisDrillId: todaySessionExercise
        ? (todaySession.analysisDrillId ?? exercise.analysisDrillId)
        : exercise.analysisDrillId,
      visual: exercise.visual,
      icon: getExerciseIcon(exercise),
      gradient: getExerciseGradient(exercise.category),
    }),
  );
  const currentExercise =
    todayExerciseCards[activeExerciseIndex] ?? todayExerciseCards[0];
  const dailyGoalTotal = todayExerciseCards.length;
  const currentExercisePairComplete = Boolean(firstTake);
  const currentExerciseAlreadyCompleted = completedExerciseIds.includes(
    currentExercise?.id ?? "",
  );
  const pendingCompletedCount =
    currentExercisePairComplete && !currentExerciseAlreadyCompleted ? 1 : 0;
  const dailyGoalCompleted = Math.min(
    dailyGoalTotal,
    completedExerciseIds.length + pendingCompletedCount,
  );
  const savedTodayClip = state.savedClips.find(
    (clip) =>
      clip.weekNumber === displayedWeek.weekNumber &&
      clip.dayNumber === selectedDayNumber,
  );
  const currentRecordedMs = firstTake?.durationMs ?? 0;
  const recordedPracticeMs =
    completedRecordedMs +
    (completedExerciseIds.includes(currentExercise?.id ?? "")
      ? 0
      : currentRecordedMs);
  const displayedGoalRecordedMs = Math.max(
    savedTodayClip?.recordedPracticeMs ?? 0,
    recordedPracticeMs,
  );
  const allExercisesRecorded =
    dailyGoalCompleted >= dailyGoalTotal && dailyGoalTotal > 0;
  const allGoalTargetsAchieved =
    allExercisesRecorded && displayedGoalRecordedMs >= DAILY_RECORDED_TARGET_MS;
  const firstIncompleteExerciseIndex = todayExerciseCards.findIndex(
    (exercise) => !completedExerciseIds.includes(exercise.id),
  );
  const monthOneDrillId =
    currentExercise?.analysisDrillId ?? todaySession.analysisDrillId;

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
    setSelectedDayNumber(state.currentDayNumber);
  }, [state.currentDayNumber]);

  useEffect(() => {
    setActiveExerciseIndex(0);
    setCompletedExerciseIds([]);
    setCompletedRecordedMs(0);
    setFirstTake(null);
    setFirstAnalysis(null);
    setRetryAnalysis(null);
    setAnalysisSource(null);
  }, [selectedWeekNumber, selectedDayNumber]);

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
      duration: 260,
      toValue: 1,
      useNativeDriver: true,
    }).start();
  }

  function closeGoalModal() {
    Animated.timing(goalFade, {
      duration: 200,
      toValue: 0,
      useNativeDriver: true,
    }).start(({ finished }) => {
      if (finished) {
        setGoalModalVisible(false);
      }
    });
  }

  async function handleLiveSessionComplete(payload: {
    durationMs: number;
    uri?: string;
    samples: LiveMeterSample[];
  }) {
    const drillId = monthOneDrillId;
    const recordedTake = {
      durationMs: payload.durationMs,
      uri: payload.uri,
    };

    setFirstTake(recordedTake);
    setFirstAnalysis(null);
    setRetryAnalysis(null);
    setAnalysisSource(null);
    setSessionStep("analyzing");

    if (recordedTake.uri && drillId) {
      await analyzeFirstTake(recordedTake);
      return;
    }

    setAnalysisSource("fallback");
    setSessionStep("results");
  }

  function startTrainingSession() {
    setSessionOpen(true);
    setSessionStep("detail");
    setActiveExerciseIndex(
      firstIncompleteExerciseIndex >= 0 ? firstIncompleteExerciseIndex : 0,
    );
    setFirstTake(null);
    setLiveSessionKey((current) => current + 1);
    setFirstAnalysis(null);
    setRetryAnalysis(null);
    setAnalysisSource(null);
  }

  function closeTrainingSession() {
    setSessionOpen(false);
    setSessionStep("detail");
    setFirstTake(null);
    setFirstAnalysis(null);
    setRetryAnalysis(null);
    setAnalysisSource(null);
  }

  function redoLiveSession() {
    setFirstTake(null);
    setLiveSessionKey((current) => current + 1);
    setFirstAnalysis(null);
    setRetryAnalysis(null);
    setAnalysisSource(null);
    setSessionStep("live");
  }

  function completeLiveSession() {
    const completedIds = currentExercise
      ? completedExerciseIds.includes(currentExercise.id)
        ? completedExerciseIds
        : [...completedExerciseIds, currentExercise.id]
      : completedExerciseIds;

    if (
      currentExercise &&
      firstTake &&
      !completedExerciseIds.includes(currentExercise.id)
    ) {
      setCompletedRecordedMs((recordedMs) => recordedMs + firstTake.durationMs);
      setCompletedExerciseIds(completedIds);
    }

    const nextIncompleteIndex = todayExerciseCards.findIndex(
      (exercise) => !completedIds.includes(exercise.id),
    );

    if (nextIncompleteIndex >= 0) {
      setActiveExerciseIndex(nextIncompleteIndex);
      setSessionStep("detail");
      setFirstTake(null);
      setLiveSessionKey((current) => current + 1);
      setFirstAnalysis(null);
      setRetryAnalysis(null);
      setAnalysisSource(null);
      return;
    }

    closeTrainingSession();
  }

  async function analyzeFirstTake(take: RecordedTake) {
    const drillId = monthOneDrillId;
    if (!take.uri || !drillId) {
      setAnalysisSource("fallback");
      setSessionStep("results");
      return;
    }

    try {
      const analysis = await analyzeMonthOneTake({
        uri: take.uri,
        drillId,
        language: state.language,
        takeKind: "first",
      });
      setFirstAnalysis(analysis);
      setAnalysisSource("server");
    } catch {
      setAnalysisSource("fallback");
    } finally {
      setSessionStep("results");
    }
  }

  return (
    <>
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.header}>
            <View style={styles.headerTop}>
              <Text style={styles.title}>{forYouTitle}</Text>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={text.today.showDailyGoal}
                onPress={openGoalModal}
                style={({ pressed }) => [
                  styles.goalIconButton,
                  pressed && styles.goalIconButtonPressed,
                ]}
              >
                <MaterialIcons
                  name={
                    allGoalTargetsAchieved ? "check-circle" : "track-changes"
                  }
                  size={24}
                  color={
                    allGoalTargetsAchieved ? theme.success : theme.primaryBright
                  }
                />
              </Pressable>
            </View>
            <View style={styles.forYouLine}>
              <MaterialIcons
                name="auto-awesome"
                size={26}
                color={theme.primaryBright}
              />
              <Text style={styles.forYouSubtitle}>{forYouSubtitle}</Text>
            </View>
            <View style={styles.headerStats}>
              <HeaderStat
                icon="local-fire-department"
                value={`${state.streak.current}`}
                label={text.common.streak}
              />
              <HeaderStat
                icon="shield"
                value={
                  state.streak.monthlyGraceUsed
                    ? text.common.used
                    : text.common.ready
                }
                label={text.common.grace}
              />
            </View>
          </View>

          <ForYouStack
            dayLabel={`${text.common.day} ${selectedDayNumber}`}
            selectedDayNumber={selectedDayNumber}
            selectedWeekNumber={selectedWeekNumber}
            weeks={selectableWeeks}
            exercises={todayExerciseCards}
            text={text}
            onSelectWeek={(weekNumber) => {
              setSelectedWeekNumber(weekNumber);
              setActiveExerciseIndex(0);
            }}
            onSelectDay={(dayNumber) => {
              setSelectedDayNumber(dayNumber);
              setActiveExerciseIndex(0);
            }}
            onMoveExercise={(fromIndex, toIndex) =>
              reorderWeekExercise(displayedWeek.weekNumber, fromIndex, toIndex)
            }
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
      <Modal
        animationType="slide"
        onRequestClose={closeTrainingSession}
        presentationStyle="fullScreen"
        visible={sessionOpen}
      >
        <SafeAreaProvider>
          <TrainingSessionModalContent
            sessionStep={sessionStep}
            text={text}
            currentExercise={currentExercise}
            liveSessionKey={liveSessionKey}
            firstAnalysis={firstAnalysis}
            analysisSource={analysisSource}
            language={state.language}
            audioRecorder={audioRecorder}
            recorderState={recorderState}
            onClose={closeTrainingSession}
            onStartLive={() => setSessionStep("live")}
            onLiveComplete={handleLiveSessionComplete}
            onLiveCancel={closeTrainingSession}
            onRedo={redoLiveSession}
            onDone={completeLiveSession}
          />
        </SafeAreaProvider>
      </Modal>
    </>
  );
}

function useReliableSafeInsets() {
  const insets = useSafeAreaInsets();
  const fallbackTop = Constants.statusBarHeight ?? 0;

  return {
    top: insets.top > 0 ? insets.top : fallbackTop,
    bottom: insets.bottom,
  };
}

function TrainingSessionModalContent({
  sessionStep,
  text,
  currentExercise,
  liveSessionKey,
  firstAnalysis,
  analysisSource,
  language,
  audioRecorder,
  recorderState,
  onClose,
  onStartLive,
  onLiveComplete,
  onLiveCancel,
  onRedo,
  onDone,
}: {
  sessionStep: SessionStep;
  text: (typeof mainAppText)["en"];
  currentExercise?: TodayExerciseCard;
  liveSessionKey: number;
  firstAnalysis: MonthOneAnalysisResponse | null;
  analysisSource: "server" | "fallback" | null;
  language: MainAppLanguage;
  audioRecorder: AudioRecorder;
  recorderState: RecorderState;
  onClose: () => void;
  onStartLive: () => void;
  onLiveComplete: (payload: {
    durationMs: number;
    uri?: string;
    samples: LiveMeterSample[];
  }) => void | Promise<void>;
  onLiveCancel: () => void;
  onRedo: () => void;
  onDone: () => void;
}) {
  const insets = useReliableSafeInsets();
  const usesFullHeightStep =
    sessionStep === "analyzing" ||
    sessionStep === "results" ||
    sessionStep === "detail";

  const stepContent = (
    <>
      {sessionStep === "live" ? (
        <CloseIconButton
          onPress={onClose}
          style={headerIconButtonStyles.buttonAlignStart}
        />
      ) : null}

      {sessionStep === "detail" && currentExercise ? (
        <TrainingDetailScreen
          title={currentExercise.title}
          category={currentExercise.category}
          goal={currentExercise.goal}
          instruction={currentExercise.instruction}
          exerciseId={currentExercise.id}
          icon={currentExercise.icon}
          gradient={currentExercise.gradient}
          language={language}
          text={text.today}
          onClose={onClose}
          onStart={onStartLive}
        />
      ) : null}

      {sessionStep === "live" && currentExercise ? (
        <TrainingLiveSession
          key={liveSessionKey}
          exerciseId={currentExercise.id}
          exerciseTitle={currentExercise.title}
          gradient={currentExercise.gradient}
          language={language}
          text={text}
          audioRecorder={audioRecorder}
          recorderState={recorderState}
          onComplete={onLiveComplete}
          onCancel={onLiveCancel}
        />
      ) : null}

      {sessionStep === "analyzing" ? (
        <TrainingAnalyzingScreen text={text.today} />
      ) : null}

      {sessionStep === "results" ? (
        <TrainingResultsScreen
          analysis={firstAnalysis}
          fallback={analysisSource === "fallback"}
          text={text}
          language={language}
          exerciseTitle={currentExercise?.title}
          onRedo={onRedo}
          onDone={onDone}
        />
      ) : null}
    </>
  );

  return (
    <View
      style={[
        styles.safeArea,
        styles.sessionRoot,
        {
          paddingBottom: insets.bottom,
          paddingTop: insets.top,
        },
      ]}
    >
      {usesFullHeightStep ? (
        <View style={[styles.sessionContent, styles.sessionContentFlex]}>
          {stepContent}
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={styles.sessionContent}
          showsVerticalScrollIndicator={false}
        >
          {stepContent}
        </ScrollView>
      )}
    </View>
  );
}

function HeaderStat({
  icon,
  value,
  label,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
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

function getExerciseIcon(
  exercise: CurriculumExercise,
): ComponentProps<typeof MaterialIcons>["name"] {
  const icons: Record<string, ComponentProps<typeof MaterialIcons>["name"]> = {
    "sustained-hiss": "air",
    "gentle-hum": "music-note",
    "soft-hum-start": "volume-down",
    "mmm-resonance": "vibration",
    "fah-vah-resonance": "spatial-audio-off",
    "hum-to-ah": "unfold-more",
    "short-tone": "timelapse",
  };

  return icons[exercise.id] ?? "mic";
}

function getExerciseGradient(
  category: CurriculumExercise["category"],
): CardGradientVariant {
  if (category === "breathing") {
    return "breath";
  }

  if (category === "tone") {
    return "tone";
  }

  if (category === "resonance") {
    return "resonance";
  }

  return "integration";
}

function ForYouStack({
  dayLabel,
  selectedDayNumber,
  selectedWeekNumber,
  weeks,
  exercises,
  text,
  onSelectWeek,
  onSelectDay,
  onMoveExercise,
  onPressExercise,
}: {
  dayLabel: string;
  selectedDayNumber: number;
  selectedWeekNumber: number;
  weeks: typeof curriculum;
  exercises: TodayExerciseCard[];
  text: (typeof mainAppText)["en"];
  onSelectWeek: (weekNumber: number) => void;
  onSelectDay: (dayNumber: number) => void;
  onMoveExercise: (fromIndex: number, toIndex: number) => void;
  onPressExercise: () => void;
}) {
  const visibleExercises = exercises.slice(0, 5);
  const [activeExercise, ...backExercises] = visibleExercises;
  const peekStep = 34;
  const frontOffset =
    backExercises.length > 0 ? backExercises.length * peekStep + SPACE * 2 : 0;
  const deckHeight = frontOffset + 280;

  return (
    <View style={styles.pickStack}>
      <Text style={styles.dayLabel}>{dayLabel}</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.weekSelector}
      >
        {weeks.map((week) => {
          const selected = week.weekNumber === selectedWeekNumber;

          return (
            <Pressable
              key={week.weekNumber}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelectWeek(week.weekNumber)}
              style={({ pressed }) => [
                styles.weekChip,
                selected && styles.weekChipActive,
                pressed && styles.weekChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.weekChipText,
                  selected && styles.weekChipTextActive,
                ]}
              >
                {fillTemplate(text.today.weekChip, {
                  number: week.weekNumber,
                })}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.daySelector}
      >
        {Array.from({ length: 7 }, (_, index) => {
          const dayNumber = index + 1;
          const selected = dayNumber === selectedDayNumber;

          return (
            <Pressable
              key={dayNumber}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => onSelectDay(dayNumber)}
              style={({ pressed }) => [
                styles.dayChip,
                selected && styles.dayChipActive,
                pressed && styles.dayChipPressed,
              ]}
            >
              <Text
                style={[
                  styles.dayChipText,
                  selected && styles.dayChipTextActive,
                ]}
              >
                {text.common.day} {dayNumber}
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
              accessibilityLabel={fillTemplate(text.today.showExerciseA11y, {
                title: exercise.title,
              })}
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
              ]}
            >
              <CardGradientBackground muted variant={exercise.gradient} />
              <View style={styles.deckBackHeader}>
                <MaterialIcons
                  name={exercise.icon}
                  size={18}
                  color={theme.textSubtle}
                />
                <Text numberOfLines={1} style={styles.deckBackTitle}>
                  {exercise.title}
                </Text>
              </View>
            </Pressable>
          );
        })}

        {activeExercise ? (
          <Pressable
            key={activeExercise.id}
            accessibilityLabel={fillTemplate(text.today.startExerciseA11y, {
              title: activeExercise.title,
            })}
            accessibilityRole="button"
            onPress={onPressExercise}
            style={({ pressed }) => [
              styles.exerciseBlockCard,
              styles.deckFrontCard,
              { top: frontOffset },
              pressed && styles.exerciseBlockPressed,
            ]}
          >
            <CardGradientBackground variant={activeExercise.gradient} />
            <TaskCardContent exercise={activeExercise} text={text} />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}

function ExercisePattern({
  exerciseId,
  visual,
  muted = false,
}: {
  exerciseId: string;
  visual: TodayExerciseCard["visual"];
  muted?: boolean;
}) {
  const color = muted ? "rgba(0, 0, 0, 0.14)" : theme.text;
  const softColor = muted ? "rgba(0, 0, 0, 0.14)" : "rgba(0, 0, 0, 0.18)";

  switch (exerciseId) {
    case "sustained-hiss":
      return (
        <View style={styles.patternRow}>
          <View
            style={[styles.patternSustainLine, { backgroundColor: color }]}
          />
        </View>
      );

    case "gentle-hum":
      return (
        <View style={styles.patternRow}>
          <View style={[styles.patternFlatLine, { backgroundColor: color }]} />
        </View>
      );

    case "soft-hum-start":
      return (
        <View style={styles.patternRow}>
          {[0, 1, 2].map((index) => (
            <View
              key={index}
              style={[
                styles.patternGhostMark,
                { backgroundColor: softColor, width: 12 + index * 8 },
              ]}
            />
          ))}
          <View style={[styles.patternSoundCore, { backgroundColor: color }]} />
        </View>
      );

    case "mmm-resonance":
      return (
        <View style={[styles.patternRow, styles.patternResonanceRow]}>
          <View
            style={[styles.patternResonanceCenter, { backgroundColor: color }]}
          />
          <View style={styles.patternResonanceArc}>
            {[0, 1, 2, 3, 4, 5, 6].map((index) => (
              <View
                key={index}
                style={[
                  styles.patternResonanceDot,
                  {
                    backgroundColor: softColor,
                    transform: [{ translateY: Math.abs(index - 3) * 5 }],
                  },
                ]}
              />
            ))}
          </View>
        </View>
      );

    case "fah-vah-resonance":
      return (
        <View style={styles.patternRow}>
          {[10, 0, 10].map((offset, index) => (
            <View
              key={index}
              style={[
                styles.patternVowelMark,
                {
                  backgroundColor: color,
                  transform: [{ translateY: offset }],
                },
              ]}
            />
          ))}
        </View>
      );

    case "hum-to-ah":
      return (
        <View style={styles.patternRow}>
          <View
            style={[styles.patternBridgeLine, { backgroundColor: color }]}
          />
          <View style={[styles.patternBridgePulse, { borderColor: color }]} />
          <View
            style={[styles.patternBridgeOpen, { backgroundColor: softColor }]}
          />
        </View>
      );

    case "short-tone":
      return (
        <View style={styles.patternRow}>
          <View style={[styles.patternShortLine, { backgroundColor: color }]} />
        </View>
      );

    default:
      break;
  }

  if (visual === "sustain") {
    return (
      <View style={styles.patternRow}>
        <View style={[styles.patternSustainLine, { backgroundColor: color }]} />
      </View>
    );
  }

  const patterns: Record<
    Exclude<TodayExerciseCard["visual"], "sustain">,
    number[]
  > = {
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
        <View
          key={`${visual}-${index}`}
          style={[
            styles.patternMark,
            { backgroundColor: color, transform: [{ translateY: offset }] },
          ]}
        />
      ))}
    </View>
  );
}

function TaskCardContent({
  exercise,
  text,
  muted = false,
}: {
  exercise: TodayExerciseCard;
  text: (typeof mainAppText)["en"];
  muted?: boolean;
}) {
  const illustration = getExerciseIllustration(exercise.id);
  const isSustainedHiss = exercise.id === "sustained-hiss";

  return (
    <View style={styles.taskCardInner}>
      <View style={styles.exerciseCardHeader}>
        <View style={styles.pickExerciseIcon}>
          <MaterialIcons
            name={exercise.icon}
            size={18}
            color={muted ? theme.textSubtle : theme.primaryBright}
          />
        </View>
        <Text
          numberOfLines={1}
          style={[styles.pickExerciseKicker, muted && styles.pickExerciseMuted]}
        >
          {exercise.title}
        </Text>
      </View>
      {illustration ? (
        <View
          style={[
            styles.exerciseIllustrationFrame,
            isSustainedHiss ? styles.sustainedHissIllustrationFrame : null,
          ]}
        >
          <Image
            accessibilityLabel={fillTemplate(
              text.today.exerciseIllustrationA11y,
              {
                title: exercise.title,
              },
            )}
            contentFit={isSustainedHiss ? "contain" : "cover"}
            contentPosition={isSustainedHiss ? "center" : "top"}
            source={illustration}
            style={[
              styles.exerciseIllustration,
              isSustainedHiss ? styles.sustainedHissIllustration : null,
            ]}
          />
        </View>
      ) : (
        <ExercisePattern
          exerciseId={exercise.id}
          visual={exercise.visual}
          muted={muted}
        />
      )}
    </View>
  );
}

function DailyGoalCard({
  completed,
  total,
  activeMs,
  activeTargetMs,
  language,
}: {
  completed: number;
  total: number;
  activeMs: number;
  activeTargetMs: number;
  language: MainAppLanguage;
}) {
  const timeProgress = Math.min(1, activeMs / activeTargetMs);
  const labels = mainAppText[language];
  const title = labels.today.dailyGoal;
  const timeLabel = labels.settings.dailyTraining;
  const exerciseLabel = labels.today.exercisesLabel;
  const timeRingColor =
    timeProgress >= 1
      ? "rgba(0, 0, 0, 0.92)"
      : `rgba(0, 0, 0, ${0.12 + timeProgress * 0.34})`;

  return (
    <View style={styles.dailyGoalCard}>
      <Text style={styles.goalModalTitle}>{title}</Text>

      <View style={styles.goalMeterRow}>
        <View style={styles.goalMeter}>
          <View
            style={[
              styles.goalRing,
              completed >= total && styles.goalRingComplete,
            ]}
          >
            <Text style={styles.goalRingValue}>{completed}</Text>
            <Text style={styles.goalRingTotal}>/{total}</Text>
          </View>
          <Text style={styles.goalMeterLabel}>{exerciseLabel}</Text>
        </View>

        <View style={styles.goalMeter}>
          <View style={[styles.goalRing, { borderColor: timeRingColor }]}>
            <Text style={styles.goalTimeCircleValue}>
              {formatTimer(activeMs)}
            </Text>
            <Text style={styles.goalTimeCircleTotal}>
              / {formatTimer(activeTargetMs)}
            </Text>
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
  language: MainAppLanguage;
  fade: Animated.Value;
  onClose: () => void;
}) {
  const labels = mainAppText[language];
  const sheetY = fade.interpolate({
    inputRange: [0, 1],
    outputRange: [320, 0],
  });

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.goalSheetBackdrop} onPress={onClose}>
        <Animated.View
          style={[styles.goalSheetFadeLayer, { opacity: fade }]}
          pointerEvents="none"
        />
        <Animated.View style={{ transform: [{ translateY: sheetY }] }}>
          <Pressable style={styles.goalModalSheet}>
            <CloseIconButton
              accessibilityLabel={labels.today.closeLabel}
              onPress={onClose}
              style={headerIconButtonStyles.sheetCloseButton}
            />
            <DailyGoalCard
              completed={completed}
              total={total}
              activeMs={activeMs}
              activeTargetMs={activeTargetMs}
              language={language}
            />
          </Pressable>
        </Animated.View>
      </Pressable>
    </Modal>
  );
}

function formatTimer(durationMs: number) {
  const totalSeconds = Math.max(0, Math.ceil(durationMs / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = `${totalSeconds % 60}`.padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function PrimaryAction({
  label,
  icon,
  gradient = "integration",
  onPress,
}: {
  label: string;
  icon?: ComponentProps<typeof MaterialIcons>["name"];
  gradient?: CardGradientVariant;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.primaryButton,
        pressed && styles.primaryPressed,
      ]}
    >
      <CardGradientBackground variant={gradient} />
      <Text style={styles.primaryText}>{label}</Text>
      {icon ? (
        <MaterialIcons name={icon} size={22} color={theme.textMuted} />
      ) : null}
    </Pressable>
  );
}

function SessionCard({
  icon,
  title,
  detail,
}: {
  icon: ComponentProps<typeof MaterialIcons>["name"];
  title: string;
  detail: string;
}) {
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

function AnalysisLoadingState({
  message,
  text,
}: {
  message: string;
  text: (typeof mainAppText)["en"];
}) {
  return (
    <View style={styles.analysisLoadingPanel} accessibilityRole="progressbar">
      <SignalWave active />
      <Text style={styles.analysisLoadingTitle}>
        {text.today.analyzingTake}
      </Text>
      <Text style={styles.analysisLoadingBody}>{message}</Text>
      <LoadingDots />
    </View>
  );
}

function AnalysisPanel({
  analysis,
  title,
  text,
  language,
}: {
  analysis: MonthOneAnalysisResponse;
  title: string;
  text: typeof mainAppText.en;
  language: MainAppLanguage;
}) {
  const safetyText =
    analysis.safetyFlags.length > 0
      ? analysis.safetyFlags.join(", ").replaceAll("_", " ")
      : null;
  const metricItems = analysisMetricItems(analysis, language);

  return (
    <View style={styles.analysisPanel}>
      <View style={styles.analysisHeader}>
        <Text style={styles.panelTitle}>{title}</Text>
        <View style={styles.analysisPills}>
          <Text style={styles.analysisPill}>
            {analysis.quality.replaceAll("_", " ")}
          </Text>
          <Text style={styles.analysisPill}>
            {analysis.drillId.replaceAll("_", " ")}
          </Text>
        </View>
      </View>

      <View style={styles.metricGuide}>
        <Text style={styles.metricGuideTitle}>{metricGuideTitle(language)}</Text>
        <View style={styles.analysisMetrics}>
          {metricItems.map((item) => (
            <AnalysisMetricCard key={item.label} item={item} />
          ))}
        </View>
      </View>

      <AnalysisLine
        label={text.today.whatWeHeard}
        detail={analysis.feedback.whatWeHeard}
      />
      <AnalysisLine
        label={text.today.whatItMeans}
        detail={analysis.feedback.whatItOftenMeans}
      />
      <AnalysisLine
        label={text.today.oneFix}
        detail={analysis.feedback.oneThingToTry}
      />
      <AnalysisLine
        label={text.today.retryRule}
        detail={analysis.feedback.retryGoal}
      />
      {analysis.comparison ? (
        <AnalysisLine
          label={text.today.secondTakeComparison}
          detail={analysis.comparison.summary}
        />
      ) : null}
      {safetyText ? (
        <Text style={styles.analysisSafety}>{safetyText}</Text>
      ) : null}
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

const styles = StyleSheet.create({
  safeArea: {
    backgroundColor: theme.backgroundDeep,
    flex: 1,
  },
  sessionRoot: {
    flex: 1,
  },
  sessionContent: {
    gap: SPACE * 5,
    paddingBottom: 24,
    paddingHorizontal: 22,
    paddingTop: SPACE * 4,
  },
  sessionContentFlex: {
    flex: 1,
  },
  content: {
    gap: SPACE * 5,
    paddingHorizontal: 22,
    paddingTop: SPACE * 4,
    paddingBottom: 116,
  },
  loadingScreen: {
    alignItems: "center",
    flex: 1,
    gap: 18,
    justifyContent: "center",
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
    alignItems: "center",
    flexDirection: "row",
    gap: SPACE * 2,
    justifyContent: "space-between",
  },
  goalIconButton: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 26,
    height: 56,
    justifyContent: "center",
    width: 56,
  },
  goalIconButtonPressed: {
    backgroundColor: theme.surfacePressed,
  },
  sessionTop: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    paddingTop: 8,
  },
  kicker: {
    color: theme.text,
    fontSize: 13,
    fontWeight: "900",
    letterSpacing: 0,
    textTransform: "uppercase",
  },
  title: {
    color: theme.text,
    fontSize: 42,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 48,
  },
  body: {
    color: theme.textMuted,
    fontSize: 16,
    lineHeight: 24,
  },
  forYouLine: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACE * 2,
  },
  forYouSubtitle: {
    color: theme.textMuted,
    flex: 1,
    fontSize: 21,
    fontWeight: "900",
    lineHeight: 28,
  },
  headerStats: {
    flexDirection: "row",
    gap: SPACE * 2,
  },
  headerStat: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 10,
    flex: 1,
    flexDirection: "row",
    gap: SPACE,
    minHeight: 44,
    paddingHorizontal: SPACE * 2,
  },
  headerStatValue: {
    color: theme.text,
    fontSize: 14,
    fontWeight: "900",
  },
  headerStatLabel: {
    color: theme.textSubtle,
    flex: 1,
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  pickStack: {
    gap: SPACE * 2,
  },
  dayLabel: {
    color: theme.text,
    fontSize: 28,
    fontWeight: "900",
    lineHeight: 34,
    paddingHorizontal: SPACE,
  },
  weekSelector: {
    gap: SPACE,
    paddingHorizontal: SPACE,
    paddingVertical: SPACE,
  },
  weekChip: {
    backgroundColor: theme.surfaceRaised,
    borderColor: "transparent",
    borderRadius: 16,
    borderWidth: 2,
    minHeight: 42,
    paddingHorizontal: SPACE * 3,
    justifyContent: "center",
  },
  weekChipActive: {
    backgroundColor: theme.background,
    borderColor: theme.text,
  },
  weekChipPressed: {
    backgroundColor: theme.surfacePressed,
  },
  weekChipText: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  weekChipTextActive: {
    color: theme.primaryBright,
  },
  daySelector: {
    gap: SPACE,
    paddingHorizontal: SPACE,
    paddingBottom: SPACE,
  },
  dayChip: {
    backgroundColor: theme.surfaceRaised,
    borderColor: theme.border,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: SPACE * 2,
  },
  dayChipActive: {
    backgroundColor: theme.text,
    borderColor: theme.text,
  },
  dayChipPressed: {
    backgroundColor: theme.surfacePressed,
  },
  dayChipText: {
    color: theme.textSubtle,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase",
  },
  dayChipTextActive: {
    color: theme.background,
  },
  exerciseDeck: {
    marginTop: SPACE,
    position: "relative",
  },
  exerciseBlockCard: {
    backgroundColor: theme.background,
    borderRadius: 28,
    minHeight: 256,
    overflow: "hidden",
    padding: SPACE * 5,
    position: "relative",
  },
  exerciseBlockPressed: {
    backgroundColor: theme.surfacePressed,
  },
  deckBackCard: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 28,
    height: 104,
    overflow: "hidden",
    paddingHorizontal: SPACE * 5,
    paddingTop: SPACE * 4,
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: { height: 22, width: 0 },
    shadowOpacity: 0.11,
    shadowRadius: 24,
  },
  deckBackCardPressed: {
    backgroundColor: theme.surfacePressed,
  },
  deckBackHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACE * 2,
    zIndex: 1,
  },
  deckBackTitle: {
    color: theme.textMuted,
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  deckFrontCard: {
    left: 0,
    minHeight: 280,
    position: "absolute",
    right: 0,
    zIndex: 20,
  },
  patternRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
  },
  patternMark: {
    borderRadius: 999,
    height: 8,
    width: 48,
  },
  patternSustainLine: {
    borderRadius: 999,
    height: 8,
    width: "72%",
  },
  patternFlatLine: {
    borderRadius: 999,
    height: 8,
    width: "58%",
  },
  patternShortLine: {
    borderRadius: 999,
    height: 8,
    width: "42%",
  },
  patternGhostMark: {
    borderRadius: 999,
    height: 6,
  },
  patternSoundCore: {
    borderRadius: 999,
    height: 8,
    width: 54,
  },
  patternResonanceRow: {
    minHeight: 72,
  },
  patternResonanceCenter: {
    borderRadius: 999,
    height: 16,
    width: 16,
  },
  patternResonanceArc: {
    flexDirection: "row",
    gap: 6,
    position: "absolute",
    top: "34%",
  },
  patternResonanceDot: {
    borderRadius: 999,
    height: 7,
    width: 7,
  },
  patternVowelMark: {
    borderRadius: 999,
    height: 8,
    width: 52,
  },
  patternBridgeLine: {
    borderRadius: 999,
    height: 6,
    width: 40,
  },
  patternBridgePulse: {
    borderRadius: 14,
    borderWidth: 5,
    height: 28,
    width: 28,
  },
  patternBridgeOpen: {
    borderRadius: 999,
    height: 6,
    width: 64,
  },
  taskCardInner: {
    flex: 1,
    minHeight: 206,
    position: "relative",
    zIndex: 1,
  },
  exerciseIllustrationFrame: {
    borderRadius: 22,
    flex: 1,
    marginTop: SPACE * 3,
    minHeight: 172,
    overflow: "hidden",
  },
  sustainedHissIllustrationFrame: {
    backgroundColor: "rgba(255, 253, 248, 0.82)",
    borderColor: "rgba(23, 17, 15, 0.08)",
    borderWidth: 1,
    padding: 10,
  },
  exerciseIllustration: {
    height: "100%",
    width: "100%",
  },
  sustainedHissIllustration: {
    borderRadius: 16,
    transform: [{ scale: 1.28 }],
  },
  pickExerciseIcon: {
    alignItems: "center",
    backgroundColor: "rgba(255, 248, 245, 0.68)",
    borderRadius: 14,
    height: 32,
    justifyContent: "center",
    width: 32,
  },
  exerciseCardHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: SPACE * 2,
  },
  pickExerciseKicker: {
    color: theme.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  pickExerciseMuted: {
    color: theme.textMuted,
  },
  dailyGoalCard: {
    alignItems: "center",
    gap: SPACE * 4,
    paddingBottom: SPACE * 2,
    paddingHorizontal: SPACE * 5,
    paddingTop: SPACE * 2,
    width: "100%",
  },
  goalMeterRow: {
    alignItems: "flex-start",
    alignSelf: "stretch",
    flexDirection: "row",
    gap: SPACE * 3,
    justifyContent: "center",
    paddingTop: SPACE * 2,
  },
  goalMeter: {
    alignItems: "center",
    flex: 1,
    gap: SPACE * 3,
    minWidth: 0,
  },
  goalRing: {
    alignItems: "center",
    borderColor: theme.border,
    borderRadius: 48,
    borderWidth: 8,
    flexDirection: "row",
    height: 96,
    justifyContent: "center",
    width: 96,
  },
  goalRingComplete: {
    borderColor: "rgba(0, 0, 0, 0.92)",
  },
  goalRingValue: {
    color: theme.text,
    fontSize: 22,
    fontWeight: "900",
  },
  goalRingTotal: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 5,
  },
  goalTimeCircleValue: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "900",
  },
  goalTimeCircleTotal: {
    color: theme.textMuted,
    fontSize: 9,
    fontWeight: "800",
    marginTop: 2,
  },
  goalMeterLabel: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center",
    textTransform: "uppercase",
  },
  goalSheetBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
  },
  goalSheetFadeLayer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0, 0, 0, 0.16)",
  },
  goalModalSheet: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderTopLeftRadius: 34,
    borderTopRightRadius: 34,
    gap: SPACE * 1.5,
    paddingBottom: 42,
    paddingTop: 78,
    width: "100%",
  },
  goalModalTitle: {
    color: theme.text,
    fontSize: 31,
    fontWeight: "900",
    lineHeight: 38,
    textAlign: "center",
  },
  heroPanel: {
    backgroundColor: theme.surfaceRaised,
    borderColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    padding: 18,
  },
  heroMeta: {
    gap: 4,
  },
  panel: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 24,
    gap: 12,
    padding: 16,
  },
  panelHead: {
    gap: 4,
  },
  panelTitle: {
    color: theme.text,
    fontSize: 20,
    fontWeight: "800",
  },
  panelSub: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: "700",
  },
  sessionCard: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 22,
    flexDirection: "row",
    gap: 12,
    minHeight: 76,
    padding: 13,
  },
  sessionIcon: {
    alignItems: "center",
    backgroundColor: theme.background,
    borderRadius: 18,
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  sessionCopy: {
    flex: 1,
    gap: 3,
  },
  sessionTitle: {
    color: theme.text,
    fontSize: 15,
    fontWeight: "800",
  },
  sessionDetail: {
    color: theme.textMuted,
    fontSize: 13,
    lineHeight: 18,
  },
  note: {
    alignItems: "flex-start",
    backgroundColor: theme.surface,
    borderColor: theme.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
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
    alignItems: "center",
    backgroundColor: theme.background,
    borderColor: theme.border,
    borderRadius: 28,
    borderWidth: 2,
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    minHeight: 56,
    overflow: "hidden",
    paddingHorizontal: 18,
  },
  primaryPressed: {
    opacity: 0.72,
  },
  primaryText: {
    color: theme.textMuted,
    fontSize: 20,
    fontWeight: "900",
    zIndex: 1,
  },
  recordPanel: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 28,
    padding: 18,
  },
  recordLabel: {
    color: theme.text,
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  durationText: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10,
    textAlign: "center",
    textTransform: "uppercase",
  },
  errorText: {
    color: theme.caution,
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
  },
  analysisNote: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  analysisLoadingPanel: {
    alignItems: "center",
    backgroundColor: theme.surfaceRaised,
    borderRadius: 28,
    gap: SPACE * 2,
    padding: SPACE * 4,
  },
  analysisLoadingTitle: {
    color: theme.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center",
  },
  analysisLoadingBody: {
    color: theme.textMuted,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
  },
  analysisLoadingDots: {
    flexDirection: "row",
    gap: SPACE,
    paddingTop: SPACE,
  },
  analysisLoadingDot: {
    backgroundColor: theme.primaryBright,
    borderRadius: 999,
    height: 7,
    opacity: 0.72,
    width: 28,
  },
  analysisPanel: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 28,
    gap: 13,
    padding: 16,
  },
  analysisHeader: {
    gap: 10,
  },
  analysisPills: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  analysisPill: {
    backgroundColor: theme.primarySoft,
    borderColor: "rgba(0, 0, 0, 0.12)",
    borderRadius: 999,
    borderWidth: 1,
    color: theme.primaryBright,
    fontSize: 12,
    fontWeight: "800",
    overflow: "hidden",
    paddingHorizontal: 10,
    paddingVertical: 6,
    textTransform: "uppercase",
  },
  analysisMetrics: {
    gap: 10,
  },
  metricGuide: {
    gap: 10,
  },
  metricGuideTitle: {
    color: theme.textSubtle,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.1,
    textTransform: "uppercase",
  },
  analysisLine: {
    borderTopColor: "rgba(0, 0, 0, 0.08)",
    borderTopWidth: 1,
    gap: 5,
    paddingTop: 12,
  },
  analysisSafety: {
    color: theme.warning,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
  },
  feedbackBlock: {
    backgroundColor: theme.surfaceRaised,
    borderRadius: 24,
    gap: 5,
    padding: 15,
  },
  feedbackLabel: {
    color: theme.textSubtle,
    fontSize: 13,
    fontWeight: "800",
    textTransform: "uppercase",
  },
  feedbackDetail: {
    color: theme.text,
    fontSize: 15,
    lineHeight: 22,
  },
});

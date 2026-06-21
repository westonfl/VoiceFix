import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import type { Language, OnboardingAnswers } from "@/features/onboarding/types";

import {
  DAYS_PER_WEEK,
  getPlacementFromAnswers,
  getWeek,
  TOTAL_CURRICULUM_WEEKS,
  TOTAL_JOURNEY_DAYS,
  type CurriculumWeek,
  type PlacementResult,
} from "./curriculum";
import { normalizeMainLanguage, type MainAppLanguage } from "./localization";
import {
  cancelTrainingReminder,
  syncTrainingReminder,
} from "@/features/settings/trainingReminders";

export type SavedClip = {
  id: string;
  exerciseId?: string;
  title: string;
  weekNumber: number;
  dayNumber: number;
  firstTakeUri?: string;
  retryTakeUri?: string;
  firstDurationMs: number;
  retryDurationMs: number;
  activeTrainingMs?: number;
  recordedPracticeMs?: number;
  dailyGoalMet?: boolean;
  observation: string;
  comparison: string;
  createdAt: string;
  analysisMetrics?: Record<string, unknown>;
};

export type StreakState = {
  current: number;
  best: number;
  monthlyGraceUsed: boolean;
};

export type MonthlyTestResult = {
  status: "not_started" | "passed";
  completedAt?: string;
  passedChecks?: string[];
};

export const MONTH_ONE_REQUIRED_CHECKS = [
  "breath",
  "gentle-sound",
  "resonance",
  "tone",
] as const;

export function isMonthlyTestPassed(
  monthlyTests: Record<string, MonthlyTestResult>,
  month: number,
): boolean {
  const result = monthlyTests[`${month}`];
  if (result?.status !== "passed" || !result.completedAt) {
    return false;
  }

  if (month === 1) {
    const checks = result.passedChecks ?? [];
    return MONTH_ONE_REQUIRED_CHECKS.every((id) => checks.includes(id));
  }

  return true;
}

export type PrototypeUserState = {
  onboardingComplete: boolean;
  placement?: PlacementResult;
  answers?: OnboardingAnswers;
  currentWeekNumber: number;
  currentDayNumber: number;
  journeyDay: number;
  trainingTime: string;
  notificationTone: string;
  notificationsEnabled: boolean;
  sessionLength: string;
  streak: StreakState;
  savedClips: SavedClip[];
  completedToday: boolean;
  language: MainAppLanguage;
  exerciseOrdersByWeek: Record<string, string[]>;
  monthlyTests: Record<string, MonthlyTestResult>;
};

type PrototypeContextValue = {
  state: PrototypeUserState;
  currentWeek: CurriculumWeek;
  isHydrated: boolean;
  completeOnboarding: (answers: OnboardingAnswers, language?: Language) => void;
  completeSession: (
    clip: Omit<SavedClip, "id" | "weekNumber" | "dayNumber">,
    target?: { weekNumber: number; dayNumber: number },
  ) => void;
  resetPrototype: () => void;
  setTrainingPreference: (
    key: "trainingTime" | "notificationTone",
    value: string,
  ) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setLanguage: (language: MainAppLanguage) => void;
  reorderWeekExercise: (
    weekNumber: number,
    fromIndex: number,
    toIndex: number,
  ) => void;
  completeMonthlyTest: (month: number, passedChecks?: string[]) => void;
};

const DAILY_SESSION_LENGTH = "10 minutes";
const MAX_AVAILABLE_WEEK = 4;

const initialState: PrototypeUserState = {
  onboardingComplete: false,
  currentWeekNumber: 1,
  currentDayNumber: 1,
  journeyDay: 1,
  trainingTime: "7:30 PM",
  notificationTone: "Coach-like",
  notificationsEnabled: false,
  sessionLength: DAILY_SESSION_LENGTH,
  streak: {
    current: 0,
    best: 0,
    monthlyGraceUsed: false,
  },
  savedClips: [],
  completedToday: false,
  language: "en",
  exerciseOrdersByWeek: {},
  monthlyTests: {},
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);
const STORAGE_KEY = "rehear:mvp-state:v2";
const LEGACY_STORAGE_KEY = ["voice", "fix:mvp-state:v2"].join("");

type StoredPrototypeUserState = Partial<PrototypeUserState> & {
  language?: Language;
};

function clampNumber(
  value: unknown,
  min: number,
  max: number,
  fallback: number,
) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.min(max, Math.max(min, value))
    : fallback;
}

function normalizeMonthlyTests(
  raw: Record<string, MonthlyTestResult> | undefined,
): Record<string, MonthlyTestResult> {
  if (!raw) {
    return {};
  }

  const normalized: Record<string, MonthlyTestResult> = {};

  for (const [key, value] of Object.entries(raw)) {
    const month = Number(key);
    if (!Number.isFinite(month) || !value || value.status !== "passed") {
      continue;
    }

    if (isMonthlyTestPassed({ [key]: value }, month)) {
      normalized[key] = value;
    }
  }

  return normalized;
}

function normalizeStoredState(
  parsed: StoredPrototypeUserState,
): PrototypeUserState {
  const currentWeekNumber = clampNumber(
    parsed.currentWeekNumber,
    1,
    MAX_AVAILABLE_WEEK,
    initialState.currentWeekNumber,
  );
  const currentDayNumber = clampNumber(
    parsed.currentDayNumber,
    1,
    DAYS_PER_WEEK,
    initialState.currentDayNumber,
  );
  const journeyDay = clampNumber(
    parsed.journeyDay,
    1,
    TOTAL_JOURNEY_DAYS,
    (currentWeekNumber - 1) * DAYS_PER_WEEK + currentDayNumber,
  );

  return {
    ...initialState,
    ...parsed,
    currentWeekNumber,
    currentDayNumber,
    journeyDay,
    sessionLength: DAILY_SESSION_LENGTH,
    exerciseOrdersByWeek:
      parsed.exerciseOrdersByWeek ?? initialState.exerciseOrdersByWeek,
    monthlyTests: normalizeMonthlyTests(parsed.monthlyTests),
    language: parsed.language
      ? normalizeMainLanguage(parsed.language)
      : initialState.language,
    notificationsEnabled:
      typeof parsed.notificationsEnabled === "boolean"
        ? parsed.notificationsEnabled
        : initialState.notificationsEnabled,
  };
}

function getOrderedExerciseIds(week: CurriculumWeek, storedOrder?: string[]) {
  const exerciseIds =
    week.exercises.length > 0
      ? week.exercises.map((exercise) => exercise.id)
      : week.coreExercises;
  const validExercises = new Set(exerciseIds);
  const saved =
    storedOrder?.filter((exercise) => validExercises.has(exercise)) ?? [];
  const missing = exerciseIds.filter((exercise) => !saved.includes(exercise));

  return [...saved, ...missing];
}

function buildNextExerciseOrders(
  currentOrders: Record<string, string[]>,
  week: CurriculumWeek,
  weekNumber: number,
  fromIndex: number,
  toIndex: number,
) {
  const currentOrder = getOrderedExerciseIds(
    week,
    currentOrders[`${weekNumber}`],
  );
  const clampedToIndex = Math.min(
    Math.max(toIndex, 0),
    currentOrder.length - 1,
  );

  if (fromIndex === clampedToIndex) {
    return currentOrders;
  }

  const nextOrder = [...currentOrder];
  const [movedExercise] = nextOrder.splice(fromIndex, 1);
  nextOrder.splice(clampedToIndex, 0, movedExercise);

  return {
    ...currentOrders,
    [`${weekNumber}`]: nextOrder,
  };
}

export function PrototypeProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PrototypeUserState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  const currentWeek = useMemo(
    () => getWeek(state.currentWeekNumber),
    [state.currentWeekNumber],
  );

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const stored =
          (await AsyncStorage.getItem(STORAGE_KEY)) ??
          (await AsyncStorage.getItem(LEGACY_STORAGE_KEY));
        if (stored && mounted) {
          const parsed = JSON.parse(stored) as StoredPrototypeUserState;
          setState(normalizeStoredState(parsed));
          AsyncStorage.setItem(STORAGE_KEY, stored).catch(() => {
            // Migration can retry on the next launch.
          });
        }
      } catch {
        // If local state is corrupted, keep the default first-run state.
      } finally {
        if (mounted) {
          setIsHydrated(true);
        }
      }
    }

    hydrate();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {
      // Persistence failure should not block practice.
    });
  }, [isHydrated, state]);

  useEffect(() => {
    if (!isHydrated) {
      return;
    }

    if (!state.onboardingComplete) {
      cancelTrainingReminder().catch(() => {
        // Clearing reminders should not block the app.
      });
      return;
    }

    syncTrainingReminder({
      enabled: state.notificationsEnabled,
      trainingTime: state.trainingTime,
      notificationTone: state.notificationTone,
      language: state.language,
    }).catch(() => {
      // Reminder scheduling should not block the app.
    });
  }, [
    isHydrated,
    state.onboardingComplete,
    state.notificationsEnabled,
    state.trainingTime,
    state.notificationTone,
    state.language,
  ]);

  function completeOnboarding(
    answers: OnboardingAnswers,
    language: Language = "en",
  ) {
    const placement = getPlacementFromAnswers(answers);
    const availableStartWeek = Math.min(
      placement.startWeek,
      MAX_AVAILABLE_WEEK,
    );
    setState((current) => ({
      ...current,
      answers,
      onboardingComplete: true,
      placement,
      language: normalizeMainLanguage(language),
      currentWeekNumber: availableStartWeek,
      currentDayNumber: 1,
      journeyDay: Math.max(1, (availableStartWeek - 1) * 7 + 1),
      trainingTime:
        answers.reminderTime === "morning"
          ? "8:00 AM"
          : answers.reminderTime === "afternoon"
            ? "1:00 PM"
            : answers.reminderTime === "custom"
              ? "Choose later"
              : "7:30 PM",
      sessionLength: DAILY_SESSION_LENGTH,
      notificationsEnabled: answers.notificationPermissionStatus === "granted",
    }));
  }

  function completeSession(
    clip: Omit<SavedClip, "id" | "weekNumber" | "dayNumber">,
    target?: { weekNumber: number; dayNumber: number },
  ) {
    setState((current) => {
      const nextStreak = current.completedToday
        ? current.streak.current
        : current.streak.current + 1;
      return {
        ...current,
        completedToday: true,
        streak: {
          ...current.streak,
          current: nextStreak,
          best: Math.max(current.streak.best, nextStreak),
        },
        savedClips: [
          {
            ...clip,
            id: `${Date.now()}`,
            weekNumber: target?.weekNumber ?? current.currentWeekNumber,
            dayNumber: target?.dayNumber ?? current.currentDayNumber,
          },
          ...current.savedClips,
        ],
      };
    });
  }

  function resetPrototype() {
    setState(initialState);
    cancelTrainingReminder().catch(() => {
      // Reset still works in memory if reminder cancellation fails.
    });
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {
      // Reset still works in memory if storage deletion fails.
    });
    AsyncStorage.removeItem(LEGACY_STORAGE_KEY).catch(() => {
      // Reset still works in memory if legacy cleanup fails.
    });
  }

  function setTrainingPreference(
    key: "trainingTime" | "notificationTone",
    value: string,
  ) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function setNotificationsEnabled(enabled: boolean) {
    setState((current) => ({ ...current, notificationsEnabled: enabled }));
  }

  function setLanguage(language: MainAppLanguage) {
    setState((current) => ({ ...current, language }));
  }

  const reorderWeekExercise = useCallback(
    (weekNumber: number, fromIndex: number, toIndex: number) => {
      const week = getWeek(weekNumber);

      setState((current) => ({
        ...current,
        exerciseOrdersByWeek: buildNextExerciseOrders(
          current.exerciseOrdersByWeek,
          week,
          weekNumber,
          fromIndex,
          toIndex,
        ),
      }));
    },
    [],
  );

  function completeMonthlyTest(month: number, passedChecks?: string[]) {
    setState((current) => ({
      ...current,
      monthlyTests: {
        ...current.monthlyTests,
        [`${month}`]: {
          status: "passed",
          completedAt: new Date().toISOString(),
          passedChecks,
        },
      },
    }));
  }

  const value = useMemo(
    () => ({
      state,
      currentWeek,
      isHydrated,
      completeOnboarding,
      completeSession,
      resetPrototype,
      setTrainingPreference,
      setNotificationsEnabled,
      setLanguage,
      reorderWeekExercise,
      completeMonthlyTest,
    }),
    [currentWeek, isHydrated, reorderWeekExercise, state],
  );

  return (
    <PrototypeContext.Provider value={value}>
      {children}
    </PrototypeContext.Provider>
  );
}

export function usePrototype() {
  const context = useContext(PrototypeContext);

  if (!context) {
    throw new Error("usePrototype must be used inside PrototypeProvider");
  }

  return context;
}

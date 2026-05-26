import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, PropsWithChildren, useContext, useEffect, useMemo, useState } from 'react';

import type { Language, OnboardingAnswers } from '@/features/onboarding/types';

import { getPlacementFromAnswers, getWeek, type CurriculumWeek, type PlacementResult } from './curriculum';
import { normalizeMainLanguage, type MainAppLanguage } from './localization';

export type SavedClip = {
  id: string;
  title: string;
  weekNumber: number;
  dayNumber: number;
  firstTakeUri?: string;
  retryTakeUri?: string;
  firstDurationMs: number;
  retryDurationMs: number;
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

export type PrototypeUserState = {
  onboardingComplete: boolean;
  placement?: PlacementResult;
  answers?: OnboardingAnswers;
  currentWeekNumber: number;
  currentDayNumber: number;
  journeyDay: number;
  trainingTime: string;
  notificationTone: string;
  sessionLength: string;
  streak: StreakState;
  savedClips: SavedClip[];
  completedToday: boolean;
  language: MainAppLanguage;
};

type PrototypeContextValue = {
  state: PrototypeUserState;
  currentWeek: CurriculumWeek;
  isHydrated: boolean;
  completeOnboarding: (answers: OnboardingAnswers, language?: Language) => void;
  completeSession: (clip: Omit<SavedClip, 'id' | 'weekNumber' | 'dayNumber'>) => void;
  resetPrototype: () => void;
  setTrainingPreference: (key: 'trainingTime' | 'notificationTone' | 'sessionLength', value: string) => void;
  setLanguage: (language: MainAppLanguage) => void;
};

const initialState: PrototypeUserState = {
  onboardingComplete: false,
  currentWeekNumber: 1,
  currentDayNumber: 1,
  journeyDay: 1,
  trainingTime: '7:30 PM',
  notificationTone: 'Coach-like',
  sessionLength: '12 minutes',
  streak: {
    current: 0,
    best: 0,
    monthlyGraceUsed: false,
  },
  savedClips: [],
  completedToday: false,
  language: 'en',
};

const PrototypeContext = createContext<PrototypeContextValue | null>(null);
const STORAGE_KEY = 'voicefix:mvp-state:v1';

type StoredPrototypeUserState = Partial<PrototypeUserState> & { language?: Language };

export function PrototypeProvider({ children }: PropsWithChildren) {
  const [state, setState] = useState<PrototypeUserState>(initialState);
  const [isHydrated, setIsHydrated] = useState(false);

  const currentWeek = useMemo(() => getWeek(state.currentWeekNumber), [state.currentWeekNumber]);

  useEffect(() => {
    let mounted = true;

    async function hydrate() {
      try {
        const stored = await AsyncStorage.getItem(STORAGE_KEY);
        if (stored && mounted) {
          const parsed = JSON.parse(stored) as StoredPrototypeUserState;
          setState({
            ...initialState,
            ...parsed,
            language: parsed.language ? normalizeMainLanguage(parsed.language) : initialState.language,
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

  function completeOnboarding(answers: OnboardingAnswers, language: Language = 'en') {
    const placement = getPlacementFromAnswers(answers);
    setState((current) => ({
      ...current,
      answers,
      onboardingComplete: true,
      placement,
      language: normalizeMainLanguage(language),
      currentWeekNumber: placement.startWeek,
      currentDayNumber: 1,
      journeyDay: Math.max(1, (placement.startWeek - 1) * 7 + 1),
      trainingTime:
        answers.reminderTime === 'morning'
          ? '8:00 AM'
          : answers.reminderTime === 'afternoon'
            ? '1:00 PM'
            : answers.reminderTime === 'custom'
              ? 'Choose later'
              : '7:30 PM',
      sessionLength: answers.practiceLength === '5' ? '5 minutes' : answers.practiceLength === '20' ? '20 minutes' : '12 minutes',
    }));
  }

  function completeSession(clip: Omit<SavedClip, 'id' | 'weekNumber' | 'dayNumber'>) {
    setState((current) => {
      const nextStreak = current.completedToday ? current.streak.current : current.streak.current + 1;
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
            weekNumber: current.currentWeekNumber,
            dayNumber: current.currentDayNumber,
          },
          ...current.savedClips,
        ],
      };
    });
  }

  function resetPrototype() {
    setState(initialState);
    AsyncStorage.removeItem(STORAGE_KEY).catch(() => {
      // Reset still works in memory if storage deletion fails.
    });
  }

  function setTrainingPreference(key: 'trainingTime' | 'notificationTone' | 'sessionLength', value: string) {
    setState((current) => ({ ...current, [key]: value }));
  }

  function setLanguage(language: MainAppLanguage) {
    setState((current) => ({ ...current, language }));
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
      setLanguage,
    }),
    [currentWeek, isHydrated, state],
  );

  return <PrototypeContext.Provider value={value}>{children}</PrototypeContext.Provider>;
}

export function usePrototype() {
  const context = useContext(PrototypeContext);

  if (!context) {
    throw new Error('usePrototype must be used inside PrototypeProvider');
  }

  return context;
}

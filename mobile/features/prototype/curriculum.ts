import type { OnboardingAnswers } from "@/features/onboarding/types";

import type { MonthOneDrillId } from "./serverAnalysis";

export type CurriculumPhase = "foundation" | "control" | "songs";

export const TOTAL_JOURNEY_DAYS = 90;
export const TOTAL_CURRICULUM_WEEKS = 12;
export const DAYS_PER_WEEK = 7;

export type DailySession = {
  day: number;
  role: string;
  focus: string;
  drill: string;
  exerciseId?: string;
  goal?: string;
  instruction?: string;
  analysisDrillId?: MonthOneDrillId;
};

export type CurriculumExercise = {
  id: string;
  title: string;
  category: "breathing" | "tone" | "resonance" | "integration";
  goal: string;
  instruction: string;
  analysisDrillId: MonthOneDrillId;
  visual: "sustain" | "pulse" | "flat" | "arc" | "rise" | "fall" | "wave";
  locked?: boolean;
};

export type CurriculumWeek = {
  phase: CurriculumPhase;
  weekNumber: number;
  title: string;
  goal: string;
  exercises: CurriculumExercise[];
  coreExercises: string[];
  dailySessions: DailySession[];
  checkpoint: string;
  tags: string[];
  difficulty: number;
  safetyRules: string[];
};

export type PlacementResult = {
  startWeek: number;
  emphasis: string[];
  safetyNote?: string;
  reason: string;
};

function repeatWeeklySession(
  session: Omit<DailySession, "day">,
): DailySession[] {
  return Array.from({ length: DAYS_PER_WEEK }, (_, index) => ({
    ...session,
    day: index + 1,
  }));
}

function monthOneSession(session: DailySession): DailySession {
  return session;
}

const weekOneExercises: CurriculumExercise[] = [
  {
    id: "sustained-hiss",
    title: "Sustained Hiss",
    category: "breathing",
    goal: "Release a steady stream of air without pushing.",
    instruction:
      "Inhale quietly, then make a soft hiss that stays even from start to finish.",
    analysisDrillId: "sustained_hiss",
    visual: "sustain",
  },
];

const weekTwoExercises: CurriculumExercise[] = [
  {
    id: "gentle-hum",
    title: "Gentle Hum",
    category: "tone",
    goal: "Start a tiny hum without throat pressure.",
    instruction:
      "Hum quietly on one comfortable pitch and stop before it feels pressed.",
    analysisDrillId: "gentle_hum",
    visual: "flat",
  },
  {
    id: "soft-hum-start",
    title: "Soft Hum Start",
    category: "tone",
    goal: "Begin sound cleanly without a hard attack.",
    instruction:
      "Let the hum appear gently after the breath; avoid grabbing the first moment.",
    analysisDrillId: "soft_hum_start",
    visual: "pulse",
  },
];

const weekThreeExercises: CurriculumExercise[] = [
  {
    id: "mmm-resonance",
    title: "Mmm Resonance",
    category: "resonance",
    goal: "Find an easy buzz without pressing for volume.",
    instruction:
      "Use a small mmm and notice whether it feels easier in the lips or face.",
    analysisDrillId: "mmm_resonance",
    visual: "arc",
  },
  {
    id: "fah-vah-resonance",
    title: "Fah / Vah Resonance",
    category: "resonance",
    goal: "Keep the same easy resonance on a gentle consonant-vowel.",
    instruction: "Speak-sing fah or vah softly, keeping it light and unforced.",
    analysisDrillId: "fah_vah_resonance",
    visual: "wave",
  },
];

const weekFourExercises: CurriculumExercise[] = [
  {
    id: "hum-to-ah",
    title: "Hum to Ah",
    category: "integration",
    goal: "Open from hum to ah without losing ease.",
    instruction:
      "Start with a gentle hum, then open to ah while keeping the same calm airflow.",
    analysisDrillId: "hum_to_ah",
    visual: "rise",
  },
  {
    id: "short-tone",
    title: "Short Tone Hold",
    category: "integration",
    goal: "Hold a short sound comfortably and finish cleanly.",
    instruction:
      "Sing one easy pitch for 3-5 seconds, then release without squeezing.",
    analysisDrillId: "short_tone_hold",
    visual: "sustain",
  },
];

const weekOneSessions: DailySession[] = [
  monthOneSession({
    day: 1,
    role: "Baseline",
    focus: "Record the current version",
    drill: "Soft hiss baseline",
    exerciseId: "sustained-hiss",
    goal: "Record a natural soft hiss",
    instruction:
      "Inhale quietly, then make a soft hiss that stays even from start to finish.",
    analysisDrillId: "sustained_hiss",
  }),
  monthOneSession({
    day: 2,
    role: "Stabilize",
    focus: "Repeat the easiest version",
    drill: "Smaller soft hiss",
    exerciseId: "sustained-hiss",
    goal: "Repeat the hiss with less force",
    instruction:
      "Use less air than yesterday and keep the hiss narrow, small, and easy.",
    analysisDrillId: "sustained_hiss",
  }),
  monthOneSession({
    day: 3,
    role: "Clarify",
    focus: "Add one technical detail",
    drill: "Even-ending hiss",
    exerciseId: "sustained-hiss",
    goal: "Keep the last third from collapsing",
    instruction:
      "Start smaller so the ending can stay alive without adding pressure.",
    analysisDrillId: "sustained_hiss",
  }),
  monthOneSession({
    day: 4,
    role: "Small cue",
    focus: "Add one technical detail",
    drill: "Quiet inhale to hiss",
    exerciseId: "sustained-hiss",
    goal: "Avoid shoulder lift and over-breathing",
    instruction:
      "Take a quiet inhale, then let the hiss begin without a big reset.",
    analysisDrillId: "sustained_hiss",
  }),
  monthOneSession({
    day: 5,
    role: "Focused take",
    focus: "Same drill",
    drill: "Timed soft hiss",
    exerciseId: "sustained-hiss",
    goal: "Hold a 10-second steady hiss",
    instruction:
      "Release only enough air to stay even for the full count.",
    analysisDrillId: "sustained_hiss",
  }),
  monthOneSession({
    day: 6,
    role: "Review",
    focus: "Repeat and compare",
    drill: "Hiss comparison take",
    exerciseId: "sustained-hiss",
    goal: "Compare the first hiss with the latest hiss",
    instruction:
      "Record the same soft hiss and notice whether it feels easier or steadier.",
    analysisDrillId: "sustained_hiss",
  }),
  monthOneSession({
    day: 7,
    role: "Checkpoint",
    focus: "Recover, reflect, or advance",
    drill: "Breath checkpoint",
    exerciseId: "sustained-hiss",
    goal: "Check whether air can leave without pushing",
    instruction:
      "Make your easiest hiss and decide whether this week feels ready to build on.",
    analysisDrillId: "sustained_hiss",
  }),
];

const weekTwoSessions: DailySession[] = [
  monthOneSession({
    day: 1,
    role: "Baseline",
    focus: "Record the current version",
    drill: "Gentle hum baseline",
    exerciseId: "gentle-hum",
    goal: "Record a tiny comfortable hum",
    instruction:
      "Hum quietly on one comfortable pitch and stop before it feels pressed.",
    analysisDrillId: "gentle_hum",
  }),
  monthOneSession({
    day: 2,
    role: "Easy start",
    focus: "Add one technical detail",
    drill: "Soft hum start",
    exerciseId: "soft-hum-start",
    goal: "Begin the hum without a hard attack",
    instruction:
      "Let the hum appear gently after the breath; avoid grabbing the first moment.",
    analysisDrillId: "soft_hum_start",
  }),
  monthOneSession({
    day: 3,
    role: "Steady volume",
    focus: "Same drill",
    drill: "Even gentle hum",
    exerciseId: "gentle-hum",
    goal: "Keep the hum small and even",
    instruction:
      "Stay on one comfortable pitch and let the hum remain boringly even.",
    analysisDrillId: "gentle_hum",
  }),
  monthOneSession({
    day: 4,
    role: "Comfort check",
    focus: "Gentle check",
    drill: "Comfort hum",
    exerciseId: "gentle-hum",
    goal: "Stop before the sound gets pressed",
    instruction:
      "Use a tiny hum and stop the moment the throat wants to help.",
    analysisDrillId: "gentle_hum",
  }),
  monthOneSession({
    day: 5,
    role: "Short hold",
    focus: "Same drill",
    drill: "Short gentle hum",
    exerciseId: "gentle-hum",
    goal: "Hold a relaxed hum for 3-5 seconds",
    instruction:
      "Keep the hum easy for a few seconds, then release before it tightens.",
    analysisDrillId: "gentle_hum",
  }),
  monthOneSession({
    day: 6,
    role: "Review",
    focus: "Repeat and compare",
    drill: "Hum comparison take",
    exerciseId: "gentle-hum",
    goal: "Compare the first hum with the latest hum",
    instruction:
      "Record the same small hum and notice whether the start feels cleaner.",
    analysisDrillId: "gentle_hum",
  }),
  monthOneSession({
    day: 7,
    role: "Checkpoint",
    focus: "Recover, reflect, or advance",
    drill: "Gentle sound checkpoint",
    exerciseId: "soft-hum-start",
    goal: "Check whether sound starts without throat pressure",
    instruction:
      "Begin one gentle hum and decide whether the start feels easy enough to continue.",
    analysisDrillId: "soft_hum_start",
  }),
];

const weekThreeSessions: DailySession[] = [
  monthOneSession({
    day: 1,
    role: "Baseline resonance",
    focus: "Record the current version",
    drill: "Resonance baseline",
    exerciseId: "mmm-resonance",
    goal: "Record a soft mmm or vah sound",
    instruction:
      "Use a small mmm and notice whether it feels easier in the lips or face.",
    analysisDrillId: "mmm_resonance",
  }),
  monthOneSession({
    day: 2,
    role: "Find vibration",
    focus: "Add one technical detail",
    drill: "Mmm resonance",
    exerciseId: "mmm-resonance",
    goal: "Notice easy face or lip vibration",
    instruction:
      "Keep the mmm quiet and notice the easiest buzz without chasing volume.",
    analysisDrillId: "mmm_resonance",
  }),
  monthOneSession({
    day: 3,
    role: "Keep it easy",
    focus: "Same drill",
    drill: "Easy mmm resonance",
    exerciseId: "mmm-resonance",
    goal: "Avoid pressing for more buzz",
    instruction:
      "Make the mmm smaller if the throat starts working for the vibration.",
    analysisDrillId: "mmm_resonance",
  }),
  monthOneSession({
    day: 4,
    role: "Open gently",
    focus: "Application take",
    drill: "Mmm-ah connection",
    exerciseId: "hum-to-ah",
    goal: "Open from mmm to ah without grabbing",
    instruction:
      "Open less than you think and keep the easy hum feeling in the vowel.",
    analysisDrillId: "hum_to_ah",
  }),
  monthOneSession({
    day: 5,
    role: "Vowel resonance",
    focus: "Application take",
    drill: "Fah or vah resonance",
    exerciseId: "fah-vah-resonance",
    goal: "Try a gentle fah or vah with the same ease",
    instruction: "Speak-sing fah or vah softly, keeping it light and unforced.",
    analysisDrillId: "fah_vah_resonance",
  }),
  monthOneSession({
    day: 6,
    role: "Repeat best sound",
    focus: "Best take",
    drill: "Best resonance take",
    exerciseId: "mmm-resonance",
    goal: "Recreate the easiest resonant take",
    instruction:
      "Choose the sound that felt easiest this week and record that version again.",
    analysisDrillId: "mmm_resonance",
  }),
  monthOneSession({
    day: 7,
    role: "Checkpoint",
    focus: "Recover, reflect, or advance",
    drill: "Resonance checkpoint",
    exerciseId: "mmm-resonance",
    goal: "Check for an easier, less throat-heavy sound",
    instruction:
      "Record a small resonant sound and decide whether it feels less throat-heavy.",
    analysisDrillId: "mmm_resonance",
  }),
];

const weekFourSessions: DailySession[] = [
  monthOneSession({
    day: 1,
    role: "Baseline tone",
    focus: "Record the current version",
    drill: "Hum to ah baseline",
    exerciseId: "hum-to-ah",
    goal: "Record hum to ah as one connected gesture",
    instruction:
      "Start with a gentle hum, then open to ah while keeping the same calm airflow.",
    analysisDrillId: "hum_to_ah",
  }),
  monthOneSession({
    day: 2,
    role: "Softer onset",
    focus: "Add one technical detail",
    drill: "Soft vowel onset",
    exerciseId: "hum-to-ah",
    goal: "Start the vowel gently without pushing",
    instruction:
      "Let the ah arrive from the hum instead of starting it with extra pressure.",
    analysisDrillId: "hum_to_ah",
  }),
  monthOneSession({
    day: 3,
    role: "Stable middle",
    focus: "Same drill",
    drill: "Short gentle tone",
    exerciseId: "short-tone",
    goal: "Keep a short tone from wobbling",
    instruction:
      "Sing one easy pitch for 3-5 seconds, then release without squeezing.",
    analysisDrillId: "short_tone_hold",
  }),
  monthOneSession({
    day: 4,
    role: "Clean ending",
    focus: "Add one technical detail",
    drill: "Clean ending tone",
    exerciseId: "short-tone",
    goal: "Finish without dropping suddenly",
    instruction:
      "Make the tone shorter and finish while it still feels easy.",
    analysisDrillId: "short_tone_hold",
  }),
  monthOneSession({
    day: 5,
    role: "Tiny musical move",
    focus: "Application take",
    drill: "Mm-ah one pitch",
    exerciseId: "hum-to-ah",
    goal: "Keep the same ease on one comfortable pitch",
    instruction:
      "Use one easy pitch: mm, then ah, without changing the calm airflow.",
    analysisDrillId: "hum_to_ah",
  }),
  monthOneSession({
    day: 6,
    role: "Month comparison",
    focus: "Compare first and latest takes",
    drill: "Month 1 comparison",
    exerciseId: "short-tone",
    goal: "Compare the Week 1 sound with today",
    instruction:
      "Record a short easy tone and listen for steadier breath, cleaner start, and easier release.",
    analysisDrillId: "short_tone_hold",
  }),
  monthOneSession({
    day: 7,
    role: "Month 1 checkpoint",
    focus: "Recover, reflect, or advance",
    drill: "Month 1 checkpoint",
    exerciseId: "hum-to-ah",
    goal: "Decide whether to continue, repeat, or advance",
    instruction:
      "Record your easiest connected hum-to-ah and decide whether the next month feels appropriate.",
    analysisDrillId: "hum_to_ah",
  }),
];

const monthOneExercises = [
  ...weekOneExercises,
  ...weekTwoExercises,
  ...weekThreeExercises,
  ...weekFourExercises,
];

function coreTitles(exercises: CurriculumExercise[]) {
  return exercises.map((exercise) => exercise.title);
}

export function getExerciseById(exerciseId: string) {
  return monthOneExercises.find((exercise) => exercise.id === exerciseId);
}

export const curriculum: CurriculumWeek[] = [
  {
    phase: "foundation",
    weekNumber: 1,
    title: "Breath Awareness",
    goal: "Feel steady outgoing air without pushing.",
    exercises: weekOneExercises,
    coreExercises: coreTitles(weekOneExercises),
    dailySessions: weekOneSessions,
    checkpoint: "Can you release air without pushing?",
    tags: ["breath", "airflow", "foundation"],
    difficulty: 1,
    safetyRules: ["avoid_forced_breath", "stop_if_dizzy"],
  },
  {
    phase: "foundation",
    weekNumber: 2,
    title: "Gentle Sound",
    goal: "Introduce sound without throat pressure.",
    exercises: weekTwoExercises,
    coreExercises: coreTitles(weekTwoExercises),
    dailySessions: weekTwoSessions,
    checkpoint: "Can you make a small sound without strain?",
    tags: ["hum", "gentle", "foundation"],
    difficulty: 1,
    safetyRules: ["stop_if_pain", "avoid_loud_volume"],
  },
  {
    phase: "foundation",
    weekNumber: 3,
    title: "Resonance Exploration",
    goal: "Explore easier vibration and reduce throat-heavy sound.",
    exercises: weekThreeExercises,
    coreExercises: coreTitles(weekThreeExercises),
    dailySessions: weekThreeSessions,
    checkpoint: "Can you find an easier, less throat-heavy sound?",
    tags: ["resonance", "hum", "foundation"],
    difficulty: 1,
    safetyRules: ["stop_if_pain", "avoid_pressing_for_buzz"],
  },
  {
    phase: "foundation",
    weekNumber: 4,
    title: "Breath + Resonance Integration",
    goal: "Combine steady air, gentle sound, and resonance into short controlled tones.",
    exercises: weekFourExercises,
    coreExercises: coreTitles(weekFourExercises),
    dailySessions: weekFourSessions,
    checkpoint: "Can you hold a short sound comfortably?",
    tags: ["breath", "resonance", "integration"],
    difficulty: 2,
    safetyRules: ["stop_if_pain"],
  },
  {
    phase: "control",
    weekNumber: 5,
    title: "Onset Control",
    goal: "Begin sound cleanly without forcing or collapsing.",
    exercises: [],
    coreExercises: [
      "Silent breath to hum",
      "Soft ah start",
      "Hum to vowel start",
    ],
    dailySessions: repeatWeeklySession({
      role: "Coming soon",
      focus: "Month 2 is locked for now.",
      drill: "Coming soon",
    }),
    checkpoint: "Can you begin sound without forcing it?",
    tags: ["onset", "control"],
    difficulty: 2,
    safetyRules: ["avoid_hard_attack"],
  },
  {
    phase: "control",
    weekNumber: 6,
    title: "Endings and Release",
    goal: "Keep endings from fading, squeezing, or dropping.",
    exercises: [],
    coreExercises: [
      "3-5 second tone ending",
      "Gentle release",
      "Ma-ma pattern",
    ],
    dailySessions: repeatWeeklySession({
      role: "Coming soon",
      focus: "Month 2 is locked for now.",
      drill: "Coming soon",
    }),
    checkpoint: "Can the ending stay alive?",
    tags: ["endings", "release", "control"],
    difficulty: 2,
    safetyRules: ["avoid_squeezing"],
  },
  {
    phase: "control",
    weekNumber: 7,
    title: "Single Pitch Matching",
    goal: "Match one comfortable reference pitch.",
    exercises: [],
    coreExercises: ["Listen to note", "Hum target", "Open to vowel"],
    dailySessions: repeatWeeklySession({
      role: "Coming soon",
      focus: "Month 2 is locked for now.",
      drill: "Coming soon",
    }),
    checkpoint: "Can you find one note more reliably?",
    tags: ["pitch", "match", "control"],
    difficulty: 2,
    safetyRules: ["stay_comfortable_range"],
  },
  {
    phase: "control",
    weekNumber: 8,
    title: "Pitch Stability",
    goal: "Keep pitch from drifting after you find it.",
    exercises: [],
    coreExercises: [
      "Sustained target note",
      "Stability bands",
      "Short repeats",
    ],
    dailySessions: repeatWeeklySession({
      role: "Coming soon",
      focus: "Month 2 is locked for now.",
      drill: "Coming soon",
    }),
    checkpoint: "Can you hold the target more steadily?",
    tags: ["pitch", "stability"],
    difficulty: 3,
    safetyRules: ["stay_comfortable_range"],
  },
  {
    phase: "songs",
    weekNumber: 9,
    title: "Two-Note and Three-Note Movement",
    goal: "Move through tiny melodic shapes without losing ease.",
    exercises: [],
    coreExercises: ["Do-re echo", "Three-note echo", "Ma-ma step"],
    dailySessions: repeatWeeklySession({
      role: "Coming soon",
      focus: "Month 3 is locked for now.",
      drill: "Coming soon",
    }),
    checkpoint: "Can you move through a small shape without grabbing?",
    tags: ["interval", "movement", "song"],
    difficulty: 3,
    safetyRules: ["slow_if_tense"],
  },
  {
    phase: "songs",
    weekNumber: 10,
    title: "Phrase Control",
    goal: "Apply breath, resonance, pitch, and timing to very short phrases.",
    exercises: [],
    coreExercises: [
      "3-5 note phrase",
      "Neutral syllable phrase",
      "Simple lyric phrase",
    ],
    dailySessions: repeatWeeklySession({
      role: "Coming soon",
      focus: "Month 3 is locked for now.",
      drill: "Coming soon",
    }),
    checkpoint: "Can you keep a short phrase recognizable and comfortable?",
    tags: ["phrase", "singing"],
    difficulty: 4,
    safetyRules: ["stop_if_pain"],
  },
  {
    phase: "songs",
    weekNumber: 11,
    title: "Simple Song Practice",
    goal: "Prepare and repeat one easy song phrase with the same feedback loop.",
    exercises: [],
    coreExercises: [
      "Choose easy phrase",
      "Hum phrase shape",
      "Sing with lyric",
    ],
    dailySessions: repeatWeeklySession({
      role: "Coming soon",
      focus: "Month 3 is locked for now.",
      drill: "Coming soon",
    }),
    checkpoint: "Can you prepare before singing?",
    tags: ["song", "phrase"],
    difficulty: 4,
    safetyRules: ["choose_easy_key"],
  },
  {
    phase: "songs",
    weekNumber: 12,
    title: "Final Song Comparison",
    goal: "Compare earliest recordings to a short current song phrase and choose the next path.",
    exercises: [],
    coreExercises: [
      "Replay baseline",
      "Record final phrase",
      "Choose next focus",
    ],
    dailySessions: repeatWeeklySession({
      role: "Coming soon",
      focus: "Month 3 is locked for now.",
      drill: "Coming soon",
    }),
    checkpoint: "What changed, and what should you train next?",
    tags: ["checkpoint", "next_plan"],
    difficulty: 6,
    safetyRules: ["celebrate_without_overpushing"],
  },
];

export function getWeek(weekNumber: number) {
  return (
    curriculum.find((week) => week.weekNumber === weekNumber) ?? curriculum[0]
  );
}

export function getPhaseLabel(phase: CurriculumPhase) {
  if (phase === "foundation") {
    return "Breath & Resonance";
  }

  if (phase === "control") {
    return "Vocal Control";
  }

  return "Song Application";
}

export function getPlacementFromAnswers(
  answers: OnboardingAnswers,
): PlacementResult {
  const symptoms = answers.reportedSymptoms;
  const nervous =
    answers.primaryGoal === "confidence" ||
    answers.playbackComfort === "hate-playback" ||
    answers.biggestFrustration === "embarrassed";
  const strain =
    answers.strainStatus === "pain" ||
    answers.strainStatus === "tight" ||
    symptoms.includes("squeezed") ||
    symptoms.includes("crack");
  const breath =
    symptoms.includes("fade") ||
    symptoms.includes("breathy") ||
    symptoms.includes("wobble");
  const pitch =
    answers.primaryGoal === "pitch" ||
    symptoms.includes("pitch-drift") ||
    answers.biggestFrustration === "needs-guide";
  const advanced =
    answers.experienceLevel === "lessons-before" ||
    answers.experienceLevel === "musician";

  if (strain) {
    return {
      startWeek: 2,
      emphasis: ["Comfort checks", "Gentle sound", "No high-note chasing"],
      safetyNote:
        "Because you reported tightness or strain, range work stays locked behind comfort checks.",
      reason:
        "Your first step is making sound easier before adding pitch or song pressure.",
    };
  }

  if (nervous || answers.experienceLevel === "beginner") {
    return {
      startWeek: 1,
      emphasis: ["Small daily wins", "Optional playback", "Breath awareness"],
      reason:
        "A steady first month gives you confidence before the app asks for more musical tasks.",
    };
  }

  if (breath) {
    return {
      startWeek: 1,
      emphasis: ["Steady air", "Gentle hum", "Endings"],
      reason:
        "Fading or breathy sounds often improve when the first month stays focused on air and resonance.",
    };
  }

  if (pitch && advanced) {
    return {
      startWeek: 7,
      emphasis: ["Pitch matching", "Hum to vowel", "Reference fading later"],
      reason:
        "Your answers suggest you can start after the setup block and focus on finding one note reliably.",
    };
  }

  if (pitch) {
    return {
      startWeek: 5,
      emphasis: ["Clean starts", "Pitch readiness", "Short repeats"],
      reason:
        "You will still use the foundation setup, but the app can move you toward pitch work sooner.",
    };
  }

  if (advanced) {
    return {
      startWeek: 9,
      emphasis: [
        "Tiny melody movement",
        "Song setup",
        "Weekly foundation review",
      ],
      reason:
        "Your background suggests you can begin near the song application block while keeping a foundation drill in rotation.",
    };
  }

  return {
    startWeek: 1,
    emphasis: ["Breath awareness", "Gentle sound", "Resonance"],
    reason:
      "No single issue dominates yet, so VoiceFix starts with the safest fixed foundation path.",
  };
}

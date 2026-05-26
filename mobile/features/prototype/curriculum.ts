import type { OnboardingAnswers } from '@/features/onboarding/types';

export type CurriculumPhase = 'foundation' | 'control' | 'songs';

export type DailySession = {
  day: number;
  role: string;
  focus: string;
  drill: string;
};

export type CurriculumWeek = {
  phase: CurriculumPhase;
  weekNumber: number;
  title: string;
  goal: string;
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

const weekPattern = [
  { role: 'Baseline', focus: 'Record the current version', drill: 'First take' },
  { role: 'Stabilize', focus: 'Repeat the easiest version', drill: 'Small cue' },
  { role: 'Clarify', focus: 'Add one technical detail', drill: 'Focused take' },
  { role: 'Retry', focus: 'Repeat and compare', drill: 'Same drill' },
  { role: 'Apply', focus: 'Use it in a tiny musical pattern', drill: 'Application take' },
  { role: 'Review', focus: 'Compare first and latest takes', drill: 'Best take' },
  { role: 'Checkpoint', focus: 'Recover, reflect, or advance', drill: 'Gentle check' },
];

function sessionsFor(exercise: string): DailySession[] {
  return weekPattern.map((item, index) => ({
    day: index + 1,
    role: item.role,
    focus: item.focus,
    drill: `${exercise} - ${item.drill}`,
  }));
}

export const curriculum: CurriculumWeek[] = [
  {
    phase: 'foundation',
    weekNumber: 1,
    title: 'Breath Awareness',
    goal: 'Feel steady outgoing air without pushing.',
    coreExercises: ['Quiet inhale', 'Soft hiss', '5-second air release'],
    dailySessions: sessionsFor('Soft hiss'),
    checkpoint: 'Can you release air without pushing?',
    tags: ['breath', 'airflow', 'foundation'],
    difficulty: 1,
    safetyRules: ['avoid_forced_breath', 'stop_if_dizzy'],
  },
  {
    phase: 'foundation',
    weekNumber: 2,
    title: 'Gentle Sound',
    goal: 'Introduce sound without throat pressure.',
    coreExercises: ['Soft hum', 'Gentle mm', 'Comfort check'],
    dailySessions: sessionsFor('Gentle hum'),
    checkpoint: 'Can you make a small sound without strain?',
    tags: ['hum', 'gentle', 'foundation'],
    difficulty: 1,
    safetyRules: ['stop_if_pain', 'avoid_loud_volume'],
  },
  {
    phase: 'foundation',
    weekNumber: 3,
    title: 'Resonance Exploration',
    goal: 'Explore easier vibration and reduce throat-heavy sound.',
    coreExercises: ['Mmm', 'Nnn', 'Ng', 'Mmm-ah'],
    dailySessions: sessionsFor('Mmm-ah resonance'),
    checkpoint: 'Can you find an easier, less throat-heavy sound?',
    tags: ['resonance', 'hum', 'foundation'],
    difficulty: 1,
    safetyRules: ['stop_if_pain', 'avoid_pressing_for_buzz'],
  },
  {
    phase: 'foundation',
    weekNumber: 4,
    title: 'Breath + Resonance Integration',
    goal: 'Combine steady air, gentle sound, and resonance into short controlled tones.',
    coreExercises: ['Hiss to hum', 'Hum to ah', '3-5 second tone'],
    dailySessions: sessionsFor('Hum to ah'),
    checkpoint: 'Can you hold a short sound comfortably?',
    tags: ['breath', 'resonance', 'integration'],
    difficulty: 2,
    safetyRules: ['stop_if_pain'],
  },
  {
    phase: 'control',
    weekNumber: 5,
    title: 'Onset Control',
    goal: 'Begin sound cleanly without forcing or collapsing.',
    coreExercises: ['Silent breath to hum', 'Soft ah start', 'Hum to vowel start'],
    dailySessions: sessionsFor('Soft ah onset'),
    checkpoint: 'Can you begin sound without forcing it?',
    tags: ['onset', 'control'],
    difficulty: 2,
    safetyRules: ['avoid_hard_attack'],
  },
  {
    phase: 'control',
    weekNumber: 6,
    title: 'Endings and Release',
    goal: 'Keep endings from fading, squeezing, or dropping.',
    coreExercises: ['3-5 second tone ending', 'Gentle release', 'Ma-ma pattern'],
    dailySessions: sessionsFor('Tone ending'),
    checkpoint: 'Can the ending stay alive?',
    tags: ['endings', 'release', 'control'],
    difficulty: 2,
    safetyRules: ['avoid_squeezing'],
  },
  {
    phase: 'control',
    weekNumber: 7,
    title: 'Single Pitch Matching',
    goal: 'Match one comfortable reference pitch.',
    coreExercises: ['Listen to note', 'Hum target', 'Open to vowel'],
    dailySessions: sessionsFor('Reference tone match'),
    checkpoint: 'Can you find one note more reliably?',
    tags: ['pitch', 'match', 'control'],
    difficulty: 2,
    safetyRules: ['stay_comfortable_range'],
  },
  {
    phase: 'control',
    weekNumber: 8,
    title: 'Pitch Stability',
    goal: 'Keep pitch from drifting after you find it.',
    coreExercises: ['Sustained target note', 'Stability bands', 'Short repeats'],
    dailySessions: sessionsFor('Pitch hold'),
    checkpoint: 'Can you hold the target more steadily?',
    tags: ['pitch', 'stability'],
    difficulty: 3,
    safetyRules: ['stay_comfortable_range'],
  },
  {
    phase: 'control',
    weekNumber: 9,
    title: 'Two-Note Movement',
    goal: 'Move between two nearby notes without losing ease.',
    coreExercises: ['Do-re echo', 'Hum two notes', 'Ma-ma step'],
    dailySessions: sessionsFor('Two-note echo'),
    checkpoint: 'Can you move without grabbing?',
    tags: ['interval', 'movement'],
    difficulty: 3,
    safetyRules: ['slow_if_tense'],
  },
  {
    phase: 'control',
    weekNumber: 10,
    title: 'Three-Note Echo',
    goal: 'Sing a tiny melodic shape.',
    coreExercises: ['Three-note echo', 'Up/down pattern', 'Hardest note retry'],
    dailySessions: sessionsFor('Three-note echo'),
    checkpoint: 'Can you echo a tiny melody?',
    tags: ['melody', 'echo'],
    difficulty: 3,
    safetyRules: ['slow_if_tense'],
  },
  {
    phase: 'control',
    weekNumber: 11,
    title: 'Timing and Rhythm Basics',
    goal: 'Keep a simple vocal pattern in time.',
    coreExercises: ['Clap/listen/sing', 'Two-beat pattern', 'Even syllables'],
    dailySessions: sessionsFor('Two-beat vocal pattern'),
    checkpoint: 'Can you wait for the beat?',
    tags: ['timing', 'rhythm'],
    difficulty: 3,
    safetyRules: ['keep_volume_easy'],
  },
  {
    phase: 'control',
    weekNumber: 12,
    title: 'First Singing Phrase',
    goal: 'Apply breath, resonance, pitch, and timing to a very short phrase.',
    coreExercises: ['3-5 note phrase', 'Neutral syllable phrase', 'Simple lyric phrase'],
    dailySessions: sessionsFor('Tiny phrase'),
    checkpoint: 'Can you keep a short phrase recognizable and comfortable?',
    tags: ['phrase', 'singing'],
    difficulty: 4,
    safetyRules: ['stop_if_pain'],
  },
  {
    phase: 'songs',
    weekNumber: 13,
    title: 'Song Phrase Setup',
    goal: 'Prepare before a real phrase.',
    coreExercises: ['Choose easy phrase', 'Hum phrase shape', 'Sing with lyric'],
    dailySessions: sessionsFor('Song phrase setup'),
    checkpoint: 'Can you prepare before singing?',
    tags: ['song', 'phrase'],
    difficulty: 4,
    safetyRules: ['choose_easy_key'],
  },
  {
    phase: 'songs',
    weekNumber: 14,
    title: 'Phrase Endings in Songs',
    goal: 'Keep the ends of words and phrases alive.',
    coreExercises: ['Last syllable sustain', 'Softer start', 'Phrase exit comparison'],
    dailySessions: sessionsFor('Song ending'),
    checkpoint: 'Can the last word stay present?',
    tags: ['song', 'endings'],
    difficulty: 4,
    safetyRules: ['avoid_squeezing'],
  },
  {
    phase: 'songs',
    weekNumber: 15,
    title: 'Vowels and Tone Consistency',
    goal: 'Keep tone from changing wildly between vowels.',
    coreExercises: ['Ma-me-mi-mo-mu', 'Lyric vowel isolation', 'Hum to vowel'],
    dailySessions: sessionsFor('Vowel line'),
    checkpoint: 'Can vowels stay connected?',
    tags: ['vowels', 'tone'],
    difficulty: 4,
    safetyRules: ['keep_jaw_easy'],
  },
  {
    phase: 'songs',
    weekNumber: 16,
    title: 'Reference Fading',
    goal: 'Reduce dependency on the app guide tone.',
    coreExercises: ['Listen and sing', 'Delayed reference', 'Sing first, check after'],
    dailySessions: sessionsFor('Faded reference'),
    checkpoint: 'Can you sing a short phrase with less guidance?',
    tags: ['reference', 'independence'],
    difficulty: 4,
    safetyRules: ['return_to_reference_if_lost'],
  },
  {
    phase: 'songs',
    weekNumber: 17,
    title: 'Comfortable Range Expansion',
    goal: 'Expand range carefully without pushing.',
    coreExercises: ['Small upward patterns', 'Comfort check', 'Transpose phrase'],
    dailySessions: sessionsFor('Small range step'),
    checkpoint: 'Can you climb without force?',
    tags: ['range', 'comfort'],
    difficulty: 5,
    safetyRules: ['stop_if_pain', 'lower_key_if_tense'],
  },
  {
    phase: 'songs',
    weekNumber: 18,
    title: 'Dynamics',
    goal: 'Sing softer and louder without losing control.',
    coreExercises: ['Soft-to-medium tone', 'Medium-to-soft phrase', 'Quiet carrying sound'],
    dailySessions: sessionsFor('Dynamic phrase'),
    checkpoint: 'Can volume change without collapse?',
    tags: ['dynamics', 'expression'],
    difficulty: 5,
    safetyRules: ['avoid_shouting'],
  },
  {
    phase: 'songs',
    weekNumber: 19,
    title: 'Expression and Meaning',
    goal: 'Add musical intention without sacrificing technique.',
    coreExercises: ['Speak phrase', 'Hum phrase', 'Sing with one intention'],
    dailySessions: sessionsFor('Expressive phrase'),
    checkpoint: 'Can the phrase mean something and stay easy?',
    tags: ['expression', 'meaning'],
    difficulty: 5,
    safetyRules: ['keep_technique_first'],
  },
  {
    phase: 'songs',
    weekNumber: 20,
    title: 'Consistency Across Takes',
    goal: 'Make good takes repeatable.',
    coreExercises: ['Same phrase three times', 'Identify best take', 'Repeat best setup'],
    dailySessions: sessionsFor('Consistent phrase'),
    checkpoint: 'Are good takes becoming less accidental?',
    tags: ['consistency', 'takes'],
    difficulty: 5,
    safetyRules: ['rest_if_fatigued'],
  },
  {
    phase: 'songs',
    weekNumber: 21,
    title: 'Verse Section',
    goal: 'Train a longer but manageable section.',
    coreExercises: ['Split verse', 'Train each phrase', 'Combine phrases'],
    dailySessions: sessionsFor('Verse section'),
    checkpoint: 'Can two phrases connect?',
    tags: ['verse', 'section'],
    difficulty: 5,
    safetyRules: ['split_if_tired'],
  },
  {
    phase: 'songs',
    weekNumber: 22,
    title: 'Chorus or Peak Phrase',
    goal: 'Handle the most demanding phrase without pushing.',
    coreExercises: ['Identify peak note', 'Sing softer through peak', 'Transpose if needed'],
    dailySessions: sessionsFor('Peak phrase'),
    checkpoint: 'Can the peak stay comfortable?',
    tags: ['chorus', 'peak'],
    difficulty: 6,
    safetyRules: ['transpose_if_needed', 'stop_if_pain'],
  },
  {
    phase: 'songs',
    weekNumber: 23,
    title: 'Full Short Song Take',
    goal: 'Record a short full take or complete selected section.',
    coreExercises: ['Warm-up', 'Phrase reminders', 'Full take', 'One fix'],
    dailySessions: sessionsFor('Full section take'),
    checkpoint: 'Can you improve one thing across two full takes?',
    tags: ['full_take', 'song'],
    difficulty: 6,
    safetyRules: ['rest_between_takes'],
  },
  {
    phase: 'songs',
    weekNumber: 24,
    title: 'Final Comparison and Next Plan',
    goal: 'Compare earliest recordings to current singing and choose the next path.',
    coreExercises: ['Replay baseline', 'Record final section', 'Choose next focus'],
    dailySessions: sessionsFor('Final comparison'),
    checkpoint: 'What changed, and what should you train next?',
    tags: ['checkpoint', 'next_plan'],
    difficulty: 6,
    safetyRules: ['celebrate_without_overpushing'],
  },
];

export function getWeek(weekNumber: number) {
  return curriculum.find((week) => week.weekNumber === weekNumber) ?? curriculum[0];
}

export function getPhaseLabel(phase: CurriculumPhase) {
  if (phase === 'foundation') {
    return 'Breath & Resonance';
  }

  if (phase === 'control') {
    return 'Vocal Control';
  }

  return 'Song Application';
}

export function getPlacementFromAnswers(answers: OnboardingAnswers): PlacementResult {
  const symptoms = answers.reportedSymptoms;
  const nervous =
    answers.primaryGoal === 'confidence' ||
    answers.playbackComfort === 'hate-playback' ||
    answers.biggestFrustration === 'embarrassed';
  const strain = answers.strainStatus === 'pain' || answers.strainStatus === 'tight' || symptoms.includes('squeezed') || symptoms.includes('crack');
  const breath = symptoms.includes('fade') || symptoms.includes('breathy') || symptoms.includes('wobble');
  const pitch = answers.primaryGoal === 'pitch' || symptoms.includes('pitch-drift') || answers.biggestFrustration === 'needs-guide';
  const advanced = answers.experienceLevel === 'lessons-before' || answers.experienceLevel === 'musician';

  if (strain) {
    return {
      startWeek: 2,
      emphasis: ['Comfort checks', 'Gentle sound', 'No high-note chasing'],
      safetyNote: 'Because you reported tightness or strain, range work stays locked behind comfort checks.',
      reason: 'Your first step is making sound easier before adding pitch or song pressure.',
    };
  }

  if (nervous || answers.experienceLevel === 'beginner') {
    return {
      startWeek: 1,
      emphasis: ['Small daily wins', 'Optional playback', 'Breath awareness'],
      reason: 'A steady first month gives you confidence before the app asks for more musical tasks.',
    };
  }

  if (breath) {
    return {
      startWeek: 1,
      emphasis: ['Steady air', 'Gentle hum', 'Endings'],
      reason: 'Fading or breathy sounds often improve when the first month stays focused on air and resonance.',
    };
  }

  if (pitch && advanced) {
    return {
      startWeek: 7,
      emphasis: ['Pitch matching', 'Hum to vowel', 'Reference fading later'],
      reason: 'Your answers suggest you can start after the setup block and focus on finding one note reliably.',
    };
  }

  if (pitch) {
    return {
      startWeek: 5,
      emphasis: ['Clean starts', 'Pitch readiness', 'Short repeats'],
      reason: 'You will still use the foundation setup, but the app can move you toward pitch work sooner.',
    };
  }

  if (advanced) {
    return {
      startWeek: 12,
      emphasis: ['Short phrase control', 'Song setup', 'Weekly foundation review'],
      reason: 'Your background suggests you can begin near the first phrase checkpoint while keeping a foundation drill in rotation.',
    };
  }

  return {
    startWeek: 1,
    emphasis: ['Breath awareness', 'Gentle sound', 'Resonance'],
    reason: 'No single issue dominates yet, so VoiceFix starts with the safest fixed foundation path.',
  };
}

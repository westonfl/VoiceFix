import { getPhaseLabel, getPlacementFromAnswers, getWeek } from '@/features/prototype/curriculum';

import type { OnboardingAnswers, StarterPlan } from './types';

export function buildStarterPlan(answers: OnboardingAnswers): StarterPlan {
  const placement = getPlacementFromAnswers(answers);
  const week = getWeek(placement.startWeek);

  return {
    bucket: placement.safetyNote ? 'safety' : week.phase === 'foundation' ? 'air' : week.phase === 'control' ? 'pitch' : 'mixed',
    focus: `Start at Week ${week.weekNumber}: ${week.title}`,
    reason: `${placement.reason} This is a recommended starting point inside the fixed 12-week VoiceFix journey, not a separate custom curriculum.`,
    firstSession: `${getPhaseLabel(week.phase)} - Day 1`,
    drills: week.coreExercises.slice(0, 3),
    cue: placement.safetyNote ?? week.goal,
    planDays: [
      {
        range: 'Month 1',
        title: 'Breath and resonance',
        detail: 'Build steady air, gentle sound, humming, and resonance awareness before heavier song work.',
      },
      {
        range: 'Month 2',
        title: 'Vocal control',
        detail: 'Train starts, endings, pitch matching, timing, and short melodic phrases.',
      },
      {
        range: 'Month 3',
        title: 'Song application',
        detail: 'Apply the same feedback loop to phrases, range, dynamics, expression, and full takes.',
      },
    ],
  };
}

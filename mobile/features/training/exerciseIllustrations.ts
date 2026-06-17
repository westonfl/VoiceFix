import type { ImageSourcePropType } from 'react-native';

export type ExerciseIllustrationSlide = {
  label: string;
  source: ImageSourcePropType;
};

const EXERCISE_ILLUSTRATIONS: Record<string, ImageSourcePropType> = {
  'fah-vah-resonance': require('../../assets/images/exercise-fah-vah-resonance.png'),
  'gentle-hum': require('../../assets/images/exercise-gentle-hum.png'),
  'hum-to-ah': require('../../assets/images/exercise-hum-to-ah.png'),
  'mmm-resonance': require('../../assets/images/exercise-mmm-resonance.png'),
  'short-tone': require('../../assets/images/exercise-short-tone.png'),
  'soft-hum-start': require('../../assets/images/exercise-soft-hum-start.png'),
  'sustained-hiss': require('../../assets/images/exercise-sustained-hiss.png'),
};

const EXERCISE_ILLUSTRATION_SLIDES: Record<string, ExerciseIllustrationSlide[]> = {
  'sustained-hiss': [
    {
      label: 'Standing',
      source: require('../../assets/images/exercise-sustained-hiss-standing.png'),
    },
    {
      label: 'Sitting',
      source: require('../../assets/images/exercise-sustained-hiss-sitting.png'),
    },
    {
      label: 'Lying down',
      source: require('../../assets/images/exercise-sustained-hiss-lying.png'),
    },
  ],
};

export function getExerciseIllustration(
  exerciseId: string,
): ImageSourcePropType | undefined {
  return getExerciseIllustrationSlides(exerciseId)[0]?.source;
}

export function getExerciseIllustrationSlides(
  exerciseId: string,
): ExerciseIllustrationSlide[] {
  const slides = EXERCISE_ILLUSTRATION_SLIDES[exerciseId];
  if (slides) {
    return slides;
  }

  const source = EXERCISE_ILLUSTRATIONS[exerciseId];
  return source ? [{ label: '', source }] : [];
}

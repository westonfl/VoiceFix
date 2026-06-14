import type { ImageSourcePropType } from 'react-native';

const EXERCISE_ILLUSTRATIONS: Record<string, ImageSourcePropType> = {
  'fah-vah-resonance': require('../../assets/images/exercise-fah-vah-resonance.png'),
  'gentle-hum': require('../../assets/images/exercise-gentle-hum.png'),
  'hum-to-ah': require('../../assets/images/exercise-hum-to-ah.png'),
  'mmm-resonance': require('../../assets/images/exercise-mmm-resonance.png'),
  'short-tone': require('../../assets/images/exercise-short-tone.png'),
  'soft-hum-start': require('../../assets/images/exercise-soft-hum-start.png'),
  'sustained-hiss': require('../../assets/images/exercise-sustained-hiss.png'),
};

export function getExerciseIllustration(
  exerciseId: string,
): ImageSourcePropType | undefined {
  return EXERCISE_ILLUSTRATIONS[exerciseId];
}

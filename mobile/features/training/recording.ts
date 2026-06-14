import { RecordingPresets, type RecordingOptions } from 'expo-audio';

export const TRAINING_RECORDING_OPTIONS: RecordingOptions = {
  ...RecordingPresets.LOW_QUALITY,
  isMeteringEnabled: true,
};

export const TRAINING_METER_INTERVAL_MS = 50;

export const DEFAULT_EXERCISE_DURATION_SEC = 10;

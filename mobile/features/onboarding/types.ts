import type { ComponentProps } from 'react';
import type { MaterialIcons } from '@expo/vector-icons';

export type IconName = ComponentProps<typeof MaterialIcons>['name'];
export type Language =
  | 'en'
  | 'es'
  | 'pt'
  | 'fr'
  | 'de'
  | 'ja'
  | 'ko'
  | 'zhHans'
  | 'zhHant'
  | 'hi'
  | 'ar'
  | 'id';

export type OnboardingScreenKind =
  | 'splash'
  | 'info'
  | 'single'
  | 'multi'
  | 'permission'
  | 'voiceIntro'
  | 'recording'
  | 'analysis'
  | 'recap'
  | 'plan'
  | 'sessionPreview'
  | 'conversion'
  | 'ready';

export type OnboardingOption = {
  id: string;
  label: string;
  detail: string;
  icon: IconName;
};

export type RecordingCheck = {
  index: number;
  title: string;
  instruction: string;
  listensFor: string[];
  icon: IconName;
};

export type OnboardingPermissionType = 'mic' | 'notifications';

export type OnboardingScreen = {
  id: string;
  shortTitle: string;
  kind: OnboardingScreenKind;
  permissionType?: OnboardingPermissionType;
  eyebrow: string;
  title: string;
  body?: string;
  primaryAction: string;
  secondaryAction?: string;
  dataKey?: keyof OnboardingAnswers;
  options?: OnboardingOption[];
  multi?: boolean;
  bullets?: string[];
  comparison?: { label: string; detail: string; icon: IconName }[];
  recording?: RecordingCheck;
};

export type OnboardingAnswers = {
  primaryGoal: string;
  useCases: string[];
  experienceLevel: string;
  learningSources: string[];
  reportedSymptoms: string[];
  biggestFrustration: string;
  playbackComfort: string;
  feedbackStyle: string;
  practiceLength: string;
  reminderTime: string;
  practiceEnvironment: string[];
  strainStatus: string;
  micPermissionStatus: string;
  notificationPermissionStatus: string;
};

export type StarterPlan = {
  bucket: 'air' | 'pitch' | 'tension' | 'confidence' | 'mixed' | 'safety';
  focus: string;
  reason: string;
  firstSession: string;
  planDays: Array<{ range: string; title: string; detail: string }>;
  drills: string[];
  cue: string;
};

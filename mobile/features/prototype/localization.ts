import type { Language } from '@/features/onboarding/types';

import type { CurriculumWeek } from './curriculum';

export type MainAppLanguage = Extract<Language, 'en' | 'ko'>;

export const mainAppLanguageOptions: Array<{ id: MainAppLanguage; label: string; shortLabel: string }> = [
  { id: 'en', label: 'English', shortLabel: 'EN' },
  { id: 'ko', label: '한국어', shortLabel: 'KO' },
];

export const mainAppText = {
  en: {
    tabs: {
      today: 'Today',
      journey: 'Journey',
      journal: 'Journal',
      settings: 'Settings',
    },
    common: {
      day: 'Day',
      of: 'of',
      week: 'Week',
      loading: 'Loading your VoiceFix journey...',
      grace: 'grace',
      ready: 'Ready',
      used: 'Used',
      today: 'today',
      streak: 'streak',
      dayStreak: 'day streak',
      graceDay: 'grace day',
      firstTake: 'first take',
      retry: 'retry',
    },
    today: {
      trainingSession: 'Training session',
      introBody: 'Small honest repetitions are how the voice changes. Today, record once, improve one thing, then retry the exact same drill.',
      warmUp: 'Warm-up',
      mainDrill: 'Main drill',
      retryRule: 'Retry rule',
      retryRuleDetail: 'Same task, one cue, one comparison.',
      startRecording: 'Start recording',
      recordFirstTake: 'Record the first take.',
      storesLocally: 'VoiceFix stores this take locally for the retry comparison.',
      readyToRecord: 'Ready to record',
      startFirstTake: 'Start first take',
      stopFirstTake: 'Stop first take',
      oneThing: 'One thing to try.',
      whatWeHeard: 'What we heard',
      whatItMeans: 'What it often means',
      oneFix: 'One fix',
      retrySameDrill: 'Retry same drill',
      retryUnchanged: 'Retry, unchanged.',
      retryBody: 'Same drill. Same target. Only the cue changes.',
      secondTakeComparison: 'Second take comparison',
      readyToRetry: 'Ready to retry',
      startRetry: 'Start retry',
      stopRetry: 'Stop retry',
      dayComplete: 'Day complete.',
      savedFallback: 'The app saved this comparison to Journal.',
      recordedTakes: 'Recorded takes',
      backToToday: 'Back to Today',
      todaysSession: "Today’s session",
      recordCueRetry: 'Record, get one cue, retry.',
      practiceAgain: 'Practice again',
      startTraining: 'Start training',
      micUnavailableTitle: 'Microphone unavailable',
      micUnavailableBody: 'Allow microphone access to record real takes.',
      micSetupFailed: 'Microphone setup failed. You can still review the flow, but real recording is unavailable.',
      recordStartFailed: 'Recording could not start. Check mic permission and try again.',
      recordSaveFailed: 'Recording could not be saved. Try again with a shorter take.',
      placementReason: 'Onboarding recommended this starting point inside the fixed roadmap.',
    },
    journey: {
      kicker: '6-month roadmap',
      title: 'Your fixed VoiceFix journey.',
      body: 'Onboarding chooses your starting point. The 24-week path stays visible, reviewable, and skippable by checkpoint.',
      currentPlacement: 'Current placement',
      completeOnboarding: 'Complete onboarding to place yourself in the curriculum.',
      review: 'Review',
      current: 'Current',
      locked: 'Locked',
      note: 'Skip-ahead checks are shown as prototype affordances. In production, they require one recording, one retry, and no pain report.',
    },
    journal: {
      kicker: 'Journal',
      title: 'Proof against your last take.',
      body: 'VoiceFix saves local take comparisons, not a pile of raw recordings. Each entry keeps the first take, retry, and one written observation.',
      emptyTitle: 'No saved comparisons yet.',
      emptyBody: "Complete today’s training loop to save the first take, retry result, and one written observation.",
      latestComparison: 'Latest comparison',
      firstTake: 'First take',
      retry: 'Retry',
      first: 'First',
      savedLocally: 'saved locally',
      noUri: 'no URI',
      monthlyCheckpoints: 'Monthly checkpoints',
      checkpointOne: 'Month 1 breath and resonance',
      checkpointTwo: 'Month 3 first phrase',
      checkpointThree: 'Month 6 final comparison',
      open: 'Open',
      later: 'Later',
    },
    settings: {
      kicker: 'Settings',
      title: 'Keep the promise realistic.',
      body: 'These controls tune habit pressure without changing the fixed curriculum.',
      dailyTraining: 'Daily training',
      reminderTime: 'Reminder time',
      notificationTone: 'Notification tone',
      sessionLength: 'Session length',
      habitRules: 'Habit rules',
      graceCopy: 'One missed day per calendar month can use a grace day. The streak survives; the 180-day journey never resets.',
      currentStreak: 'current streak',
      bestStreak: 'best streak',
      safetyAndData: 'Safety and data',
      safetyReminder: 'Safety reminder',
      safetyReminderValue: 'Stop if your throat hurts',
      language: 'Language',
      audio: 'Audio',
      audioValue: 'Real local recording',
      analyzeAudioFile: 'Analyze audio file',
      analyzeAudioFileValue: 'Send file to resonance analyzer',
      analyzeAudioTitle: 'Analysis result',
      analyzeAudioFailedTitle: 'Analysis failed',
      analyzeAudioFailedBody: 'Start the analysis server and try again with an audio file.',
      reset: 'Reset prototype',
    },
  },
  ko: {
    tabs: {
      today: '오늘',
      journey: '여정',
      journal: '저널',
      settings: '설정',
    },
    common: {
      day: '일차',
      of: '/',
      week: '주차',
      loading: 'VoiceFix 여정을 불러오는 중...',
      grace: '유예일',
      ready: '준비됨',
      used: '사용됨',
      today: '오늘',
      streak: '연속',
      dayStreak: '연속일',
      graceDay: '유예일',
      firstTake: '첫 테이크',
      retry: '재시도',
    },
    today: {
      trainingSession: '훈련 세션',
      introBody: '목소리는 작은 반복으로 달라집니다. 오늘은 한 번 녹음하고, 한 가지만 고친 뒤, 같은 드릴을 다시 합니다.',
      warmUp: '워밍업',
      mainDrill: '중심 드릴',
      retryRule: '재시도 규칙',
      retryRuleDetail: '같은 과제, 한 가지 힌트, 한 번의 비교.',
      startRecording: '녹음 시작',
      recordFirstTake: '첫 테이크를 녹음하세요.',
      storesLocally: 'VoiceFix는 재시도 비교를 위해 이 테이크를 기기에 저장합니다.',
      readyToRecord: '녹음 준비됨',
      startFirstTake: '첫 테이크 시작',
      stopFirstTake: '첫 테이크 정지',
      oneThing: '한 가지를 시도해보세요.',
      whatWeHeard: '들린 점',
      whatItMeans: '흔한 의미',
      oneFix: '한 가지 수정',
      retrySameDrill: '같은 드릴 다시 하기',
      retryUnchanged: '그대로 다시 시도하세요.',
      retryBody: '같은 드릴, 같은 목표입니다. 달라지는 것은 힌트 하나뿐입니다.',
      secondTakeComparison: '두 번째 테이크 비교',
      readyToRetry: '재시도 준비됨',
      startRetry: '재시도 시작',
      stopRetry: '재시도 정지',
      dayComplete: '오늘 훈련 완료.',
      savedFallback: '비교 결과가 저널에 저장되었습니다.',
      recordedTakes: '녹음한 테이크',
      backToToday: '오늘로 돌아가기',
      todaysSession: '오늘의 세션',
      recordCueRetry: '녹음하고, 한 가지 힌트를 받고, 다시 시도합니다.',
      practiceAgain: '다시 연습하기',
      startTraining: '훈련 시작',
      micUnavailableTitle: '마이크를 사용할 수 없음',
      micUnavailableBody: '실제 테이크를 녹음하려면 마이크 접근을 허용하세요.',
      micSetupFailed: '마이크 설정에 실패했습니다. 흐름은 볼 수 있지만 실제 녹음은 사용할 수 없습니다.',
      recordStartFailed: '녹음을 시작할 수 없습니다. 마이크 권한을 확인하고 다시 시도하세요.',
      recordSaveFailed: '녹음을 저장할 수 없습니다. 더 짧게 다시 시도하세요.',
      placementReason: '온보딩 결과에 따라 고정 로드맵 안의 시작점이 추천되었습니다.',
    },
    journey: {
      kicker: '6개월 로드맵',
      title: '고정된 VoiceFix 여정.',
      body: '온보딩은 시작점을 고릅니다. 24주 경로는 항상 보이고, 복습하거나 체크포인트에서 건너뛸 수 있습니다.',
      currentPlacement: '현재 시작점',
      completeOnboarding: '온보딩을 완료하면 커리큘럼 안에서 시작점이 정해집니다.',
      review: '복습',
      current: '진행중',
      locked: '잠김',
      note: '건너뛰기 체크는 프로토타입 기능 표시입니다. 실제 제품에서는 한 번 녹음, 한 번 재시도, 통증 없음 확인이 필요합니다.',
    },
    journal: {
      kicker: '저널',
      title: '이전 테이크와 비교한 증거.',
      body: 'VoiceFix는 무작정 녹음을 쌓지 않고, 첫 테이크와 재시도, 한 줄 관찰을 함께 저장합니다.',
      emptyTitle: '저장된 비교가 아직 없습니다.',
      emptyBody: '오늘 훈련 루프를 완료하면 첫 테이크, 재시도 결과, 한 줄 관찰이 저장됩니다.',
      latestComparison: '최근 비교',
      firstTake: '첫 테이크',
      retry: '재시도',
      first: '첫 테이크',
      savedLocally: '기기에 저장됨',
      noUri: '저장 없음',
      monthlyCheckpoints: '월별 체크포인트',
      checkpointOne: '1개월 호흡과 공명',
      checkpointTwo: '3개월 첫 구절',
      checkpointThree: '6개월 최종 비교',
      open: '열림',
      later: '나중에',
    },
    settings: {
      kicker: '설정',
      title: '현실적인 약속을 유지하세요.',
      body: '이 설정은 고정 커리큘럼은 바꾸지 않고 습관 압력만 조절합니다.',
      dailyTraining: '매일 훈련',
      reminderTime: '알림 시간',
      notificationTone: '알림 톤',
      sessionLength: '세션 길이',
      habitRules: '습관 규칙',
      graceCopy: '한 달에 하루는 유예일로 사용할 수 있습니다. 연속 기록은 유지되고, 180일 여정은 리셋되지 않습니다.',
      currentStreak: '현재 연속일',
      bestStreak: '최고 연속일',
      safetyAndData: '안전과 데이터',
      safetyReminder: '안전 알림',
      safetyReminderValue: '목이 아프면 멈추세요',
      language: '언어',
      audio: '오디오',
      audioValue: '실제 로컬 녹음',
      analyzeAudioFile: '오디오 파일 분석',
      analyzeAudioFileValue: '공명 분석기로 파일 보내기',
      analyzeAudioTitle: '분석 결과',
      analyzeAudioFailedTitle: '분석 실패',
      analyzeAudioFailedBody: '분석 서버를 켠 뒤 오디오 파일로 다시 시도하세요.',
      reset: '프로토타입 초기화',
    },
  },
} as const;

export function normalizeMainLanguage(language: Language): MainAppLanguage {
  return language === 'ko' ? 'ko' : 'en';
}

const weekKo: Record<number, { title: string; goal: string }> = {
  1: { title: '호흡 인식', goal: '밀어내지 않고 일정하게 나가는 숨을 느낍니다.' },
  2: { title: '부드러운 소리', goal: '목에 압박 없이 소리를 시작합니다.' },
  3: { title: '공명 탐색', goal: '목에만 걸리지 않는 더 쉬운 울림을 탐색합니다.' },
  4: { title: '호흡 + 공명 연결', goal: '일정한 숨, 부드러운 소리, 울림을 짧은 음으로 연결합니다.' },
};

export function displayWeek(week: CurriculumWeek, language: MainAppLanguage) {
  if (language === 'ko' && weekKo[week.weekNumber]) {
    return weekKo[week.weekNumber];
  }

  return {
    title: week.title,
    goal: week.goal,
  };
}

export function displayPhase(phaseLabel: string, language: MainAppLanguage) {
  if (language !== 'ko') {
    return phaseLabel;
  }

  const labels: Record<string, string> = {
    'Breath & Resonance': '호흡과 공명',
    'Vocal Control': '보컬 컨트롤',
    'Song Application': '노래 적용',
  };

  return labels[phaseLabel] ?? phaseLabel;
}

export function displaySessionText(value: string, language: MainAppLanguage) {
  if (language !== 'ko') {
    return value;
  }

  const labels: Record<string, string> = {
    Baseline: '기준 녹음',
    Stabilize: '안정화',
    Clarify: '명확화',
    Retry: '재시도',
    Apply: '적용',
    Review: '복습',
    Checkpoint: '체크포인트',
    'Record the current version': '현재 상태를 녹음합니다',
    'Repeat the easiest version': '가장 쉬운 형태로 반복합니다',
    'Add one technical detail': '기술 힌트 하나를 더합니다',
    'Repeat and compare': '반복하고 비교합니다',
    'Use it in a tiny musical pattern': '아주 작은 음악 패턴에 적용합니다',
    'Compare first and latest takes': '첫 테이크와 최신 테이크를 비교합니다',
    'Recover, reflect, or advance': '회복, 회고, 다음 단계 선택',
    'Quiet inhale': '조용한 들숨',
    'Soft hiss': '부드러운 hiss',
    '5-second air release': '5초 숨 내보내기',
    'Soft hum': '부드러운 허밍',
    'Gentle mm': '가벼운 mm',
    'Comfort check': '편안함 확인',
    Mmm: 'Mmm',
    Nnn: 'Nnn',
    Ng: 'Ng',
    'Mmm-ah': 'Mmm-ah',
    'Hiss to hum': 'hiss에서 허밍',
    'Hum to ah': '허밍에서 ah',
    '3-5 second tone': '3-5초 짧은 음',
  };

  return labels[value] ?? value;
}

export function displayPreferenceValue(value: string, language: MainAppLanguage) {
  if (language !== 'ko') {
    return value;
  }

  const labels: Record<string, string> = {
    '7:30 PM': '오후 7:30',
    '8:00 AM': '오전 8:00',
    '1:00 PM': '오후 1:00',
    'Choose later': '나중에 선택',
    'Coach-like': '코치 스타일',
    Gentle: '부드럽게',
    '5 minutes': '5분',
    '12 minutes': '12분',
    '20 minutes': '20분',
  };

  return labels[value] ?? value;
}

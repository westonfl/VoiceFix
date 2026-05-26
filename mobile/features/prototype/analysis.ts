export type TakeMetrics = {
  durationMs: number;
};

type AnalysisLanguage = 'en' | 'ko';

export function buildMvpFeedback(firstTake: TakeMetrics, language: AnalysisLanguage = 'en') {
  const seconds = Math.max(0, Math.round(firstTake.durationMs / 100) / 10);

  if (language === 'ko') {
    if (firstTake.durationMs < 2500) {
      return {
        observation: `들린 점: 첫 테이크가 약 ${seconds}초로 짧았습니다.`,
        interpretation: '소리가 안정되기 전에 끝났을 가능성이 있습니다.',
        cue: '같은 드릴을 더 작은 소리로 시작해서 조금 더 오래 이어보세요.',
      };
    }

    if (firstTake.durationMs > 9000) {
      return {
        observation: `들린 점: 테이크가 약 ${seconds}초로 이 드릴에는 충분히 길었습니다.`,
        interpretation: '길게 버티는 것보다 목에 힘을 주지 않고 일정하게 유지하는 것이 더 중요합니다.',
        cue: '조금 더 부드럽게 시작하고 목이 일하기 전에 멈춰보세요.',
      };
    }

    return {
      observation: `들린 점: 테이크가 약 ${seconds}초로 비교하기에 알맞은 길이였습니다.`,
      interpretation: 'VoiceFix가 한 가지 변화를 비교하기에 충분한 자료입니다.',
      cue: '같은 드릴을 더 쉬운 시작과 더 깔끔한 끝으로 다시 해보세요.',
    };
  }

  if (firstTake.durationMs < 2500) {
    return {
      observation: `What we heard: the first take was short, about ${seconds}s.`,
      interpretation: 'That often means the sound ended before the exercise had time to settle.',
      cue: 'Try the same drill with a smaller sound so it can last a little longer.',
    };
  }

  if (firstTake.durationMs > 9000) {
    return {
      observation: `What we heard: the take lasted about ${seconds}s, which is plenty for this drill.`,
      interpretation: 'Longer is not automatically better; steadiness matters more than pushing duration.',
      cue: 'Try the same drill slightly softer and stop before the throat works hard.',
    };
  }

  return {
    observation: `What we heard: the take lasted about ${seconds}s, a useful length for comparison.`,
    interpretation: 'That gives VoiceFix enough material to compare one small change.',
    cue: 'Try the same drill again with an easier start and a cleaner ending.',
  };
}

export function compareTakes(firstTake: TakeMetrics, retryTake: TakeMetrics, language: AnalysisLanguage = 'en') {
  const delta = retryTake.durationMs - firstTake.durationMs;

  if (language === 'ko') {
    if (Math.abs(delta) < 500) {
      return '재시도 결과: 길이는 거의 비슷합니다. 두 번째 테이크가 더 쉽게 느껴졌는지 들어보세요.';
    }

    if (delta > 0) {
      return '재시도 결과: 두 번째 테이크가 조금 더 길었습니다. 시작할 때 힘이 줄었을 가능성이 있습니다.';
    }

    return '재시도 결과: 두 번째 테이크가 더 짧았습니다. 그래도 더 쉽고 덜 밀어낸 느낌이었다면 좋은 자료입니다.';
  }

  if (Math.abs(delta) < 500) {
    return 'Retry result: about the same length, which is useful. Listen for whether the second take felt easier.';
  }

  if (delta > 0) {
    return 'Retry result: the second take lasted a little longer. That often means the start used less effort.';
  }

  return 'Retry result: the second take was shorter. That can still be useful if it felt easier or less pushed.';
}

export function formatDuration(durationMs: number) {
  return `${Math.max(0, Math.round(durationMs / 100) / 10).toFixed(1)}s`;
}

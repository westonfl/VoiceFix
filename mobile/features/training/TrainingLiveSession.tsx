import type { AudioRecorder, RecorderState } from 'expo-audio';
import { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import type { CardGradientVariant } from '@/features/onboarding/cardGradientBackground';
import { VoiceFixTheme as theme } from '@/constants/theme';
import type { MainAppLanguage } from '@/features/prototype/localization';
import { LiveSessionParticles } from '@/features/training/LiveSessionParticles';
import { LiveVoiceOrb } from '@/features/training/LiveVoiceOrb';
import {
  normalizeMetering,
  type LiveMeterSample,
} from '@/features/training/liveAnalysis';
import {
  DEFAULT_EXERCISE_DURATION_SEC,
} from '@/features/training/recording';

export type LiveSessionPhase = 'ready' | 'set' | 'go' | 'perform' | 'finishing';

type TrainingLiveSessionProps = {
  exerciseId: string;
  exerciseTitle: string;
  gradient: CardGradientVariant;
  language: MainAppLanguage;
  durationSec?: number;
  audioRecorder: AudioRecorder;
  recorderState: RecorderState;
  onComplete: (payload: {
    durationMs: number;
    uri?: string;
    samples: LiveMeterSample[];
  }) => void;
  onCancel: () => void;
};

const CUE_MS = 900;

function readySetGoLabels(language: MainAppLanguage): [string, string, string] {
  if (language === 'ko') {
    return ['준비', '대기', '시작'];
  }

  return ['Ready', 'Set', 'Go'];
}

export function TrainingLiveSession({
  exerciseId,
  exerciseTitle,
  gradient,
  language,
  durationSec = DEFAULT_EXERCISE_DURATION_SEC,
  audioRecorder,
  recorderState,
  onComplete,
  onCancel,
}: TrainingLiveSessionProps) {
  const [phase, setPhase] = useState<LiveSessionPhase>('ready');
  const [performTick, setPerformTick] = useState(durationSec);
  const samplesRef = useRef<LiveMeterSample[]>([]);
  const startedAtRef = useRef<number | null>(null);
  const completedRef = useRef(false);
  const onCancelRef = useRef(onCancel);
  onCancelRef.current = onCancel;
  const cues = readySetGoLabels(language);
  const liveLevel = useMemo(
    () => normalizeMetering(recorderState.metering),
    [recorderState.metering],
  );

  const cueLabel =
    phase === 'ready'
      ? cues[0]
      : phase === 'set'
        ? cues[1]
        : phase === 'go'
          ? cues[2]
          : null;

  const orbLevel =
    phase === 'perform' || phase === 'finishing' ? liveLevel : liveLevel * 0.3;

  useEffect(() => {
    samplesRef.current = [];
    completedRef.current = false;
    startedAtRef.current = null;
    setPhase('ready');
    setPerformTick(durationSec);

    async function begin() {
      try {
        await audioRecorder.prepareToRecordAsync();
        audioRecorder.record();
        startedAtRef.current = Date.now();
      } catch {
        onCancelRef.current();
      }
    }

    void begin();
  }, [audioRecorder, durationSec, exerciseId]);

  useEffect(() => {
    if (phase === 'finishing') {
      return;
    }

    if (phase === 'ready') {
      const timer = setTimeout(() => setPhase('set'), CUE_MS);
      return () => clearTimeout(timer);
    }

    if (phase === 'set') {
      const timer = setTimeout(() => setPhase('go'), CUE_MS);
      return () => clearTimeout(timer);
    }

    if (phase === 'go') {
      const timer = setTimeout(() => {
        setPhase('perform');
        setPerformTick(durationSec);
      }, CUE_MS);
      return () => clearTimeout(timer);
    }

    if (phase === 'perform') {
      const timer = setInterval(() => {
        setPerformTick((current) => {
          if (current <= 0) {
            clearInterval(timer);
            setPhase('finishing');
            return 0;
          }

          return current - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [durationSec, phase]);

  useEffect(() => {
    if (!recorderState.isRecording || phase === 'finishing') {
      return;
    }

    const elapsed = startedAtRef.current ? Date.now() - startedAtRef.current : 0;
    samplesRef.current.push({
      t: elapsed,
      level: liveLevel,
    });
  }, [liveLevel, phase, recorderState.isRecording, recorderState.durationMillis]);

  useEffect(() => {
    if (phase !== 'finishing' || completedRef.current) {
      return;
    }

    completedRef.current = true;

    async function finish() {
      const measuredDurationMs = startedAtRef.current
        ? Date.now() - startedAtRef.current
        : recorderState.durationMillis;
      const durationMs = Math.max(recorderState.durationMillis, measuredDurationMs);

      try {
        if (recorderState.isRecording) {
          await audioRecorder.stop();
        }
      } catch {
        // Still surface local results even if stop fails.
      }

      onComplete({
        durationMs,
        uri: audioRecorder.uri ?? undefined,
        samples: samplesRef.current,
      });
    }

    void finish();
  }, [
    audioRecorder,
    onComplete,
    phase,
    recorderState.durationMillis,
    recorderState.isRecording,
  ]);

  return (
    <View style={styles.screen}>
      <LiveSessionParticles active={phase !== 'finishing'} />

      {phase !== 'finishing' ? (
        <View style={styles.topHud}>
          {cueLabel ? <Text style={styles.hudValue}>{cueLabel}</Text> : null}
          {phase === 'perform' ? (
            <Text style={styles.hudValue}>{performTick}</Text>
          ) : null}
        </View>
      ) : null}

      <View style={styles.orbHost}>
        <LiveVoiceOrb
          gradient={gradient}
          level={orbLevel}
          active={phase !== 'finishing'}
        />
      </View>

      {phase !== 'finishing' ? (
        <Text style={styles.exerciseName}>{exerciseTitle}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    minHeight: 480,
    overflow: 'hidden',
  },
  topHud: {
    alignItems: 'center',
    gap: 8,
    paddingTop: 4,
    zIndex: 1,
  },
  hudValue: {
    color: theme.text,
    fontSize: 52,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
    lineHeight: 58,
    textTransform: 'uppercase',
  },
  orbHost: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    zIndex: 1,
  },
  exerciseName: {
    color: theme.textMuted,
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: 0.8,
    opacity: 0.88,
    paddingBottom: 8,
    textAlign: 'center',
    textTransform: 'uppercase',
    zIndex: 1,
  },
});

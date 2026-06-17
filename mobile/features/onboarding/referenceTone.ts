import { createAudioPlayer, setAudioModeAsync, type AudioPlayer } from 'expo-audio';
import { File, Paths } from 'expo-file-system';

type NoteSegment = {
  frequencyHz: number;
  durationSec: number;
  gapAfterSec?: number;
};

const PITCH_MATCH_HZ = 220;
const ECHO_PATTERN_HZ = [196, 220, 262];

let activePlayer: AudioPlayer | null = null;

function noteSegmentsForScreen(screenId: string): NoteSegment[] {
  if (screenId === 'ONB-22') {
    return ECHO_PATTERN_HZ.map((frequencyHz, index) => ({
      frequencyHz,
      durationSec: 1.4,
      gapAfterSec: index < ECHO_PATTERN_HZ.length - 1 ? 0.35 : 0,
    }));
  }

  return [{ frequencyHz: PITCH_MATCH_HZ, durationSec: 2.2 }];
}

function generateToneSamples(segments: NoteSegment[], sampleRate: number) {
  let totalSamples = 0;

  for (const segment of segments) {
    totalSamples += Math.round(segment.durationSec * sampleRate);
    if (segment.gapAfterSec) {
      totalSamples += Math.round(segment.gapAfterSec * sampleRate);
    }
  }

  const output = new Float32Array(totalSamples);
  let writeIndex = 0;

  for (const segment of segments) {
    const noteSamples = Math.round(segment.durationSec * sampleRate);
    const fadeSamples = Math.min(Math.round(0.05 * sampleRate), Math.floor(noteSamples / 4));

    for (let index = 0; index < noteSamples; index += 1) {
      const time = index / sampleRate;
      let amplitude = 0.35;

      if (index < fadeSamples) {
        amplitude *= index / fadeSamples;
      }

      if (index > noteSamples - fadeSamples) {
        amplitude *= (noteSamples - index) / fadeSamples;
      }

      output[writeIndex] = amplitude * Math.sin(2 * Math.PI * segment.frequencyHz * time);
      writeIndex += 1;
    }

    if (segment.gapAfterSec) {
      writeIndex += Math.round(segment.gapAfterSec * sampleRate);
    }
  }

  return output;
}

function writeString(view: DataView, offset: number, value: string) {
  for (let index = 0; index < value.length; index += 1) {
    view.setUint8(offset + index, value.charCodeAt(index));
  }
}

function encodeMonoWav(samples: Float32Array, sampleRate: number) {
  const bytesPerSample = 2;
  const dataSize = samples.length * bytesPerSample;
  const buffer = new ArrayBuffer(44 + dataSize);
  const view = new DataView(buffer);

  writeString(view, 0, 'RIFF');
  view.setUint32(4, 36 + dataSize, true);
  writeString(view, 8, 'WAVE');
  writeString(view, 12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * bytesPerSample, true);
  view.setUint16(32, bytesPerSample, true);
  view.setUint16(34, 16, true);
  writeString(view, 36, 'data');
  view.setUint32(40, dataSize, true);

  let offset = 44;

  for (let index = 0; index < samples.length; index += 1) {
    const clamped = Math.max(-1, Math.min(1, samples[index]));
    view.setInt16(offset, clamped * 0x7fff, true);
    offset += 2;
  }

  return new Uint8Array(buffer);
}

function stopActivePlayer() {
  if (!activePlayer) {
    return;
  }

  activePlayer.pause();
  activePlayer.remove();
  activePlayer = null;
}

function writeReferenceFile(screenId: string, wavBytes: Uint8Array) {
  const file = new File(Paths.cache, `voicefix-reference-${screenId}.wav`);

  if (file.exists) {
    file.delete();
  }

  file.create({ overwrite: true });
  file.write(wavBytes);
  return file.uri;
}

export async function playOnboardingReference(
  screenId: string,
  options?: { onFinish?: () => void },
) {
  stopActivePlayer();

  await setAudioModeAsync({
    allowsRecording: false,
    playsInSilentMode: true,
    interruptionMode: 'duckOthers',
  });

  const sampleRate = 44100;
  const wavBytes = encodeMonoWav(
    generateToneSamples(noteSegmentsForScreen(screenId), sampleRate),
    sampleRate,
  );
  const uri = writeReferenceFile(screenId, wavBytes);
  const player = createAudioPlayer({ uri });
  activePlayer = player;

  const finish = () => {
    stopActivePlayer();
    options?.onFinish?.();
  };

  const statusListener = player.addListener('playbackStatusUpdate', (status) => {
    if (status.didJustFinish) {
      statusListener.remove();
      finish();
    }
  });

  player.play();
}

export function stopOnboardingReference() {
  stopActivePlayer();
}

export function onboardingScreenHasReferencePlayback(screenId: string) {
  return screenId === 'ONB-21' || screenId === 'ONB-22';
}

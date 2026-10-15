import { useCallback, useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import {
  RecordingPresets,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
  useAudioRecorder,
  type RecordingOptions,
} from 'expo-audio';
import { File } from 'expo-file-system';

import { SENSITIVITY, type Sensitivity } from './game';

// The recording itself is thrown away: only the live level (metering, in dBFS) is used.
const OPTIONS: RecordingOptions = { ...RecordingPresets.LOW_QUALITY, isMeteringEnabled: true };

export const CALIBRATION_MS = 3000;
const SAMPLE_MS = 100;
const NO_SIGNAL_DB = -160; // what recorders report before the first real reading
const MIN_BASELINE_DB = -70;
const MAX_THRESHOLD_DB = -3;
const CALIBRATION_PERCENTILE = 0.4; // ignores a giggle during the countdown
const BASELINE_FOLLOW = 0.01; // per sample: tracks a car speeding up over ~10 s
const LEVEL_DECAY = 0.75; // the meter jumps up at once and falls back gently

export type MonitorPhase = 'idle' | 'starting' | 'calibrating' | 'listening';
export type StartResult = 'ok' | 'denied' | 'error' | 'cancelled';

type StartOptions = {
  sensitivity: Sensitivity;
  onReady: () => void;
  onNoise: () => void;
};

export function useNoiseMonitor() {
  const recorder = useAudioRecorder(OPTIONS);
  const [phase, setPhase] = useState<MonitorPhase>('idle');
  const [level, setLevel] = useState(0);
  const [countdown, setCountdown] = useState(Math.ceil(CALIBRATION_MS / 1000));
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  // Bumped by every start/stop so a slow start that was cancelled cleans up after itself.
  const session = useRef(0);

  const release = useCallback(async () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
    try {
      await recorder.stop();
    } catch {
      // Not recording.
    }
    const uri = recorder.uri;
    if (uri && Platform.OS !== 'web') {
      try {
        new File(uri).delete();
      } catch {
        // Already gone.
      }
    }
    // Back to a playback session so the game sounds come out of the loudspeaker at full volume.
    await setAudioModeAsync({ allowsRecording: false, playsInSilentMode: true }).catch(() => {});
  }, [recorder]);

  const stop = useCallback(async () => {
    session.current += 1;
    setPhase('idle');
    setLevel(0);
    await release();
  }, [release]);

  const start = useCallback(
    async ({ sensitivity, onReady, onNoise }: StartOptions): Promise<StartResult> => {
      const id = ++session.current;
      const cancelled = () => id !== session.current;
      setPhase('starting');
      setLevel(0);
      setCountdown(Math.ceil(CALIBRATION_MS / 1000));

      try {
        const permission = await requestRecordingPermissionsAsync();
        if (cancelled()) return 'cancelled';
        if (!permission.granted) {
          setPhase('idle');
          return 'denied';
        }
        await setAudioModeAsync({ allowsRecording: true, playsInSilentMode: true });
        await recorder.prepareToRecordAsync();
        if (cancelled()) {
          await release();
          return 'cancelled';
        }
        recorder.record();
      } catch {
        if (cancelled()) return 'cancelled';
        setPhase('idle');
        await release();
        return 'error';
      }

      const { marginDb, samples: needed } = SENSITIVITY[sensitivity];
      const startedAt = Date.now();
      const calibration: number[] = [];
      let calibrating = true;
      let baseline = MIN_BASELINE_DB;
      let over = 0;
      let shown = 0;
      setPhase('calibrating');

      timer.current = setInterval(() => {
        const db = recorder.getStatus().metering;
        const reading = db === undefined || db <= NO_SIGNAL_DB ? null : db;

        if (calibrating) {
          if (reading !== null) calibration.push(reading);
          const left = CALIBRATION_MS - (Date.now() - startedAt);
          if (left > 0) {
            setCountdown(Math.ceil(left / 1000));
            return;
          }
          calibration.sort((a, b) => a - b);
          const quiet = calibration[Math.floor(calibration.length * CALIBRATION_PERCENTILE)];
          baseline = Math.max(MIN_BASELINE_DB, quiet ?? MIN_BASELINE_DB);
          calibrating = false;
          setPhase('listening');
          onReady();
          return;
        }

        if (reading === null) return;
        const threshold = Math.min(MAX_THRESHOLD_DB, baseline + marginDb);
        if (reading >= threshold) {
          over += 1;
          if (over >= needed) {
            session.current += 1;
            setPhase('idle');
            setLevel(1);
            release().then(onNoise);
            return;
          }
        } else {
          over = 0;
          // Follow slow changes in the background without learning from short sounds.
          if (reading < baseline + marginDb / 2) {
            baseline = Math.max(MIN_BASELINE_DB, baseline + (reading - baseline) * BASELINE_FOLLOW);
          }
        }
        const raw = Math.min(1, Math.max(0, (reading - baseline) / (threshold - baseline)));
        shown = Math.max(raw, shown * LEVEL_DECAY);
        setLevel(shown);
      }, SAMPLE_MS);

      return 'ok';
    },
    [recorder, release],
  );

  useEffect(
    () => () => {
      session.current += 1;
      if (timer.current) clearInterval(timer.current);
    },
    [],
  );

  return { phase, level, countdown, start, stop };
}

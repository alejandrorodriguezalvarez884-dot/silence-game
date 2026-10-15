import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, Vibration } from 'react-native';
import { useAudioPlayer } from 'expo-audio';
import * as Haptics from 'expo-haptics';
import { activateKeepAwakeAsync, deactivateKeepAwake } from 'expo-keep-awake';
import * as Speech from 'expo-speech';

import { isElimination, type Player, type Settings } from './game';
import { speechLanguage, t } from './i18n';
import { useNoiseMonitor, type StartResult } from './useNoiseMonitor';

const KEEP_AWAKE_TAG = 'silence-game';

export type GamePhase = 'countdown' | 'playing' | 'caught' | 'out' | 'paused' | 'over';

export type Outcome = {
  // timeUp: silence held until the end. noise: the team woke the owl. lastStanding: one player left.
  kind: 'timeUp' | 'noise' | 'lastStanding';
  winners: Player[];
  silentMs: number;
  newRecord: boolean;
};

export function useSilenceGame(settings: Settings, recordMs: number, onRecord: (ms: number) => void) {
  const durationMs = settings.minutes * 60_000;
  const elimination = isElimination(settings.players);
  const { start: startMonitor, stop: stopMonitor, level, countdown } = useNoiseMonitor();
  const buzzer = useAudioPlayer(require('../assets/sounds/eliminated.wav'));
  const fanfare = useAudioPlayer(require('../assets/sounds/win.wav'));

  const [phase, setPhase] = useState<GamePhase>('countdown');
  const [alive, setAlive] = useState(settings.players);
  const [lastOut, setLastOut] = useState<Player | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [micProblem, setMicProblem] = useState<Exclude<StartResult, 'ok' | 'cancelled'> | null>(null);

  // Silence banked before the current listening stretch; the clock only runs while listening.
  const banked = useRef(0);
  const stretchStart = useRef(0);

  const say = useCallback(
    (text: string) => {
      if (!settings.speakNames) return;
      Speech.stop();
      Speech.speak(text, { language: speechLanguage });
    },
    [settings.speakNames],
  );

  const bank = useCallback(() => {
    banked.current = Math.min(durationMs, banked.current + Date.now() - stretchStart.current);
    setElapsed(banked.current);
  }, [durationMs]);

  const finish = useCallback(
    (kind: Outcome['kind'], winners: Player[]) => {
      const silentMs = banked.current;
      const newRecord = silentMs > recordMs && silentMs >= 10_000;
      if (newRecord) onRecord(silentMs);
      setOutcome({ kind, winners, silentMs, newRecord });
      setPhase('over');
      if (kind !== 'noise') {
        fanfare.seekTo(0);
        fanfare.play();
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success).catch(() => {});
      }
    },
    [fanfare, onRecord, recordMs],
  );

  const onNoise = useCallback(() => {
    bank();
    buzzer.seekTo(0);
    buzzer.play();
    Vibration.vibrate(400);
    if (elimination) setPhase('caught');
    else finish('noise', []);
  }, [bank, buzzer, elimination, finish]);

  const listen = useCallback(() => {
    setPhase('countdown');
    startMonitor({
      sensitivity: settings.sensitivity,
      onReady: () => {
        stretchStart.current = Date.now();
        setPhase('playing');
      },
      onNoise,
    }).then((result) => {
      if (result === 'denied' || result === 'error') setMicProblem(result);
    });
  }, [onNoise, settings.sensitivity, startMonitor]);

  // Start listening as soon as the game screen opens.
  const started = useRef(false);
  useEffect(() => {
    if (started.current) return;
    started.current = true;
    listen();
  }, [listen]);

  useEffect(() => {
    if (phase !== 'playing') return;
    const id = setInterval(() => {
      const total = banked.current + Date.now() - stretchStart.current;
      if (total < durationMs) {
        setElapsed(total);
        return;
      }
      stopMonitor();
      banked.current = durationMs;
      setElapsed(durationMs);
      finish('timeUp', alive);
      if (elimination) say(t.winner(alive.map((p) => p.name)));
    }, 200);
    return () => clearInterval(id);
  }, [alive, durationMs, elimination, finish, phase, say, stopMonitor]);

  const blame = useCallback(
    (player: Player) => {
      const left = alive.filter((p) => p.id !== player.id);
      setAlive(left);
      setLastOut(player);
      if (left.length <= 1) {
        finish('lastStanding', left);
        say(`${t.out(player.name)} ${t.winner(left.map((p) => p.name))}`);
      } else {
        setPhase('out');
        say(t.out(player.name));
      }
    },
    [alive, finish, say],
  );

  const pause = useCallback(() => {
    if (phase === 'playing') bank();
    stopMonitor();
    setPhase('paused');
  }, [bank, phase, stopMonitor]);

  // The microphone stops in the background, so leaving the app pauses the game.
  useEffect(() => {
    if (phase !== 'playing' && phase !== 'countdown') return;
    const sub = AppState.addEventListener('change', (state) => {
      if (state !== 'active') pause();
    });
    return () => sub.remove();
  }, [pause, phase]);

  useEffect(() => {
    if (phase === 'over') return;
    // Best effort: browsers can deny the wake lock, and the game should run anyway.
    activateKeepAwakeAsync(KEEP_AWAKE_TAG).catch(() => {});
    return () => {
      deactivateKeepAwake(KEEP_AWAKE_TAG).catch(() => {});
    };
  }, [phase]);

  useEffect(
    () => () => {
      stopMonitor();
      Speech.stop();
    },
    [stopMonitor],
  );

  return {
    phase,
    elimination,
    alive,
    lastOut,
    outcome,
    micProblem,
    remainingMs: durationMs - elapsed,
    progress: elapsed / durationMs,
    level: phase === 'caught' ? 1 : level,
    countdown,
    blame,
    resume: listen,
    pause,
  };
}

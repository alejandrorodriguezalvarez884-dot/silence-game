export type Player = {
  id: string;
  name: string;
  color: string;
};

export type Sensitivity = 'low' | 'medium' | 'high';

export type Settings = {
  players: Player[];
  minutes: number;
  sensitivity: Sensitivity;
  speakNames: boolean;
};

export const MAX_PLAYERS = 8;
export const MAX_NAME_LENGTH = 14;
export const MINUTE_OPTIONS = [1, 3, 5, 10];

export const DEFAULT_SETTINGS: Settings = {
  players: [],
  minutes: 3,
  sensitivity: 'medium',
  speakNames: true,
};

// How far above the calibrated background noise (in dB) a sound has to rise, and for how many
// consecutive 100 ms samples, before it counts. Car engines hum; a giggle spikes.
export const SENSITIVITY: Record<Sensitivity, { marginDb: number; samples: number }> = {
  high: { marginDb: 7, samples: 1 },
  medium: { marginDb: 11, samples: 2 },
  low: { marginDb: 16, samples: 3 },
};

// With fewer than two names everyone plays as a team against the clock.
export const isElimination = (players: Player[]) => players.length >= 2;

export function formatTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

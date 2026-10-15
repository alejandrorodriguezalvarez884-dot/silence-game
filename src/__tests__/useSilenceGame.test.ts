import { act, renderHook } from '@testing-library/react-native';
import { AppState, type AppStateStatus } from 'react-native';

import { DEFAULT_SETTINGS, type Player, type Settings } from '../game';
import { useSilenceGame } from '../useSilenceGame';

// The real monitor needs a microphone; this one lets the test decide when the owl is ready or hears noise.
const mockMonitor = {
  start: jest.fn(),
  stop: jest.fn(() => Promise.resolve()),
  callbacks: null as null | { onReady: () => void; onNoise: () => void },
};

jest.mock('../useNoiseMonitor', () => ({
  useNoiseMonitor: () => ({
    level: 0,
    countdown: 3,
    phase: 'idle',
    start: (options: { onReady: () => void; onNoise: () => void }) => {
      mockMonitor.callbacks = options;
      return mockMonitor.start(options);
    },
    stop: mockMonitor.stop,
  }),
}));

jest.mock('expo-audio', () => ({
  useAudioPlayer: () => ({ play: jest.fn(), seekTo: jest.fn() }),
}));

jest.mock('expo-speech', () => ({ speak: jest.fn(), stop: jest.fn() }));

const players: Player[] = [
  { id: 'a', name: 'Ana', color: '#F472B6' },
  { id: 'b', name: 'Leo', color: '#60A5FA' },
  { id: 'c', name: 'Sara', color: '#34D399' },
];

async function setup(settings: Partial<Settings> = {}, recordMs = 0) {
  const onRecord = jest.fn();
  const hook = await renderHook(() => useSilenceGame({ ...DEFAULT_SETTINGS, ...settings }, recordMs, onRecord));
  return { ...hook, onRecord };
}

beforeEach(() => {
  jest.useFakeTimers();
  mockMonitor.start.mockReset().mockResolvedValue('ok');
  mockMonitor.callbacks = null;
});

afterEach(() => jest.useRealTimers());

const ready = () => act(() => mockMonitor.callbacks!.onReady());
const noise = () => act(() => mockMonitor.callbacks!.onNoise());

it('starts listening with a countdown', async () => {
  const { result } = await setup();
  expect(result.current.phase).toBe('countdown');
  expect(mockMonitor.start).toHaveBeenCalledTimes(1);
  await ready();
  expect(result.current.phase).toBe('playing');
});

it('team game: a noise ends the game', async () => {
  const { result, onRecord } = await setup({ minutes: 1 }, 5_000);
  await ready();
  await act(() => jest.advanceTimersByTime(20_000));
  await noise();
  expect(result.current.phase).toBe('over');
  expect(result.current.outcome).toMatchObject({ kind: 'noise', winners: [] });
  expect(result.current.outcome!.silentMs).toBeGreaterThanOrEqual(20_000);
  expect(result.current.outcome!.newRecord).toBe(true);
  expect(onRecord).toHaveBeenCalled();
});

it('team game: holding the silence until the end wins', async () => {
  const { result } = await setup({ minutes: 1 });
  await ready();
  await act(() => jest.advanceTimersByTime(61_000));
  expect(result.current.phase).toBe('over');
  expect(result.current.outcome).toMatchObject({ kind: 'timeUp', silentMs: 60_000 });
  expect(result.current.remainingMs).toBe(0);
});

it('elimination: asks who it was, then the last one standing wins', async () => {
  const { result } = await setup({ players });
  await ready();
  await noise();
  expect(result.current.phase).toBe('caught');

  await act(() => result.current.blame(players[0]));
  expect(result.current.phase).toBe('out');
  expect(result.current.alive.map((p) => p.name)).toEqual(['Leo', 'Sara']);

  await act(() => result.current.resume());
  expect(result.current.phase).toBe('countdown');
  await ready();
  await noise();
  await act(() => result.current.blame(players[2]));
  expect(result.current.phase).toBe('over');
  expect(result.current.outcome).toMatchObject({ kind: 'lastStanding', winners: [players[1]] });
});

it('elimination: a false alarm keeps everyone in', async () => {
  const { result } = await setup({ players });
  await ready();
  await noise();
  await act(() => result.current.resume());
  expect(result.current.phase).toBe('countdown');
  expect(result.current.alive).toHaveLength(3);
});

it('pausing stops the clock', async () => {
  const { result } = await setup({ minutes: 1 });
  await ready();
  await act(() => jest.advanceTimersByTime(10_000));
  await act(() => result.current.pause());
  expect(result.current.phase).toBe('paused');
  const left = result.current.remainingMs;
  await act(() => jest.advanceTimersByTime(30_000));
  expect(result.current.remainingMs).toBe(left);
  expect(mockMonitor.stop).toHaveBeenCalled();
});

it('reports a denied microphone', async () => {
  mockMonitor.start.mockResolvedValue('denied');
  const { result } = await setup();
  await act(async () => {});
  expect(result.current.micProblem).toBe('denied');
});

it('keeps playing through the permission prompt but pauses in the background', async () => {
  const listeners: ((state: AppStateStatus) => void)[] = [];
  jest.spyOn(AppState, 'addEventListener').mockImplementation((_type, listener) => {
    listeners.push(listener);
    return { remove: () => listeners.splice(listeners.indexOf(listener), 1) } as never;
  });
  const { result } = await setup();
  const emit = (state: AppStateStatus) => act(() => listeners.forEach((l) => l(state)));

  await emit('inactive');
  expect(result.current.phase).toBe('countdown');
  await ready();
  await emit('inactive');
  expect(result.current.phase).toBe('playing');
  await emit('background');
  expect(result.current.phase).toBe('paused');
});

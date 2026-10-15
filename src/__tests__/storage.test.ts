import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS } from '../game';
import { loadRecord, loadSettings, saveRecord, saveSettings } from '../storage';

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

beforeEach(() => AsyncStorage.clear());

it('returns defaults when nothing is saved', async () => {
  expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
  expect(await loadRecord()).toBe(0);
});

it('round-trips settings and the record', async () => {
  const settings = { ...DEFAULT_SETTINGS, minutes: 10, players: [{ id: '1', name: 'Ana', color: '#F472B6' }] };
  saveSettings(settings);
  saveRecord(83_456.7);
  await flush();
  expect(await loadSettings()).toEqual(settings);
  expect(await loadRecord()).toBe(83_457);
});

it('fills in settings added after the data was saved', async () => {
  await AsyncStorage.setItem('settings.v1', JSON.stringify({ minutes: 5 }));
  expect(await loadSettings()).toEqual({ ...DEFAULT_SETTINGS, minutes: 5 });
});

it('ignores corrupt data', async () => {
  await AsyncStorage.setItem('settings.v1', '{not json');
  expect(await loadSettings()).toEqual(DEFAULT_SETTINGS);
});

import AsyncStorage from '@react-native-async-storage/async-storage';

import { DEFAULT_SETTINGS, type Settings } from './game';

const SETTINGS_KEY = 'settings.v1';
const RECORD_KEY = 'record.v1';

// Storage is a convenience (names survive between trips), so failures fall back to defaults.
export async function loadSettings(): Promise<Settings> {
  try {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return raw ? { ...DEFAULT_SETTINGS, ...JSON.parse(raw) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveSettings(settings: Settings) {
  AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)).catch(() => {});
}

export async function loadRecord(): Promise<number> {
  try {
    return Number(await AsyncStorage.getItem(RECORD_KEY)) || 0;
  } catch {
    return 0;
  }
}

export function saveRecord(ms: number) {
  AsyncStorage.setItem(RECORD_KEY, String(Math.round(ms))).catch(() => {});
}

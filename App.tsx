import { useCallback, useEffect, useState } from 'react';
import { Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold, useFonts } from '@expo-google-fonts/fredoka';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { NightSky } from './src/components/NightSky';
import { DEFAULT_SETTINGS, type Settings } from './src/game';
import { GameScreen } from './src/screens/GameScreen';
import { SetupScreen } from './src/screens/SetupScreen';
import { loadRecord, loadSettings, saveRecord, saveSettings } from './src/storage';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [fontsLoaded, fontError] = useFonts({ Fredoka_400Regular, Fredoka_500Medium, Fredoka_600SemiBold, Fredoka_700Bold });
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);
  const [recordMs, setRecordMs] = useState(0);
  const [loaded, setLoaded] = useState(false);
  // Each game gets a fresh key so "play again" starts from a clean state.
  const [game, setGame] = useState<number | null>(null);

  useEffect(() => {
    Promise.all([loadSettings(), loadRecord()]).then(([s, r]) => {
      setSettings(s);
      setRecordMs(r);
      setLoaded(true);
    });
  }, []);

  const ready = loaded && (fontsLoaded || !!fontError);
  useEffect(() => {
    if (ready) SplashScreen.hideAsync().catch(() => {});
  }, [ready]);

  const changeSettings = useCallback((next: Settings) => {
    setSettings(next);
    saveSettings(next);
  }, []);

  const updateRecord = useCallback((ms: number) => {
    setRecordMs(ms);
    saveRecord(ms);
  }, []);

  if (!ready) return null;

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NightSky />
      {game === null ? (
        <SetupScreen
          settings={settings}
          recordMs={recordMs}
          onChange={changeSettings}
          onStart={() => setGame(Date.now())}
        />
      ) : (
        <GameScreen
          key={game}
          settings={settings}
          recordMs={recordMs}
          onRecord={updateRecord}
          onPlayAgain={() => setGame(Date.now())}
          onExit={() => setGame(null)}
        />
      )}
    </SafeAreaProvider>
  );
}

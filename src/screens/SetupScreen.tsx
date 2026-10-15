import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Switch, Text, TextInput, View } from 'react-native';
import * as Haptics from 'expo-haptics';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Owl } from '../components/Owl';
import { Segmented } from '../components/Segmented';
import {
  MAX_NAME_LENGTH,
  MAX_PLAYERS,
  MINUTE_OPTIONS,
  formatTime,
  isElimination,
  type Sensitivity,
  type Settings,
} from '../game';
import { t } from '../i18n';
import { colors, fonts, playerColors } from '../theme';

type Props = {
  settings: Settings;
  recordMs: number;
  onChange: (settings: Settings) => void;
  onStart: () => void;
};

const SENSITIVITIES: Sensitivity[] = ['low', 'medium', 'high'];

export function SetupScreen({ settings, recordMs, onChange, onStart }: Props) {
  const [name, setName] = useState('');
  const { players } = settings;
  const trimmed = name.trim();
  const canAdd = trimmed.length > 0 && players.length < MAX_PLAYERS;

  const addPlayer = () => {
    if (!canAdd) return;
    Haptics.selectionAsync().catch(() => {});
    const used = new Set(players.map((p) => p.color));
    const color = playerColors.find((c) => !used.has(c)) ?? playerColors[players.length % playerColors.length];
    onChange({ ...settings, players: [...players, { id: `${Date.now()}`, name: trimmed, color }] });
    setName('');
  };

  const removePlayer = (id: string) => {
    Haptics.selectionAsync().catch(() => {});
    onChange({ ...settings, players: players.filter((p) => p.id !== id) });
  };

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom']}>
      <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.hero}>
            <View style={styles.moon} />
            <Owl size={130} mood="sleep" />
            <Text style={styles.title}>{t.title}</Text>
            <Text style={styles.subtitle}>{t.subtitle}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.playersTitle}</Text>
            <View style={styles.inputRow}>
              <TextInput
                value={name}
                onChangeText={setName}
                onSubmitEditing={addPlayer}
                placeholder={t.namePlaceholder}
                placeholderTextColor={colors.textFaint}
                maxLength={MAX_NAME_LENGTH}
                returnKeyType="done"
                submitBehavior="submit"
                autoCapitalize="words"
                autoCorrect={false}
                editable={players.length < MAX_PLAYERS}
                style={styles.input}
              />
              <Pressable
                onPress={addPlayer}
                disabled={!canAdd}
                accessibilityRole="button"
                style={[styles.addButton, !canAdd && styles.addDisabled]}
              >
                <Text style={styles.addLabel}>{t.add}</Text>
              </Pressable>
            </View>
            {players.length > 0 && (
              <View style={styles.chips}>
                {players.map((player) => (
                  <Pressable
                    key={player.id}
                    onPress={() => removePlayer(player.id)}
                    accessibilityRole="button"
                    accessibilityLabel={t.removePlayer(player.name)}
                    style={[styles.chip, { borderColor: player.color }]}
                  >
                    <Avatar player={player} size={28} />
                    <Text style={styles.chipName}>{player.name}</Text>
                    <Text style={styles.chipRemove}>×</Text>
                  </Pressable>
                ))}
              </View>
            )}
            <Text style={styles.hint}>{isElimination(players) ? t.eliminationHint : t.teamHint}</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.durationTitle}</Text>
            <Segmented
              options={MINUTE_OPTIONS.map((m) => ({ value: m, label: t.minutes(m) }))}
              value={settings.minutes}
              onChange={(minutes) => onChange({ ...settings, minutes })}
            />
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>{t.sensitivityTitle}</Text>
            <Segmented
              options={SENSITIVITIES.map((s) => ({ value: s, ...t.sensitivity[s] }))}
              value={settings.sensitivity}
              onChange={(sensitivity) => onChange({ ...settings, sensitivity })}
            />
            {isElimination(players) && (
              <View style={styles.switchRow}>
                <Text style={styles.switchLabel}>{t.speakNames}</Text>
                <Switch
                  value={settings.speakNames}
                  onValueChange={(speakNames) => onChange({ ...settings, speakNames })}
                  trackColor={{ true: colors.accentDeep, false: colors.track }}
                  thumbColor={colors.white}
                />
              </View>
            )}
          </View>

          {recordMs > 0 && <Text style={styles.record}>{t.record(formatTime(recordMs))}</Text>}
        </ScrollView>

        <View style={styles.footer}>
          <Button label={t.start} onPress={onStart} />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 14,
  },
  hero: {
    alignItems: 'center',
    paddingTop: 8,
    paddingBottom: 6,
  },
  moon: {
    position: 'absolute',
    top: 4,
    right: 24,
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: colors.moon,
    opacity: 0.9,
    shadowColor: colors.moon,
    shadowOpacity: 0.8,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 0 },
  },
  title: {
    color: colors.text,
    fontSize: 30,
    fontFamily: fonts.bold,
    textAlign: 'center',
    marginTop: 8,
  },
  subtitle: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.surfaceBorder,
    borderWidth: 1,
    borderRadius: 22,
    padding: 16,
    gap: 12,
  },
  cardTitle: {
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(0,0,0,0.25)',
    color: colors.text,
    fontSize: 17,
    fontFamily: fonts.medium,
  },
  addButton: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addDisabled: {
    opacity: 0.35,
  },
  addLabel: {
    color: '#3B2300',
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingLeft: 4,
    paddingRight: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1.5,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  chipName: {
    color: colors.text,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  chipRemove: {
    color: colors.textFaint,
    fontSize: 20,
    fontFamily: fonts.medium,
    marginTop: -2,
  },
  hint: {
    color: colors.textMuted,
    fontSize: 14,
    lineHeight: 19,
    fontFamily: fonts.regular,
  },
  switchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  switchLabel: {
    flex: 1,
    color: colors.textMuted,
    fontSize: 15,
    fontFamily: fonts.medium,
  },
  record: {
    color: colors.moon,
    fontSize: 15,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
});

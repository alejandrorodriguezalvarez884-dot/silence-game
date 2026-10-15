import { StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Owl } from '../components/Owl';
import { formatTime } from '../game';
import { t } from '../i18n';
import { colors, fonts } from '../theme';
import type { Outcome } from '../useSilenceGame';

type Props = {
  outcome: Outcome;
  elimination: boolean;
  onPlayAgain: () => void;
  onSettings: () => void;
};

export function ResultView({ outcome, elimination, onPlayAgain, onSettings }: Props) {
  const time = formatTime(outcome.silentMs);
  const lost = outcome.kind === 'noise';
  const names = outcome.winners.map((p) => p.name);

  const headline = elimination && names.length > 0 ? t.winner(names) : lost ? t.teamLose : t.teamWin;
  const detail = elimination ? t.winnerDetail(time) : lost ? t.teamLoseDetail(time) : t.teamWinDetail(time);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.content}>
        <Owl size={170} mood={lost ? 'caught' : 'happy'} />
        {elimination && (
          <View style={styles.winners}>
            {outcome.winners.map((player) => (
              <Avatar key={player.id} player={player} size={outcome.winners.length > 2 ? 52 : 72} />
            ))}
          </View>
        )}
        <Text style={[styles.headline, lost && { color: colors.danger }]}>{headline}</Text>
        <Text style={styles.detail}>{detail}</Text>
        {outcome.newRecord && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>★ {t.newRecord}</Text>
          </View>
        )}
      </View>
      <View style={styles.buttons}>
        <Button label={t.playAgain} onPress={onPlayAgain} />
        <Button label={t.settings} onPress={onSettings} variant="secondary" />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 14,
  },
  winners: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
  },
  headline: {
    color: colors.text,
    fontSize: 36,
    lineHeight: 42,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  detail: {
    color: colors.textMuted,
    fontSize: 19,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  badge: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(253,230,138,0.15)',
    borderWidth: 1.5,
    borderColor: colors.moon,
  },
  badgeText: {
    color: colors.moon,
    fontSize: 17,
    fontFamily: fonts.semibold,
  },
  buttons: {
    paddingHorizontal: 20,
    paddingBottom: 12,
    gap: 12,
  },
});

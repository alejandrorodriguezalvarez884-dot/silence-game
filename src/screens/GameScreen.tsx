import { Pressable, ScrollView, StyleSheet, Text, View, useWindowDimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { NoiseRing } from '../components/NoiseRing';
import { Owl } from '../components/Owl';
import { formatTime, type Settings } from '../game';
import { t } from '../i18n';
import { colors, fonts } from '../theme';
import { useSilenceGame } from '../useSilenceGame';
import { ResultView } from './ResultView';

type Props = {
  settings: Settings;
  recordMs: number;
  onRecord: (ms: number) => void;
  onPlayAgain: () => void;
  onExit: () => void;
};

export function GameScreen({ settings, recordMs, onRecord, onPlayAgain, onExit }: Props) {
  const game = useSilenceGame(settings, recordMs, onRecord);
  const { width } = useWindowDimensions();
  const ringSize = Math.min(width - 48, 340);

  if (game.micProblem) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <Owl size={140} mood="sleep" />
        <Text style={styles.message}>{game.micProblem === 'denied' ? t.micDenied : t.micError}</Text>
        <Button label={t.back} onPress={onExit} variant="secondary" style={styles.wide} />
      </SafeAreaView>
    );
  }

  if (game.phase === 'over' && game.outcome) {
    return (
      <ResultView
        outcome={game.outcome}
        elimination={game.elimination}
        onPlayAgain={onPlayAgain}
        onSettings={onExit}
      />
    );
  }

  if (game.phase === 'caught') {
    return (
      <SafeAreaView style={styles.safe}>
        <ScrollView contentContainerStyle={styles.panel}>
          <Owl size={150} mood="caught" />
          <Text style={[styles.headline, { color: colors.danger }]}>{t.caughtTitle}</Text>
          <Text style={styles.question}>{t.whoWasIt}</Text>
          <View style={styles.culprits}>
            {game.alive.map((player) => (
              <Pressable
                key={player.id}
                onPress={() => game.blame(player)}
                accessibilityRole="button"
                style={({ pressed }) => [
                  styles.culprit,
                  { borderColor: player.color, backgroundColor: `${player.color}22` },
                  pressed && styles.pressed,
                ]}
              >
                <Avatar player={player} size={44} />
                <Text style={styles.culpritName} numberOfLines={1}>
                  {player.name}
                </Text>
              </Pressable>
            ))}
          </View>
          <Button label={t.falseAlarm} onPress={game.resume} variant="secondary" style={styles.wide} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (game.phase === 'out' && game.lastOut) {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <Avatar player={game.lastOut} size={110} />
        <Text style={styles.headline}>{t.out(game.lastOut.name)}</Text>
        <Text style={styles.detail}>{t.playersLeft(game.alive.length)}</Text>
        <AliveRow game={game} />
        <Button label={t.continue} onPress={game.resume} style={styles.wide} />
      </SafeAreaView>
    );
  }

  if (game.phase === 'paused') {
    return (
      <SafeAreaView style={[styles.safe, styles.centered]}>
        <Owl size={140} mood="peek" open={0.5} />
        <Text style={styles.headline}>{t.pausedTitle}</Text>
        <Text style={styles.detail}>
          {formatTime(game.remainingMs)} {t.timeLeft}
        </Text>
        <View style={styles.buttons}>
          <Button label={t.resume} onPress={game.resume} />
          <Button label={t.end} onPress={onExit} variant="secondary" />
        </View>
      </SafeAreaView>
    );
  }

  const counting = game.phase === 'countdown';

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.topBar}>
        <Pressable onPress={game.pause} accessibilityRole="button" accessibilityLabel={t.pause} style={styles.pause}>
          <View style={styles.pauseBar} />
          <View style={styles.pauseBar} />
        </Pressable>
        {game.elimination && <Text style={styles.topText}>{t.playersLeft(game.alive.length)}</Text>}
      </View>

      <View style={styles.stage}>
        <Text style={styles.title}>{counting ? t.countdownTitle : game.level >= 0.5 ? t.wakingTitle : t.playingTitle}</Text>

        <NoiseRing size={ringSize} level={counting ? 0 : game.level}>
          <Owl size={ringSize * 0.56} mood={counting || game.level < 0.25 ? 'sleep' : 'peek'} open={game.level} />
        </NoiseRing>

        {counting ? (
          <View style={styles.clock}>
            <Text style={styles.countdown}>{game.countdown}</Text>
            <Text style={styles.clockCaption}>{t.countdownHint}</Text>
          </View>
        ) : (
          <View style={styles.clock}>
            <Text style={styles.time}>{formatTime(game.remainingMs)}</Text>
            <Text style={styles.clockCaption}>{t.timeLeft}</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${game.progress * 100}%` }]} />
            </View>
          </View>
        )}
      </View>

      {game.elimination && <AliveRow game={game} />}
    </SafeAreaView>
  );
}

function AliveRow({ game }: { game: ReturnType<typeof useSilenceGame> }) {
  return (
    <View style={styles.aliveRow}>
      {game.alive.map((player) => (
        <View key={player.id} style={styles.alive}>
          <Avatar player={player} size={40} />
          <Text style={styles.aliveName} numberOfLines={1}>
            {player.name}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  centered: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    gap: 16,
  },
  wide: {
    alignSelf: 'stretch',
  },
  message: {
    color: colors.text,
    fontSize: 18,
    lineHeight: 25,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    minHeight: 56,
  },
  pause: {
    width: 48,
    height: 48,
    borderRadius: 24,
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.surfaceBorder,
  },
  pauseBar: {
    width: 5,
    height: 16,
    borderRadius: 2,
    backgroundColor: colors.text,
  },
  topText: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  stage: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
    paddingHorizontal: 24,
  },
  title: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.semibold,
    textAlign: 'center',
  },
  clock: {
    alignItems: 'center',
    minHeight: 120,
  },
  countdown: {
    color: colors.moon,
    fontSize: 72,
    lineHeight: 80,
    fontFamily: fonts.bold,
  },
  time: {
    color: colors.text,
    fontSize: 64,
    lineHeight: 72,
    fontFamily: fonts.bold,
    fontVariant: ['tabular-nums'],
  },
  clockCaption: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: fonts.medium,
  },
  progressTrack: {
    width: 200,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.track,
    marginTop: 12,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.moon,
  },
  aliveRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 14,
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  alive: {
    alignItems: 'center',
    width: 64,
    gap: 4,
  },
  aliveName: {
    color: colors.textMuted,
    fontSize: 13,
    fontFamily: fonts.medium,
  },
  panel: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    gap: 14,
  },
  headline: {
    color: colors.text,
    fontSize: 36,
    fontFamily: fonts.bold,
    textAlign: 'center',
  },
  question: {
    color: colors.text,
    fontSize: 22,
    fontFamily: fonts.semibold,
  },
  detail: {
    color: colors.textMuted,
    fontSize: 18,
    fontFamily: fonts.medium,
    textAlign: 'center',
  },
  culprits: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    alignSelf: 'stretch',
  },
  culprit: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    padding: 10,
    borderRadius: 20,
    borderWidth: 2,
  },
  culpritName: {
    flex: 1,
    color: colors.text,
    fontSize: 18,
    fontFamily: fonts.semibold,
  },
  pressed: {
    opacity: 0.8,
    transform: [{ scale: 0.97 }],
  },
  buttons: {
    alignSelf: 'stretch',
    gap: 12,
    marginTop: 8,
  },
});

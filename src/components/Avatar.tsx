import { StyleSheet, Text, View } from 'react-native';

import type { Player } from '../game';
import { fonts } from '../theme';

export function Avatar({ player, size = 36, faded = false }: { player: Player; size?: number; faded?: boolean }) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2, backgroundColor: player.color },
        faded && styles.faded,
      ]}
    >
      <Text allowFontScaling={false} style={[styles.initial, { fontSize: size * 0.48 }]}>{player.name.charAt(0).toUpperCase()}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  faded: {
    opacity: 0.3,
  },
  initial: {
    color: '#1B1033',
    fontFamily: fonts.bold,
  },
});

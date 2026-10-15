import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

import { colors, levelColor } from '../theme';

type Props = {
  size: number;
  // Noise relative to the limit: 0 is calm, 1 wakes the owl.
  level: number;
  children: ReactNode;
};

const STROKE = 14;
const HALO = 34;

export function NoiseRing({ size, level, children }: Props) {
  const c = size / 2;
  const r = (size - HALO) / 2;
  const circumference = 2 * Math.PI * r;
  const shown = Math.max(0.02, Math.min(1, level));
  const color = levelColor(level);

  return (
    <View style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={StyleSheet.absoluteFill}>
        <Circle cx={c} cy={c} r={r} stroke={color} strokeWidth={HALO} opacity={0.06 + level * 0.2} fill="none" />
        <Circle cx={c} cy={c} r={r} stroke={colors.track} strokeWidth={STROKE} fill="rgba(0,0,0,0.18)" />
        <Circle
          cx={c}
          cy={c}
          r={r}
          stroke={color}
          strokeWidth={STROKE}
          strokeLinecap="round"
          fill="none"
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={circumference * (1 - shown)}
          transform={`rotate(-90 ${c} ${c})`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

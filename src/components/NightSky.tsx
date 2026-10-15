import { StyleSheet, useWindowDimensions } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

import { colors } from '../theme';

// Fixed pseudo-random stars so the sky looks the same on every render.
const STARS = Array.from({ length: 46 }, (_, i) => {
  const rand = (n: number) => {
    const x = Math.sin(i * 12.9898 + n * 78.233) * 43758.5453;
    return x - Math.floor(x);
  };
  return { x: rand(1), y: rand(2), r: 0.6 + rand(3) * 1.4, o: 0.25 + rand(4) * 0.6 };
});

export function NightSky() {
  const { width, height } = useWindowDimensions();
  return (
    <>
      <LinearGradient colors={[colors.backgroundTop, colors.backgroundBottom]} style={StyleSheet.absoluteFill} />
      <Svg width={width} height={height} style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
        {STARS.map((s, i) => (
          <Circle key={i} cx={s.x * width} cy={s.y * height * 0.75} r={s.r} fill={colors.white} opacity={s.o} />
        ))}
      </Svg>
    </>
  );
}

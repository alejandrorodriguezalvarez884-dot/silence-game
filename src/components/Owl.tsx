import { useEffect, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import Svg, { Circle, ClipPath, Defs, Ellipse, G, Line, LinearGradient, Path, Rect, Stop } from 'react-native-svg';

import { colors, fonts } from '../theme';

export type OwlMood = 'sleep' | 'peek' | 'caught' | 'happy';

type Props = {
  size: number;
  mood: OwlMood;
  // How far the eyes are open while peeking, 0 (shut) to 1 (wide open).
  open?: number;
};

const BODY = '#7C5A3A';
const BODY_DARK = '#5E4229';
const FACE = '#B98556';
const LID = '#8E6440';
const BELLY = '#F3D9B1';
const BELLY_MARK = '#D9B48A';
const ORANGE = '#F59E0B';
const INK = '#2A1A0C';
const EYE_R = 27;
const EYES = [72, 128];
const EYE_Y = 96;

export function Owl({ size, mood, open = 0 }: Props) {
  const openness = mood === 'caught' ? 1 : mood === 'peek' ? Math.min(1, Math.max(0, open)) : 0;
  const shocked = mood === 'caught';

  return (
    <View style={{ width: size, height: size * 1.1 }}>
      <Svg width={size} height={size * 1.1} viewBox="0 0 200 220">
        <Defs>
          <LinearGradient id="body" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={BODY} />
            <Stop offset="1" stopColor={BODY_DARK} />
          </LinearGradient>
          {EYES.map((cx) => (
            <ClipPath key={cx} id={`eye${cx}`}>
              <Circle cx={cx} cy={EYE_Y} r={EYE_R} />
            </ClipPath>
          ))}
        </Defs>

        {/* Ear tufts */}
        <Path d="M50 62 L36 16 L84 46 Z" fill={BODY_DARK} />
        <Path d="M150 62 L164 16 L116 46 Z" fill={BODY_DARK} />

        {/* Body, wings, belly */}
        <Ellipse cx={100} cy={124} rx={70} ry={84} fill="url(#body)" />
        <Ellipse cx={36} cy={142} rx={17} ry={46} fill={BODY_DARK} transform="rotate(12 36 142)" />
        <Ellipse cx={164} cy={142} rx={17} ry={46} fill={BODY_DARK} transform="rotate(-12 164 142)" />
        <Ellipse cx={100} cy={154} rx={46} ry={50} fill={BELLY} />
        {[
          [84, 136],
          [116, 136],
          [100, 152],
          [84, 168],
          [116, 168],
          [100, 184],
        ].map(([x, y]) => (
          <Path
            key={`${x}-${y}`}
            d={`M${x - 7} ${y} Q${x} ${y + 7} ${x + 7} ${y}`}
            stroke={BELLY_MARK}
            strokeWidth={3}
            strokeLinecap="round"
            fill="none"
          />
        ))}

        {/* Face disc */}
        <Circle cx={EYES[0]} cy={EYE_Y} r={36} fill={FACE} />
        <Circle cx={EYES[1]} cy={EYE_Y} r={36} fill={FACE} />

        {EYES.map((cx) => (
          <Eye key={cx} cx={cx} openness={openness} shocked={shocked} happy={mood === 'happy'} />
        ))}

        {shocked && (
          <G stroke={INK} strokeWidth={5} strokeLinecap="round">
            <Line x1={50} y1={56} x2={86} y2={66} />
            <Line x1={150} y1={56} x2={114} y2={66} />
          </G>
        )}
        {(shocked || mood === 'happy') && (
          <G fill="#F9A8D4" opacity={0.7}>
            <Ellipse cx={46} cy={124} rx={10} ry={6} />
            <Ellipse cx={154} cy={124} rx={10} ry={6} />
          </G>
        )}

        {/* Beak and feet */}
        <Path d="M91 114 L109 114 L100 131 Z" fill={ORANGE} />
        {[78, 122].map((x) => (
          <G key={x} fill={ORANGE}>
            <Ellipse cx={x - 8} cy={206} rx={5} ry={7} />
            <Ellipse cx={x} cy={208} rx={5} ry={7} />
            <Ellipse cx={x + 8} cy={206} rx={5} ry={7} />
          </G>
        ))}
      </Svg>
      {mood === 'sleep' && <Snore size={size} />}
    </View>
  );
}

function Eye({ cx, openness, shocked, happy }: { cx: number; openness: number; shocked: boolean; happy: boolean }) {
  if (happy) {
    return (
      <Path
        d={`M${cx - 17} ${EYE_Y + 6} Q${cx} ${EYE_Y - 12} ${cx + 17} ${EYE_Y + 6}`}
        stroke={INK}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  if (openness < 0.06) {
    return (
      <Path
        d={`M${cx - 17} ${EYE_Y + 2} Q${cx} ${EYE_Y + 13} ${cx + 17} ${EYE_Y + 2}`}
        stroke={INK}
        strokeWidth={5}
        strokeLinecap="round"
        fill="none"
      />
    );
  }
  const lidBottom = EYE_Y - EYE_R + 2 * EYE_R * (1 - openness);
  return (
    <G>
      <Circle cx={cx} cy={EYE_Y} r={EYE_R} fill="#FFF7E0" />
      <Circle cx={cx} cy={EYE_Y} r={18} fill={ORANGE} />
      <Circle cx={cx} cy={EYE_Y} r={shocked ? 6 : 10} fill={INK} />
      <Circle cx={cx + 6} cy={EYE_Y - 7} r={4} fill={colors.white} />
      <G clipPath={`url(#eye${cx})`}>
        <Rect x={cx - EYE_R} y={EYE_Y - EYE_R} width={EYE_R * 2} height={lidBottom - (EYE_Y - EYE_R)} fill={LID} />
        <Line x1={cx - EYE_R} y1={lidBottom} x2={cx + EYE_R} y2={lidBottom} stroke={INK} strokeWidth={4} />
      </G>
    </G>
  );
}

// Three "z" floating up from the owl's head, one after another.
function Snore({ size }: { size: number }) {
  const [t] = useState(() => new Animated.Value(0));

  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(t, { toValue: 1, duration: 2400, easing: Easing.linear, useNativeDriver: true }),
    );
    loop.start();
    return () => loop.stop();
  }, [t]);

  return (
    <View style={[StyleSheet.absoluteFill, { pointerEvents: 'none' }]}>
      {[0, 1, 2].map((i) => {
        const shifted = Animated.modulo(Animated.add(t, i / 3), 1);
        return (
          <Animated.Text
            key={i}
            allowFontScaling={false}
            style={[
              styles.z,
              {
                fontSize: size * (0.1 + i * 0.03),
                left: size * 0.78,
                top: size * 0.12,
                opacity: shifted.interpolate({ inputRange: [0, 0.2, 0.8, 1], outputRange: [0, 1, 1, 0] }),
                transform: [
                  { translateX: shifted.interpolate({ inputRange: [0, 1], outputRange: [0, size * 0.18] }) },
                  { translateY: shifted.interpolate({ inputRange: [0, 1], outputRange: [0, -size * 0.3] }) },
                ],
              },
            ]}
          >
            z
          </Animated.Text>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  z: {
    position: 'absolute',
    color: colors.moon,
    fontFamily: fonts.bold,
  },
});

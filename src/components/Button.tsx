import { Pressable, StyleSheet, Text, type StyleProp, type ViewStyle } from 'react-native';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import { colors, fonts } from '../theme';

type Props = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  // Tint for secondary buttons, e.g. a player's color.
  color?: string;
  style?: StyleProp<ViewStyle>;
};

export function Button({ label, onPress, variant = 'primary', color, style }: Props) {
  const press = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    onPress();
  };

  if (variant === 'secondary') {
    return (
      <Pressable
        onPress={press}
        accessibilityRole="button"
        style={({ pressed }) => [
          styles.base,
          styles.secondary,
          color && { borderColor: color, backgroundColor: `${color}22` },
          pressed && styles.pressed,
          style,
        ]}
      >
        <Text style={[styles.label, styles.secondaryLabel]}>{label}</Text>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={press}
      accessibilityRole="button"
      style={({ pressed }) => [styles.shadow, pressed && styles.pressed, style]}
    >
      <LinearGradient
        colors={[colors.moon, colors.accentDeep]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.base}
      >
        <Text style={[styles.label, styles.primaryLabel]}>{label}</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 58,
    borderRadius: 29,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  shadow: {
    borderRadius: 29,
    shadowColor: colors.accent,
    shadowOpacity: 0.45,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: colors.surfaceBorder,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.97 }],
  },
  label: {
    fontSize: 20,
    fontFamily: fonts.semibold,
  },
  primaryLabel: {
    color: '#3B2300',
  },
  secondaryLabel: {
    color: colors.text,
  },
});

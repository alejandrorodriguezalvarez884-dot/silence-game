import { Pressable, StyleSheet, Text, View } from 'react-native';
import * as Haptics from 'expo-haptics';

import { colors, fonts, textScale } from '../theme';

type Option<T> = { value: T; label: string; caption?: string };

type Props<T> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function Segmented<T extends string | number>({ options, value, onChange }: Props<T>) {
  return (
    <View style={styles.row} accessibilityRole="radiogroup">
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            onPress={() => {
              if (selected) return;
              Haptics.selectionAsync().catch(() => {});
              onChange(option.value);
            }}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.option, selected && styles.selected]}
          >
            <Text maxFontSizeMultiplier={textScale.body} style={[styles.label, selected && styles.selectedLabel]}>{option.label}</Text>
            {option.caption && (
              <Text maxFontSizeMultiplier={textScale.body} style={[styles.caption, selected && styles.selectedCaption]}>{option.caption}</Text>
            )}
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: 8,
  },
  option: {
    flex: 1,
    minHeight: 48,
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  selected: {
    backgroundColor: 'rgba(251,191,36,0.16)',
    borderColor: colors.accent,
  },
  label: {
    color: colors.textMuted,
    fontSize: 16,
    fontFamily: fonts.semibold,
  },
  selectedLabel: {
    color: colors.text,
  },
  caption: {
    color: colors.textFaint,
    fontSize: 11,
    fontFamily: fonts.regular,
    textAlign: 'center',
    marginTop: 2,
  },
  selectedCaption: {
    color: colors.textMuted,
  },
});

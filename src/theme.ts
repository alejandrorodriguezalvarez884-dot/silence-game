export const colors = {
  backgroundTop: '#1E1B4B',
  backgroundBottom: '#0B0820',
  surface: 'rgba(255,255,255,0.07)',
  surfaceBorder: 'rgba(255,255,255,0.12)',
  track: 'rgba(255,255,255,0.10)',
  text: '#F5F3FF',
  textMuted: '#B4AEDB',
  textFaint: '#7A73A6',
  moon: '#FDE68A',
  accent: '#FBBF24',
  accentDeep: '#F59E0B',
  calm: '#4ADE80',
  warn: '#FBBF24',
  danger: '#F87171',
  white: '#FFFFFF',
};

export const fonts = {
  regular: 'Fredoka_400Regular',
  medium: 'Fredoka_500Medium',
  semibold: 'Fredoka_600SemiBold',
  bold: 'Fredoka_700Bold',
};

// One color per player seat, in the order they are added.
export const playerColors = ['#F472B6', '#60A5FA', '#34D399', '#FBBF24', '#A78BFA', '#FB923C', '#22D3EE', '#F87171'];

// Green while calm, amber when it gets close, red at the threshold.
export function levelColor(level: number) {
  if (level < 0.5) return colors.calm;
  if (level < 0.85) return colors.warn;
  return colors.danger;
}

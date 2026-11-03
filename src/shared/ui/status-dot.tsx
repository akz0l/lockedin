import { View } from 'react-native';

import { type ColorRole, useTheme } from '@/shared/theme';

export type StatusTone = Extract<ColorRole, 'success' | 'warning' | 'danger' | 'muted'>;

/** Decorative: the adjacent text always states the same status. */
export function StatusDot({ tone, size = 8 }: { tone: StatusTone; size?: number }) {
  const { colors } = useTheme();
  return (
    <View
      aria-hidden
      importantForAccessibility="no"
      style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: colors[tone] }}
    />
  );
}

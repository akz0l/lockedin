import { ActivityIndicator, Pressable, StyleSheet } from 'react-native';

import { minTouchTarget, radius, space, useTheme } from '@/shared/theme';

import { AppText } from './app-text';

type ButtonProps = {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'plain';
  disabled?: boolean;
  loading?: boolean;
  hint?: string;
};

export function Button({ label, onPress, variant = 'primary', disabled, loading, hint }: ButtonProps) {
  const { colors } = useTheme();
  const inactive = disabled || loading;
  const isPrimary = variant === 'primary';
  const labelColor = inactive ? 'textDisabled' : isPrimary ? 'onInk' : 'text';

  return (
    <Pressable
      role="button"
      aria-label={label}
      aria-disabled={inactive}
      aria-busy={loading}
      accessibilityHint={hint}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        isPrimary && { backgroundColor: inactive ? colors.hairline : colors.ink },
        variant === 'secondary' && {
          backgroundColor: pressed ? colors.pressed : colors.surface,
          borderColor: colors.hairline,
          borderWidth: StyleSheet.hairlineWidth,
        },
        isPrimary && pressed && styles.pressedPrimary,
        variant === 'plain' && pressed && { backgroundColor: colors.pressed },
      ]}>
      {loading ? (
        <ActivityIndicator color={colors[labelColor]} />
      ) : (
        <AppText variant="headline" color={labelColor}>
          {label}
        </AppText>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: minTouchTarget + 4,
    paddingHorizontal: space.xl,
    borderRadius: radius.card,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressedPrimary: { opacity: 0.82 },
});

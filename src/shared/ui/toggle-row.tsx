import { StyleSheet, Switch, View } from 'react-native';

import { minTouchTarget, space, useTheme } from '@/shared/theme';

import { AppText } from './app-text';

type ToggleRowProps = {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function ToggleRow({ label, description, value, onValueChange, disabled }: ToggleRowProps) {
  const { colors } = useTheme();

  return (
    <View style={styles.row}>
      <View style={styles.text}>
        <AppText color={disabled ? 'textDisabled' : 'text'}>{label}</AppText>
        {description ? (
          <AppText variant="footnote" color="textSecondary">
            {description}
          </AppText>
        ) : null}
      </View>
      <Switch
        aria-label={label}
        aria-disabled={disabled}
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ true: colors.ink, false: colors.hairline }}
        thumbColor={colors.surface}
        ios_backgroundColor={colors.hairline}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
    paddingVertical: space.md,
  },
  text: { flex: 1, gap: 2 },
});

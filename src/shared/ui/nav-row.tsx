import { SymbolView } from 'expo-symbols';
import { Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, space, useTheme } from '@/shared/theme';

import { AppText } from './app-text';

type NavRowProps = {
  label: string;
  value?: string;
  onPress: () => void;
  disabled?: boolean;
};

export function NavRow({ label, value, onPress, disabled }: NavRowProps) {
  const { colors } = useTheme();

  return (
    <Pressable
      role="button"
      aria-label={value ? `${label}, ${value}` : label}
      aria-disabled={disabled}
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.pressed }]}>
      <AppText style={styles.label} color={disabled ? 'textDisabled' : 'text'}>
        {label}
      </AppText>
      <View style={styles.trailing}>
        {value ? <AppText color="textSecondary">{value}</AppText> : null}
        <SymbolView
          name={{ ios: 'chevron.right', android: 'chevron_right' }}
          size={14}
          weight="semibold"
          tintColor={colors.textSecondary}
        />
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    minHeight: minTouchTarget + 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: space.md,
    paddingHorizontal: space.lg,
  },
  label: { flex: 1 },
  trailing: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});

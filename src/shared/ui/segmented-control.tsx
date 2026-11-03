import { Pressable, StyleSheet, View } from 'react-native';

import { haptics } from '@/shared/feedback/haptics';
import { minTouchTarget, radius, useTheme } from '@/shared/theme';

import { AppText } from './app-text';

export type SegmentOption<T extends string> = { value: T; label: string };

type SegmentedControlProps<T extends string> = {
  label: string;
  options: readonly SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  disabled?: boolean;
};

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  disabled,
}: SegmentedControlProps<T>) {
  const { colors } = useTheme();

  return (
    <View
      role="radiogroup"
      aria-label={label}
      style={[styles.track, { backgroundColor: colors.pressed }]}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            role="radio"
            aria-label={option.label}
            aria-checked={selected}
            aria-disabled={disabled}
            disabled={disabled}
            onPress={() => {
              if (!selected) haptics.selection();
              onChange(option.value);
            }}
            style={[
              styles.segment,
              selected && {
                backgroundColor: colors.surface,
                borderColor: colors.hairline,
                borderWidth: StyleSheet.hairlineWidth,
              },
            ]}>
            <AppText variant="callout" color={selected ? 'text' : 'textSecondary'} style={selected && styles.selected}>
              {option.label}
            </AppText>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: { flexDirection: 'row', borderRadius: radius.control, padding: 3, gap: 3 },
  segment: {
    flex: 1,
    minHeight: minTouchTarget - 6,
    borderRadius: radius.control - 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selected: { fontWeight: '600' },
});

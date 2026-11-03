import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { useFocus } from '@/app-composition';
import { MAX_DURATION_MINUTES, MIN_DURATION_MINUTES } from '@/focus-session/domain';
import { minTouchTarget, space, useTheme } from '@/shared/theme';
import { AppText, Button } from '@/shared/ui';

import { formatMinutes } from './format';

const STEP = 5;

export function CustomDurationScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const current = useFocus((state) => state.preferences.durationMinutes);
  const setDuration = useFocus((state) => state.setDuration);
  const [minutes, setMinutes] = useState(current);

  const change = (delta: number) =>
    setMinutes((value) => Math.min(MAX_DURATION_MINUTES, Math.max(MIN_DURATION_MINUTES, value + delta)));

  const stepper = (delta: number, label: string, icon: { ios: 'minus' | 'plus'; android: 'remove' | 'add' }) => {
    const disabled = delta < 0 ? minutes <= MIN_DURATION_MINUTES : minutes >= MAX_DURATION_MINUTES;
    return (
      <Pressable
        role="button"
        aria-label={label}
        aria-disabled={disabled}
        disabled={disabled}
        onPress={() => change(delta)}
        style={({ pressed }) => [
          styles.stepper,
          { borderColor: colors.hairline, backgroundColor: pressed ? colors.pressed : colors.surface },
        ]}>
        <SymbolView name={icon} size={20} tintColor={disabled ? colors.textDisabled : colors.text} />
      </Pressable>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {stepper(-STEP, `Decrease by ${STEP} minutes`, { ios: 'minus', android: 'remove' })}
        <AppText variant="title" tabular role="status" style={styles.value}>
          {formatMinutes(minutes)}
        </AppText>
        {stepper(STEP, `Increase by ${STEP} minutes`, { ios: 'plus', android: 'add' })}
      </View>
      <AppText variant="footnote" color="textSecondary" style={styles.hint}>
        From {MIN_DURATION_MINUTES} minutes to {formatMinutes(MAX_DURATION_MINUTES)}.
      </AppText>
      <Button
        label="Set duration"
        onPress={() => {
          setDuration(minutes);
          router.back();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: space.xl, gap: space.xl },
  row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: space.lg },
  value: { flex: 1, textAlign: 'center' },
  stepper: {
    width: minTouchTarget + 8,
    height: minTouchTarget + 8,
    borderRadius: (minTouchTarget + 8) / 2,
    borderWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
    justifyContent: 'center',
  },
  hint: { textAlign: 'center' },
});

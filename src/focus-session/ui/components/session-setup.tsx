import { StyleSheet, View } from 'react-native';

import { type BlockLevel, DURATION_PRESETS } from '@/focus-session/domain';
import { space } from '@/shared/theme';
import { AppText, SegmentedControl } from '@/shared/ui';

import { formatCountdown, formatMinutes } from '../format';
import { LEVEL_CONSEQUENCE, LEVEL_OPTIONS } from './level-copy';

type DurationChoice = '25' | '50' | '90' | 'custom';

type SessionSetupProps = {
  durationMinutes: number;
  level: BlockLevel;
  onPresetDuration: (minutes: number) => void;
  onCustomDuration: () => void;
  onLevel: (level: BlockLevel) => void;
};

export function SessionSetup({ durationMinutes, level, onPresetDuration, onCustomDuration, onLevel }: SessionSetupProps) {
  const isPreset = (DURATION_PRESETS as readonly number[]).includes(durationMinutes);
  const durationOptions = [
    ...DURATION_PRESETS.map((minutes) => ({ value: String(minutes) as DurationChoice, label: String(minutes) })),
    { value: 'custom' as const, label: isPreset ? 'Custom' : formatMinutes(durationMinutes) },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <AppText variant="display" tabular aria-label={`Duration ${formatMinutes(durationMinutes)}`}>
          {formatCountdown(durationMinutes * 60_000)}
        </AppText>
        <SegmentedControl
          label="Duration in minutes"
          options={durationOptions}
          value={isPreset ? (String(durationMinutes) as DurationChoice) : 'custom'}
          onChange={(choice) => (choice === 'custom' ? onCustomDuration() : onPresetDuration(Number(choice)))}
        />
      </View>

      <View style={styles.block}>
        <AppText variant="headline">Block level</AppText>
        <SegmentedControl label="Block level" options={LEVEL_OPTIONS} value={level} onChange={onLevel} />
        <AppText variant="footnote" color="textSecondary">
          {LEVEL_CONSEQUENCE[level]}
        </AppText>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: space.xxl },
  block: { gap: space.md },
});

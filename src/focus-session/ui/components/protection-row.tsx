import { Pressable, StyleSheet, View } from 'react-native';

import { minTouchTarget, space, useTheme } from '@/shared/theme';
import { AppText, StatusDot, type StatusTone } from '@/shared/ui';

type ProtectionRowProps = {
  tone: StatusTone;
  text: string;
  action?: { label: string; onPress: () => void };
};

/** One line of state: a dot and a sentence, with an optional fix. */
export function ProtectionRow({ tone, text, action }: ProtectionRowProps) {
  const { colors } = useTheme();
  const content = (
    <>
      <StatusDot tone={tone} />
      <AppText variant="callout" color="textSecondary" style={styles.text}>
        {text}
      </AppText>
      {action ? (
        <AppText variant="callout" style={styles.action}>
          {action.label}
        </AppText>
      ) : null}
    </>
  );

  if (!action) return <View style={styles.row}>{content}</View>;
  return (
    <Pressable
      role="button"
      aria-label={`${text}. ${action.label}`}
      onPress={action.onPress}
      style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.pressed }]}>
      {content}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: space.sm, minHeight: minTouchTarget, borderRadius: 8 },
  text: { flex: 1 },
  action: { fontWeight: '600' },
});

import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useFocus } from '@/app-composition';
import { isActive, remainingFraction } from '@/focus-session/domain';
import { useTheme } from '@/shared/theme';

import { useNow } from './use-now';

/** 2px line along the top edge that drains as the session runs. Visible on every screen. */
export function LockLine() {
  const session = useFocus((state) => state.session);
  const now = useNow(session !== null, 5000);
  const { colors } = useTheme();
  const { top } = useSafeAreaInsets();

  if (!session || !isActive(session, now)) return null;

  return (
    <View pointerEvents="none" aria-hidden style={[styles.track, { top }]}>
      <View style={[styles.fill, { width: `${remainingFraction(session, now) * 100}%`, backgroundColor: colors.ink }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: { position: 'absolute', left: 0, right: 0, height: 2 },
  fill: { height: 2 },
});

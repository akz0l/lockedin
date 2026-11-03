import { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, TextInput, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import type { InstalledApp } from '@/app-blocking/domain';
import { useBlocker, useFocus } from '@/app-composition';
import { isActive } from '@/focus-session/domain';
import { useNow } from '@/focus-session/ui/use-now';
import { minTouchTarget, radius, space, type as typeScale, useTheme } from '@/shared/theme';
import { AppText, Button, ToggleRow } from '@/shared/ui';

type LoadState = { kind: 'loading' } | { kind: 'error' } | { kind: 'ready'; apps: InstalledApp[] };

export function BlockedAppsScreen() {
  const blocker = useBlocker();
  const { colors } = useTheme();
  const { blockedPackages, session, setBlockedPackages } = useFocus(
    useShallow(({ preferences, session, setBlockedPackages }) => ({
      blockedPackages: preferences.blockedPackages,
      session,
      setBlockedPackages,
    })),
  );
  const [state, setState] = useState<LoadState>({ kind: 'loading' });
  const [query, setQuery] = useState('');
  const now = useNow(session !== null);
  const locked = session !== null && isActive(session, now);

  const fetchApps = useCallback(() => {
    blocker.listLaunchableApps().then(
      (apps) => setState({ kind: 'ready', apps }),
      () => setState({ kind: 'error' }),
    );
  }, [blocker]);

  useEffect(() => {
    fetchApps();
  }, [fetchApps]);

  const retry = () => {
    setState({ kind: 'loading' });
    fetchApps();
  };

  const visible = useMemo(() => {
    if (state.kind !== 'ready') return [];
    const needle = query.trim().toLowerCase();
    return needle ? state.apps.filter((app) => app.label.toLowerCase().includes(needle)) : state.apps;
  }, [state, query]);

  const toggle = (packageName: string, blocked: boolean) =>
    setBlockedPackages(blocked ? [...blockedPackages, packageName] : blockedPackages.filter((p) => p !== packageName));

  if (state.kind === 'loading') {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={colors.textSecondary} aria-label="Loading apps" />
      </View>
    );
  }

  if (state.kind === 'error') {
    return (
      <View style={[styles.center, styles.gap]}>
        <AppText color="textSecondary">Couldn’t load your apps.</AppText>
        <Button variant="secondary" label="Try again" onPress={retry} />
      </View>
    );
  }

  return (
    <FlatList
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={styles.content}
      data={visible}
      keyExtractor={(app) => app.packageName}
      keyboardShouldPersistTaps="handled"
      ListHeaderComponent={
        <View style={styles.gap}>
          {locked ? (
            <AppText variant="footnote" color="textSecondary" role="status">
              Blocked apps can’t change during a session.
            </AppText>
          ) : null}
          <TextInput
            role="searchbox"
            aria-label="Search apps"
            placeholder="Search apps"
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={setQuery}
            autoCorrect={false}
            style={[
              typeScale.body,
              styles.search,
              { color: colors.text, backgroundColor: colors.surface, borderColor: colors.hairline },
            ]}
          />
          <AppText variant="footnote" color="textSecondary">
            {blockedPackages.length === 0 ? 'No apps blocked' : `${blockedPackages.length} blocked`}
          </AppText>
        </View>
      }
      ListEmptyComponent={
        <AppText color="textSecondary" style={styles.empty}>
          {query ? `No apps match "${query}".` : 'No apps found.'}
        </AppText>
      }
      renderItem={({ item }) => (
        <View style={[styles.row, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
          <ToggleRow
            label={item.label}
            value={blockedPackages.includes(item.packageName)}
            disabled={locked}
            onValueChange={(blocked) => toggle(item.packageName, blocked)}
          />
        </View>
      )}
    />
  );
}

const styles = StyleSheet.create({
  content: { width: '100%', maxWidth: 560, alignSelf: 'center', padding: space.lg, gap: space.sm },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: space.xl },
  gap: { gap: space.md },
  search: {
    minHeight: minTouchTarget,
    paddingHorizontal: space.lg,
    borderRadius: radius.control,
    borderWidth: StyleSheet.hairlineWidth,
  },
  empty: { textAlign: 'center', paddingVertical: space.xxl },
  row: { borderRadius: radius.card, borderWidth: StyleSheet.hairlineWidth },
});

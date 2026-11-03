import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Platform, ScrollView, StyleSheet, View } from 'react-native';
import { useShallow } from 'zustand/react/shallow';

import { useBlocker, useBlockerStatus, useFocus } from '@/app-composition';
import type { InstalledApp } from '@/app-blocking/domain';
import { FILTERS } from '@/content-filters/domain';
import { earlyExit, isActive } from '@/focus-session/domain';
import { space } from '@/shared/theme';
import { AppText, Button, ListGroup, NavRow } from '@/shared/ui';

import { ActiveSession } from './components/active-session';
import { ProtectionRow } from './components/protection-row';
import { SessionSetup } from './components/session-setup';
import { useNow } from './use-now';

export function FocusScreen() {
  const router = useRouter();
  const blocker = useBlocker();
  const { status } = useBlockerStatus();
  const { session, filters, preferences, enforcementError } = useFocus(
    useShallow(({ session, filters, preferences, enforcementError }) => ({ session, filters, preferences, enforcementError })),
  );
  const actions = useFocus(
    useShallow(({ setDuration, setLevel, startSession, requestExit, cancelExitRequest, endSession, syncClock }) => ({
      setDuration,
      setLevel,
      startSession,
      requestExit,
      cancelExitRequest,
      endSession,
      syncClock,
    })),
  );
  const now = useNow(session !== null, 1000, session);
  const activeSession = session && isActive(session, now) ? session : null;
  const apps = useInstalledApps(blocker.capabilities.appBlocking);

  useEffect(() => {
    if (session && !activeSession) actions.syncClock();
  }, [session, activeSession, actions]);

  const needsService = blocker.capabilities.inAppFilters && status !== null && !status.serviceEnabled;

  const lockIn = () => {
    if (needsService) router.push('/permissions');
    else actions.startSession();
  };

  return (
    <ScrollView contentInsetAdjustmentBehavior="automatic" contentContainerStyle={styles.content}>
      <View style={styles.status}>
        {needsService ? (
          <ProtectionRow tone="warning" text="Blocking is off" action={{ label: 'Turn on', onPress: () => router.push('/permissions') }} />
        ) : (
          <ProtectionRow
            {...filterStatus(
              FILTERS.filter((f) => filters[f.id] && (blocker.capabilities.inAppFilters || f.app === 'Instagram')).length,
              blocker.capabilities.inAppFilters,
            )}
          />
        )}
        {enforcementError ? <ProtectionRow tone="danger" text={`Couldn't apply blocking: ${enforcementError}`} /> : null}
      </View>

      {activeSession ? (
        <ActiveSession
          session={activeSession}
          now={now}
          exit={earlyExit(activeSession, now)}
          blockedSummary={blockedSummary(activeSession.blockedPackages, apps)}
          onRequestExit={actions.requestExit}
          onCancelExit={actions.cancelExitRequest}
          onEnd={() => {
            try {
              actions.endSession();
            } catch (error) {
              console.warn('Session could not end yet', error);
            }
          }}
        />
      ) : (
        <>
          <SessionSetup
            durationMinutes={preferences.durationMinutes}
            level={preferences.level}
            onPresetDuration={actions.setDuration}
            onCustomDuration={() => router.push('/duration')}
            onLevel={actions.setLevel}
          />
          {blocker.capabilities.appBlocking ? (
            <ListGroup footer="These apps open to a block screen until the session ends.">
              <NavRow
                label="Blocked apps"
                value={preferences.blockedPackages.length === 0 ? 'None' : String(preferences.blockedPackages.length)}
                onPress={() => router.push('/apps')}
              />
            </ListGroup>
          ) : (
            <AppText variant="footnote" color="textSecondary">
              {Platform.OS === 'ios'
                ? 'On iPhone, a session locks Clean Instagram. Blocking other apps needs Screen Time, planned for a later version.'
                : 'App blocking is not available on this device.'}
            </AppText>
          )}
          <View style={styles.spacer} />
          <Button label="Lock in" onPress={lockIn} hint={`Starts a ${preferences.durationMinutes}-minute focus session`} />
        </>
      )}
    </ScrollView>
  );
}

function filterStatus(count: number, inAppFilters: boolean) {
  if (count === 0) return { tone: 'muted' as const, text: 'Filters off' };
  const label = count === 1 ? '1 filter on' : `${count} filters on`;
  return { tone: 'success' as const, text: inAppFilters ? label : `${label} in Clean Instagram` };
}

function blockedSummary(packages: string[], apps: InstalledApp[]): string | null {
  if (packages.length === 0) return null;
  const labels = packages.map((pkg) => apps.find((app) => app.packageName === pkg)?.label ?? pkg);
  const shown = labels.slice(0, 2).join(', ');
  return labels.length > 2 ? `Blocking ${shown} and ${labels.length - 2} more` : `Blocking ${shown}`;
}

function useInstalledApps(enabled: boolean): InstalledApp[] {
  const blocker = useBlocker();
  const [apps, setApps] = useState<InstalledApp[]>([]);
  useEffect(() => {
    if (enabled) blocker.listLaunchableApps().then(setApps, () => setApps([]));
  }, [blocker, enabled]);
  return apps;
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, padding: space.lg, paddingBottom: space.xxl, gap: space.xxl },
  status: { gap: space.xs },
  spacer: { flexGrow: 1 },
});

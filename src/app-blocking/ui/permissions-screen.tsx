import { useRouter } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';

import { useBlocker, useBlockerStatus } from '@/app-composition';
import { space } from '@/shared/theme';
import { AppText, Button, StatusDot } from '@/shared/ui';

/**
 * Prominent disclosure and consent for the Accessibility service (Google Play policy):
 * shown in the app, states what is read and why, and requires an explicit tap to proceed.
 */
export function PermissionsScreen() {
  const router = useRouter();
  const blocker = useBlocker();
  const { status } = useBlockerStatus();

  if (!blocker.capabilities.inAppFilters) {
    return (
      <View style={styles.content}>
        <AppText color="textSecondary">Blocking other apps isn't available on this device.</AppText>
      </View>
    );
  }

  const serviceOn = status?.serviceEnabled ?? false;
  const batteryOn = status?.batteryUnrestricted ?? false;

  return (
    <ScrollView contentContainerStyle={styles.content}>
      <View style={styles.block}>
        <AppText>
          LockedIn uses Android's Accessibility service to see which screen is open in Instagram, YouTube and the apps
          you block. That's how it closes Reels, Explore and Shorts and blocks apps during a session.
        </AppText>
        <AppText variant="headline" role="heading">
          What LockedIn reads
        </AppText>
        <AppText color="textSecondary">
          The names of on-screen elements in Instagram, YouTube and your blocked apps. During Strict sessions, also the
          text of Settings screens, so LockedIn can't be switched off mid-session.
        </AppText>
        <AppText color="textSecondary">
          It never reads your messages or posts. Nothing is stored or sent anywhere: there's no account and no server.
        </AppText>
      </View>

      <Step
        done={serviceOn}
        title="Accessibility service"
        detail="In Settings, open Installed apps (or Downloaded apps), choose LockedIn and turn it on. If Android says the setting is restricted, open LockedIn's App info, open the menu and allow restricted settings."
        action={{ label: serviceOn ? 'Open settings again' : 'Agree and open settings', onPress: blocker.openServiceSettings }}
      />

      <Step
        done={batteryOn}
        title="Keep LockedIn running"
        detail="Some phones stop background services to save battery. Set LockedIn to Unrestricted or Don't optimize."
        action={{ label: 'Open battery settings', onPress: blocker.openBatterySettings }}
      />

      <Button variant="plain" label="Done" onPress={() => router.back()} />
    </ScrollView>
  );
}

function Step({
  done,
  title,
  detail,
  action,
}: {
  done: boolean;
  title: string;
  detail: string;
  action: { label: string; onPress: () => void };
}) {
  return (
    <View style={styles.block}>
      <View style={styles.stepTitle}>
        <StatusDot tone={done ? 'success' : 'warning'} />
        <AppText variant="headline" role="heading" style={styles.flex}>
          {title}
        </AppText>
        <AppText variant="callout" color={done ? 'success' : 'warning'}>
          {done ? 'On' : 'Off'}
        </AppText>
      </View>
      <AppText variant="footnote" color="textSecondary">
        {detail}
      </AppText>
      <Button variant={done ? 'secondary' : 'primary'} label={action.label} onPress={action.onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  content: { padding: space.xl, gap: space.xxl },
  block: { gap: space.md },
  stepTitle: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
  flex: { flex: 1 },
});

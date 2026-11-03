import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

import type { SessionNotifier } from '../application/ports';

const NOTIFICATION_ID = 'lockedin-session-end';
const CHANNEL_ID = 'focus-sessions';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

async function canNotify(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  if (!current.canAskAgain) return false;
  return (await Notifications.requestPermissionsAsync()).granted;
}

/** Best effort: a missing permission or scheduling error never blocks a session. */
export const expoSessionNotifier: SessionNotifier = {
  async scheduleSessionEnd(endsAt) {
    try {
      if (!(await canNotify())) return;
      if (Platform.OS === 'android') {
        await Notifications.setNotificationChannelAsync(CHANNEL_ID, {
          name: 'Focus sessions',
          importance: Notifications.AndroidImportance.DEFAULT,
        });
      }
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
      await Notifications.scheduleNotificationAsync({
        identifier: NOTIFICATION_ID,
        content: { title: 'Focus session complete', body: 'Your apps are unlocked.' },
        trigger: { type: Notifications.SchedulableTriggerInputTypes.DATE, date: endsAt, channelId: CHANNEL_ID },
      });
    } catch (error) {
      console.warn('Could not schedule the session end notification', error);
    }
  },
  async cancelSessionEnd() {
    try {
      await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
    } catch (error) {
      console.warn('Could not cancel the session end notification', error);
    }
  },
};

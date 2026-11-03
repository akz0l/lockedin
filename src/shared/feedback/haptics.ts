import * as Haptics from 'expo-haptics';

/** Haptics are a nicety: devices without a motor or with haptics off must never break an action. */
const quietly = (feedback: () => Promise<void>) => {
  feedback().catch(() => {});
};

export const haptics = {
  selection: () => quietly(Haptics.selectionAsync),
  sessionStarted: () => quietly(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  sessionEnded: () => quietly(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
};

import { createPlatformBlocker } from '@/app-blocking/infrastructure';
import { createFocusStore } from '@/focus-session/application/focus-store';
import { expoSessionNotifier } from '@/focus-session/infrastructure/expo-session-notifier';
import { deviceStorage } from '@/shared/storage/device-storage';

import type { AppServices } from './focus-context';

export function createAppServices(): AppServices {
  const blocker = createPlatformBlocker();
  const store = createFocusStore({ storage: deviceStorage, blocker, notifier: expoSessionNotifier, clock: Date.now });
  return { store, blocker };
}

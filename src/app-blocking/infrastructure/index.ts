import { Platform } from 'react-native';

import FocusGuard from '../../../modules/focus-guard';
import type { BlockerPort } from '../domain';

import { createAndroidBlocker } from './android-focus-guard-blocker';
import { unsupportedBlocker } from './unsupported-blocker';

export function createPlatformBlocker(): BlockerPort {
  if (Platform.OS === 'android' && FocusGuard) return createAndroidBlocker(FocusGuard);
  return unsupportedBlocker;
}

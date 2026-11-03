import { NativeModule, requireOptionalNativeModule } from 'expo';

import type { FocusGuardStatus, LaunchableApp } from './FocusGuard.types';

declare class FocusGuardModule extends NativeModule<Record<string, never>> {
  /** Validates and persists the policy JSON; rejects with ERR_INVALID_POLICY. */
  applyPolicy(json: string): Promise<void>;
  getStatus(): Promise<FocusGuardStatus>;
  openAccessibilitySettings(): Promise<void>;
  openBatteryOptimizationSettings(): Promise<void>;
  listLaunchableApps(): Promise<LaunchableApp[]>;
}

/** Android only. `null` on iOS, web and in tests. */
export default requireOptionalNativeModule<FocusGuardModule>('FocusGuard');

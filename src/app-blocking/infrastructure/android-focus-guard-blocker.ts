import FocusGuard from '../../../modules/focus-guard';
import type { BlockerPort } from '../domain';

export function createAndroidBlocker(module: NonNullable<typeof FocusGuard>): BlockerPort {
  return {
    capabilities: { appBlocking: true, inAppFilters: true },
    getStatus: async () => {
      const status = await module.getStatus();
      return { serviceEnabled: status.serviceEnabled, batteryUnrestricted: status.ignoringBatteryOptimizations };
    },
    openServiceSettings: () => module.openAccessibilitySettings(),
    openBatterySettings: () => module.openBatteryOptimizationSettings(),
    listLaunchableApps: () => module.listLaunchableApps(),
    applyPolicy: (policy) => module.applyPolicy(JSON.stringify(policy)),
  };
}

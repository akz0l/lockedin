import type { BlockerPort } from '../domain';

/**
 * iOS without Screen Time (no paid Apple Developer account yet). Nothing outside
 * LockedIn can be blocked; the clean Instagram screen applies the filters instead.
 */
export const unsupportedBlocker: BlockerPort = {
  capabilities: { appBlocking: false, inAppFilters: false },
  getStatus: async () => ({ serviceEnabled: false, batteryUnrestricted: false }),
  openServiceSettings: async () => {},
  openBatterySettings: async () => {},
  listLaunchableApps: async () => [],
  applyPolicy: async () => {},
};

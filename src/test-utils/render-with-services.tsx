import { render } from '@testing-library/react-native';
import type { ReactElement } from 'react';

import type { BlockerCapabilities, BlockerPort, BlockerStatus, BlockingPolicy, InstalledApp } from '@/app-blocking/domain';
import { FocusProvider } from '@/app-composition';
import { createFocusStore } from '@/focus-session/application/focus-store';
import { createMemoryStorage } from '@/shared/storage/key-value-storage';

type Options = {
  capabilities?: BlockerCapabilities;
  status?: BlockerStatus;
  apps?: InstalledApp[];
};

export const ANDROID: BlockerCapabilities = { appBlocking: true, inAppFilters: true };
export const IOS: BlockerCapabilities = { appBlocking: false, inAppFilters: false };

export function createTestServices({
  capabilities = ANDROID,
  status = { serviceEnabled: true, batteryUnrestricted: true },
  apps = [],
}: Options = {}) {
  const applied: BlockingPolicy[] = [];
  const blocker: BlockerPort = {
    capabilities,
    getStatus: jest.fn(async () => status),
    openServiceSettings: jest.fn(async () => {}),
    openBatterySettings: jest.fn(async () => {}),
    listLaunchableApps: jest.fn(async () => apps),
    applyPolicy: jest.fn(async (policy: BlockingPolicy) => void applied.push(policy)),
  };
  const store = createFocusStore({
    storage: createMemoryStorage(),
    blocker,
    notifier: { scheduleSessionEnd: jest.fn(async () => {}), cancelSessionEnd: jest.fn(async () => {}) },
    clock: () => Date.now(),
  });
  return { store, blocker, applied };
}

export type TestServices = ReturnType<typeof createTestServices>;

export async function renderWithServices(ui: ReactElement, services: TestServices = createTestServices()) {
  await render(<FocusProvider services={services}>{ui}</FocusProvider>);
  return services;
}

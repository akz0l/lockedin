import { createAndroidBlocker } from '../android-focus-guard-blocker';

function fakeModule() {
  return {
    applyPolicy: jest.fn(async (_json: string) => {}),
    getStatus: jest.fn(async () => ({ serviceEnabled: true, ignoringBatteryOptimizations: false })),
    openAccessibilitySettings: jest.fn(async () => {}),
    openBatteryOptimizationSettings: jest.fn(async () => {}),
    listLaunchableApps: jest.fn(async () => [{ packageName: 'com.zhiliaoapp.musically', label: 'TikTok' }]),
  };
}

describe('Android FocusGuard blocker', () => {
  it('sends the policy as the JSON contract the Kotlin service parses', async () => {
    const module = fakeModule();
    const blocker = createAndroidBlocker(module as never);

    await blocker.applyPolicy({
      filters: { instagramReels: true, instagramExplore: false, youtubeShorts: true },
      session: { endsAt: 1_700_000_000_000, level: 'strict', blockedPackages: ['com.zhiliaoapp.musically'], exitRequestedAt: null },
    });

    expect(JSON.parse(module.applyPolicy.mock.calls[0][0])).toEqual({
      filters: { instagramReels: true, instagramExplore: false, youtubeShorts: true },
      session: { endsAt: 1_700_000_000_000, level: 'strict', blockedPackages: ['com.zhiliaoapp.musically'], exitRequestedAt: null },
    });
  });

  it('reports the accessibility service status and lists launchable apps', async () => {
    const blocker = createAndroidBlocker(fakeModule() as never);
    await expect(blocker.getStatus()).resolves.toEqual({ serviceEnabled: true, batteryUnrestricted: false });
    await expect(blocker.listLaunchableApps()).resolves.toEqual([{ packageName: 'com.zhiliaoapp.musically', label: 'TikTok' }]);
    expect(blocker.capabilities).toEqual({ appBlocking: true, inAppFilters: true });
  });
});

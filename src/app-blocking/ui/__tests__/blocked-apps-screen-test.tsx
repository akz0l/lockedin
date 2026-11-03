import { fireEvent, screen, userEvent } from '@testing-library/react-native';

import { createTestServices, renderWithServices } from '@/test-utils/render-with-services';

import { BlockedAppsScreen } from '../blocked-apps-screen';

const apps = [
  { packageName: 'com.instagram.android', label: 'Instagram' },
  { packageName: 'com.zhiliaoapp.musically', label: 'TikTok' },
  { packageName: 'com.google.android.youtube', label: 'YouTube' },
];

describe('BlockedAppsScreen', () => {
  it('lists launchable apps and saves the blocked ones', async () => {
    const services = await renderWithServices(<BlockedAppsScreen />, createTestServices({ apps }));

    await fireEvent(await screen.findByRole('switch', { name: 'TikTok' }), 'valueChange', true);

    expect(services.store.getState().preferences.blockedPackages).toEqual(['com.zhiliaoapp.musically']);
    expect(screen.getByText('1 blocked')).toBeOnTheScreen();
  });

  it('filters the list by search', async () => {
    await renderWithServices(<BlockedAppsScreen />, createTestServices({ apps }));

    await userEvent.setup().type(await screen.findByRole('searchbox', { name: 'Search apps' }), 'tik');

    expect(screen.getByRole('switch', { name: 'TikTok' })).toBeOnTheScreen();
    expect(screen.queryByRole('switch', { name: 'Instagram' })).not.toBeOnTheScreen();
  });

  it('locks the list while a session runs', async () => {
    const services = createTestServices({ apps });
    services.store.getState().startSession();
    await renderWithServices(<BlockedAppsScreen />, services);

    expect(await screen.findByText("Blocked apps can't change during a session.")).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'TikTok' })).toBeDisabled();
  });

  it('offers a retry when the apps cannot be loaded', async () => {
    const services = createTestServices({ apps });
    jest.mocked(services.blocker.listLaunchableApps).mockRejectedValueOnce(new Error('boom'));
    await renderWithServices(<BlockedAppsScreen />, services);

    await fireEvent.press(await screen.findByRole('button', { name: 'Try again' }));

    expect(await screen.findByRole('switch', { name: 'YouTube' })).toBeOnTheScreen();
  });
});

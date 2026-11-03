import { fireEvent, screen } from '@testing-library/react-native';

import { createTestServices, renderWithServices } from '@/test-utils/render-with-services';

import { PermissionsScreen } from '../permissions-screen';

describe('PermissionsScreen', () => {
  it('discloses what is read and opens settings only after an explicit tap', async () => {
    const services = createTestServices({ status: { serviceEnabled: false, batteryUnrestricted: false } });
    await renderWithServices(<PermissionsScreen />, services);

    expect(screen.getByText(/never reads your messages or posts/)).toBeOnTheScreen();
    expect(services.blocker.openServiceSettings).not.toHaveBeenCalled();

    await fireEvent.press(await screen.findByRole('button', { name: 'Agree and open settings' }));
    expect(services.blocker.openServiceSettings).toHaveBeenCalledTimes(1);

    await fireEvent.press(screen.getByRole('button', { name: 'Open battery settings' }));
    expect(services.blocker.openBatterySettings).toHaveBeenCalledTimes(1);
  });

  it('shows each step as on once Android reports it', async () => {
    await renderWithServices(<PermissionsScreen />, createTestServices());
    expect(await screen.findAllByText('On')).toHaveLength(2);
  });
});

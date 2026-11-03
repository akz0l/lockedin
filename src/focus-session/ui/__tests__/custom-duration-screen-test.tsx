import { screen, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { createTestServices, renderWithServices } from '@/test-utils/render-with-services';

import { CustomDurationScreen } from '../custom-duration-screen';

describe('CustomDurationScreen', () => {
  it('steps by 5 minutes and saves the duration', async () => {
    const user = userEvent.setup();
    const services = await renderWithServices(<CustomDurationScreen />);

    await user.press(screen.getByRole('button', { name: 'Increase by 5 minutes' }));
    await user.press(screen.getByRole('button', { name: 'Increase by 5 minutes' }));
    expect(screen.getByRole('status')).toHaveTextContent('35 min');

    await user.press(screen.getByRole('button', { name: 'Set duration' }));

    expect(services.store.getState().preferences.durationMinutes).toBe(35);
    expect(useRouter().back).toHaveBeenCalled();
  });

  it('stops at the 5 minute minimum', async () => {
    const services = createTestServices();
    services.store.getState().setDuration(5);
    await renderWithServices(<CustomDurationScreen />, services);

    expect(screen.getByRole('button', { name: 'Decrease by 5 minutes' })).toBeDisabled();
  });
});

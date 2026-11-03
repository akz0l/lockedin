import { fireEvent, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { createTestServices, IOS, renderWithServices } from '@/test-utils/render-with-services';

import { FiltersScreen } from '../filters-screen';

describe('FiltersScreen', () => {
  it('toggles a filter and enforces it right away', async () => {
    const services = await renderWithServices(<FiltersScreen />);

    const reels = screen.getByRole('switch', { name: 'Reels' });
    expect(reels).toBeChecked();
    await fireEvent(reels, 'valueChange', false);

    expect(services.store.getState().filters.instagramReels).toBe(false);
    expect(services.applied.at(-1)?.filters.instagramReels).toBe(false);
  });

  it('warns when the Android service is off and links to the setup', async () => {
    const services = createTestServices({ status: { serviceEnabled: false, batteryUnrestricted: false } });
    await renderWithServices(<FiltersScreen />, services);

    await fireEvent.press(await screen.findByRole('button', { name: /Blocking is off/ }));

    expect(useRouter().push).toHaveBeenCalledWith('/permissions');
  });

  it('on iPhone, disables YouTube Shorts because only Clean Instagram is filtered', async () => {
    await renderWithServices(<FiltersScreen />, createTestServices({ capabilities: IOS }));

    expect(screen.getByRole('switch', { name: 'Shorts' })).toBeDisabled();
    expect(screen.getByText('Not available on iPhone yet.')).toBeOnTheScreen();
    expect(screen.getByRole('switch', { name: 'Explore' })).toBeEnabled();
  });
});

import { act, screen, userEvent } from '@testing-library/react-native';
import { useRouter } from 'expo-router';

import { createTestServices, IOS, renderWithServices } from '@/test-utils/render-with-services';

import { FocusScreen } from '../focus-screen';

const T0 = new Date('2026-11-03T09:00:00Z');

beforeEach(() => {
  jest.useFakeTimers();
  jest.setSystemTime(T0);
});

afterEach(() => {
  jest.useRealTimers();
});

const user = () => userEvent.setup({ advanceTimers: jest.advanceTimersByTime });

describe('FocusScreen', () => {
  it('shows the filters, the default 25 minute duration and starts a session', async () => {
    const services = await renderWithServices(<FocusScreen />);

    expect(await screen.findByText('3 filters on')).toBeOnTheScreen();
    expect(screen.getByLabelText('Duration 25 min')).toHaveTextContent('25:00');

    await user().press(screen.getByRole('button', { name: 'Lock in' }));

    expect(services.store.getState().session).not.toBeNull();
    expect(screen.getByRole('timer')).toHaveTextContent('25:00');
    expect(screen.getByText(/Soft · until/)).toBeOnTheScreen();
  });

  it('picks a preset duration and opens the custom duration sheet', async () => {
    const services = await renderWithServices(<FocusScreen />);

    await user().press(screen.getByRole('radio', { name: '50' }));
    expect(services.store.getState().preferences.durationMinutes).toBe(50);

    await user().press(screen.getByRole('radio', { name: 'Custom' }));
    expect(useRouter().push).toHaveBeenCalledWith('/duration');
  });

  it('reopens the custom duration sheet when a custom duration is already set', async () => {
    const services = createTestServices();
    services.store.getState().setDuration(35);
    await renderWithServices(<FocusScreen />, services);

    const custom = screen.getByRole('radio', { name: '35 min' });
    expect(custom).toBeChecked();
    await user().press(custom);

    expect(useRouter().push).toHaveBeenCalledWith('/duration');
  });

  it('sends the user to turn on blocking instead of starting a session when the service is off', async () => {
    const services = createTestServices({ status: { serviceEnabled: false, batteryUnrestricted: false } });
    await renderWithServices(<FocusScreen />, services);

    expect(await screen.findByText('Blocking is off')).toBeOnTheScreen();
    await user().press(screen.getByRole('button', { name: 'Lock in' }));

    expect(useRouter().push).toHaveBeenCalledWith('/permissions');
    expect(services.store.getState().session).toBeNull();
  });

  it('a soft session can end after the 10 second pause', async () => {
    const services = await renderWithServices(<FocusScreen />);
    await user().press(screen.getByRole('button', { name: 'Lock in' }));

    await user().press(screen.getByRole('button', { name: 'End early' }));
    expect(screen.getByRole('status')).toHaveTextContent('You can end the session in 0:10.');

    await act(() => jest.advanceTimersByTime(10_000));
    // The screen refreshes on its one-second tick, so the button appears within a second.
    await act(() => jest.advanceTimersByTime(1_000));
    await user().press(screen.getByRole('button', { name: 'End session' }));

    expect(services.store.getState().session).toBeNull();
    expect(screen.getByRole('button', { name: 'Lock in' })).toBeOnTheScreen();
  });

  it('never offers End session before the store allows it', async () => {
    const services = await renderWithServices(<FocusScreen />);
    await act(() => jest.advanceTimersByTime(30));
    await user().press(screen.getByRole('button', { name: 'Lock in' }));
    await act(() => jest.advanceTimersByTime(40));
    await user().press(screen.getByRole('button', { name: 'End early' }));

    // A screen tick lands 40 ms before the 10-second pause ends.
    await act(() => jest.advanceTimersByTime(9_960));
    expect(screen.queryByRole('button', { name: 'End session' })).not.toBeOnTheScreen();

    await act(() => jest.advanceTimersByTime(1_000));
    await user().press(screen.getByRole('button', { name: 'End session' }));
    expect(services.store.getState().session).toBeNull();
  });

  it('a strict session offers no way to end early', async () => {
    const services = await renderWithServices(<FocusScreen />);
    await user().press(screen.getByRole('radio', { name: 'Strict' }));
    expect(screen.getByText('No way out until the timer ends.')).toBeOnTheScreen();

    await user().press(screen.getByRole('button', { name: 'Lock in' }));

    expect(screen.getByText('Strict sessions can’t be ended early.')).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: 'End early' })).not.toBeOnTheScreen();
    expect(services.store.getState().session?.level).toBe('strict');
  });

  it('returns to setup when the timer runs out', async () => {
    const services = await renderWithServices(<FocusScreen />);
    await user().press(screen.getByRole('button', { name: 'Lock in' }));

    await act(() => jest.advanceTimersByTime(25 * 60_000));

    expect(await screen.findByRole('button', { name: 'Lock in' })).toBeOnTheScreen();
    expect(services.store.getState().session).toBeNull();
  });

  it('on iPhone, explains that app blocking needs Screen Time and counts only Instagram filters', async () => {
    await renderWithServices(<FocusScreen />, createTestServices({ capabilities: IOS }));

    expect(await screen.findByText('2 filters on in Clean Instagram')).toBeOnTheScreen();
    expect(screen.getByText(/Blocking other apps needs Screen Time/)).toBeOnTheScreen();
    expect(screen.queryByRole('button', { name: /Blocked apps/ })).not.toBeOnTheScreen();
  });
});

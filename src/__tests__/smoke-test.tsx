import { render, screen } from '@testing-library/react-native';

import HomeRoute from '@/app/index';

describe('app shell', () => {
  it('renders the home route', async () => {
    await render(<HomeRoute />);
    expect(screen.getByText('LockedIn')).toBeTruthy();
  });
});

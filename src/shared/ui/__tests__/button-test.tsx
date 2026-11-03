import { render, screen, userEvent } from '@testing-library/react-native';

import { Button } from '../button';

describe('Button', () => {
  it('calls onPress when pressed', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="Lock in" onPress={onPress} />);

    await user.press(screen.getByRole('button', { name: 'Lock in' }));

    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('is disabled and ignores presses when disabled', async () => {
    const user = userEvent.setup();
    const onPress = jest.fn();
    await render(<Button label="End session" onPress={onPress} disabled />);

    const button = screen.getByRole('button', { name: 'End session' });
    await user.press(button);

    expect(button).toBeDisabled();
    expect(onPress).not.toHaveBeenCalled();
  });
});

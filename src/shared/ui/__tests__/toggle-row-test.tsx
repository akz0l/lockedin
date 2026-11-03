import { fireEvent, render, screen } from '@testing-library/react-native';

import { ToggleRow } from '../toggle-row';

describe('ToggleRow', () => {
  it('exposes a switch named by its label and reports changes', async () => {
    const onValueChange = jest.fn();
    await render(<ToggleRow label="Instagram Reels" value={false} onValueChange={onValueChange} />);

    const toggle = screen.getByRole('switch', { name: 'Instagram Reels' });
    expect(toggle).not.toBeChecked();

    await fireEvent(toggle, 'valueChange', true);

    expect(onValueChange).toHaveBeenCalledWith(true);
  });
});

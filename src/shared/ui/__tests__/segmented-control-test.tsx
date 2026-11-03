import { render, screen, userEvent } from '@testing-library/react-native';

import { SegmentedControl } from '../segmented-control';

const options = [
  { value: 'soft', label: 'Soft' },
  { value: 'firm', label: 'Firm' },
  { value: 'strict', label: 'Strict' },
] as const;

describe('SegmentedControl', () => {
  it('marks the current value as checked', async () => {
    await render(<SegmentedControl label="Block level" options={options} value="firm" onChange={jest.fn()} />);

    expect(screen.getByRole('radio', { name: 'Firm' })).toBeChecked();
    expect(screen.getByRole('radio', { name: 'Soft' })).not.toBeChecked();
  });

  it('reports the pressed option', async () => {
    const user = userEvent.setup();
    const onChange = jest.fn();
    await render(<SegmentedControl label="Block level" options={options} value="soft" onChange={onChange} />);

    await user.press(screen.getByRole('radio', { name: 'Strict' }));

    expect(onChange).toHaveBeenCalledWith('strict');
  });
});

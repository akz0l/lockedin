import { palettes } from '@/shared/theme';

import { tabStackOptions } from '../tab-stack-options';

describe('tabStackOptions', () => {
  it.each(['light', 'dark'] as const)('shows a native large title on the %s ground', (scheme) => {
    const colors = palettes[scheme];
    const options = tabStackOptions(colors);

    expect(options.headerLargeTitle).toBe(true);
    expect(options.headerTintColor).toBe(colors.text);
    expect(options.contentStyle).toEqual({ backgroundColor: colors.ground });
  });

  it('leaves the header transparent so iOS draws the large title', () => {
    // A header background color hides the large title on iOS 26 and later.
    const options = tabStackOptions(palettes.light);

    expect(options.headerStyle).toBeUndefined();
    expect(options.headerLargeStyle).toBeUndefined();
  });
});

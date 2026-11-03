import * as ReactNative from 'react-native';

import { palettes } from '../tokens';
import { useTheme } from '../use-theme';

describe('useTheme (S3: follow the system appearance)', () => {
  it.each([
    ['dark', 'dark'],
    ['light', 'light'],
    [null, 'light'],
  ] as const)('system %p -> %p palette', (system, expected) => {
    jest.spyOn(ReactNative, 'useColorScheme').mockReturnValue(system);
    const theme = useTheme();
    expect(theme.scheme).toBe(expected);
    expect(theme.colors).toBe(palettes[expected]);
  });
});

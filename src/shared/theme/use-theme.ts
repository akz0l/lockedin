import { useColorScheme } from 'react-native';

import { palettes, type Palette } from './tokens';

export type Theme = { scheme: 'light' | 'dark'; colors: Palette };

export function useTheme(): Theme {
  const scheme = useColorScheme() === 'dark' ? 'dark' : 'light';
  return { scheme, colors: palettes[scheme] };
}

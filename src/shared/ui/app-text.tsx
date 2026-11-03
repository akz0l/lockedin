import { Text, type TextProps } from 'react-native';

import { type ColorRole, type TypeVariant, type as typeScale, useTheme } from '@/shared/theme';

type AppTextProps = TextProps & {
  variant?: TypeVariant;
  color?: ColorRole;
  /** Fixed-width digits for numbers that change in place (timers, counts). */
  tabular?: boolean;
};

export function AppText({ variant = 'body', color = 'text', tabular, style, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      maxFontSizeMultiplier={variant === 'display' ? 1.2 : undefined}
      {...rest}
      style={[
        typeScale[variant],
        { color: colors[color] },
        tabular && { fontVariant: ['tabular-nums'] },
        style,
      ]}
    />
  );
}

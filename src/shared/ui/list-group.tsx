import { Children, Fragment, type ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { radius, space, useTheme } from '@/shared/theme';

import { AppText } from './app-text';

type ListGroupProps = {
  header?: string;
  footer?: string;
  children: ReactNode;
};

/** Inset grouped list: one rounded surface, hairline separators between rows. */
export function ListGroup({ header, footer, children }: ListGroupProps) {
  const { colors } = useTheme();
  const rows = Children.toArray(children);

  return (
    <View style={styles.wrapper}>
      {header ? (
        <AppText variant="footnote" color="textSecondary" role="heading" style={styles.header}>
          {header}
        </AppText>
      ) : null}
      <View style={[styles.group, { backgroundColor: colors.surface, borderColor: colors.hairline }]}>
        {rows.map((row, index) => (
          <Fragment key={index}>
            {index > 0 ? <View style={[styles.separator, { backgroundColor: colors.hairline }]} /> : null}
            {row}
          </Fragment>
        ))}
      </View>
      {footer ? (
        <AppText variant="footnote" color="textSecondary" style={styles.footer}>
          {footer}
        </AppText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: space.sm },
  header: { paddingHorizontal: space.lg },
  group: {
    borderRadius: radius.card,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  separator: { height: StyleSheet.hairlineWidth, marginLeft: space.lg },
  footer: { paddingHorizontal: space.lg },
});

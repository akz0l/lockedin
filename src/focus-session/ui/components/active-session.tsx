import { StyleSheet, View } from 'react-native';

import type { EarlyExit, FocusSession } from '@/focus-session/domain';
import { space } from '@/shared/theme';
import { AppText, Button, StatusDot } from '@/shared/ui';

import { formatClockTime, formatCountdown } from '../format';
import { LEVEL_LABEL, LEVEL_TONE } from './level-copy';

type ActiveSessionProps = {
  session: FocusSession;
  now: number;
  exit: EarlyExit;
  blockedSummary: string | null;
  onRequestExit: () => void;
  onCancelExit: () => void;
  onEnd: () => void;
};

export function ActiveSession({ session, now, exit, blockedSummary, onRequestExit, onCancelExit, onEnd }: ActiveSessionProps) {
  const remaining = session.endsAt - now;

  return (
    <View style={styles.container}>
      <View style={styles.block}>
        <AppText variant="display" tabular role="timer" aria-label={`${formatCountdown(remaining)} left`}>
          {formatCountdown(remaining)}
        </AppText>
        <View style={styles.levelRow}>
          <StatusDot tone={LEVEL_TONE[session.level]} />
          <AppText variant="callout" color="textSecondary">
            {LEVEL_LABEL[session.level]} · until {formatClockTime(session.endsAt)}
          </AppText>
        </View>
        {blockedSummary ? (
          <AppText variant="callout" color="textSecondary">
            {blockedSummary}
          </AppText>
        ) : null}
      </View>

      <EndControl exit={exit} now={now} onRequestExit={onRequestExit} onCancelExit={onCancelExit} onEnd={onEnd} />
    </View>
  );
}

function EndControl({
  exit,
  now,
  onRequestExit,
  onCancelExit,
  onEnd,
}: Pick<ActiveSessionProps, 'exit' | 'now' | 'onRequestExit' | 'onCancelExit' | 'onEnd'>) {
  switch (exit.kind) {
    case 'denied':
      return (
        <AppText variant="footnote" color="textSecondary">
          Strict sessions can't be ended early.
        </AppText>
      );
    case 'request-required':
      return <Button variant="secondary" label="End early" onPress={onRequestExit} />;
    case 'wait':
      return (
        <View style={styles.block}>
          <AppText variant="callout" color="textSecondary" role="status">
            You can end the session in {formatCountdown(exit.availableAt - now)}.
          </AppText>
          <Button variant="secondary" label="Keep focusing" onPress={onCancelExit} />
        </View>
      );
    case 'allowed':
      return (
        <View style={styles.block}>
          <Button variant="secondary" label="End session" onPress={onEnd} />
          <Button variant="plain" label="Keep focusing" onPress={onCancelExit} />
        </View>
      );
  }
}

const styles = StyleSheet.create({
  container: { gap: space.xxl },
  block: { gap: space.md },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: space.sm },
});

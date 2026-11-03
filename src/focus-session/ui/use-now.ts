import { useCallback, useSyncExternalStore } from 'react';

/**
 * Wall clock rounded down to 100 ms: never ahead of the store's clock, so anything it
 * unlocks on screen is already allowed by the store. Stable within 100 ms for React.
 */
const readClock = () => Math.floor(Date.now() / 100) * 100;

/** Current time; re-renders every `intervalMs` while `enabled` and reads fresh on any other render. */
export function useNow(enabled: boolean, intervalMs = 1000): number {
  const subscribe = useCallback(
    (onTick: () => void) => {
      if (!enabled) return () => {};
      const id = setInterval(onTick, intervalMs);
      return () => clearInterval(id);
    },
    [enabled, intervalMs],
  );
  return useSyncExternalStore(subscribe, readClock);
}

/**
 * Clock for a session screen: never behind the session's own timestamps, so a countdown
 * starts at the full duration (25:00, not 25:01) and an exit wait at the full pause.
 */
export function useSessionNow(
  session: { startedAt: number; exitRequestedAt: number | null } | null,
  intervalMs = 1000,
): number {
  const now = useNow(session !== null, intervalMs);
  return session ? Math.max(now, session.startedAt, session.exitRequestedAt ?? 0) : now;
}

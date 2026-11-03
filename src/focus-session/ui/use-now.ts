import { useCallback, useSyncExternalStore } from 'react';

/** Wall clock rounded up to 100 ms, so a render right after a user action never shows stale time. */
const readClock = () => Math.ceil(Date.now() / 100) * 100;

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

import { useEffect, useState } from 'react';

/**
 * Current time, refreshed every `intervalMs` while `enabled` and immediately
 * whenever `resetKey` changes (for example right after the user acts).
 */
export function useNow(enabled: boolean, intervalMs = 1000, resetKey?: unknown): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    setNow(Date.now());
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs, resetKey]);
  return now;
}

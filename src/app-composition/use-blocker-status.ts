import { useCallback, useEffect, useState } from 'react';
import { AppState } from 'react-native';

import type { BlockerStatus } from '@/app-blocking/domain';

import { useBlocker } from './focus-context';

/** Native blocking status, refreshed whenever the app returns to the foreground. */
export function useBlockerStatus(): { status: BlockerStatus | null; refresh: () => void } {
  const blocker = useBlocker();
  const [status, setStatus] = useState<BlockerStatus | null>(null);

  const refresh = useCallback(() => {
    blocker.getStatus().then(setStatus, () => setStatus(null));
  }, [blocker]);

  useEffect(() => {
    refresh();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') refresh();
    });
    return () => subscription.remove();
  }, [refresh]);

  return { status, refresh };
}

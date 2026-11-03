import { createContext, type ReactNode, useContext } from 'react';
import { useStore } from 'zustand';

import type { BlockerPort } from '@/app-blocking/domain';
import type { FocusState, FocusStore } from '@/focus-session/application/focus-store';

export type AppServices = { store: FocusStore; blocker: BlockerPort };

const FocusContext = createContext<AppServices | null>(null);

export function FocusProvider({ services, children }: { services: AppServices; children: ReactNode }) {
  return <FocusContext.Provider value={services}>{children}</FocusContext.Provider>;
}

function useServices(): AppServices {
  const services = useContext(FocusContext);
  if (!services) throw new Error('FocusProvider is missing');
  return services;
}

export function useFocus<T>(selector: (state: FocusState) => T): T {
  return useStore(useServices().store, selector);
}

export function useBlocker(): BlockerPort {
  return useServices().blocker;
}

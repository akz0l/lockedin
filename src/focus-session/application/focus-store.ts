import { createStore, type StoreApi } from 'zustand/vanilla';

import type { BlockerPort, BlockingPolicy } from '@/app-blocking/domain';
import { DEFAULT_FILTERS, FILTERS, type FilterId, type FilterSettings, setFilter } from '@/content-filters/domain';
import {
  BLOCK_LEVELS,
  type BlockLevel,
  cancelExitRequest,
  createSession,
  endSession,
  type FocusSession,
  isActive,
  isValidDuration,
  requestExit,
} from '@/focus-session/domain';
import type { KeyValueStorage } from '@/shared/storage/key-value-storage';

import type { Clock, SessionNotifier } from './ports';

export const STORAGE_KEY = 'lockedin/state/v1';

export type SessionPreferences = {
  durationMinutes: number;
  level: BlockLevel;
  blockedPackages: string[];
};

type PersistedState = {
  filters: FilterSettings;
  preferences: SessionPreferences;
  session: FocusSession | null;
};

export type FocusState = PersistedState & {
  /** Last native enforcement failure, shown to the user; null when in sync. */
  enforcementError: string | null;
  setFilter: (id: FilterId, enabled: boolean) => void;
  setDuration: (minutes: number) => void;
  setLevel: (level: BlockLevel) => void;
  setBlockedPackages: (packages: string[]) => void;
  startSession: () => void;
  requestExit: () => void;
  cancelExitRequest: () => void;
  endSession: () => void;
  /** Clears the session once its time is up. Call on app foreground and every tick. */
  syncClock: () => void;
  /** Re-sends the saved policy to the native layer (app start, return to foreground). */
  reapply: () => void;
};

export type FocusStore = StoreApi<FocusState>;

export type FocusStoreDeps = {
  storage: KeyValueStorage;
  blocker: BlockerPort;
  notifier: SessionNotifier;
  clock: Clock;
};

const DEFAULT_PREFERENCES: SessionPreferences = { durationMinutes: 25, level: 'soft', blockedPackages: [] };

export function createFocusStore({ storage, blocker, notifier, clock }: FocusStoreDeps): FocusStore {
  const initial = readPersisted(storage);

  return createStore<FocusState>()((set, get) => {
    const commit = (patch: Partial<PersistedState>) => {
      set(patch);
      const { filters, preferences, session } = get();
      storage.setItem(STORAGE_KEY, JSON.stringify({ filters, preferences, session }));
      enforce();
    };

    const enforce = () => {
      const { filters, session } = get();
      blocker.applyPolicy(toPolicy(filters, session, clock())).then(
        () => set({ enforcementError: null }),
        (error: unknown) => set({ enforcementError: error instanceof Error ? error.message : String(error) }),
      );
    };

    const activeSession = () => {
      const { session } = get();
      return session && isActive(session, clock()) ? session : null;
    };

    const updatePreferences = (patch: Partial<SessionPreferences>) => {
      if (activeSession()) return;
      commit({ preferences: { ...get().preferences, ...patch } });
    };

    return {
      ...initial,
      enforcementError: null,

      setFilter: (id, enabled) => commit({ filters: setFilter(get().filters, id, enabled) }),

      setDuration: (minutes) => {
        if (isValidDuration(minutes)) updatePreferences({ durationMinutes: minutes });
      },
      setLevel: (level) => updatePreferences({ level }),
      setBlockedPackages: (packages) => updatePreferences({ blockedPackages: [...new Set(packages)] }),

      startSession: () => {
        if (activeSession()) return;
        const { durationMinutes, level, blockedPackages } = get().preferences;
        const session = createSession({ now: clock(), durationMinutes, level, blockedPackages });
        commit({ session });
        void notifier.scheduleSessionEnd(session.endsAt);
      },

      requestExit: () => {
        const session = activeSession();
        if (session) commit({ session: requestExit(session, clock()) });
      },

      cancelExitRequest: () => {
        const session = activeSession();
        if (session) commit({ session: cancelExitRequest(session) });
      },

      endSession: () => {
        const { session } = get();
        if (!session) return;
        endSession(session, clock());
        commit({ session: null });
        void notifier.cancelSessionEnd();
      },

      syncClock: () => {
        const { session } = get();
        if (session && !isActive(session, clock())) commit({ session: null });
      },

      reapply: () => enforce(),
    };
  });
}

export function toPolicy(filters: FilterSettings, session: FocusSession | null, now: number): BlockingPolicy {
  return {
    filters,
    session:
      session && isActive(session, now)
        ? {
            endsAt: session.endsAt,
            level: session.level,
            blockedPackages: session.blockedPackages,
            exitRequestedAt: session.exitRequestedAt,
          }
        : null,
  };
}

function readPersisted(storage: KeyValueStorage): PersistedState {
  const fallback: PersistedState = { filters: DEFAULT_FILTERS, preferences: DEFAULT_PREFERENCES, session: null };
  const raw = storage.getItem(STORAGE_KEY);
  if (!raw) return fallback;
  try {
    const data: unknown = JSON.parse(raw);
    if (!isRecord(data)) return fallback;
    return {
      filters: parseFilters(data.filters) ?? fallback.filters,
      preferences: parsePreferences(data.preferences) ?? fallback.preferences,
      session: parseSession(data.session),
    };
  } catch {
    return fallback;
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return Array.isArray(value) && value.every((item) => typeof item === 'string');
}

function isLevel(value: unknown): value is BlockLevel {
  return BLOCK_LEVELS.includes(value as BlockLevel);
}

function parseFilters(value: unknown): FilterSettings | null {
  if (!isRecord(value)) return null;
  const filters = { ...DEFAULT_FILTERS };
  for (const { id } of FILTERS) {
    if (typeof value[id] === 'boolean') filters[id] = value[id];
  }
  return filters;
}

function parsePreferences(value: unknown): SessionPreferences | null {
  if (!isRecord(value)) return null;
  const { durationMinutes, level, blockedPackages } = value;
  return {
    durationMinutes:
      typeof durationMinutes === 'number' && isValidDuration(durationMinutes)
        ? durationMinutes
        : DEFAULT_PREFERENCES.durationMinutes,
    level: isLevel(level) ? level : DEFAULT_PREFERENCES.level,
    blockedPackages: isStringArray(blockedPackages) ? blockedPackages : [],
  };
}

function parseSession(value: unknown): FocusSession | null {
  if (!isRecord(value)) return null;
  const { startedAt, endsAt, level, blockedPackages, exitRequestedAt } = value;
  if (typeof startedAt !== 'number' || typeof endsAt !== 'number' || !isLevel(level) || !isStringArray(blockedPackages)) {
    return null;
  }
  return {
    startedAt,
    endsAt,
    level,
    blockedPackages,
    exitRequestedAt: typeof exitRequestedAt === 'number' ? exitRequestedAt : null,
  };
}

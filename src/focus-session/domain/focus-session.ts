import { type BlockLevel, EXIT_DELAY_MS } from './block-level';
import { FocusSessionError } from './errors';

export type FocusSession = {
  startedAt: number;
  endsAt: number;
  level: BlockLevel;
  /** Android package names blocked for the whole session. */
  blockedPackages: string[];
  /** When the user asked to end early; the exit delay counts from here. */
  exitRequestedAt: number | null;
};

export const MIN_DURATION_MINUTES = 5;
export const MAX_DURATION_MINUTES = 480;
export const DURATION_PRESETS = [25, 50, 90] as const;

const MINUTE_MS = 60_000;

export function isValidDuration(minutes: number): boolean {
  return Number.isInteger(minutes) && minutes >= MIN_DURATION_MINUTES && minutes <= MAX_DURATION_MINUTES;
}

export function createSession(input: {
  now: number;
  durationMinutes: number;
  level: BlockLevel;
  blockedPackages: string[];
}): FocusSession {
  if (!isValidDuration(input.durationMinutes)) throw new FocusSessionError('INVALID_DURATION');
  return {
    startedAt: input.now,
    endsAt: input.now + input.durationMinutes * MINUTE_MS,
    level: input.level,
    blockedPackages: [...input.blockedPackages],
    exitRequestedAt: null,
  };
}

export function isActive(session: FocusSession, now: number): boolean {
  return now < session.endsAt;
}

export function remainingMs(session: FocusSession, now: number): number {
  return Math.max(0, session.endsAt - now);
}

/** 1 at the start, 0 when the session ends. */
export function remainingFraction(session: FocusSession, now: number): number {
  const total = session.endsAt - session.startedAt;
  return total <= 0 ? 0 : remainingMs(session, now) / total;
}

export type EarlyExit =
  | { kind: 'allowed' }
  | { kind: 'denied' }
  | { kind: 'request-required'; delayMs: number }
  | { kind: 'wait'; availableAt: number };

export function earlyExit(session: FocusSession, now: number): EarlyExit {
  if (!isActive(session, now)) return { kind: 'allowed' };
  const delayMs = EXIT_DELAY_MS[session.level];
  if (delayMs === null) return { kind: 'denied' };
  if (session.exitRequestedAt === null) return { kind: 'request-required', delayMs };
  const availableAt = session.exitRequestedAt + delayMs;
  return now < availableAt ? { kind: 'wait', availableAt } : { kind: 'allowed' };
}

export function requestExit(session: FocusSession, now: number): FocusSession {
  if (earlyExit(session, now).kind === 'denied') throw new FocusSessionError('EARLY_EXIT_DENIED');
  if (session.exitRequestedAt !== null) return session;
  return { ...session, exitRequestedAt: now };
}

export function cancelExitRequest(session: FocusSession): FocusSession {
  return { ...session, exitRequestedAt: null };
}

/** Validates that the session may end now; throws otherwise. */
export function endSession(session: FocusSession, now: number): void {
  const exit = earlyExit(session, now);
  if (exit.kind === 'denied') throw new FocusSessionError('EARLY_EXIT_DENIED');
  if (exit.kind !== 'allowed') throw new FocusSessionError('EARLY_EXIT_NOT_READY');
}

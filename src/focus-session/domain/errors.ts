export type FocusSessionErrorCode = 'INVALID_DURATION' | 'EARLY_EXIT_DENIED' | 'EARLY_EXIT_NOT_READY';

export class FocusSessionError extends Error {
  constructor(readonly code: FocusSessionErrorCode) {
    super(code);
    this.name = 'FocusSessionError';
  }
}

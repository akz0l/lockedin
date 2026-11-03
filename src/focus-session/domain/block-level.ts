export type BlockLevel = 'soft' | 'firm' | 'strict';

export const BLOCK_LEVELS: readonly BlockLevel[] = ['soft', 'firm', 'strict'];

/** How long the user must wait after asking to end early. `null` means never. */
export const EXIT_DELAY_MS: Record<BlockLevel, number | null> = {
  soft: 10_000,
  firm: 5 * 60_000,
  strict: null,
};

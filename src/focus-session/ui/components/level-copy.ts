import type { BlockLevel } from '@/focus-session/domain';
import type { StatusTone } from '@/shared/ui';

export const LEVEL_OPTIONS = [
  { value: 'soft', label: 'Soft' },
  { value: 'firm', label: 'Firm' },
  { value: 'strict', label: 'Strict' },
] as const satisfies readonly { value: BlockLevel; label: string }[];

export const LEVEL_CONSEQUENCE: Record<BlockLevel, string> = {
  soft: 'Ending early takes a 10-second pause.',
  firm: 'Ending early takes a 5-minute wait.',
  strict: 'No way out until the timer ends.',
};

export const LEVEL_TONE: Record<BlockLevel, StatusTone> = {
  soft: 'success',
  firm: 'warning',
  strict: 'danger',
};

export const LEVEL_LABEL: Record<BlockLevel, string> = { soft: 'Soft', firm: 'Firm', strict: 'Strict' };

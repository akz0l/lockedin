import type { FilterSettings } from '@/content-filters/domain';
import type { BlockLevel } from '@/focus-session/domain';

/** What the native layer enforces. Only active sessions are sent. */
export type BlockingPolicy = {
  filters: FilterSettings;
  session: {
    endsAt: number;
    level: BlockLevel;
    blockedPackages: string[];
    exitRequestedAt: number | null;
  } | null;
};

export type InstalledApp = { packageName: string; label: string };

export type BlockerCapabilities = {
  /** Can block whole apps during a session. */
  appBlocking: boolean;
  /** Can remove Reels, Explore and Shorts inside the official apps. */
  inAppFilters: boolean;
};

export type BlockerStatus = { serviceEnabled: boolean };

export interface BlockerPort {
  readonly capabilities: BlockerCapabilities;
  getStatus(): Promise<BlockerStatus>;
  openServiceSettings(): Promise<void>;
  listLaunchableApps(): Promise<InstalledApp[]>;
  applyPolicy(policy: BlockingPolicy): Promise<void>;
}

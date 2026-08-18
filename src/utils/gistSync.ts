/**
 * GitHub Gist Sync Engine
 *
 * Uses a single secret GitHub Gist as a free, zero-infrastructure sync backend.
 * The Gist contains one file: `capystars-data.json` holding the full BackupData.
 *
 * Merge strategy (conflict resolution):
 *   - Stars & settings: take the record with the most recent `lastActiveDate`
 *   - Chores: union by ID; completed/pending_approval wins over todo for same ID
 *   - Rewards: union by ID; claimed/fulfilled wins over available for same ID
 *   - StarLogs: union by ID (deduped)
 *   - Pet: take the happier / higher-level pet
 *
 * Credentials are stored in localStorage (acceptable for a trusted home device).
 */

import type { BackupData, SyncConfig, Chore, Reward, StarLog } from '../types';
import { exportAllData, importAllData } from '../db';

const GIST_FILENAME = 'capystars-data.json';
const STORAGE_KEY = 'capystars_sync_config';
const GITHUB_API = 'https://api.github.com';

// ─── Credential helpers ────────────────────────────────────────────────────

export function loadSyncConfig(): SyncConfig | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SyncConfig;
  } catch {
    return null;
  }
}

export function saveSyncConfig(config: SyncConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export function clearSyncConfig(): void {
  localStorage.removeItem(STORAGE_KEY);
}

// ─── GitHub Gist API ───────────────────────────────────────────────────────

function headers(pat: string): HeadersInit {
  return {
    Authorization: `Bearer ${pat}`,
    Accept: 'application/vnd.github+json',
    'Content-Type': 'application/json',
    'X-GitHub-Api-Version': '2022-11-28',
  };
}

/** Fetch the current Gist content. Returns null if not found / auth fails. */
export async function fetchGist(config: SyncConfig): Promise<BackupData | null> {
  try {
    const res = await fetch(`${GITHUB_API}/gists/${config.gistId}`, {
      headers: headers(config.pat),
    });
    if (!res.ok) return null;
    const gist = await res.json() as { files: Record<string, { content: string }> };
    const file = gist.files[GIST_FILENAME];
    if (!file?.content) return null;
    return JSON.parse(file.content) as BackupData;
  } catch {
    return null;
  }
}

/** Push data to the Gist (PATCH). */
export async function pushGist(config: SyncConfig, data: BackupData): Promise<boolean> {
  try {
    const res = await fetch(`${GITHUB_API}/gists/${config.gistId}`, {
      method: 'PATCH',
      headers: headers(config.pat),
      body: JSON.stringify({
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(data, null, 2),
          },
        },
      }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Create a brand-new secret Gist and return its ID.
 * Used during first-time setup when the user has no Gist yet.
 */
export async function createGist(pat: string): Promise<string | null> {
  try {
    const initialData: BackupData = await exportAllData();
    const res = await fetch(`${GITHUB_API}/gists`, {
      method: 'POST',
      headers: headers(pat),
      body: JSON.stringify({
        description: 'CapyStars – Family Chore Tracker Sync Data',
        public: false,
        files: {
          [GIST_FILENAME]: {
            content: JSON.stringify(initialData, null, 2),
          },
        },
      }),
    });
    if (!res.ok) return null;
    const gist = await res.json() as { id: string };
    return gist.id;
  } catch {
    return null;
  }
}

/** Validate that a PAT can read gists (scope check). */
export async function validatePat(pat: string): Promise<boolean> {
  try {
    const res = await fetch(`${GITHUB_API}/gists`, {
      headers: headers(pat),
    });
    return res.ok;
  } catch {
    return false;
  }
}

// ─── Merge Logic ───────────────────────────────────────────────────────────

const CHORE_STATUS_PRIORITY: Record<string, number> = {
  completed: 2,
  pending_approval: 1,
  todo: 0,
};

const REWARD_STATUS_PRIORITY: Record<string, number> = {
  fulfilled: 2,
  claimed: 1,
  available: 0,
};

function mergeChores(local: Chore[], remote: Chore[]): Chore[] {
  const map = new Map<string, Chore>();
  for (const c of remote) map.set(c.id, c);
  for (const c of local) {
    const existing = map.get(c.id);
    if (!existing) {
      map.set(c.id, c);
    } else {
      // Keep whichever has the higher-priority status
      const localPri = CHORE_STATUS_PRIORITY[c.status] ?? 0;
      const remotePri = CHORE_STATUS_PRIORITY[existing.status] ?? 0;
      if (localPri >= remotePri) map.set(c.id, c);
    }
  }
  return Array.from(map.values()).sort((a, b) => a.orderIndex - b.orderIndex);
}

function mergeRewards(local: Reward[], remote: Reward[]): Reward[] {
  const map = new Map<string, Reward>();
  for (const r of remote) map.set(r.id, r);
  for (const r of local) {
    const existing = map.get(r.id);
    if (!existing) {
      map.set(r.id, r);
    } else {
      const localPri = REWARD_STATUS_PRIORITY[r.status] ?? 0;
      const remotePri = REWARD_STATUS_PRIORITY[existing.status] ?? 0;
      if (localPri >= remotePri) map.set(r.id, r);
    }
  }
  return Array.from(map.values());
}

function mergeStarLogs(local: StarLog[], remote: StarLog[]): StarLog[] {
  const map = new Map<string, StarLog>();
  for (const l of [...remote, ...local]) map.set(l.id, l);
  return Array.from(map.values()).sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );
}

function mergeData(local: BackupData, remote: BackupData): BackupData {
  // Settings: use whichever was active more recently
  const localDate = new Date(local.settings.lastActiveDate || 0).getTime();
  const remoteDate = new Date(remote.settings.lastActiveDate || 0).getTime();
  const winningSettings = localDate >= remoteDate ? local.settings : remote.settings;

  // Pet: prefer the more "lived-in" pet.
  // Priority: level → totalFedCount → happiness.
  // Using totalFedCount as the primary tie-breaker means a freshly-installed
  // device (fed count = 0) will always defer to the Gist pet, preserving the
  // pet name and other customizations set on the original device.
  const winningPet = (() => {
    if (local.pet.level !== remote.pet.level)
      return local.pet.level > remote.pet.level ? local.pet : remote.pet;
    if (local.pet.totalFedCount !== remote.pet.totalFedCount)
      return local.pet.totalFedCount > remote.pet.totalFedCount ? local.pet : remote.pet;
    return local.pet.happiness >= remote.pet.happiness ? local.pet : remote.pet;
  })();

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    settings: {
      ...winningSettings,
      // Always take the higher star counts to avoid losing progress
      currentStars: Math.max(local.settings.currentStars, remote.settings.currentStars),
      totalEarnedStars: Math.max(local.settings.totalEarnedStars, remote.settings.totalEarnedStars),
      currentStreakDays: Math.max(local.settings.currentStreakDays, remote.settings.currentStreakDays),
    },
    pet: winningPet,
    chores: mergeChores(local.chores, remote.chores),
    rewards: mergeRewards(local.rewards, remote.rewards),
    starLogs: mergeStarLogs(local.starLogs, remote.starLogs),
  };
}

// ─── Main Sync Operation ───────────────────────────────────────────────────

export type SyncResult =
  | { ok: true; message: string }
  | { ok: false; error: string };

/**
 * Full bidirectional sync:
 * 1. Export local DB
 * 2. Fetch remote Gist
 * 3. Merge
 * 4. Import merged data into local DB
 * 5. Push merged data back to Gist
 */
export async function syncWithGist(config: SyncConfig): Promise<SyncResult> {
  if (!navigator.onLine) {
    return { ok: false, error: 'Device is offline — sync will retry when connected.' };
  }

  try {
    const [localData, remoteData] = await Promise.all([
      exportAllData(),
      fetchGist(config),
    ]);

    let merged: BackupData;

    if (!remoteData) {
      // Gist is empty or first sync — just push local data up
      merged = localData;
    } else {
      merged = mergeData(localData, remoteData);
    }

    // Update local DB with merged result
    const importResult = await importAllData(merged);
    if (!importResult.success) {
      return { ok: false, error: `DB import failed: ${importResult.error}` };
    }

    // Push merged result back to Gist
    const pushed = await pushGist(config, merged);
    if (!pushed) {
      return { ok: false, error: 'Failed to push to GitHub Gist. Check your token.' };
    }

    // Update lastSyncedAt in stored config
    const updatedConfig: SyncConfig = { ...config, lastSyncedAt: new Date().toISOString() };
    saveSyncConfig(updatedConfig);

    return { ok: true, message: 'Synced successfully!' };
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown sync error';
    return { ok: false, error: message };
  }
}

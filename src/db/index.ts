import Dexie, { type EntityTable } from 'dexie';
import type { Chore, Reward, PetState, AppSettings, StarLog, BackupData, PetType } from '../types';
import { DEFAULT_SETTINGS, DEFAULT_PET, DEFAULT_CHORES, DEFAULT_REWARDS } from './defaultData';

export interface PetRecord extends PetState {
  id: string;
}

export class CapyStarsDB extends Dexie {
  chores!: EntityTable<Chore, 'id'>;
  rewards!: EntityTable<Reward, 'id'>;
  pet!: EntityTable<PetRecord, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;
  starLogs!: EntityTable<StarLog, 'id'>;

  constructor(dbName = 'CapyStarsDB') {
    super(dbName);
    this.version(1).stores({
      chores: 'id, routine, repeat, status, orderIndex, createdAt',
      rewards: 'id, status, costInStars, createdAt',
      pet: 'id, type, name',
      settings: 'id',
      starLogs: 'id, type, createdAt',
    });
  }
}

export const db = new CapyStarsDB();

// Request persistent storage on iPad/iOS
export async function enablePersistentStorage(): Promise<boolean> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.persist) {
    try {
      const isPersisted = await navigator.storage.persist();
      return isPersisted;
    } catch {
      return false;
    }
  }
  return false;
}

// Generate simple UUID
export function generateId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

// Initialize database with default data if empty
export async function initializeDatabase(): Promise<void> {
  await enablePersistentStorage();

  const settingsCount = await db.settings.count();
  if (settingsCount === 0) {
    await db.settings.put({ ...DEFAULT_SETTINGS });
  }

  const petCount = await db.pet.count();
  if (petCount === 0) {
    await db.pet.put({ id: 'active_pet', ...DEFAULT_PET });
  }

  const choresCount = await db.chores.count();
  if (choresCount === 0) {
    const choresWithIds: Chore[] = DEFAULT_CHORES.map((c) => ({
      ...c,
      id: generateId(),
    }));
    await db.chores.bulkPut(choresWithIds);
  }

  const rewardsCount = await db.rewards.count();
  if (rewardsCount === 0) {
    const rewardsWithIds: Reward[] = DEFAULT_REWARDS.map((r) => ({
      ...r,
      id: generateId(),
    }));
    await db.rewards.bulkPut(rewardsWithIds);
  }

  // Check and run daily reset
  await checkAndPerformDailyReset();
}

// Check if a new day has started to reset repeating chores and update streaks
export async function checkAndPerformDailyReset(): Promise<void> {
  const settings = await db.settings.get('global_settings');
  if (!settings) return;

  const todayStr = new Date().toISOString().split('T')[0];
  const lastDateStr = settings.lastActiveDate;

  if (todayStr !== lastDateStr) {
    const dayOfWeek = new Date().getDay(); // 0 = Sunday, 6 = Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;

    // Reset chores based on their repeat pattern
    const chores = await db.chores.toArray();
    for (const chore of chores) {
      let shouldReset = false;
      if (chore.repeat === 'daily') {
        shouldReset = true;
      } else if (chore.repeat === 'weekdays' && !isWeekend) {
        shouldReset = true;
      } else if (chore.repeat === 'weekends' && isWeekend) {
        shouldReset = true;
      }

      if (shouldReset && chore.status !== 'todo') {
        await db.chores.update(chore.id, {
          status: 'todo',
          completedAt: undefined,
        });
      }
    }

    // Update streak: if last active was yesterday, streak + 1, else reset to 1
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split('T')[0];

    let newStreak = settings.currentStreakDays;
    if (lastDateStr === yesterdayStr) {
      newStreak += 1;
    } else {
      newStreak = 1;
    }

    // Gently lower pet happiness overnight so kid has a reason to care for it today
    const pet = await db.pet.get('active_pet');
    if (pet) {
      const newHappiness = Math.max(30, pet.happiness - 15);
      await db.pet.update('active_pet', { happiness: newHappiness });
    }

    await db.settings.update('global_settings', {
      lastActiveDate: todayStr,
      currentStreakDays: newStreak,
    });
  }
}

// ---------------- Database Action Helpers ---------------- //

export async function completeChore(choreId: string): Promise<{ starsAwarded: number; newTotal: number }> {
  const chore = await db.chores.get(choreId);
  const settings = await db.settings.get('global_settings');
  if (!chore || !settings) return { starsAwarded: 0, newTotal: 0 };

  if (settings.requireApproval) {
    // Moves to pending approval without awarding stars yet
    await db.chores.update(choreId, {
      status: 'pending_approval',
      completedAt: new Date().toISOString(),
    });
    return { starsAwarded: 0, newTotal: settings.currentStars };
  }

  // Instant completion
  const starsAwarded = chore.starsReward;
  const newCurrentStars = settings.currentStars + starsAwarded;
  const newTotalStars = settings.totalEarnedStars + starsAwarded;

  await db.chores.update(choreId, {
    status: 'completed',
    completedAt: new Date().toISOString(),
  });

  await db.settings.update('global_settings', {
    currentStars: newCurrentStars,
    totalEarnedStars: newTotalStars,
  });

  // Log star transaction
  await db.starLogs.put({
    id: generateId(),
    amount: starsAwarded,
    reason: `Completed: ${chore.title}`,
    type: 'chore',
    createdAt: new Date().toISOString(),
  });

  // Boost pet happiness
  await boostPetHappiness(15);

  return { starsAwarded, newTotal: newCurrentStars };
}

export async function uncompleteChore(choreId: string): Promise<void> {
  const chore = await db.chores.get(choreId);
  const settings = await db.settings.get('global_settings');
  if (!chore || !settings) return;

  if (chore.status === 'completed') {
    const starsToRemove = chore.starsReward;
    const newCurrent = Math.max(0, settings.currentStars - starsToRemove);
    const newTotal = Math.max(0, settings.totalEarnedStars - starsToRemove);

    await db.settings.update('global_settings', {
      currentStars: newCurrent,
      totalEarnedStars: newTotal,
    });

    await db.starLogs.put({
      id: generateId(),
      amount: -starsToRemove,
      reason: `Unmarked: ${chore.title}`,
      type: 'chore',
      createdAt: new Date().toISOString(),
    });
  }

  await db.chores.update(choreId, {
    status: 'todo',
    completedAt: undefined,
  });
}

export async function approveChore(choreId: string): Promise<void> {
  const chore = await db.chores.get(choreId);
  const settings = await db.settings.get('global_settings');
  if (!chore || !settings) return;

  const starsAwarded = chore.starsReward;
  await db.chores.update(choreId, {
    status: 'completed',
  });

  await db.settings.update('global_settings', {
    currentStars: settings.currentStars + starsAwarded,
    totalEarnedStars: settings.totalEarnedStars + starsAwarded,
  });

  await db.starLogs.put({
    id: generateId(),
    amount: starsAwarded,
    reason: `Parent Approved: ${chore.title}`,
    type: 'chore',
    createdAt: new Date().toISOString(),
  });

  await boostPetHappiness(20);
}

export async function rejectChore(choreId: string): Promise<void> {
  await db.chores.update(choreId, {
    status: 'todo',
    completedAt: undefined,
  });
}

export async function claimReward(rewardId: string): Promise<{ success: boolean; message?: string }> {
  const reward = await db.rewards.get(rewardId);
  const settings = await db.settings.get('global_settings');
  if (!reward || !settings) return { success: false, message: 'Not found' };

  if (settings.currentStars < reward.costInStars) {
    return { success: false, message: 'Not enough stars yet!' };
  }

  const newBalance = settings.currentStars - reward.costInStars;

  await db.settings.update('global_settings', {
    currentStars: newBalance,
  });

  await db.rewards.update(rewardId, {
    status: 'claimed',
    claimedAt: new Date().toISOString(),
  });

  await db.starLogs.put({
    id: generateId(),
    amount: -reward.costInStars,
    reason: `Claimed Reward: ${reward.title}`,
    type: 'reward',
    createdAt: new Date().toISOString(),
  });

  return { success: true };
}

export async function fulfillReward(rewardId: string): Promise<void> {
  await db.rewards.update(rewardId, {
    status: 'fulfilled',
    fulfilledAt: new Date().toISOString(),
  });
}

export async function cancelClaimedReward(rewardId: string): Promise<void> {
  const reward = await db.rewards.get(rewardId);
  const settings = await db.settings.get('global_settings');
  if (!reward || !settings) return;

  // Refund stars
  await db.settings.update('global_settings', {
    currentStars: settings.currentStars + reward.costInStars,
  });

  await db.rewards.update(rewardId, {
    status: 'available',
    claimedAt: undefined,
  });

  await db.starLogs.put({
    id: generateId(),
    amount: reward.costInStars,
    reason: `Refunded Reward: ${reward.title}`,
    type: 'reward',
    createdAt: new Date().toISOString(),
  });
}

export async function adjustStars(amount: number, reason: string): Promise<void> {
  const settings = await db.settings.get('global_settings');
  if (!settings) return;

  const newCurrent = Math.max(0, settings.currentStars + amount);
  const newTotal = amount > 0 ? settings.totalEarnedStars + amount : settings.totalEarnedStars;

  await db.settings.update('global_settings', {
    currentStars: newCurrent,
    totalEarnedStars: newTotal,
  });

  await db.starLogs.put({
    id: generateId(),
    amount,
    reason,
    type: amount >= 0 ? 'parent_bonus' : 'parent_penalty',
    createdAt: new Date().toISOString(),
  });
}

export async function switchPet(type: PetType, name?: string): Promise<void> {
  const current = await db.pet.get('active_pet');
  const petName = name || (type.charAt(0).toUpperCase() + type.slice(1));
  if (current) {
    await db.pet.update('active_pet', {
      type,
      name: name || current.name || petName,
    });
  } else {
    await db.pet.put({
      id: 'active_pet',
      type,
      name: petName,
      happiness: 80,
      level: 1,
      totalFedCount: 0,
    });
  }
}

export async function boostPetHappiness(amount: number): Promise<number> {
  const pet = await db.pet.get('active_pet');
  if (!pet) return 80;

  const newHappiness = Math.min(100, Math.max(0, pet.happiness + amount));
  let newLevel = pet.level;
  let newFedCount = pet.totalFedCount + 1;

  // Level up every 10 completions
  if (newFedCount >= pet.level * 10) {
    newLevel += 1;
  }

  await db.pet.update('active_pet', {
    happiness: newHappiness,
    level: newLevel,
    totalFedCount: newFedCount,
  });

  return newHappiness;
}

export async function exportAllData(): Promise<BackupData> {
  const settings = (await db.settings.get('global_settings')) || { ...DEFAULT_SETTINGS };
  const pet = (await db.pet.get('active_pet')) || { id: 'active_pet', ...DEFAULT_PET };
  const chores = await db.chores.toArray();
  const rewards = await db.rewards.toArray();
  const starLogs = await db.starLogs.toArray();

  return {
    version: 1,
    timestamp: new Date().toISOString(),
    settings,
    pet: {
      type: pet.type,
      name: pet.name,
      happiness: pet.happiness,
      level: pet.level,
      totalFedCount: pet.totalFedCount,
    },
    chores,
    rewards,
    starLogs,
  };
}

export async function importAllData(data: BackupData): Promise<{ success: boolean; error?: string }> {
  if (!data || typeof data !== 'object' || !data.settings || !Array.isArray(data.chores)) {
    return { success: false, error: 'Invalid backup file format' };
  }

  try {
    await db.transaction('rw', [db.settings, db.pet, db.chores, db.rewards, db.starLogs], async () => {
      await db.settings.clear();
      await db.pet.clear();
      await db.chores.clear();
      await db.rewards.clear();
      await db.starLogs.clear();

      await db.settings.put({ ...data.settings, id: 'global_settings' });
      await db.pet.put({ id: 'active_pet', ...data.pet });
      if (data.chores.length > 0) await db.chores.bulkPut(data.chores);
      if (data.rewards && data.rewards.length > 0) await db.rewards.bulkPut(data.rewards);
      if (data.starLogs && data.starLogs.length > 0) await db.starLogs.bulkPut(data.starLogs);
    });

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error during restore';
    return { success: false, error: message };
  }
}

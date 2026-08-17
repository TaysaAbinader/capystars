import Dexie, { type EntityTable } from 'dexie';
import type {
  Chore,
  Reward,
  PetState,
  AppSettings,
  StarLog,
  BackupData,
  PetType,
  ChoreCompletionRecord,
  Achievement,
} from '../types';
import {
  DEFAULT_SETTINGS,
  DEFAULT_PET,
  DEFAULT_CHORES,
  DEFAULT_REWARDS,
  DEFAULT_ACHIEVEMENTS,
  DEFAULT_GOALS,
} from './defaultData';

export interface PetRecord extends PetState {
  id: string;
}

export class CapyStarsDB extends Dexie {
  chores!: EntityTable<Chore, 'id'>;
  rewards!: EntityTable<Reward, 'id'>;
  pet!: EntityTable<PetRecord, 'id'>;
  settings!: EntityTable<AppSettings, 'id'>;
  starLogs!: EntityTable<StarLog, 'id'>;
  choreHistory!: EntityTable<ChoreCompletionRecord, 'id'>;
  achievements!: EntityTable<Achievement, 'id'>;

  constructor(dbName = 'CapyStarsDB') {
    super(dbName);
    this.version(1).stores({
      chores: 'id, routine, repeat, status, orderIndex, createdAt',
      rewards: 'id, status, costInStars, createdAt',
      pet: 'id, type, name',
      settings: 'id',
      starLogs: 'id, type, createdAt',
    });
    this.version(2).stores({
      chores: 'id, routine, repeat, status, orderIndex, createdAt',
      rewards: 'id, status, costInStars, createdAt',
      pet: 'id, type, name',
      settings: 'id',
      starLogs: 'id, type, createdAt',
      choreHistory: 'id, choreId, completedDate, weekKey, monthKey, routine, isWeekend, completedAt',
      achievements: 'id, timeframe, unlocked, unlockedAt',
    });
  }
}

export const db = new CapyStarsDB();

// ---------------- Date & Timeframe Helpers ---------------- //

export function formatDateKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getMonthKey(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

export function getISOWeekKey(d: Date = new Date()): string {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7; // Sunday is 7 in ISO
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((date.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  const weekPadded = weekNo < 10 ? `0${weekNo}` : `${weekNo}`;
  return `${date.getUTCFullYear()}-W${weekPadded}`;
}

export function isWeekendDay(d: Date = new Date()): boolean {
  const day = d.getDay();
  return day === 0 || day === 6;
}

export function isChoreActiveOnDate(chore: Chore, d: Date = new Date()): boolean {
  const weekend = isWeekendDay(d);
  if (chore.repeat === 'daily') return true;
  if (chore.repeat === 'weekdays') return !weekend;
  if (chore.repeat === 'weekends') return weekend;
  if (chore.repeat === 'once') return true;
  return true;
}

export function getWeekDays(d: Date = new Date()): Date[] {
  const current = new Date(d);
  const day = current.getDay();
  // calculate Monday (if Sunday day=0, diff = -6)
  const diffToMonday = day === 0 ? -6 : 1 - day;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  const days: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const nextDay = new Date(monday);
    nextDay.setDate(monday.getDate() + i);
    days.push(nextDay);
  }
  return days;
}

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
  } else {
    // Ensure settings has goals
    const existing = await db.settings.get('global_settings');
    if (existing && !existing.goals) {
      await db.settings.update('global_settings', { goals: DEFAULT_GOALS });
    }
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

  const achievementsCount = await db.achievements.count();
  if (achievementsCount === 0) {
    await db.achievements.bulkPut(DEFAULT_ACHIEVEMENTS);
  }

  // Check and run daily reset
  await checkAndPerformDailyReset();
}

// Check if a new day has started to reset repeating chores and update streaks
export async function checkAndPerformDailyReset(): Promise<void> {
  const settings = await db.settings.get('global_settings');
  if (!settings) return;

  const todayStr = formatDateKey(new Date());
  const lastDateStr = settings.lastActiveDate;

  if (todayStr !== lastDateStr) {
    const isWeekend = isWeekendDay(new Date());

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
    const yesterdayStr = formatDateKey(yesterday);

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

  const now = new Date();
  const todayStr = formatDateKey(now);

  if (settings.requireApproval) {
    // Moves to pending approval without awarding stars yet
    await db.chores.update(choreId, {
      status: 'pending_approval',
      completedAt: now.toISOString(),
    });
    return { starsAwarded: 0, newTotal: settings.currentStars };
  }

  // Instant completion
  const starsAwarded = chore.starsReward;
  const newCurrentStars = settings.currentStars + starsAwarded;
  const newTotalStars = settings.totalEarnedStars + starsAwarded;

  await db.chores.update(choreId, {
    status: 'completed',
    completedAt: now.toISOString(),
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
    createdAt: now.toISOString(),
  });

  // Log activity completion record for timely history tracking
  const historyRecord: ChoreCompletionRecord = {
    id: generateId(),
    choreId: chore.id,
    title: chore.title,
    icon: chore.icon,
    routine: chore.routine,
    starsAwarded,
    completedAt: now.toISOString(),
    completedDate: todayStr,
    weekKey: getISOWeekKey(now),
    monthKey: getMonthKey(now),
    isWeekend: isWeekendDay(now),
  };
  await db.choreHistory.put(historyRecord);

  // Boost pet happiness
  await boostPetHappiness(15);

  // Check and unlock any applicable achievements
  await checkAndUnlockAchievements();

  return { starsAwarded, newTotal: newCurrentStars };
}

export async function uncompleteChore(choreId: string): Promise<void> {
  const chore = await db.chores.get(choreId);
  const settings = await db.settings.get('global_settings');
  if (!chore || !settings) return;

  const todayStr = formatDateKey(new Date());

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

    // Remove from today's chore completion history
    const todaysLogs = await db.choreHistory
      .where('completedDate')
      .equals(todayStr)
      .filter((h) => h.choreId === choreId)
      .toArray();

    for (const log of todaysLogs) {
      await db.choreHistory.delete(log.id);
    }
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

  const now = new Date();
  const todayStr = formatDateKey(now);
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
    createdAt: now.toISOString(),
  });

  const historyRecord: ChoreCompletionRecord = {
    id: generateId(),
    choreId: chore.id,
    title: chore.title,
    icon: chore.icon,
    routine: chore.routine,
    starsAwarded,
    completedAt: now.toISOString(),
    completedDate: todayStr,
    weekKey: getISOWeekKey(now),
    monthKey: getMonthKey(now),
    isWeekend: isWeekendDay(now),
  };
  await db.choreHistory.put(historyRecord);

  await boostPetHappiness(20);
  await checkAndUnlockAchievements();
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

// ---------------- Timely History & Achievement Evaluators ---------------- //

export async function getDailyStats(dateStr: string = formatDateKey()) {
  const history = await db.choreHistory.where('completedDate').equals(dateStr).toArray();
  const totalChores = history.length;
  const totalStars = history.reduce((sum, item) => sum + item.starsAwarded, 0);

  const byRoutine = {
    morning: history.filter((h) => h.routine === 'morning').length,
    afternoon: history.filter((h) => h.routine === 'afternoon').length,
    evening: history.filter((h) => h.routine === 'evening').length,
    bonus: history.filter((h) => h.routine === 'bonus').length,
  };

  return { dateStr, totalChores, totalStars, byRoutine, history };
}

export async function getWeeklyStats(weekKey: string = getISOWeekKey()) {
  const history = await db.choreHistory.where('weekKey').equals(weekKey).toArray();
  const totalChores = history.length;
  const totalStars = history.reduce((sum, item) => sum + item.starsAwarded, 0);

  const weekdayChores = history.filter((h) => !h.isWeekend).length;
  const weekendChores = history.filter((h) => h.isWeekend).length;

  const byDay: Record<string, { chores: number; stars: number; records: ChoreCompletionRecord[] }> = {};
  for (const item of history) {
    if (!byDay[item.completedDate]) {
      byDay[item.completedDate] = { chores: 0, stars: 0, records: [] };
    }
    byDay[item.completedDate].chores += 1;
    byDay[item.completedDate].stars += item.starsAwarded;
    byDay[item.completedDate].records.push(item);
  }

  return { weekKey, totalChores, totalStars, weekdayChores, weekendChores, byDay, history };
}

export async function getMonthlyStats(monthKey: string = getMonthKey()) {
  const history = await db.choreHistory.where('monthKey').equals(monthKey).toArray();
  const totalChores = history.length;
  const totalStars = history.reduce((sum, item) => sum + item.starsAwarded, 0);

  // Group by date
  const byDay: Record<string, { chores: number; stars: number }> = {};
  for (const item of history) {
    if (!byDay[item.completedDate]) {
      byDay[item.completedDate] = { chores: 0, stars: 0 };
    }
    byDay[item.completedDate].chores += 1;
    byDay[item.completedDate].stars += item.starsAwarded;
  }

  const activeDaysCount = Object.keys(byDay).length;

  const byRoutine = {
    morning: history.filter((h) => h.routine === 'morning').length,
    afternoon: history.filter((h) => h.routine === 'afternoon').length,
    evening: history.filter((h) => h.routine === 'evening').length,
    bonus: history.filter((h) => h.routine === 'bonus').length,
  };

  return { monthKey, totalChores, totalStars, activeDaysCount, byDay, byRoutine, history };
}

export async function checkAndUnlockAchievements(): Promise<Achievement[]> {
  const now = new Date();
  const todayStr = formatDateKey(now);
  const weekKey = getISOWeekKey(now);
  const monthKey = getMonthKey(now);

  const daily = await getDailyStats(todayStr);
  const weekly = await getWeeklyStats(weekKey);
  const monthly = await getMonthlyStats(monthKey);

  const achievements = await db.achievements.toArray();
  const newlyUnlocked: Achievement[] = [];

  for (const ach of achievements) {
    let currentVal = ach.currentValue;
    let shouldUnlock = false;

    if (ach.id === 'daily_first_step') {
      currentVal = daily.totalChores;
      shouldUnlock = daily.totalChores >= 1;
    } else if (ach.id === 'daily_goal_crusher') {
      currentVal = daily.totalChores;
      shouldUnlock = daily.totalChores >= 5;
    } else if (ach.id === 'daily_morning_champion') {
      currentVal = daily.byRoutine.morning;
      shouldUnlock = daily.byRoutine.morning >= 4;
    } else if (ach.id === 'weekly_goal_hero') {
      currentVal = weekly.totalChores;
      shouldUnlock = weekly.totalChores >= 30;
    } else if (ach.id === 'weekly_school_star') {
      // Distinct weekdays completed
      const weekdayDates = Object.keys(weekly.byDay).filter((d) => !isWeekendDay(new Date(d)));
      currentVal = weekdayDates.length;
      shouldUnlock = weekdayDates.length >= 5;
    } else if (ach.id === 'weekly_weekend_warrior') {
      currentVal = weekly.weekendChores;
      shouldUnlock = weekly.weekendChores >= 6;
    } else if (ach.id === 'monthly_century_club') {
      currentVal = monthly.totalChores;
      shouldUnlock = monthly.totalChores >= 100;
    } else if (ach.id === 'monthly_super_saver') {
      currentVal = monthly.totalStars;
      shouldUnlock = monthly.totalStars >= 250;
    } else if (ach.id === 'monthly_consistency_legend') {
      currentVal = monthly.activeDaysCount;
      shouldUnlock = monthly.activeDaysCount >= 20;
    }

    const wasUnlocked = ach.unlocked;
    const isNowUnlocked = wasUnlocked || shouldUnlock;
    const unlockTime = isNowUnlocked && !wasUnlocked ? now.toISOString() : ach.unlockedAt;

    if (!wasUnlocked && shouldUnlock) {
      newlyUnlocked.push({ ...ach, unlocked: true, unlockedAt: unlockTime, currentValue: currentVal });
    }

    await db.achievements.update(ach.id, {
      currentValue: currentVal,
      unlocked: isNowUnlocked,
      unlockedAt: unlockTime,
    });
  }

  return newlyUnlocked;
}

// ---------------- Backup / Restore ---------------- //

export async function exportAllData(): Promise<BackupData> {
  const settings = (await db.settings.get('global_settings')) || { ...DEFAULT_SETTINGS };
  const pet = (await db.pet.get('active_pet')) || { id: 'active_pet', ...DEFAULT_PET };
  const chores = await db.chores.toArray();
  const rewards = await db.rewards.toArray();
  const starLogs = await db.starLogs.toArray();
  const choreHistory = await db.choreHistory.toArray();
  const achievements = await db.achievements.toArray();

  return {
    version: 2,
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
    choreHistory,
    achievements,
  };
}

export async function importAllData(data: BackupData): Promise<{ success: boolean; error?: string }> {
  if (!data || typeof data !== 'object' || !data.settings || !Array.isArray(data.chores)) {
    return { success: false, error: 'Invalid backup file format' };
  }

  try {
    await db.transaction(
      'rw',
      [db.settings, db.pet, db.chores, db.rewards, db.starLogs, db.choreHistory, db.achievements],
      async () => {
        await db.settings.clear();
        await db.pet.clear();
        await db.chores.clear();
        await db.rewards.clear();
        await db.starLogs.clear();
        await db.choreHistory.clear();
        await db.achievements.clear();

        await db.settings.put({ ...data.settings, id: 'global_settings' });
        await db.pet.put({ id: 'active_pet', ...data.pet });
        if (data.chores.length > 0) await db.chores.bulkPut(data.chores);
        if (data.rewards && data.rewards.length > 0) await db.rewards.bulkPut(data.rewards);
        if (data.starLogs && data.starLogs.length > 0) await db.starLogs.bulkPut(data.starLogs);
        if (data.choreHistory && data.choreHistory.length > 0) {
          await db.choreHistory.bulkPut(data.choreHistory);
        }
        if (data.achievements && data.achievements.length > 0) {
          await db.achievements.bulkPut(data.achievements);
        } else {
          await db.achievements.bulkPut(DEFAULT_ACHIEVEMENTS);
        }
      }
    );

    return { success: true };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Database error during restore';
    return { success: false, error: message };
  }
}


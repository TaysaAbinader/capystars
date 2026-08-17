import { describe, it, expect, beforeEach } from 'vitest';
import {
  db,
  initializeDatabase,
  completeChore,
  uncompleteChore,
  getDailyStats,
  getWeeklyStats,
  getMonthlyStats,
  checkAndUnlockAchievements,
  isChoreActiveOnDate,
  isWeekendDay,
  formatDateKey,
  getISOWeekKey,
  getMonthKey,
  exportAllData,
  importAllData,
} from '../db';
import type { Chore } from '../types';

describe('Timely Activity Tracking & Weekday/Weekend Goals', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.pet.clear();
    await db.chores.clear();
    await db.rewards.clear();
    await db.starLogs.clear();
    await db.choreHistory.clear();
    await db.achievements.clear();
    await initializeDatabase();
  });

  it('records chore completion in choreHistory with date keys', async () => {
    const chores = await db.chores.toArray();
    const chore = chores[0];

    await completeChore(chore.id);

    const history = await db.choreHistory.toArray();
    expect(history.length).toBe(1);
    expect(history[0].choreId).toBe(chore.id);
    expect(history[0].title).toBe(chore.title);
    expect(history[0].completedDate).toBe(formatDateKey(new Date()));
    expect(history[0].weekKey).toBe(getISOWeekKey(new Date()));
    expect(history[0].monthKey).toBe(getMonthKey(new Date()));
    expect(history[0].isWeekend).toBe(isWeekendDay(new Date()));
  });

  it('removes today history entry when uncompleting a chore', async () => {
    const chores = await db.chores.toArray();
    const chore = chores[0];

    await completeChore(chore.id);
    expect(await db.choreHistory.count()).toBe(1);

    await uncompleteChore(chore.id);
    expect(await db.choreHistory.count()).toBe(0);
  });

  it('calculates daily, weekly, and monthly stats properly', async () => {
    const chores = await db.chores.toArray();
    await completeChore(chores[0].id);
    await completeChore(chores[1].id);

    const todayStr = formatDateKey(new Date());
    const weekKey = getISOWeekKey(new Date());
    const monthKey = getMonthKey(new Date());

    const daily = await getDailyStats(todayStr);
    expect(daily.totalChores).toBe(2);
    expect(daily.totalStars).toBe(chores[0].starsReward + chores[1].starsReward);

    const weekly = await getWeeklyStats(weekKey);
    expect(weekly.totalChores).toBe(2);
    expect(weekly.byDay[todayStr].chores).toBe(2);

    const monthly = await getMonthlyStats(monthKey);
    expect(monthly.totalChores).toBe(2);
    expect(monthly.activeDaysCount).toBe(1);
  });

  it('identifies weekday vs weekend chores accurately', () => {
    const weekdayDate = new Date(2026, 7, 19); // Wednesday (Aug 19, 2026)
    const weekendDate = new Date(2026, 7, 22); // Saturday (Aug 22, 2026)

    expect(isWeekendDay(weekdayDate)).toBe(false);
    expect(isWeekendDay(weekendDate)).toBe(true);

    const dailyChore: Chore = {
      id: '1',
      title: 'Daily Task',
      icon: '⭐️',
      routine: 'morning',
      starsReward: 1,
      repeat: 'daily',
      status: 'todo',
      createdAt: new Date().toISOString(),
      orderIndex: 0,
    };

    const weekdayChore: Chore = {
      id: '2',
      title: 'School Homework',
      icon: '📚',
      routine: 'afternoon',
      starsReward: 2,
      repeat: 'weekdays',
      status: 'todo',
      createdAt: new Date().toISOString(),
      orderIndex: 1,
    };

    const weekendChore: Chore = {
      id: '3',
      title: 'Weekend Clean Play Area',
      icon: '🧹',
      routine: 'bonus',
      starsReward: 3,
      repeat: 'weekends',
      status: 'todo',
      createdAt: new Date().toISOString(),
      orderIndex: 2,
    };

    // On Wednesday (Weekday)
    expect(isChoreActiveOnDate(dailyChore, weekdayDate)).toBe(true);
    expect(isChoreActiveOnDate(weekdayChore, weekdayDate)).toBe(true);
    expect(isChoreActiveOnDate(weekendChore, weekdayDate)).toBe(false);

    // On Saturday (Weekend)
    expect(isChoreActiveOnDate(dailyChore, weekendDate)).toBe(true);
    expect(isChoreActiveOnDate(weekdayChore, weekendDate)).toBe(false);
    expect(isChoreActiveOnDate(weekendChore, weekendDate)).toBe(true);
  });

  it('unlocks achievements on milestone triggers', async () => {
    const chores = await db.chores.toArray();
    await completeChore(chores[0].id);

    await checkAndUnlockAchievements();
    const firstStepAch = await db.achievements.get('daily_first_step');

    expect(firstStepAch?.unlocked).toBe(true);
    expect(firstStepAch?.currentValue).toBeGreaterThanOrEqual(1);
  });

  it('exports and restores timely activity history and achievements', async () => {
    const chores = await db.chores.toArray();
    await completeChore(chores[0].id);

    const backup = await exportAllData();
    expect(backup.version).toBe(2);
    expect(backup.choreHistory).toBeDefined();
    expect(backup.choreHistory?.length).toBe(1);

    // Clear and restore
    await db.choreHistory.clear();
    expect(await db.choreHistory.count()).toBe(0);

    const result = await importAllData(backup);
    expect(result.success).toBe(true);
    expect(await db.choreHistory.count()).toBe(1);
  });
});

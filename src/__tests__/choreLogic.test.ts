import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase, completeChore, uncompleteChore, approveChore, rejectChore, checkAndPerformDailyReset } from '../db';

describe('Chore Completion and Routine Logic', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.pet.clear();
    await db.chores.clear();
    await db.rewards.clear();
    await db.starLogs.clear();
    await initializeDatabase();
  });

  it('toggles chore to completed when requireApproval is false', async () => {
    const chores = await db.chores.toArray();
    const chore = chores[0];

    await completeChore(chore.id);
    const updated = await db.chores.get(chore.id);
    expect(updated?.status).toBe('completed');
    expect(updated?.completedAt).toBeDefined();

    // Uncomplete
    await uncompleteChore(chore.id);
    const uncompleted = await db.chores.get(chore.id);
    expect(uncompleted?.status).toBe('todo');
    expect(uncompleted?.completedAt).toBeUndefined();
  });

  it('moves chore to pending_approval when requireApproval is true', async () => {
    await db.settings.update('global_settings', { requireApproval: true });

    const chores = await db.chores.toArray();
    const chore = chores[0];

    await completeChore(chore.id);
    const updated = await db.chores.get(chore.id);
    expect(updated?.status).toBe('pending_approval');

    // Parent Approves
    await approveChore(chore.id);
    const approved = await db.chores.get(chore.id);
    expect(approved?.status).toBe('completed');

    // Parent Rejects
    await db.chores.update(chore.id, { status: 'pending_approval' });
    await rejectChore(chore.id);
    const rejected = await db.chores.get(chore.id);
    expect(rejected?.status).toBe('todo');
  });

  it('resets daily chores when a new day is detected', async () => {
    const chores = await db.chores.toArray();
    const dailyChore = chores.find((c) => c.repeat === 'daily');
    expect(dailyChore).toBeDefined();

    if (dailyChore) {
      await completeChore(dailyChore.id);
      expect((await db.chores.get(dailyChore.id))?.status).toBe('completed');

      // Simulate yesterday's active date
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      await db.settings.update('global_settings', {
        lastActiveDate: yesterday.toISOString().split('T')[0],
      });

      // Run daily reset
      await checkAndPerformDailyReset();

      const resetChore = await db.chores.get(dailyChore.id);
      expect(resetChore?.status).toBe('todo');
    }
  });
});

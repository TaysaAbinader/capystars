import { describe, it, expect } from 'vitest';
import Dexie from 'dexie';
import { CapyStarsDB, initializeDatabase, DEFAULT_SETTINGS, DEFAULT_PET } from '../db';
import { DEFAULT_GOALS } from '../db/defaultData';

describe('Database Schema Version 1 -> Version 2 Seamless Migration', () => {
  it('seamlessly upgrades an existing v1 database to v2 preserving all data', async () => {
    const testDbName = `MigrationTestDB_${Date.now()}`;

    // 1. Simulate an existing v1 database
    const v1Db = new Dexie(testDbName);
    v1Db.version(1).stores({
      chores: 'id, routine, repeat, status, orderIndex, createdAt',
      rewards: 'id, status, costInStars, createdAt',
      pet: 'id, type, name',
      settings: 'id',
      starLogs: 'id, type, createdAt',
    });

    await v1Db.open();

    // Populate v1 data with user customization
    await v1Db.table('settings').put({
      ...DEFAULT_SETTINGS,
      id: 'global_settings',
      childName: 'Lily',
      currentStars: 48,
      totalEarnedStars: 120,
      currentStreakDays: 14,
      // note: v1 has no 'goals' property
    });

    await v1Db.table('pet').put({
      id: 'active_pet',
      type: 'unicorn',
      name: 'Starlight',
      happiness: 95,
      level: 4,
      totalFedCount: 32,
    });

    await v1Db.table('chores').put({
      id: 'custom_chore_1',
      title: 'Practice Piano',
      icon: '🎹',
      routine: 'afternoon',
      starsReward: 3,
      repeat: 'weekdays',
      status: 'completed',
      completedAt: '2026-08-16T15:00:00Z',
      createdAt: '2026-08-01T10:00:00Z',
      orderIndex: 0,
    });

    await v1Db.table('starLogs').put({
      id: 'log_1',
      amount: 3,
      reason: 'Completed: Practice Piano',
      type: 'chore',
      createdAt: '2026-08-16T15:00:00Z',
    });

    v1Db.close();

    // 2. Open with the new v2 CapyStarsDB schema
    const v2Db = new CapyStarsDB(testDbName);
    await v2Db.open();

    expect(v2Db.verno).toBe(2);

    // Verify existing v1 data was preserved intact
    const settings = await v2Db.settings.get('global_settings');
    expect(settings?.childName).toBe('Lily');
    expect(settings?.currentStars).toBe(48);
    expect(settings?.totalEarnedStars).toBe(120);
    expect(settings?.currentStreakDays).toBe(14);

    const pet = await v2Db.pet.get('active_pet');
    expect(pet?.type).toBe('unicorn');
    expect(pet?.name).toBe('Starlight');
    expect(pet?.level).toBe(4);

    const chores = await v2Db.chores.toArray();
    expect(chores.length).toBe(1);
    expect(chores[0].title).toBe('Practice Piano');

    const starLogs = await v2Db.starLogs.toArray();
    expect(starLogs.length).toBe(1);
    expect(starLogs[0].reason).toBe('Completed: Practice Piano');

    // 3. Run initializeDatabase logic on this DB instance
    if (!settings?.goals) {
      await v2Db.settings.update('global_settings', { goals: DEFAULT_GOALS });
    }
    const achCount = await v2Db.achievements.count();
    if (achCount === 0) {
      const { DEFAULT_ACHIEVEMENTS } = await import('../db/defaultData');
      await v2Db.achievements.bulkPut(DEFAULT_ACHIEVEMENTS);
    }

    // Verify v2 additions
    const updatedSettings = await v2Db.settings.get('global_settings');
    expect(updatedSettings?.goals).toBeDefined();
    expect(updatedSettings?.goals?.dailyChoresTarget).toBe(5);

    const achievements = await v2Db.achievements.toArray();
    expect(achievements.length).toBeGreaterThan(0);

    const historyCount = await v2Db.choreHistory.count();
    expect(historyCount).toBe(0); // ready for new records

    v2Db.close();
    await Dexie.delete(testDbName);
  });
});

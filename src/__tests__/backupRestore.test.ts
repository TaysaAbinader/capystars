import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase, exportAllData, importAllData } from '../db';
import type { BackupData } from '../types';

describe('Backup and Data Portability', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.pet.clear();
    await db.chores.clear();
    await db.rewards.clear();
    await db.starLogs.clear();
    await initializeDatabase();
  });

  it('exports valid backup JSON schema with all entities', async () => {
    const backup = await exportAllData();

    expect(backup.version).toBe(2);
    expect(backup.timestamp).toBeDefined();
    expect(backup.settings).toBeDefined();
    expect(backup.settings.childName).toBe('My Champion');
    expect(backup.pet.type).toBe('capybara');
    expect(backup.chores.length).toBeGreaterThan(0);
    expect(backup.rewards.length).toBeGreaterThan(0);
  });

  it('restores clean backup data completely', async () => {
    const customBackup: BackupData = {
      version: 1,
      timestamp: new Date().toISOString(),
      settings: {
        id: 'global_settings',
        childName: 'Emma',
        currentStars: 42,
        totalEarnedStars: 100,
        currentStreakDays: 7,
        lastActiveDate: '2026-08-15',
        pinHash: '1234',
        requireApproval: true,
        soundEnabled: true,
        hapticsEnabled: true,
      },
      pet: {
        type: 'unicorn',
        name: 'Sparkle',
        happiness: 95,
        level: 3,
        totalFedCount: 25,
      },
      chores: [
        {
          id: 'test_chore_1',
          title: 'Custom Chore',
          icon: '🦄',
          routine: 'morning',
          starsReward: 5,
          repeat: 'daily',
          status: 'todo',
          createdAt: new Date().toISOString(),
          orderIndex: 0,
        },
      ],
      rewards: [],
      starLogs: [],
    };

    const importResult = await importAllData(customBackup);
    expect(importResult.success).toBe(true);

    const settings = await db.settings.get('global_settings');
    expect(settings?.childName).toBe('Emma');
    expect(settings?.currentStars).toBe(42);

    const pet = await db.pet.get('active_pet');
    expect(pet?.type).toBe('unicorn');
    expect(pet?.name).toBe('Sparkle');

    const chores = await db.chores.toArray();
    expect(chores.length).toBe(1);
    expect(chores[0].title).toBe('Custom Chore');
  });

  it('rejects corrupted or malformed backup data', async () => {
    const invalidBackup = { badData: true } as unknown as BackupData;
    const result = await importAllData(invalidBackup);
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});

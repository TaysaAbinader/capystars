import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase } from '../db';

describe('Database Initialization and Seeding', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.pet.clear();
    await db.chores.clear();
    await db.rewards.clear();
    await db.starLogs.clear();
  });

  it('initializes database with default settings, pet, chores, and rewards', async () => {
    await initializeDatabase();

    const settings = await db.settings.get('global_settings');
    expect(settings).toBeDefined();
    expect(settings?.childName).toBe('My Champion');
    expect(settings?.currentStars).toBe(5);

    const pet = await db.pet.get('active_pet');
    expect(pet).toBeDefined();
    expect(pet?.type).toBe('capybara');
    expect(pet?.name).toBe('Boba');

    const chores = await db.chores.toArray();
    expect(chores.length).toBeGreaterThan(0);
    const morningChores = chores.filter((c) => c.routine === 'morning');
    expect(morningChores.length).toBeGreaterThanOrEqual(3);

    const rewards = await db.rewards.toArray();
    expect(rewards.length).toBeGreaterThan(0);
  });
});

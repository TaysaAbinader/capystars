import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase, completeChore, claimReward, adjustStars } from '../db';

describe('Star Economy and Rewards', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.pet.clear();
    await db.chores.clear();
    await db.rewards.clear();
    await db.starLogs.clear();
    await initializeDatabase();
  });

  it('credits stars upon chore completion', async () => {
    const initialSettings = await db.settings.get('global_settings');
    const startStars = initialSettings?.currentStars || 0;

    const chores = await db.chores.toArray();
    const chore = chores[0];

    const result = await completeChore(chore.id);
    expect(result.starsAwarded).toBe(chore.starsReward);
    expect(result.newTotal).toBe(startStars + chore.starsReward);

    const updatedSettings = await db.settings.get('global_settings');
    expect(updatedSettings?.currentStars).toBe(startStars + chore.starsReward);
    expect(updatedSettings?.totalEarnedStars).toBe((initialSettings?.totalEarnedStars || 0) + chore.starsReward);
  });

  it('deducts stars when claiming an affordable reward', async () => {
    await adjustStars(50, 'Test Fund');
    const settingsBefore = await db.settings.get('global_settings');
    const balanceBefore = settingsBefore?.currentStars || 0;

    const rewards = await db.rewards.toArray();
    const affordableReward = rewards.find((r) => r.costInStars <= balanceBefore);
    expect(affordableReward).toBeDefined();

    if (affordableReward) {
      const claimResult = await claimReward(affordableReward.id);
      expect(claimResult.success).toBe(true);

      const settingsAfter = await db.settings.get('global_settings');
      expect(settingsAfter?.currentStars).toBe(balanceBefore - affordableReward.costInStars);

      const updatedReward = await db.rewards.get(affordableReward.id);
      expect(updatedReward?.status).toBe('claimed');
    }
  });

  it('prevents claiming a reward if star balance is insufficient', async () => {
    // Set stars to 0
    await db.settings.update('global_settings', { currentStars: 0 });

    const rewards = await db.rewards.toArray();
    const expensiveReward = rewards[0];

    const claimResult = await claimReward(expensiveReward.id);
    expect(claimResult.success).toBe(false);
    expect(claimResult.message).toContain('Not enough stars');
  });

  it('logs manual parent bonus and penalty adjustments', async () => {
    await adjustStars(10, 'Bonus for helping sister');

    let settings = await db.settings.get('global_settings');
    expect(settings?.currentStars).toBe(15); // default 5 + 10

    await adjustStars(-3, 'Penalty for screen time overuse');
    settings = await db.settings.get('global_settings');
    expect(settings?.currentStars).toBe(12);

    const logs = await db.starLogs.toArray();
    expect(logs.length).toBeGreaterThanOrEqual(2);
  });
});

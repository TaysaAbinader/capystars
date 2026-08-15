import { describe, it, expect, beforeEach } from 'vitest';
import { db, initializeDatabase, switchPet, boostPetHappiness } from '../db';
import type { PetType } from '../types';

describe('Pet Companion and Sanctuary System', () => {
  beforeEach(async () => {
    await db.settings.clear();
    await db.pet.clear();
    await db.chores.clear();
    await db.rewards.clear();
    await db.starLogs.clear();
    await initializeDatabase();
  });

  it('allows adopting and switching between all 6 pets', async () => {
    const allPets: PetType[] = ['capybara', 'kitten', 'puppy', 'bunny', 'unicorn', 'dragon'];

    for (const petType of allPets) {
      await switchPet(petType, `My ${petType}`);
      const current = await db.pet.get('active_pet');
      expect(current?.type).toBe(petType);
      expect(current?.name).toBe(`My ${petType}`);
    }
  });

  it('boosts happiness and triggers level progression', async () => {
    const initialPet = await db.pet.get('active_pet');
    const startHappiness = initialPet?.happiness || 80;

    await boostPetHappiness(10);
    const updated = await db.pet.get('active_pet');
    expect(updated?.happiness).toBe(Math.min(100, startHappiness + 10));

    // Complete multiple feeds to test level up
    for (let i = 0; i < 15; i++) {
      await boostPetHappiness(5);
    }

    const leveledPet = await db.pet.get('active_pet');
    expect(leveledPet?.level).toBeGreaterThanOrEqual(2);
  });
});

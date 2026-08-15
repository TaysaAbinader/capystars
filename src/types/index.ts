export type RoutineType = 'morning' | 'afternoon' | 'evening' | 'bonus';

export type RepeatType = 'daily' | 'weekdays' | 'weekends' | 'once';

export type ChoreStatus = 'todo' | 'pending_approval' | 'completed';

export interface Chore {
  id: string;
  title: string;
  icon: string;
  routine: RoutineType;
  starsReward: number;
  repeat: RepeatType;
  status: ChoreStatus;
  completedAt?: string;
  createdAt: string;
  orderIndex: number;
}

export type RewardStatus = 'available' | 'claimed' | 'fulfilled';

export interface Reward {
  id: string;
  title: string;
  icon: string;
  costInStars: number;
  status: RewardStatus;
  claimedAt?: string;
  fulfilledAt?: string;
  createdAt: string;
}

export type PetType = 'capybara' | 'kitten' | 'puppy' | 'bunny' | 'unicorn' | 'dragon';

export interface PetState {
  type: PetType;
  name: string;
  happiness: number; // 0 to 100
  level: number;
  totalFedCount: number;
}

export interface StarLog {
  id: string;
  amount: number; // positive = earned/bonus, negative = spent/penalty
  reason: string;
  type: 'chore' | 'reward' | 'parent_bonus' | 'parent_penalty';
  createdAt: string;
}

export interface AppSettings {
  id: string;
  childName: string;
  currentStars: number;
  totalEarnedStars: number;
  currentStreakDays: number;
  lastActiveDate: string;
  pinHash: string;
  requireApproval: boolean;
  soundEnabled: boolean;
  hapticsEnabled: boolean;
}

export interface BackupData {
  version: number;
  timestamp: string;
  settings: AppSettings;
  pet: PetState;
  chores: Chore[];
  rewards: Reward[];
  starLogs: StarLog[];
}

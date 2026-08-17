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

export interface ChoreCompletionRecord {
  id: string;
  choreId: string;
  title: string;
  icon: string;
  routine: RoutineType;
  starsAwarded: number;
  completedAt: string; // ISO string
  completedDate: string; // YYYY-MM-DD
  weekKey: string; // e.g. "2026-W34"
  monthKey: string; // e.g. "2026-08"
  isWeekend: boolean;
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

export interface TimeframeGoals {
  dailyChoresTarget: number;
  dailyStarsTarget: number;
  weeklyChoresTarget: number;
  weeklyStarsTarget: number;
  monthlyChoresTarget: number;
  monthlyStarsTarget: number;
}

export type AchievementTimeframe = 'daily' | 'weekly' | 'monthly' | 'milestone';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  timeframe: AchievementTimeframe;
  unlockedAt?: string;
  targetValue: number;
  currentValue: number;
  unlocked: boolean;
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
  goals?: TimeframeGoals;
}

export interface BackupData {
  version: number;
  timestamp: string;
  settings: AppSettings;
  pet: PetState;
  chores: Chore[];
  rewards: Reward[];
  starLogs: StarLog[];
  choreHistory?: ChoreCompletionRecord[];
  achievements?: Achievement[];
}

export interface SyncConfig {
  gistId: string;
  pat: string; // GitHub Personal Access Token (gist scope only)
  enabled: boolean;
  lastSyncedAt?: string; // ISO timestamp of last successful sync
}

export type SyncStatus = 'idle' | 'syncing' | 'synced' | 'error' | 'offline';

export type ChildViewType = 'chores' | 'weekly' | 'monthly' | 'rewards';


import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ParentDashboard } from '../components/parent/ParentDashboard';
import type { Chore, Reward, StarLog, AppSettings } from '../types';

const mockSettings: AppSettings = {
  id: 'global_settings',
  childName: 'Sarah',
  currentStars: 15,
  totalEarnedStars: 30,
  currentStreakDays: 3,
  lastActiveDate: '2026-08-15',
  pinHash: '1234',
  requireApproval: false,
  soundEnabled: true,
  hapticsEnabled: true,
};

const mockChores: Chore[] = [
  {
    id: 'chore_1',
    title: 'Clean Bedroom',
    icon: '🛏️',
    routine: 'morning',
    starsReward: 2,
    repeat: 'daily',
    status: 'pending_approval',
    createdAt: new Date().toISOString(),
    orderIndex: 0,
  },
];

const mockRewards: Reward[] = [
  {
    id: 'reward_1',
    title: 'Ice Cream Trip',
    icon: '🍦',
    costInStars: 10,
    status: 'claimed',
    createdAt: new Date().toISOString(),
  },
];

const mockStarLogs: StarLog[] = [];

describe('ParentDashboard Component', () => {
  it('renders parent tabs and switches to Approvals to approve pending chore', async () => {
    const onExitParentMode = vi.fn();
    const onSaveChore = vi.fn();
    const onDeleteChore = vi.fn();
    const onSaveReward = vi.fn();
    const onDeleteReward = vi.fn();
    const onFulfillReward = vi.fn();
    const onCancelClaimedReward = vi.fn();
    const onApproveChore = vi.fn().mockResolvedValue(undefined);
    const onRejectChore = vi.fn();
    const onAdjustStars = vi.fn();
    const onUpdateSettings = vi.fn();
    const onReloadAllData = vi.fn();

    render(
      <ParentDashboard
        settings={mockSettings}
        chores={mockChores}
        rewards={mockRewards}
        starLogs={mockStarLogs}
        onExitParentMode={onExitParentMode}
        onSaveChore={onSaveChore}
        onDeleteChore={onDeleteChore}
        onSaveReward={onSaveReward}
        onDeleteReward={onDeleteReward}
        onFulfillReward={onFulfillReward}
        onCancelClaimedReward={onCancelClaimedReward}
        onApproveChore={onApproveChore}
        onRejectChore={onRejectChore}
        onAdjustStars={onAdjustStars}
        onUpdateSettings={onUpdateSettings}
        onReloadAllData={onReloadAllData}
      />
    );

    expect(screen.getByText(/Parent Command Center/i)).toBeInTheDocument();
    expect(screen.getByText('Sarah')).toBeInTheDocument();

    // Click Approvals tab
    fireEvent.click(screen.getByRole('button', { name: /approvals/i }));
    expect(screen.getByText('Task Approval Queue')).toBeInTheDocument();
    expect(screen.getByText('Clean Bedroom')).toBeInTheDocument();

    // Approve chore
    const approveBtn = screen.getByRole('button', { name: /approve/i });
    fireEvent.click(approveBtn);

    await waitFor(() => {
      expect(onApproveChore).toHaveBeenCalledWith('chore_1');
    });
  });

  it('allows adding a new chore through the Chore Manager form', async () => {
    const onSaveChore = vi.fn().mockResolvedValue(undefined);

    render(
      <ParentDashboard
        settings={mockSettings}
        chores={mockChores}
        rewards={mockRewards}
        starLogs={mockStarLogs}
        onExitParentMode={vi.fn()}
        onSaveChore={onSaveChore}
        onDeleteChore={vi.fn()}
        onSaveReward={vi.fn()}
        onDeleteReward={vi.fn()}
        onFulfillReward={vi.fn()}
        onCancelClaimedReward={vi.fn()}
        onApproveChore={vi.fn()}
        onRejectChore={vi.fn()}
        onAdjustStars={vi.fn()}
        onUpdateSettings={vi.fn()}
        onReloadAllData={vi.fn()}
      />
    );

    // Open new chore modal
    fireEvent.click(screen.getByRole('button', { name: /add new chore/i }));

    const titleInput = screen.getByLabelText(/chore title/i);
    fireEvent.change(titleInput, { target: { value: 'Practice Piano' } });

    fireEvent.click(screen.getByRole('button', { name: /save chore/i }));

    await waitFor(() => {
      expect(onSaveChore).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Practice Piano',
        })
      );
    });
  });
});

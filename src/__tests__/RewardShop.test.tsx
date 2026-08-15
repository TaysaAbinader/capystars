import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { RewardShop } from '../components/child/RewardShop';
import type { Reward } from '../types';

const mockRewards: Reward[] = [
  {
    id: 'reward_1',
    title: '30 Mins iPad Game',
    icon: '🎮',
    costInStars: 5,
    status: 'available',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'reward_2',
    title: 'Trip to Ice Cream',
    icon: '🍦',
    costInStars: 20,
    status: 'available',
    createdAt: new Date().toISOString(),
  },
];

describe('RewardShop Component', () => {
  it('renders reward items with star prices and user balance', () => {
    const onClaimReward = vi.fn().mockResolvedValue({ success: true });

    render(
      <RewardShop
        currentStars={10}
        rewards={mockRewards}
        onClaimReward={onClaimReward}
      />
    );

    expect(screen.getByText('10 Stars')).toBeInTheDocument();
    expect(screen.getByText('30 Mins iPad Game')).toBeInTheDocument();
    expect(screen.getByText('Trip to Ice Cream')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /redeem prize!/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /need 10 more/i })).toBeDisabled();
  });

  it('claims an affordable reward when clicking Redeem', async () => {
    const onClaimReward = vi.fn().mockResolvedValue({ success: true });

    render(
      <RewardShop
        currentStars={10}
        rewards={mockRewards}
        onClaimReward={onClaimReward}
      />
    );

    const redeemButton = screen.getByRole('button', { name: /redeem prize!/i });
    fireEvent.click(redeemButton);

    await waitFor(() => {
      expect(onClaimReward).toHaveBeenCalledWith('reward_1');
    });
  });
});

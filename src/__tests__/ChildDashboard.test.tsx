import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChildDashboard } from '../components/child/ChildDashboard';
import type { Chore, PetState } from '../types';

const mockPet: PetState = {
  type: 'capybara',
  name: 'Boba',
  happiness: 85,
  level: 1,
  totalFedCount: 0,
};

const mockChores: Chore[] = [
  {
    id: 'chore_1',
    title: 'Brush Teeth',
    icon: '🪥',
    routine: 'morning',
    starsReward: 1,
    repeat: 'daily',
    status: 'todo',
    createdAt: new Date().toISOString(),
    orderIndex: 0,
  },
  {
    id: 'chore_2',
    title: 'Clean Toys',
    icon: '🧸',
    routine: 'afternoon',
    starsReward: 2,
    repeat: 'daily',
    status: 'todo',
    createdAt: new Date().toISOString(),
    orderIndex: 1,
  },
];

describe('ChildDashboard Component', () => {
  it('renders pet name, mood bar, routine tabs, and chore cards', () => {
    const onToggleChore = vi.fn();
    const onSelectPet = vi.fn();

    render(
      <ChildDashboard
        chores={mockChores}
        pet={mockPet}
        onToggleChore={onToggleChore}
        onSelectPet={onSelectPet}
      />
    );

    expect(screen.getByText('Boba')).toBeInTheDocument();
    expect(screen.getByText(/The Loyal capybara/i)).toBeInTheDocument();
    expect(screen.getByText('Brush Teeth')).toBeInTheDocument();
    expect(screen.getByText('Clean Toys')).toBeInTheDocument();
    expect(screen.getByText('Morning')).toBeInTheDocument();
  });

  it('filters chores when clicking routine tab', () => {
    const onToggleChore = vi.fn();
    const onSelectPet = vi.fn();

    render(
      <ChildDashboard
        chores={mockChores}
        pet={mockPet}
        onToggleChore={onToggleChore}
        onSelectPet={onSelectPet}
      />
    );

    // Click Morning tab
    fireEvent.click(screen.getByRole('button', { name: /morning/i }));
    expect(screen.getByText('Brush Teeth')).toBeInTheDocument();
    expect(screen.queryByText('Clean Toys')).not.toBeInTheDocument();
  });

  it('triggers onToggleChore when clicking chore check button', () => {
    const onToggleChore = vi.fn();
    const onSelectPet = vi.fn();

    render(
      <ChildDashboard
        chores={mockChores}
        pet={mockPet}
        onToggleChore={onToggleChore}
        onSelectPet={onSelectPet}
      />
    );

    const checkButton = screen.getByRole('button', { name: /mark chore: brush teeth/i });
    fireEvent.click(checkButton);
    expect(onToggleChore).toHaveBeenCalledWith(mockChores[0]);
  });
});

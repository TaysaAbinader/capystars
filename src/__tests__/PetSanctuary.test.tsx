import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { PetSanctuaryModal } from '../components/pet/PetSanctuaryModal';
import type { PetState } from '../types';

const mockPet: PetState = {
  type: 'capybara',
  name: 'Boba',
  happiness: 90,
  level: 1,
  totalFedCount: 0,
};

describe('PetSanctuaryModal Component', () => {
  it('renders all 6 pet companion choices', () => {
    const onSelectPet = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <PetSanctuaryModal
        currentPet={mockPet}
        isOpen={true}
        onClose={onClose}
        onSelectPet={onSelectPet}
      />
    );

    expect(screen.getByText('Chill Capybara')).toBeInTheDocument();
    expect(screen.getByText('Playful Kitten')).toBeInTheDocument();
    expect(screen.getByText('Happy Puppy')).toBeInTheDocument();
    expect(screen.getByText('Fluffy Bunny')).toBeInTheDocument();
    expect(screen.getByText('Magic Unicorn')).toBeInTheDocument();
    expect(screen.getByText('Baby Dragon')).toBeInTheDocument();
  });

  it('allows selecting unicorn, editing nickname, and adopting', async () => {
    const onSelectPet = vi.fn().mockResolvedValue(undefined);
    const onClose = vi.fn();

    render(
      <PetSanctuaryModal
        currentPet={mockPet}
        isOpen={true}
        onClose={onClose}
        onSelectPet={onSelectPet}
      />
    );

    // Click Unicorn card
    fireEvent.click(screen.getByText('Magic Unicorn'));

    // Edit Name
    const nameInput = screen.getByLabelText(/give your unicorn a name/i);
    fireEvent.change(nameInput, { target: { value: 'Rainbow Sparkle' } });

    // Click Adopt
    const adoptButton = screen.getByRole('button', { name: /adopt/i });
    fireEvent.click(adoptButton);

    await waitFor(() => {
      expect(onSelectPet).toHaveBeenCalledWith('unicorn', 'Rainbow Sparkle');
      expect(onClose).toHaveBeenCalled();
    });
  });
});

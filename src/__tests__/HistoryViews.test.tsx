import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WeeklyHistoryView } from '../components/history/WeeklyHistoryView';
import { MonthlyHistoryView } from '../components/history/MonthlyHistoryView';
import { DEFAULT_GOALS, DEFAULT_ACHIEVEMENTS } from '../db/defaultData';

describe('WeeklyHistoryView Component', () => {
  it('renders weekly navigation, goal bars, and 7-day cards', () => {
    render(
      <WeeklyHistoryView
        goals={DEFAULT_GOALS}
        achievements={DEFAULT_ACHIEVEMENTS}
        soundEnabled={false}
      />
    );

    expect(screen.getByText(/Weekly Progress & History/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Chores Goal/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Stars Goal/i)).toBeInTheDocument();
    expect(screen.getByText(/Day-by-Day Activity/i)).toBeInTheDocument();
    expect(screen.getByText(/Weekly Achievements/i)).toBeInTheDocument();
  });
});

describe('MonthlyHistoryView Component', () => {
  it('renders monthly navigation, calendar heatmap, and routine distribution', () => {
    render(
      <MonthlyHistoryView
        goals={DEFAULT_GOALS}
        achievements={DEFAULT_ACHIEVEMENTS}
        soundEnabled={false}
      />
    );

    expect(screen.getByText(/Monthly Overview & Badges/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Chores Milestone/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Star Stash/i)).toBeInTheDocument();
    expect(screen.getByText(/Activity Calendar/i)).toBeInTheDocument();
    expect(screen.getByText(/Routine Activity Distribution/i)).toBeInTheDocument();
    expect(screen.getByText(/Monthly Trophies/i)).toBeInTheDocument();
  });
});

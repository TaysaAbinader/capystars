import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sun, Sunset, Moon, Sparkles, LayoutGrid } from 'lucide-react';
import type { Chore, PetState, RoutineType, PetType } from '../../types';
import { PetCompanion } from '../pet/PetCompanion';
import { PetSanctuaryModal } from '../pet/PetSanctuaryModal';
import { RoutineSection } from './RoutineSection';
import { CelebrationModal } from './CelebrationModal';
import { triggerRoutineCelebration } from '../../utils/confetti';
import { playPopSound } from '../../utils/sound';

interface ChildDashboardProps {
  chores: Chore[];
  pet: PetState;
  onToggleChore: (chore: Chore) => Promise<void>;
  onSelectPet: (type: PetType, name: string) => Promise<void>;
  soundEnabled?: boolean;
}

type TabFilter = RoutineType | 'all';

interface RoutineTabConfig {
  id: TabFilter;
  label: string;
  emoji: string;
  icon: React.ComponentType<{ className?: string }>;
}

const ROUTINE_TABS: RoutineTabConfig[] = [
  { id: 'all', label: 'All Chores', emoji: '🏆', icon: LayoutGrid },
  { id: 'morning', label: 'Morning', emoji: '🌅', icon: Sun },
  { id: 'afternoon', label: 'Afternoon', emoji: '☀️', icon: Sunset },
  { id: 'evening', label: 'Bedtime', emoji: '🌙', icon: Moon },
  { id: 'bonus', label: 'Bonus Quests', emoji: '🌟', icon: Sparkles },
];

export const ChildDashboard: React.FC<ChildDashboardProps> = ({
  chores,
  pet,
  onToggleChore,
  onSelectPet,
  soundEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [isSanctuaryOpen, setIsSanctuaryOpen] = useState(false);
  const [celebrationInfo, setCelebrationInfo] = useState<{
    isOpen: boolean;
    routineTitle: string;
    earnedStars: number;
  }>({
    isOpen: false,
    routineTitle: '',
    earnedStars: 0,
  });

  const handleToggleChoreWrapper = async (chore: Chore) => {
    // Check if completing this chore completes the routine
    const routineChores = chores.filter((c) => c.routine === chore.routine);
    const completedBefore = routineChores.filter((c) => c.status === 'completed').length;
    const isNowCompleting = chore.status === 'todo';

    await onToggleChore(chore);

    if (isNowCompleting && completedBefore + 1 === routineChores.length && routineChores.length > 1) {
      // Entire routine completed!
      const routineName =
        chore.routine === 'morning'
          ? 'Morning Routine'
          : chore.routine === 'afternoon'
          ? 'Afternoon Routine'
          : chore.routine === 'evening'
          ? 'Bedtime Routine'
          : 'Bonus Quests';

      const totalStars = routineChores.reduce((acc, c) => acc + c.starsReward, 0);

      triggerRoutineCelebration();
      setCelebrationInfo({
        isOpen: true,
        routineTitle: routineName,
        earnedStars: totalStars,
      });
    }
  };

  const morningChores = chores.filter((c) => c.routine === 'morning');
  const afternoonChores = chores.filter((c) => c.routine === 'afternoon');
  const eveningChores = chores.filter((c) => c.routine === 'evening');
  const bonusChores = chores.filter((c) => c.routine === 'bonus');

  return (
    <div className="space-y-6">
      {/* 1. Animated Pet Companion Header */}
      <PetCompanion
        pet={pet}
        soundEnabled={soundEnabled}
        onOpenSanctuary={() => setIsSanctuaryOpen(true)}
      />

      {/* 2. Routine Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {ROUTINE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          // Count pending chores in tab
          const count =
            tab.id === 'all'
              ? chores.filter((c) => c.status === 'todo').length
              : chores.filter((c) => c.routine === tab.id && c.status === 'todo').length;

          return (
            <motion.button
              key={tab.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playPopSound(soundEnabled);
                setActiveTab(tab.id);
              }}
              className={`flex items-center gap-2 px-3.5 sm:px-4.5 py-2 sm:py-2.5 rounded-2xl font-bold text-xs sm:text-sm whitespace-nowrap transition-all cursor-pointer border-2 ${
                isActive
                  ? 'bg-amber-500 text-white border-amber-600 shadow-md shadow-amber-500/20'
                  : 'bg-white/80 text-amber-950 border-amber-200/80 hover:bg-amber-100/70'
              }`}
            >
              <span>{tab.emoji}</span>
              <span>{tab.label}</span>
              {count > 0 && (
                <span
                  className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ${
                    isActive ? 'bg-white/25 text-white' : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {count}
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* 3. Routine Sections */}
      <div className="space-y-4">
        {(activeTab === 'all' || activeTab === 'morning') && (
          <RoutineSection
            routine="morning"
            title="Morning Routine"
            emoji="🌅"
            description="Start the day like a superhero!"
            chores={morningChores}
            onToggleChore={handleToggleChoreWrapper}
            soundEnabled={soundEnabled}
          />
        )}

        {(activeTab === 'all' || activeTab === 'afternoon') && (
          <RoutineSection
            routine="afternoon"
            title="Afternoon & Homework"
            emoji="☀️"
            description="Study, play, and tidy up!"
            chores={afternoonChores}
            onToggleChore={handleToggleChoreWrapper}
            soundEnabled={soundEnabled}
          />
        )}

        {(activeTab === 'all' || activeTab === 'evening') && (
          <RoutineSection
            routine="evening"
            title="Bedtime Routine"
            emoji="🌙"
            description="Wind down for sweet dreams!"
            chores={eveningChores}
            onToggleChore={handleToggleChoreWrapper}
            soundEnabled={soundEnabled}
          />
        )}

        {(activeTab === 'all' || activeTab === 'bonus') && (
          <RoutineSection
            routine="bonus"
            title="Bonus Quests"
            emoji="🌟"
            description="Extra helpful chores for extra stars!"
            chores={bonusChores}
            onToggleChore={handleToggleChoreWrapper}
            soundEnabled={soundEnabled}
          />
        )}
      </div>

      {/* 4. Pet Sanctuary Modal */}
      <PetSanctuaryModal
        currentPet={pet}
        isOpen={isSanctuaryOpen}
        onClose={() => setIsSanctuaryOpen(false)}
        onSelectPet={onSelectPet}
        soundEnabled={soundEnabled}
      />

      {/* 5. Routine Celebration Modal */}
      <CelebrationModal
        isOpen={celebrationInfo.isOpen}
        routineTitle={celebrationInfo.routineTitle}
        earnedStars={celebrationInfo.earnedStars}
        onClose={() => setCelebrationInfo((prev) => ({ ...prev, isOpen: false }))}
        soundEnabled={soundEnabled}
      />
    </div>
  );
};

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Sun,
  Sunset,
  Moon,
  Sparkles,
  LayoutGrid,
  Calendar,
  BarChart2,
} from 'lucide-react';
import type { Chore, PetState, RoutineType, PetType, TimeframeGoals, ChildViewType } from '../../types';
import { PetCompanion } from '../pet/PetCompanion';
import { PetSanctuaryModal } from '../pet/PetSanctuaryModal';
import { RoutineSection } from './RoutineSection';
import { CelebrationModal } from './CelebrationModal';
import { GoalProgressBar } from '../history/GoalProgressBar';
import { triggerRoutineCelebration } from '../../utils/confetti';
import { playPopSound } from '../../utils/sound';
import { isChoreActiveOnDate, isWeekendDay } from '../../db';

interface ChildDashboardProps {
  chores: Chore[];
  pet: PetState;
  goals?: TimeframeGoals;
  onToggleChore: (chore: Chore) => Promise<void>;
  onSelectPet: (type: PetType, name: string) => Promise<void>;
  onNavigateView?: (view: ChildViewType) => void;
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
  goals = { dailyChoresTarget: 5, dailyStarsTarget: 10, weeklyChoresTarget: 30, weeklyStarsTarget: 60, monthlyChoresTarget: 120, monthlyStarsTarget: 250 },
  onToggleChore,
  onSelectPet,
  onNavigateView,
  soundEnabled = true,
}) => {
  const [activeTab, setActiveTab] = useState<TabFilter>('all');
  const [scheduleFilter, setScheduleFilter] = useState<'today' | 'all'>('today');
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

  const isTodayWeekend = isWeekendDay(new Date());

  // Filter chores based on active schedule (today vs all)
  const scheduledChores = chores.filter((c) => {
    if (scheduleFilter === 'all') return true;
    return isChoreActiveOnDate(c, new Date());
  });

  // Calculate today's completed chores count for daily goal
  const completedTodayCount = scheduledChores.filter((c) => c.status === 'completed').length;

  const handleToggleChoreWrapper = async (chore: Chore) => {
    // Check if completing this chore completes the routine
    const routineChores = scheduledChores.filter((c) => c.routine === chore.routine);
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

  const morningChores = scheduledChores.filter((c) => c.routine === 'morning');
  const afternoonChores = scheduledChores.filter((c) => c.routine === 'afternoon');
  const eveningChores = scheduledChores.filter((c) => c.routine === 'evening');
  const bonusChores = scheduledChores.filter((c) => c.routine === 'bonus');

  return (
    <div className="space-y-6">
      {/* 1. Animated Pet Companion Header */}
      <PetCompanion
        pet={pet}
        soundEnabled={soundEnabled}
        onOpenSanctuary={() => setIsSanctuaryOpen(true)}
      />

      {/* 2. Today's Goal Progress & Quick Navigation Links */}
      <div className="space-y-3">
        <GoalProgressBar
          current={completedTodayCount}
          target={goals.dailyChoresTarget}
          label="Today's Chore Goal"
          sublabel={
            isTodayWeekend
              ? '🏖️ Weekend helpers goal for today'
              : '🎒 School weekday routine goal'
          }
          icon="🎯"
          colorScheme="amber"
          suffix="Chores"
        />

        {/* Quick-links row to Weekly / Monthly */}
        {onNavigateView && (
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => {
                playPopSound(soundEnabled);
                onNavigateView('weekly');
              }}
              className="p-3 bg-white hover:bg-blue-50 border border-blue-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-blue-100 text-blue-700">
                  <BarChart2 className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-blue-700">
                    Weekly Progress
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400">View 7-day report & badges</p>
                </div>
              </div>
              <span className="text-blue-500 font-black text-sm">→</span>
            </button>

            <button
              onClick={() => {
                playPopSound(soundEnabled);
                onNavigateView('monthly');
              }}
              className="p-3 bg-white hover:bg-purple-50 border border-purple-200 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer group shadow-2xs"
            >
              <div className="flex items-center gap-2.5">
                <span className="p-2 rounded-xl bg-purple-100 text-purple-700">
                  <Calendar className="w-4 h-4" />
                </span>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-800 group-hover:text-purple-700">
                    Monthly History
                  </h4>
                  <p className="text-[10px] font-semibold text-slate-400">Calendar heatmap & trophies</p>
                </div>
              </div>
              <span className="text-purple-500 font-black text-sm">→</span>
            </button>
          </div>
        )}
      </div>

      {/* 3. Schedule Filter Bar (Today's Schedule vs All Chores) */}
      <div className="flex items-center justify-between gap-3 bg-white/70 backdrop-blur-xs p-2 sm:p-2.5 rounded-2xl border border-amber-200">
        <div className="flex items-center gap-2 text-xs font-black text-amber-950 px-2">
          <span>{isTodayWeekend ? '🏖️ Weekend Mode' : '🎒 Weekday Mode'}</span>
        </div>

        <div className="flex items-center gap-1 bg-amber-100/70 p-1 rounded-xl">
          <button
            onClick={() => {
              playPopSound(soundEnabled);
              setScheduleFilter('today');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scheduleFilter === 'today'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            Today's Chores ({chores.filter((c) => isChoreActiveOnDate(c, new Date())).length})
          </button>
          <button
            onClick={() => {
              playPopSound(soundEnabled);
              setScheduleFilter('all');
            }}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              scheduleFilter === 'all'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            All Scheduled ({chores.length})
          </button>
        </div>
      </div>

      {/* 4. Routine Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {ROUTINE_TABS.map((tab) => {
          const isActive = activeTab === tab.id;

          // Count pending chores in tab
          const count =
            tab.id === 'all'
              ? scheduledChores.filter((c) => c.status === 'todo').length
              : scheduledChores.filter((c) => c.routine === tab.id && c.status === 'todo').length;

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

      {/* 5. Routine Sections */}
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

      {/* 6. Pet Sanctuary Modal */}
      <PetSanctuaryModal
        currentPet={pet}
        isOpen={isSanctuaryOpen}
        onClose={() => setIsSanctuaryOpen(false)}
        onSelectPet={onSelectPet}
        soundEnabled={soundEnabled}
      />

      {/* 7. Routine Celebration Modal */}
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


import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import type { Chore, RoutineType } from '../../types';
import { ChoreCard } from './ChoreCard';

interface RoutineSectionProps {
  routine: RoutineType;
  title: string;
  emoji: string;
  description: string;
  chores: Chore[];
  onToggleChore: (chore: Chore) => Promise<void>;
  soundEnabled?: boolean;
}

export const RoutineSection: React.FC<RoutineSectionProps> = ({
  title,
  emoji,
  description,
  chores,
  onToggleChore,
  soundEnabled = true,
}) => {
  const completedCount = chores.filter((c) => c.status === 'completed').length;
  const totalCount = chores.length;
  const isAllComplete = totalCount > 0 && completedCount === totalCount;

  return (
    <section className="glass-panel rounded-3xl p-4 sm:p-6 border-2 border-amber-200/80 mb-6 shadow-sm">
      {/* Section Header */}
      <div className="flex items-center justify-between gap-3 mb-4 pb-3 border-b border-amber-200/60">
        <div className="flex items-center gap-3">
          <span className="text-3xl sm:text-4xl">{emoji}</span>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-amber-950 flex items-center gap-2">
              <span>{title}</span>
              {isAllComplete && (
                <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Done!
                </span>
              )}
            </h2>
            <p className="text-xs text-amber-800/80 font-medium">{description}</p>
          </div>
        </div>

        {/* Progress Counter Pill */}
        <div className="flex items-center gap-2">
          <div className="bg-amber-100/90 text-amber-900 text-xs sm:text-sm font-black px-3 py-1.5 rounded-2xl border border-amber-300">
            {completedCount} / {totalCount}
          </div>
        </div>
      </div>

      {/* Chore Cards Grid */}
      {chores.length === 0 ? (
        <div className="text-center py-6 text-slate-400 font-medium text-sm">
          No chores in this routine yet. Ask your parent to add one! ✨
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <AnimatePresence>
            {chores.map((chore) => (
              <ChoreCard
                key={chore.id}
                chore={chore}
                onToggleComplete={onToggleChore}
                soundEnabled={soundEnabled}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Routine Completion Cheer Banner */}
      {isAllComplete && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-2xl bg-gradient-to-r from-emerald-100 via-teal-50 to-emerald-100 border border-emerald-300 text-center flex items-center justify-center gap-2 text-xs sm:text-sm font-extrabold text-emerald-900 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-emerald-600 animate-spin" />
          <span>All {title} chores finished! You're a rockstar! 🌟</span>
        </motion.div>
      )}
    </section>
  );
};

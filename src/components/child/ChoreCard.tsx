import React from 'react';
import { motion } from 'framer-motion';
import { Check, Star, Clock } from 'lucide-react';
import type { Chore } from '../../types';
import { triggerTaskConfetti } from '../../utils/confetti';
import { playStarChime, playPopSound } from '../../utils/sound';

interface ChoreCardProps {
  chore: Chore;
  onToggleComplete: (chore: Chore) => Promise<void>;
  soundEnabled?: boolean;
}

export const ChoreCard: React.FC<ChoreCardProps> = ({
  chore,
  onToggleComplete,
  soundEnabled = true,
}) => {
  const isCompleted = chore.status === 'completed';
  const isPending = chore.status === 'pending_approval';

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!isCompleted && !isPending) {
      // Trigger animations and sound
      const rect = e.currentTarget.getBoundingClientRect();
      const x = (rect.left + rect.width / 2) / window.innerWidth;
      const y = (rect.top + rect.height / 2) / window.innerHeight;
      triggerTaskConfetti(x, y);
      playStarChime(soundEnabled);
    } else {
      playPopSound(soundEnabled);
    }
    await onToggleComplete(chore);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileTap={{ scale: 0.98 }}
      className={`glass-card rounded-2xl p-3.5 sm:p-4.5 flex items-center justify-between gap-3 border-2 transition-all shadow-sm ${
        isCompleted
          ? 'bg-emerald-50/70 border-emerald-300 opacity-90'
          : isPending
          ? 'bg-amber-50/80 border-amber-300'
          : 'border-amber-200/70 hover:border-amber-400/80 hover:shadow-md'
      }`}
    >
      {/* Left: Icon & Title */}
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        {/* Large Emoji / Icon */}
        <div
          className={`w-12 h-12 sm:w-13 sm:h-13 rounded-2xl flex items-center justify-center text-2xl sm:text-3xl flex-shrink-0 shadow-inner ${
            isCompleted
              ? 'bg-emerald-100'
              : isPending
              ? 'bg-amber-100'
              : 'bg-amber-100/80'
          }`}
        >
          {chore.icon || '⭐️'}
        </div>

        <div className="min-w-0 flex-1">
          <h3
            className={`text-base sm:text-lg font-bold truncate leading-tight ${
              isCompleted
                ? 'line-through text-emerald-900/70'
                : 'text-slate-800'
            }`}
          >
            {chore.title}
          </h3>

          <div className="flex items-center gap-2 mt-1">
            {/* Star Reward Pill */}
            <span className="inline-flex items-center gap-1 bg-amber-100/90 text-amber-900 text-xs font-black px-2 py-0.5 rounded-lg border border-amber-300 shadow-2xs">
              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
              +{chore.starsReward} {chore.starsReward === 1 ? 'Star' : 'Stars'}
            </span>

            {/* Pending Status Tag */}
            {isPending && (
              <span className="inline-flex items-center gap-1 bg-amber-200 text-amber-900 text-xs font-bold px-2 py-0.5 rounded-lg">
                <Clock className="w-3 h-3" />
                Under Review
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Tactile Checkbox Button */}
      <button
        onClick={handleClick}
        className={`w-11 h-11 sm:w-12 sm:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer flex-shrink-0 ${
          isCompleted
            ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/30'
            : isPending
            ? 'bg-amber-400 text-amber-950 shadow-md shadow-amber-400/30'
            : 'bg-white border-2 border-amber-300 text-transparent hover:border-amber-500 active:scale-90 shadow-sm'
        }`}
        title={isCompleted ? 'Done! Tap to unmark' : 'Tap to complete!'}
        aria-label={`Mark chore: ${chore.title}`}
      >
        {isCompleted ? (
          <Check className="w-6 h-6 stroke-[3.5]" />
        ) : isPending ? (
          <Clock className="w-5 h-5 stroke-[2.5]" />
        ) : (
          <Check className="w-6 h-6 text-amber-200 stroke-[3]" />
        )}
      </button>
    </motion.div>
  );
};

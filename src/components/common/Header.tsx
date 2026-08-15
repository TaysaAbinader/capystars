import React from 'react';
import { motion } from 'framer-motion';
import { Star, Flame, Lock, Volume2, VolumeX, Gift, CheckSquare } from 'lucide-react';
import type { AppSettings } from '../../types';
import { playPopSound } from '../../utils/sound';

interface HeaderProps {
  settings: AppSettings;
  activeView: 'chores' | 'rewards';
  onViewChange: (view: 'chores' | 'rewards') => void;
  onOpenParentGate: () => void;
  onToggleSound: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeView,
  onViewChange,
  onOpenParentGate,
  onToggleSound,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b-2 border-amber-200/80 px-4 sm:px-6 py-3 safe-top">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
        {/* Left: Child Name & Streak */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center font-extrabold text-lg shadow-md shadow-amber-500/20 border-2 border-white">
            ✨
          </div>
          <div>
            <h1 className="text-base sm:text-lg font-extrabold text-amber-950 leading-tight">
              {settings.childName}
            </h1>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-600">
              <Flame className="w-3.5 h-3.5 fill-orange-500 text-orange-500 animate-bounce" />
              <span>{settings.currentStreakDays} Day Streak!</span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher Tabs (Chores vs Rewards Shop) */}
        <div className="flex bg-amber-100/80 p-1 rounded-2xl border border-amber-200/90 shadow-inner">
          <button
            onClick={() => {
              playPopSound(settings.soundEnabled);
              onViewChange('chores');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeView === 'chores'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-600" />
            <span>Chores</span>
          </button>
          <button
            onClick={() => {
              playPopSound(settings.soundEnabled);
              onViewChange('rewards');
            }}
            className={`flex items-center gap-1.5 px-3 sm:px-4 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
              activeView === 'rewards'
                ? 'bg-white text-amber-950 shadow-sm'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            <Gift className="w-4 h-4 text-pink-500" />
            <span>Rewards</span>
          </button>
        </div>

        {/* Right: Star Counter, Sound Toggle, and Parent Lock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Glowing Star Counter */}
          <motion.div
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 px-3 sm:px-4 py-1.5 rounded-2xl font-black text-sm sm:text-base shadow-md shadow-amber-500/20 border-2 border-amber-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Star className="w-4 h-4 sm:w-5 sm:h-5 text-amber-900 fill-amber-900" />
            <span>{settings.currentStars}</span>
          </motion.div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
            title={settings.soundEnabled ? 'Mute Sounds' : 'Unmute Sounds'}
            aria-label="Toggle sound effects"
          >
            {settings.soundEnabled ? (
              <Volume2 className="w-4 h-4 text-amber-600" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-400" />
            )}
          </button>

          {/* Parent Lock Icon */}
          <button
            onClick={onOpenParentGate}
            className="p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-amber-100 rounded-xl transition-colors border border-slate-200/80 cursor-pointer"
            title="Parent Area (PIN Required)"
            aria-label="Parent Dashboard"
          >
            <Lock className="w-4 h-4 text-slate-700" />
          </button>
        </div>
      </div>
    </header>
  );
};

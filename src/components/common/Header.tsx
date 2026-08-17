import React from 'react';
import { motion } from 'framer-motion';
import {
  Star,
  Flame,
  Lock,
  Volume2,
  VolumeX,
  Gift,
  CheckSquare,
  BarChart2,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import type { AppSettings, SyncStatus, ChildViewType } from '../../types';
import { playPopSound } from '../../utils/sound';

interface HeaderProps {
  settings: AppSettings;
  activeView: ChildViewType;
  onViewChange: (view: ChildViewType) => void;
  onOpenParentGate: () => void;
  onToggleSound: () => void;
  syncStatus?: SyncStatus;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  activeView,
  onViewChange,
  onOpenParentGate,
  onToggleSound,
  syncStatus,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/85 backdrop-blur-md border-b-2 border-amber-200/80 px-3 sm:px-6 py-2.5 sm:py-3 safe-top">
      <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        {/* Left: Child Name & Streak */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-400 text-white flex items-center justify-center font-extrabold text-base sm:text-lg shadow-md shadow-amber-500/20 border-2 border-white flex-shrink-0">
            ✨
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-extrabold text-amber-950 leading-tight truncate max-w-[120px] sm:max-w-none">
              {settings.childName}
            </h1>
            <div className="flex items-center gap-1 text-[11px] sm:text-xs font-bold text-orange-600">
              <Flame className="w-3 h-3 sm:w-3.5 sm:h-3.5 fill-orange-500 text-orange-500 animate-bounce" />
              <span>{settings.currentStreakDays}d Streak!</span>
            </div>
          </div>
        </div>

        {/* Center: View Switcher Navigation Tabs */}
        <div className="order-last sm:order-none w-full sm:w-auto flex items-center justify-center bg-amber-100/80 p-1 rounded-2xl border border-amber-200/90 shadow-inner overflow-x-auto">
          <button
            onClick={() => {
              playPopSound(settings.soundEnabled);
              onViewChange('chores');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'chores'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-600" />
            <span>Today</span>
          </button>

          <button
            onClick={() => {
              playPopSound(settings.soundEnabled);
              onViewChange('weekly');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'weekly'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            <BarChart2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-600" />
            <span>Weekly</span>
          </button>

          <button
            onClick={() => {
              playPopSound(settings.soundEnabled);
              onViewChange('monthly');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'monthly'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-600" />
            <span>Monthly</span>
          </button>

          <button
            onClick={() => {
              playPopSound(settings.soundEnabled);
              onViewChange('rewards');
            }}
            className={`flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-xl font-bold text-xs sm:text-sm transition-all cursor-pointer whitespace-nowrap ${
              activeView === 'rewards'
                ? 'bg-white text-amber-950 shadow-xs'
                : 'text-amber-800/70 hover:text-amber-950'
            }`}
          >
            <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-pink-500" />
            <span>Rewards</span>
          </button>
        </div>

        {/* Right: Star Counter, Sound Toggle, and Parent Lock */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Glowing Star Counter */}
          <motion.div
            className="flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 px-2.5 sm:px-3.5 py-1 sm:py-1.5 rounded-2xl font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 border-2 border-amber-300"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Star className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-900 fill-amber-900" />
            <span>{settings.currentStars}</span>
          </motion.div>

          {/* Sound Toggle */}
          <button
            onClick={onToggleSound}
            className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors cursor-pointer"
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
            className="relative p-1.5 sm:p-2 text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-amber-100 rounded-xl transition-colors border border-slate-200/80 cursor-pointer"
            title="Parent Area (PIN Required)"
            aria-label="Parent Dashboard"
          >
            <Lock className="w-4 h-4 text-slate-700" />
            {/* Sync status dot */}
            {syncStatus && syncStatus !== 'idle' && (
              <span
                className={`absolute -top-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-white ${
                  syncStatus === 'synced'
                    ? 'bg-emerald-400'
                    : syncStatus === 'syncing'
                    ? 'bg-blue-400 animate-pulse'
                    : syncStatus === 'error'
                    ? 'bg-red-400'
                    : syncStatus === 'offline'
                    ? 'bg-orange-400'
                    : ''
                }`}
              />
            )}
            {syncStatus === 'syncing' && (
              <RefreshCw className="absolute -top-1 -right-1 w-3 h-3 text-blue-500 animate-spin" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};


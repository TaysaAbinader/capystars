import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy } from 'lucide-react';

interface GoalProgressBarProps {
  current: number;
  target: number;
  label: string;
  sublabel?: string;
  icon?: string;
  colorScheme?: 'amber' | 'emerald' | 'blue' | 'purple' | 'rose';
  suffix?: string;
  className?: string;
}

export const GoalProgressBar: React.FC<GoalProgressBarProps> = ({
  current,
  target,
  label,
  sublabel,
  icon = '🎯',
  colorScheme = 'amber',
  suffix = 'Chores',
  className = '',
}) => {
  const percentage = Math.min(100, Math.round((current / (target || 1)) * 100));
  const isCompleted = current >= target;

  const colorStyles = {
    amber: {
      bar: 'from-amber-400 to-orange-500',
      bg: 'bg-amber-100',
      badge: 'bg-amber-500 text-white',
      border: 'border-amber-200',
      glow: 'shadow-amber-500/25',
    },
    emerald: {
      bar: 'from-emerald-400 to-teal-500',
      bg: 'bg-emerald-100',
      badge: 'bg-emerald-500 text-white',
      border: 'border-emerald-200',
      glow: 'shadow-emerald-500/25',
    },
    blue: {
      bar: 'from-blue-400 to-indigo-500',
      bg: 'bg-blue-100',
      badge: 'bg-blue-500 text-white',
      border: 'border-blue-200',
      glow: 'shadow-blue-500/25',
    },
    purple: {
      bar: 'from-purple-400 to-pink-500',
      bg: 'bg-purple-100',
      badge: 'bg-purple-500 text-white',
      border: 'border-purple-200',
      glow: 'shadow-purple-500/25',
    },
    rose: {
      bar: 'from-pink-400 to-rose-500',
      bg: 'bg-pink-100',
      badge: 'bg-rose-500 text-white',
      border: 'border-pink-200',
      glow: 'shadow-rose-500/25',
    },
  }[colorScheme];

  return (
    <div className={`p-4 bg-white/95 rounded-3xl border ${colorStyles.border} shadow-sm ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-xl">{icon}</span>
          <div>
            <h4 className="font-extrabold text-slate-800 text-sm leading-tight">{label}</h4>
            {sublabel && <p className="text-[11px] font-semibold text-slate-400">{sublabel}</p>}
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="font-black text-slate-800 text-sm">
            {current}
            <span className="text-slate-400 text-xs font-bold"> / {target} {suffix}</span>
          </span>
          {isCompleted && (
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-500 text-white flex items-center gap-1 animate-pulse">
              <Trophy className="w-3 h-3" />
              Done!
            </span>
          )}
        </div>
      </div>

      {/* Progress Track */}
      <div className={`w-full h-4 rounded-full ${colorStyles.bg} overflow-hidden p-0.5 shadow-inner`}>
        <motion.div
          className={`h-full rounded-full bg-gradient-to-r ${colorStyles.bar} shadow-md ${colorStyles.glow}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ type: 'spring', stiffness: 60, damping: 15 }}
        />
      </div>

      {/* Footer info */}
      <div className="flex items-center justify-between text-[11px] font-bold mt-2 text-slate-500">
        <span>{percentage}% of goal reached</span>
        {isCompleted ? (
          <span className="text-emerald-600 font-black flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5" /> Fantastic Job!
          </span>
        ) : (
          <span className="text-amber-600">
            {Math.max(0, target - current)} more to go!
          </span>
        )}
      </div>
    </div>
  );
};

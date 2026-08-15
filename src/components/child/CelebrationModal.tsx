import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Trophy, Star } from 'lucide-react';
import { playFanfare } from '../../utils/sound';

interface CelebrationModalProps {
  isOpen: boolean;
  routineTitle: string;
  earnedStars: number;
  onClose: () => void;
  soundEnabled?: boolean;
}

export const CelebrationModal: React.FC<CelebrationModalProps> = ({
  isOpen,
  routineTitle,
  earnedStars,
  onClose,
  soundEnabled = true,
}) => {
  React.useEffect(() => {
    if (isOpen) {
      playFanfare(soundEnabled);
    }
  }, [isOpen, soundEnabled]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 30 }}
        className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 text-center shadow-2xl border-4 border-amber-300 relative overflow-hidden"
      >
        {/* Shimmer Background */}
        <div className="absolute inset-0 bg-gradient-to-tr from-amber-100/40 via-yellow-100/30 to-pink-100/40 pointer-events-none" />

        {/* Animated Trophy */}
        <motion.div
          animate={{ scale: [1, 1.15, 1], rotate: [0, -8, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          className="w-20 h-20 bg-gradient-to-tr from-amber-400 to-yellow-400 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-500/30 border-2 border-white"
        >
          <Trophy className="w-10 h-10 text-amber-950" />
        </motion.div>

        <h3 className="text-2xl sm:text-3xl font-extrabold text-amber-950 mb-1">
          Awesome Job! 🎉
        </h3>
        <p className="text-sm font-semibold text-amber-800 mb-4">
          You finished your entire <span className="font-extrabold text-amber-900">{routineTitle}</span>!
        </p>

        {/* Reward Box */}
        <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 mb-6 flex items-center justify-center gap-3">
          <Star className="w-8 h-8 text-amber-500 fill-amber-500 animate-spin" />
          <div className="text-left">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Total Stars Added</span>
            <div className="text-xl font-black text-amber-950">+{earnedStars} Stars Earned! ⭐️</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3.5 px-6 rounded-2xl font-extrabold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 btn-tactile flex items-center justify-center gap-2 text-base cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
          <span>Keep Shining!</span>
        </button>
      </motion.div>
    </div>
  );
};

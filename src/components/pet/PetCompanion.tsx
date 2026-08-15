import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, RefreshCw } from 'lucide-react';
import type { PetState } from '../../types';
import { CapybaraPet } from './CapybaraPet';
import { KittenPet } from './KittenPet';
import { PuppyPet } from './PuppyPet';
import { BunnyPet } from './BunnyPet';
import { UnicornPet } from './UnicornPet';
import { DragonPet } from './DragonPet';
import { playPetSqueak } from '../../utils/sound';

interface PetCompanionProps {
  pet: PetState;
  soundEnabled?: boolean;
  onOpenSanctuary: () => void;
  isCelebrating?: boolean;
}

export const PetCompanion: React.FC<PetCompanionProps> = ({
  pet,
  soundEnabled = true,
  onOpenSanctuary,
  isCelebrating,
}) => {
  const [showHeartBubble, setShowHeartBubble] = useState(false);
  const [bubbleMessage, setBubbleMessage] = useState<string | null>(null);

  const handlePetTap = () => {
    setShowHeartBubble(true);
    playPetSqueak(soundEnabled);

    const happyMessages = [
      `I love you! ❤️`,
      `You're doing great today! 🌟`,
      `Chore champion! 🏆`,
      `Yay, tickles! ✨`,
      `Look at our stars shine! ⭐️`,
    ];
    setBubbleMessage(happyMessages[Math.floor(Math.random() * happyMessages.length)]);

    setTimeout(() => {
      setShowHeartBubble(false);
      setBubbleMessage(null);
    }, 2400);
  };

  const renderPetAvatar = () => {
    const props = {
      happiness: pet.happiness,
      isCelebrating,
      onTap: handlePetTap,
    };

    switch (pet.type) {
      case 'capybara':
        return <CapybaraPet {...props} />;
      case 'kitten':
        return <KittenPet {...props} />;
      case 'puppy':
        return <PuppyPet {...props} />;
      case 'bunny':
        return <BunnyPet {...props} />;
      case 'unicorn':
        return <UnicornPet {...props} />;
      case 'dragon':
        return <DragonPet {...props} />;
      default:
        return <CapybaraPet {...props} />;
    }
  };

  return (
    <div className="glass-panel rounded-3xl p-4 sm:p-5 relative flex flex-col md:flex-row items-center justify-between gap-4 border-2 border-amber-200/80 shadow-lg shadow-amber-500/5">
      {/* Speech / Love Bubble */}
      <AnimatePresence>
        {(showHeartBubble || bubbleMessage) && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8, y: -10 }}
            className="absolute -top-6 left-1/2 md:left-24 -translate-x-1/2 bg-white/95 text-amber-900 px-4 py-1.5 rounded-full shadow-md text-sm font-semibold border border-amber-300 flex items-center gap-1.5 z-20 whitespace-nowrap"
          >
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500 animate-pulse" />
            <span>{bubbleMessage || `${pet.name} is so happy!`}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Left: Pet Character & Name */}
      <div className="flex items-center gap-3">
        <div className="relative">
          {renderPetAvatar()}
          {/* Level Badge */}
          <span className="absolute -bottom-1 -right-1 bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-xs px-2.5 py-0.5 rounded-full shadow border border-white">
            Lvl {pet.level}
          </span>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-bold text-amber-950 tracking-wide">
              {pet.name}
            </h2>
            <button
              onClick={onOpenSanctuary}
              className="p-1.5 hover:bg-amber-100 rounded-full text-amber-700 transition-colors"
              title="Switch or adopt a new pet"
              aria-label="Pet Sanctuary"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <p className="text-xs sm:text-sm text-amber-800/80 font-medium capitalize flex items-center gap-1">
            <span>The Loyal {pet.type}</span>
            {pet.happiness >= 95 ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-0.5">
                • Super Happy! 💖
              </span>
            ) : pet.happiness >= 60 ? (
              <span className="text-amber-600 font-semibold">• Happy 😊</span>
            ) : (
              <span className="text-blue-500 font-semibold">• Needs Chores! 🍎</span>
            )}
          </p>
        </div>
      </div>

      {/* Right: Happiness Progress Bar & Action */}
      <div className="w-full md:w-64 flex flex-col gap-2">
        <div className="flex justify-between items-center text-xs font-bold text-amber-900">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Happiness Energy
          </span>
          <span>{pet.happiness}%</span>
        </div>

        {/* Progress Bar Container */}
        <div className="w-full bg-amber-100/90 rounded-full h-4 p-0.5 border border-amber-200 overflow-hidden shadow-inner">
          <motion.div
            className={`h-full rounded-full ${
              pet.happiness >= 95
                ? 'bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400'
                : pet.happiness >= 60
                ? 'bg-gradient-to-r from-amber-400 via-orange-400 to-rose-400'
                : 'bg-gradient-to-r from-blue-400 to-indigo-400'
            }`}
            initial={{ width: 0 }}
            animate={{ width: `${pet.happiness}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-amber-800/70 font-medium">
          <span>Complete chores to level up!</span>
          <button
            onClick={onOpenSanctuary}
            className="text-amber-700 hover:text-amber-900 underline font-semibold cursor-pointer"
          >
            Pet Sanctuary 🐾
          </button>
        </div>
      </div>
    </div>
  );
};

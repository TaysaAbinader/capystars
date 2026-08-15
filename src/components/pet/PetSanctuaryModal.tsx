import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, Sparkles, Check, Heart } from 'lucide-react';
import type { PetType, PetState } from '../../types';
import { CapybaraPet } from './CapybaraPet';
import { KittenPet } from './KittenPet';
import { PuppyPet } from './PuppyPet';
import { BunnyPet } from './BunnyPet';
import { UnicornPet } from './UnicornPet';
import { DragonPet } from './DragonPet';
import { playPopSound, playStarChime } from '../../utils/sound';

interface PetSanctuaryModalProps {
  currentPet: PetState;
  isOpen: boolean;
  onClose: () => void;
  onSelectPet: (type: PetType, name: string) => Promise<void>;
  soundEnabled?: boolean;
}

interface PetChoice {
  type: PetType;
  title: string;
  defaultName: string;
  personality: string;
  accentColor: string;
  bgGradient: string;
  icon: string;
}

const PET_ROSTER: PetChoice[] = [
  {
    type: 'capybara',
    title: 'Chill Capybara',
    defaultName: 'Boba',
    personality: 'Loves hot spring baths, balancing oranges, and spreading peaceful vibes.',
    accentColor: 'border-amber-400 text-amber-900',
    bgGradient: 'from-amber-100 to-orange-50',
    icon: '🦫',
  },
  {
    type: 'kitten',
    title: 'Playful Kitten',
    defaultName: 'Mochi',
    personality: 'Loves chasing yarn balls, purring when happy, and cozy cuddles.',
    accentColor: 'border-pink-400 text-pink-900',
    bgGradient: 'from-pink-100 to-rose-50',
    icon: '🐱',
  },
  {
    type: 'puppy',
    title: 'Happy Puppy',
    defaultName: 'Biscuit',
    personality: 'Wags its tail at superspeed, loves fetch, and cheers for every chore!',
    accentColor: 'border-yellow-400 text-yellow-900',
    bgGradient: 'from-amber-100 to-yellow-50',
    icon: '🐶',
  },
  {
    type: 'bunny',
    title: 'Fluffy Bunny',
    defaultName: 'Clover',
    personality: 'Twitches its cute nose, hops with excitement, and loves crunchy carrots.',
    accentColor: 'border-slate-300 text-slate-800',
    bgGradient: 'from-slate-100 to-blue-50',
    icon: '🐰',
  },
  {
    type: 'unicorn',
    title: 'Magic Unicorn',
    defaultName: 'Stardust',
    personality: 'Sparkles with magical rainbows and shoots lucky star dust on completions!',
    accentColor: 'border-purple-400 text-purple-900',
    bgGradient: 'from-purple-100 to-pink-50',
    icon: '🦄',
  },
  {
    type: 'dragon',
    title: 'Baby Dragon',
    defaultName: 'Ember',
    personality: 'Flaps tiny wings, makes gentle smoke rings, and guards your star hoard.',
    accentColor: 'border-emerald-400 text-emerald-900',
    bgGradient: 'from-emerald-100 to-teal-50',
    icon: '🐲',
  },
];

export const PetSanctuaryModal: React.FC<PetSanctuaryModalProps> = ({
  currentPet,
  isOpen,
  onClose,
  onSelectPet,
  soundEnabled = true,
}) => {
  const [selectedType, setSelectedType] = useState<PetType>(currentPet.type);
  const [customName, setCustomName] = useState<string>(currentPet.name);
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handlePickPetType = (pet: PetChoice) => {
    setSelectedType(pet.type);
    if (selectedType !== pet.type) {
      setCustomName(pet.defaultName);
    }
    playPopSound(soundEnabled);
  };

  const handleAdopt = async () => {
    setIsSaving(true);
    playStarChime(soundEnabled);
    await onSelectPet(selectedType, customName.trim() || 'My Pet');
    setIsSaving(false);
    onClose();
  };

  const renderPetPreview = (type: PetType) => {
    const props = { happiness: 85, isCelebrating: false };
    switch (type) {
      case 'capybara': return <CapybaraPet {...props} />;
      case 'kitten': return <KittenPet {...props} />;
      case 'puppy': return <PuppyPet {...props} />;
      case 'bunny': return <BunnyPet {...props} />;
      case 'unicorn': return <UnicornPet {...props} />;
      case 'dragon': return <DragonPet {...props} />;
      default: return <CapybaraPet {...props} />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border-4 border-amber-300 p-5 sm:p-7 relative"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-full transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-800 font-bold px-4 py-1 rounded-full text-sm mb-2">
            <Sparkles className="w-4 h-4 text-amber-500" />
            The Pet Sanctuary
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-amber-950">
            Choose Your Chore Companion! 🐾
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Pick a pet and give them a special nickname. You can change your companion anytime!
          </p>
        </div>

        {/* Pet Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4 mb-6">
          {PET_ROSTER.map((pet) => {
            const isSelected = selectedType === pet.type;
            return (
              <motion.button
                key={pet.type}
                onClick={() => handlePickPetType(pet)}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex flex-col items-center text-center p-3 rounded-2xl border-2 transition-all relative overflow-hidden bg-gradient-to-b ${pet.bgGradient} ${
                  isSelected
                    ? 'border-amber-500 ring-4 ring-amber-300/60 shadow-lg'
                    : 'border-slate-200 hover:border-slate-300 opacity-90'
                }`}
              >
                {isSelected && (
                  <div className="absolute top-2 right-2 bg-amber-500 text-white rounded-full p-1 shadow">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                <div className="scale-75 -my-3">{renderPetPreview(pet.type)}</div>
                <h4 className="font-bold text-sm text-slate-900 mt-1 flex items-center gap-1">
                  <span>{pet.icon}</span> {pet.title}
                </h4>
                <p className="text-[11px] text-slate-600 mt-1 line-clamp-2 px-1">
                  {pet.personality}
                </p>
              </motion.button>
            );
          })}
        </div>

        {/* Pet Nickname Customization */}
        <div className="bg-amber-50/80 rounded-2xl p-4 border border-amber-200 mb-6">
          <label htmlFor="petNameInput" className="block text-sm font-bold text-amber-950 mb-1.5 flex items-center gap-1.5">
            <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />
            Give your {selectedType} a Name:
          </label>
          <div className="flex gap-2">
            <input
              id="petNameInput"
              type="text"
              value={customName}
              onChange={(e) => setCustomName(e.target.value)}
              maxLength={20}
              placeholder="e.g. Boba, Sparkles, Mochi..."
              className="flex-1 bg-white border-2 border-amber-300 rounded-xl px-4 py-2 text-base font-bold text-amber-950 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 px-4 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleAdopt}
            disabled={isSaving}
            className="flex-2 py-3 px-6 rounded-xl font-extrabold text-white bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 shadow-lg shadow-amber-500/30 btn-tactile flex items-center justify-center gap-2 cursor-pointer text-base"
          >
            <Sparkles className="w-5 h-5" />
            <span>Adopt {customName || 'Pet'}!</span>
          </button>
        </div>
      </motion.div>
    </div>
  );
};

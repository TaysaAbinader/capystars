import React from 'react';
import { motion } from 'framer-motion';

interface PetProps {
  happiness: number;
  isCelebrating?: boolean;
  onTap?: () => void;
}

export const DragonPet: React.FC<PetProps> = ({ happiness, isCelebrating, onTap }) => {
  return (
    <motion.div
      className="relative cursor-pointer select-none flex flex-col items-center justify-center p-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      title="Tap me to pet!"
    >
      {/* Tiny gentle puff of friendly smoke */}
      <motion.div
        className="absolute -top-1 right-6 text-sm pointer-events-none"
        animate={{ y: [-2, -12], x: [0, 6], opacity: [0.7, 0] }}
        transition={{ repeat: Infinity, duration: 2.2, ease: 'easeOut' }}
      >
        💨
      </motion.div>

      <motion.svg
        width="130"
        height="120"
        viewBox="0 0 140 130"
        animate={
          isCelebrating
            ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isCelebrating
            ? { repeat: 3, duration: 0.5 }
            : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
        }
      >
        <defs>
          <linearGradient id="dragonBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#34D399" />
            <stop offset="100%" stopColor="#059669" />
          </linearGradient>
          <linearGradient id="dragonBelly" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FEF08A" />
            <stop offset="100%" stopColor="#FACC15" />
          </linearGradient>
          <linearGradient id="dragonWing" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#A7F3D0" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Flapping Wings */}
        <motion.g
          animate={{ rotate: [-8, 8, -8] }}
          style={{ originX: '30px', originY: '75px' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <path d="M40 75 Q15 50 20 25 Q35 45 45 65 Z" fill="url(#dragonWing)" stroke="#047857" strokeWidth="1.5" />
        </motion.g>
        <motion.g
          animate={{ rotate: [8, -8, 8] }}
          style={{ originX: '100px', originY: '75px' }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          <path d="M100 75 Q125 50 120 25 Q105 45 95 65 Z" fill="url(#dragonWing)" stroke="#047857" strokeWidth="1.5" />
        </motion.g>

        {/* Body */}
        <ellipse cx="70" cy="88" rx="38" ry="30" fill="url(#dragonBody)" />
        {/* Soft Yellow Belly */}
        <ellipse cx="70" cy="92" rx="24" ry="20" fill="url(#dragonBelly)" />
        <line x1="56" y1="88" x2="84" y2="88" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" />
        <line x1="54" y1="96" x2="86" y2="96" stroke="#CA8A04" strokeWidth="1.5" strokeLinecap="round" />

        {/* Head */}
        <circle cx="70" cy="58" r="32" fill="url(#dragonBody)" />

        {/* Tiny Cute Horns */}
        <polygon points="46,40 38,18 56,32" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />
        <polygon points="94,40 102,18 84,32" fill="#FACC15" stroke="#CA8A04" strokeWidth="1.5" />

        {/* Snout & Nostrils */}
        <ellipse cx="70" cy="68" rx="20" ry="12" fill="#34D399" />
        <circle cx="64" cy="67" r="2.5" fill="#065F46" />
        <circle cx="76" cy="67" r="2.5" fill="#065F46" />

        {/* Eyes */}
        {happiness > 60 ? (
          <g>
            <path d="M52 52 Q58 46 64 52" stroke="#064E3B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M76 52 Q82 46 88 52" stroke="#064E3B" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            <circle cx="58" cy="50" r="5.5" fill="#064E3B" />
            <circle cx="82" cy="50" r="5.5" fill="#064E3B" />
            <circle cx="60" cy="48" r="2" fill="#FFFFFF" />
            <circle cx="84" cy="48" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Cheeks */}
        <circle cx="48" cy="62" r="5" fill="#F43F5E" opacity="0.35" />
        <circle cx="92" cy="62" r="5" fill="#F43F5E" opacity="0.35" />

        {/* Paws */}
        <ellipse cx="50" cy="112" rx="10" ry="6" fill="#059669" />
        <ellipse cx="90" cy="112" rx="10" ry="6" fill="#059669" />
      </motion.svg>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';

interface PetProps {
  happiness: number;
  isCelebrating?: boolean;
  onTap?: () => void;
}

export const BunnyPet: React.FC<PetProps> = ({ happiness, isCelebrating, onTap }) => {
  return (
    <motion.div
      className="relative cursor-pointer select-none flex flex-col items-center justify-center p-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      title="Tap me to pet!"
    >
      <motion.svg
        width="130"
        height="120"
        viewBox="0 0 140 130"
        animate={
          isCelebrating
            ? { y: [0, -18, 0], scaleY: [1, 0.9, 1.05, 1] }
            : { y: [0, -4, 0] }
        }
        transition={
          isCelebrating
            ? { repeat: 3, duration: 0.4 }
            : { repeat: Infinity, duration: 2.2, ease: 'easeInOut' }
        }
      >
        <defs>
          <linearGradient id="bunnyBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#E2E8F0" />
          </linearGradient>
          <linearGradient id="bunnyEar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCE7F3" />
            <stop offset="100%" stopColor="#F472B6" />
          </linearGradient>
          <linearGradient id="carrotBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
        </defs>

        {/* Long Bunny Ears (Wiggling) */}
        <motion.g
          animate={{ rotate: [-4, 4, -4] }}
          style={{ originX: '45px', originY: '45px' }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <ellipse cx="45" cy="28" rx="11" ry="26" fill="url(#bunnyBody)" />
          <ellipse cx="45" cy="28" rx="6" ry="18" fill="url(#bunnyEar)" />
        </motion.g>

        <motion.g
          animate={{ rotate: [4, -4, 4] }}
          style={{ originX: '95px', originY: '45px' }}
          transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        >
          <ellipse cx="95" cy="28" rx="11" ry="26" fill="url(#bunnyBody)" />
          <ellipse cx="95" cy="28" rx="6" ry="18" fill="url(#bunnyEar)" />
        </motion.g>

        {/* Body */}
        <ellipse cx="70" cy="90" rx="38" ry="30" fill="url(#bunnyBody)" />

        {/* Head */}
        <circle cx="70" cy="62" r="32" fill="url(#bunnyBody)" />

        {/* Nose & Mouth (Twitches) */}
        <motion.polygon
          points="70,66 66,62 74,62"
          fill="#F472B6"
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ repeat: Infinity, duration: 1.2 }}
        />
        <path d="M66 68 Q70 72 74 68" stroke="#475569" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Eyes */}
        {happiness > 60 ? (
          <g>
            <path d="M50 56 Q56 48 62 56" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M78 56 Q84 48 90 56" stroke="#334155" strokeWidth="3" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            <circle cx="56" cy="54" r="5" fill="#334155" />
            <circle cx="84" cy="54" r="5" fill="#334155" />
            <circle cx="58" cy="52" r="1.5" fill="#FFFFFF" />
            <circle cx="86" cy="52" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Cheeks */}
        <circle cx="46" cy="64" r="5" fill="#F43F5E" opacity="0.35" />
        <circle cx="94" cy="64" r="5" fill="#F43F5E" opacity="0.35" />

        {/* Paws */}
        <ellipse cx="52" cy="112" rx="10" ry="6" fill="#F1F5F9" />
        <ellipse cx="88" cy="112" rx="10" ry="6" fill="#F1F5F9" />

        {/* Carrot Snack */}
        <g transform="translate(100, 85) rotate(-30)">
          <polygon points="0,0 22,7 0,14" fill="url(#carrotBody)" />
          <path d="M0 3 L-6 0 L-2 7 L-8 8 L-1 11" stroke="#22C55E" strokeWidth="2.5" fill="none" />
        </g>
      </motion.svg>
    </motion.div>
  );
};

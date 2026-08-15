import React from 'react';
import { motion } from 'framer-motion';

interface PetProps {
  happiness: number;
  isCelebrating?: boolean;
  onTap?: () => void;
}

export const KittenPet: React.FC<PetProps> = ({ happiness, isCelebrating, onTap }) => {
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
            ? { y: [0, -14, 0], rotate: [0, -6, 6, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isCelebrating
            ? { repeat: 3, duration: 0.45 }
            : { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }
        }
      >
        <defs>
          <linearGradient id="catBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F472B6" />
            <stop offset="100%" stopColor="#DB2777" />
          </linearGradient>
          <linearGradient id="catInnerEar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FCE7F3" />
            <stop offset="100%" stopColor="#FBCFE8" />
          </linearGradient>
          <linearGradient id="yarnBall" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60A5FA" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
        </defs>

        {/* Tail (swaying) */}
        <motion.path
          d="M35 95 Q15 80 20 60 Q25 45 35 55"
          stroke="#DB2777"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          animate={{ rotate: [-8, 8, -8] }}
          style={{ originX: '35px', originY: '95px' }}
          transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
        />

        {/* Body */}
        <ellipse cx="70" cy="88" rx="38" ry="30" fill="url(#catBody)" />

        {/* Ears */}
        <polygon points="40,55 30,22 62,42" fill="url(#catBody)" />
        <polygon points="41,50 34,28 56,42" fill="url(#catInnerEar)" />

        <polygon points="100,55 110,22 78,42" fill="url(#catBody)" />
        <polygon points="99,50 106,28 84,42" fill="url(#catInnerEar)" />

        {/* Head */}
        <circle cx="70" cy="62" r="34" fill="url(#catBody)" />

        {/* Whiskers */}
        <line x1="32" y1="64" x2="15" y2="60" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="32" y1="70" x2="16" y2="72" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="108" y1="64" x2="125" y2="60" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
        <line x1="108" y1="70" x2="124" y2="72" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />

        {/* Eyes */}
        {happiness > 60 ? (
          <g>
            <path d="M50 58 Q56 50 62 58" stroke="#831843" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M78 58 Q84 50 90 58" stroke="#831843" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            <circle cx="56" cy="56" r="6" fill="#831843" />
            <circle cx="84" cy="56" r="6" fill="#831843" />
            <circle cx="58" cy="54" r="2" fill="#FFFFFF" />
            <circle cx="86" cy="54" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Nose & Mouth */}
        <polygon points="70,66 66,62 74,62" fill="#FDF2F8" />
        <path d="M66 68 Q70 73 74 68" stroke="#831843" strokeWidth="2.5" strokeLinecap="round" fill="none" />

        {/* Cheeks */}
        <circle cx="48" cy="67" r="5" fill="#F43F5E" opacity="0.4" />
        <circle cx="92" cy="67" r="5" fill="#F43F5E" opacity="0.4" />

        {/* Paws */}
        <ellipse cx="54" cy="112" rx="10" ry="7" fill="#FDF2F8" />
        <ellipse cx="86" cy="112" rx="10" ry="7" fill="#FDF2F8" />

        {/* Yarn Ball Accessory */}
        <circle cx="108" cy="106" r="14" fill="url(#yarnBall)" />
        <path d="M100 102 Q112 96 116 110" stroke="#93C5FD" strokeWidth="2" fill="none" />
        <path d="M104 114 Q116 118 108 98" stroke="#93C5FD" strokeWidth="2" fill="none" />
      </motion.svg>
    </motion.div>
  );
};

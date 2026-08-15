import React from 'react';
import { motion } from 'framer-motion';

interface PetProps {
  happiness: number;
  isCelebrating?: boolean;
  onTap?: () => void;
}

export const CapybaraPet: React.FC<PetProps> = ({ happiness, isCelebrating, onTap }) => {
  const isSpaMode = happiness >= 95;

  return (
    <motion.div
      className="relative cursor-pointer select-none flex flex-col items-center justify-center p-2"
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onTap}
      title="Tap me to pet!"
    >
      {/* Steam clouds for Hot Spring / Spa Mode */}
      {isSpaMode && (
        <div className="absolute -top-4 flex gap-3 pointer-events-none">
          <motion.span
            animate={{ y: [-2, -14], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeOut' }}
            className="text-lg"
          >
            ♨️
          </motion.span>
          <motion.span
            animate={{ y: [-2, -18], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 2.2, delay: 0.4, ease: 'easeOut' }}
            className="text-xl"
          >
            ✨
          </motion.span>
          <motion.span
            animate={{ y: [-2, -14], opacity: [0.8, 0] }}
            transition={{ repeat: Infinity, duration: 1.9, delay: 0.8, ease: 'easeOut' }}
            className="text-lg"
          >
            ♨️
          </motion.span>
        </div>
      )}

      {/* Main Capybara SVG Character */}
      <motion.svg
        width="130"
        height="120"
        viewBox="0 0 140 130"
        animate={
          isCelebrating
            ? { y: [0, -12, 0], rotate: [0, -4, 4, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isCelebrating
            ? { repeat: 3, duration: 0.5 }
            : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
        }
      >
        <defs>
          {/* Gradients */}
          <linearGradient id="capyBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#CA8A04" />
            <stop offset="50%" stopColor="#A16207" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="capySnout" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
          <linearGradient id="orangeFruit" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FB923C" />
            <stop offset="100%" stopColor="#EA580C" />
          </linearGradient>
          <linearGradient id="tubWater" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#67E8F9" />
            <stop offset="100%" stopColor="#06B6D4" />
          </linearGradient>
        </defs>

        {/* Hot spring tub if in Spa Mode */}
        {isSpaMode && (
          <g>
            <ellipse cx="70" cy="115" rx="55" ry="12" fill="url(#tubWater)" opacity="0.85" />
            <path
              d="M20 115 Q70 128 120 115 L115 125 Q70 132 25 125 Z"
              fill="#92400E"
            />
          </g>
        )}

        {/* Body */}
        <ellipse cx="70" cy="85" rx="42" ry="32" fill="url(#capyBody)" />

        {/* Head */}
        <rect x="36" y="38" width="68" height="52" rx="24" fill="url(#capyBody)" />

        {/* Snout */}
        <rect x="30" y="56" width="80" height="34" rx="16" fill="url(#capySnout)" />

        {/* Cute Nostrils */}
        <ellipse cx="62" cy="74" rx="4" ry="5" fill="#451A03" />
        <ellipse cx="78" cy="74" rx="4" ry="5" fill="#451A03" />

        {/* Eyes (Closed zen eyes if happy/spa mode, open if standard) */}
        {isSpaMode || happiness > 70 ? (
          <g>
            <path d="M46 54 Q52 48 58 54" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
            <path d="M82 54 Q88 48 94 54" stroke="#451A03" strokeWidth="3" strokeLinecap="round" fill="none" />
            {/* Rosy Cheeks */}
            <circle cx="44" cy="66" r="6" fill="#F43F5E" opacity="0.4" />
            <circle cx="96" cy="66" r="6" fill="#F43F5E" opacity="0.4" />
          </g>
        ) : (
          <g>
            <ellipse cx="50" cy="52" rx="4" ry="3" fill="#1E293B" />
            <ellipse cx="90" cy="52" rx="4" ry="3" fill="#1E293B" />
            <circle cx="51" cy="51" r="1.5" fill="#FFFFFF" />
            <circle cx="91" cy="51" r="1.5" fill="#FFFFFF" />
          </g>
        )}

        {/* Ears */}
        <circle cx="38" cy="40" r="8" fill="#78350F" />
        <circle cx="38" cy="40" r="4.5" fill="#B45309" />
        <circle cx="102" cy="40" r="8" fill="#78350F" />
        <circle cx="102" cy="40" r="4.5" fill="#B45309" />

        {/* Feet */}
        <ellipse cx="50" cy="112" rx="10" ry="6" fill="#78350F" />
        <ellipse cx="90" cy="112" rx="10" ry="6" fill="#78350F" />

        {/* The Famous Orange On Head (bounces playfully) */}
        <motion.g
          animate={isCelebrating ? { y: [-3, 3, -3], rotate: [-8, 8, -8] } : { y: [0, -2, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
        >
          {/* Orange Body */}
          <circle cx="70" cy="24" r="14" fill="url(#orangeFruit)" />
          {/* Leaf */}
          <path d="M70 10 Q78 4 82 8 Q77 14 70 10" fill="#22C55E" />
          <path d="M70 10 L70 7" stroke="#15803D" strokeWidth="2" strokeLinecap="round" />
          {/* Shine */}
          <circle cx="65" cy="20" r="3" fill="#FFFBEB" opacity="0.6" />
        </motion.g>
      </motion.svg>
    </motion.div>
  );
};

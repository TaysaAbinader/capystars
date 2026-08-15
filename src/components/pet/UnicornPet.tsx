import React from 'react';
import { motion } from 'framer-motion';

interface PetProps {
  happiness: number;
  isCelebrating?: boolean;
  onTap?: () => void;
}

export const UnicornPet: React.FC<PetProps> = ({ happiness, isCelebrating, onTap }) => {
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
            ? { y: [0, -15, 0], rotate: [0, -4, 4, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isCelebrating
            ? { repeat: 3, duration: 0.5 }
            : { repeat: Infinity, duration: 3, ease: 'easeInOut' }
        }
      >
        <defs>
          <linearGradient id="unicornBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F5F3FF" />
          </linearGradient>
          <linearGradient id="unicornHorn" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="50%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="rainbowMane" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F43F5E" />
            <stop offset="33%" stopColor="#A855F7" />
            <stop offset="66%" stopColor="#3B82F6" />
            <stop offset="100%" stopColor="#10B981" />
          </linearGradient>
        </defs>

        {/* Rainbow Mane */}
        <path
          d="M48 40 Q30 55 40 85 Q35 100 45 105"
          stroke="url(#rainbowMane)"
          strokeWidth="16"
          strokeLinecap="round"
          fill="none"
        />

        {/* Body */}
        <ellipse cx="74" cy="90" rx="38" ry="30" fill="url(#unicornBody)" stroke="#E9D5FF" strokeWidth="2" />

        {/* Ears */}
        <polygon points="48,50 40,24 64,42" fill="url(#unicornBody)" stroke="#E9D5FF" strokeWidth="1.5" />
        <polygon points="49,46 44,30 59,41" fill="#FCE7F3" />
        <polygon points="90,50 98,24 74,42" fill="url(#unicornBody)" stroke="#E9D5FF" strokeWidth="1.5" />

        {/* Golden Sparkle Horn */}
        <motion.g
          animate={{ scale: [1, 1.08, 1], filter: ['drop-shadow(0 0 2px #F59E0B)', 'drop-shadow(0 0 8px #FDE047)', 'drop-shadow(0 0 2px #F59E0B)'] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <polygon points="69,45 61,10 77,10" fill="url(#unicornHorn)" />
          <line x1="64" y1="20" x2="74" y2="24" stroke="#FFFBEB" strokeWidth="1.5" />
          <line x1="63" y1="32" x2="75" y2="36" stroke="#FFFBEB" strokeWidth="1.5" />
        </motion.g>

        {/* Head */}
        <circle cx="70" cy="62" r="32" fill="url(#unicornBody)" stroke="#E9D5FF" strokeWidth="2" />

        {/* Eyes (Cute anime lash eyes) */}
        {happiness > 60 ? (
          <g>
            <path d="M52 58 Q58 50 64 58" stroke="#6B21A8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M76 58 Q82 50 88 58" stroke="#6B21A8" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M50 56 L47 52" stroke="#6B21A8" strokeWidth="2" strokeLinecap="round" />
            <path d="M90 56 L93 52" stroke="#6B21A8" strokeWidth="2" strokeLinecap="round" />
          </g>
        ) : (
          <g>
            <circle cx="58" cy="56" r="6" fill="#6B21A8" />
            <circle cx="82" cy="56" r="6" fill="#6B21A8" />
            <circle cx="60" cy="54" r="2" fill="#FFFFFF" />
            <circle cx="84" cy="54" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Rosy Cheeks with Stars */}
        <circle cx="48" cy="66" r="5" fill="#F472B6" opacity="0.4" />
        <circle cx="92" cy="66" r="5" fill="#F472B6" opacity="0.4" />
        <path d="M70 68 Q67 72 73 72" stroke="#C084FC" strokeWidth="2" strokeLinecap="round" fill="none" />

        {/* Golden Hooves */}
        <ellipse cx="54" cy="114" rx="10" ry="6" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.5" />
        <ellipse cx="88" cy="114" rx="10" ry="6" fill="#FDE047" stroke="#F59E0B" strokeWidth="1.5" />
      </motion.svg>
    </motion.div>
  );
};

import React from 'react';
import { motion } from 'framer-motion';

interface PetProps {
  happiness: number;
  isCelebrating?: boolean;
  onTap?: () => void;
}

export const PuppyPet: React.FC<PetProps> = ({ happiness, isCelebrating, onTap }) => {
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
            ? { y: [0, -14, 0], rotate: [0, -4, 4, 0] }
            : { y: [0, -3, 0] }
        }
        transition={
          isCelebrating
            ? { repeat: 3, duration: 0.45 }
            : { repeat: Infinity, duration: 2.8, ease: 'easeInOut' }
        }
      >
        <defs>
          <linearGradient id="dogBody" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
          <linearGradient id="dogEar" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#B45309" />
            <stop offset="100%" stopColor="#78350F" />
          </linearGradient>
        </defs>

        {/* Tail (Fast wagging) */}
        <motion.path
          d="M100 85 Q125 75 128 55 Q130 45 120 52"
          stroke="#D97706"
          strokeWidth="10"
          strokeLinecap="round"
          fill="none"
          animate={{ rotate: [-20, 20, -20] }}
          style={{ originX: '100px', originY: '85px' }}
          transition={{ repeat: Infinity, duration: 0.35, ease: 'easeInOut' }}
        />

        {/* Body */}
        <ellipse cx="70" cy="88" rx="40" ry="32" fill="url(#dogBody)" />

        {/* Floppy Ears */}
        <motion.ellipse
          cx="32"
          cy="58"
          rx="12"
          ry="24"
          fill="url(#dogEar)"
          animate={{ rotate: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />
        <motion.ellipse
          cx="108"
          cy="58"
          rx="12"
          ry="24"
          fill="url(#dogEar)"
          animate={{ rotate: [5, -5, 5] }}
          transition={{ repeat: Infinity, duration: 2, ease: 'easeInOut' }}
        />

        {/* Head */}
        <circle cx="70" cy="60" r="34" fill="url(#dogBody)" />

        {/* Muzzle */}
        <ellipse cx="70" cy="72" rx="20" ry="14" fill="#FEF3C7" />
        <ellipse cx="70" cy="66" rx="7" ry="5" fill="#451A03" />

        {/* Mouth & Tongue */}
        <path d="M64 74 Q70 78 76 74" stroke="#451A03" strokeWidth="2.5" strokeLinecap="round" fill="none" />
        {happiness > 50 && (
          <ellipse cx="70" cy="79" rx="5" ry="6" fill="#F43F5E" />
        )}

        {/* Eyes */}
        {happiness > 70 ? (
          <g>
            <path d="M48 54 Q54 48 60 54" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
            <path d="M80 54 Q86 48 92 54" stroke="#451A03" strokeWidth="3.5" strokeLinecap="round" fill="none" />
          </g>
        ) : (
          <g>
            <circle cx="54" cy="52" r="5.5" fill="#451A03" />
            <circle cx="86" cy="52" r="5.5" fill="#451A03" />
            <circle cx="56" cy="50" r="2" fill="#FFFFFF" />
            <circle cx="88" cy="50" r="2" fill="#FFFFFF" />
          </g>
        )}

        {/* Cheeks */}
        <circle cx="44" cy="65" r="5" fill="#F43F5E" opacity="0.4" />
        <circle cx="96" cy="65" r="5" fill="#F43F5E" opacity="0.4" />

        {/* Paws */}
        <ellipse cx="50" cy="114" rx="11" ry="7" fill="#FEF3C7" />
        <ellipse cx="90" cy="114" rx="11" ry="7" fill="#FEF3C7" />

        {/* Tennis Ball Accessory */}
        <circle cx="28" cy="104" r="11" fill="#A3E635" />
        <path d="M22 96 Q32 104 22 112" stroke="#FFFFFF" strokeWidth="2" fill="none" />
        <path d="M34 96 Q24 104 34 112" stroke="#FFFFFF" strokeWidth="2" fill="none" />
      </motion.svg>
    </motion.div>
  );
};

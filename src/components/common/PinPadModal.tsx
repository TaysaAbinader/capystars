import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Lock, X, Delete } from 'lucide-react';
import { verifyPin } from '../../utils/crypto';
import { playPopSound } from '../../utils/sound';

interface PinPadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  storedPinHash: string;
  soundEnabled?: boolean;
}

export const PinPadModal: React.FC<PinPadModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  storedPinHash,
  soundEnabled = true,
}) => {
  const [pin, setPin] = useState('');
  const [errorShake, setErrorShake] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  const handleDigit = (digit: string) => {
    if (pin.length < 4) {
      playPopSound(soundEnabled);
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMessage('');

      if (newPin.length === 4) {
        // Verify PIN
        setTimeout(() => {
          if (verifyPin(newPin, storedPinHash)) {
            setPin('');
            onSuccess();
          } else {
            setErrorShake(true);
            setErrorMessage('Incorrect PIN. Default is 1234');
            setTimeout(() => {
              setPin('');
              setErrorShake(false);
            }, 600);
          }
        }, 150);
      }
    }
  };

  const handleDelete = () => {
    playPopSound(soundEnabled);
    setPin((prev) => prev.slice(0, -1));
    setErrorMessage('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border-4 border-slate-200 relative text-center"
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setPin('');
            onClose();
          }}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-700 bg-slate-100 rounded-full transition-colors"
          aria-label="Close PIN modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon & Title */}
        <div className="w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-inner">
          <Lock className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-extrabold text-slate-900">Parent Area</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          Enter your 4-digit PIN to access parent controls
        </p>

        {/* PIN Circles / Dots */}
        <motion.div
          animate={errorShake ? { x: [-12, 12, -8, 8, -4, 4, 0] } : {}}
          transition={{ duration: 0.4 }}
          className="flex justify-center gap-4 mb-6"
        >
          {[0, 1, 2, 3].map((idx) => {
            const isFilled = pin.length > idx;
            return (
              <div
                key={idx}
                className={`w-4 h-4 rounded-full transition-all ${
                  isFilled
                    ? 'bg-amber-500 scale-110 shadow-md shadow-amber-500/40'
                    : 'bg-slate-200 border-2 border-slate-300'
                }`}
              />
            );
          })}
        </motion.div>

        {/* Error message */}
        <AnimatePresence>
          {errorMessage && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="text-rose-500 text-xs font-bold mb-3"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>

        {/* Number Pad Grid */}
        <div className="grid grid-cols-3 gap-3 max-w-[240px] mx-auto mb-2">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
            <button
              key={num}
              onClick={() => handleDigit(num)}
              className="h-14 rounded-2xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-800 hover:text-amber-900 font-extrabold text-xl transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
            >
              {num}
            </button>
          ))}
          <div /> {/* Spacer */}
          <button
            onClick={() => handleDigit('0')}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-amber-100 active:bg-amber-200 text-slate-800 hover:text-amber-900 font-extrabold text-xl transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
          >
            0
          </button>
          <button
            onClick={handleDelete}
            className="h-14 rounded-2xl bg-slate-100 hover:bg-rose-100 active:bg-rose-200 text-slate-600 hover:text-rose-700 font-bold transition-all shadow-sm flex items-center justify-center cursor-pointer active:scale-95"
            aria-label="Backspace"
          >
            <Delete className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};

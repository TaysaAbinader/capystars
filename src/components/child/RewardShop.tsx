import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Gift, Check, Clock, AlertCircle } from 'lucide-react';
import type { Reward } from '../../types';
import { triggerRewardFireworks } from '../../utils/confetti';
import { playRewardPurchaseSound, playPopSound } from '../../utils/sound';

interface RewardShopProps {
  currentStars: number;
  rewards: Reward[];
  onClaimReward: (rewardId: string) => Promise<{ success: boolean; message?: string }>;
  soundEnabled?: boolean;
}

export const RewardShop: React.FC<RewardShopProps> = ({
  currentStars,
  rewards,
  onClaimReward,
  soundEnabled = true,
}) => {
  const [claimSuccessReward, setClaimSuccessReward] = useState<Reward | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleClaim = async (reward: Reward) => {
    if (currentStars < reward.costInStars) {
      playPopSound(soundEnabled);
      setErrorMessage(`You need ${reward.costInStars - currentStars} more stars to unlock this! Keep doing chores! ⭐️`);
      setTimeout(() => setErrorMessage(null), 3000);
      return;
    }

    const res = await onClaimReward(reward.id);
    if (res.success) {
      triggerRewardFireworks();
      playRewardPurchaseSound(soundEnabled);
      setClaimSuccessReward(reward);
    } else if (res.message) {
      setErrorMessage(res.message);
      setTimeout(() => setErrorMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Shop Hero Banner */}
      <div className="glass-panel rounded-3xl p-5 sm:p-6 border-2 border-pink-200/80 bg-gradient-to-r from-pink-50 via-rose-50 to-amber-50 relative overflow-hidden shadow-sm">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center sm:text-left">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-gradient-to-tr from-pink-500 to-rose-400 text-white flex items-center justify-center text-3xl shadow-lg shadow-pink-500/20 border-2 border-white flex-shrink-0">
              🎁
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
                <span>The Star Rewards Shop</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 font-medium mt-0.5">
                Trade in your hard-earned stars for awesome real-world prizes!
              </p>
            </div>
          </div>

          {/* Current Star Balance Badge */}
          <div className="bg-white/90 backdrop-blur border-2 border-amber-300 rounded-2xl px-5 py-2.5 shadow-md flex items-center gap-2.5">
            <Star className="w-6 h-6 text-amber-500 fill-amber-500 animate-pulse" />
            <div className="text-left">
              <div className="text-[10px] font-black uppercase text-amber-800 tracking-wider">Your Balance</div>
              <div className="text-xl font-black text-amber-950">{currentStars} Stars</div>
            </div>
          </div>
        </div>
      </div>

      {/* Insufficient Stars Error Toast */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="p-3.5 rounded-2xl bg-rose-100 border border-rose-300 text-rose-900 font-bold text-xs sm:text-sm flex items-center gap-2 shadow"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rewards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {rewards.map((reward) => {
          const isAffordable = currentStars >= reward.costInStars;
          const starsNeeded = reward.costInStars - currentStars;
          const progressPercent = Math.min(100, Math.round((currentStars / reward.costInStars) * 100));
          const isClaimed = reward.status === 'claimed';
          const isFulfilled = reward.status === 'fulfilled';

          return (
            <motion.div
              key={reward.id}
              whileHover={{ y: -4 }}
              className={`glass-card rounded-3xl p-4 sm:p-5 border-2 flex flex-col justify-between transition-all shadow-sm ${
                isClaimed
                  ? 'border-amber-300 bg-amber-50/70'
                  : isFulfilled
                  ? 'border-emerald-300 bg-emerald-50/60 opacity-80'
                  : isAffordable
                  ? 'border-amber-400 bg-white/95 shadow-md ring-2 ring-amber-300/40'
                  : 'border-slate-200 bg-white/80'
              }`}
            >
              <div>
                {/* Reward Emoji Icon */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="w-14 h-14 rounded-2xl bg-pink-100 flex items-center justify-center text-3xl shadow-inner">
                    {reward.icon || '🎁'}
                  </div>

                  {/* Price Tag */}
                  <span className="inline-flex items-center gap-1.5 bg-gradient-to-r from-amber-400 to-yellow-400 text-amber-950 font-black text-sm px-3 py-1 rounded-xl shadow-xs border border-amber-300">
                    <Star className="w-4 h-4 fill-amber-900 text-amber-900" />
                    {reward.costInStars}
                  </span>
                </div>

                <h3 className="font-extrabold text-slate-900 text-base sm:text-lg mb-1 leading-tight">
                  {reward.title}
                </h3>

                {/* Progress toward reward */}
                {!isClaimed && !isFulfilled && (
                  <div className="mt-3 mb-4">
                    <div className="flex justify-between text-xs font-bold text-slate-500 mb-1">
                      <span>{progressPercent}% unlocked</span>
                      <span>
                        {isAffordable ? (
                          <span className="text-emerald-600 font-extrabold">Ready to unlock! ✨</span>
                        ) : (
                          <span>{starsNeeded} stars away</span>
                        )}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden border border-slate-200">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isAffordable
                            ? 'bg-gradient-to-r from-amber-400 to-emerald-400'
                            : 'bg-gradient-to-r from-amber-300 to-orange-400'
                        }`}
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Action Button */}
              <div className="mt-3">
                {isFulfilled ? (
                  <div className="py-2.5 px-4 rounded-xl bg-emerald-100 text-emerald-800 font-extrabold text-xs text-center flex items-center justify-center gap-1.5 border border-emerald-200">
                    <Check className="w-4 h-4 text-emerald-600 stroke-[3]" />
                    <span>Enjoyed & Fulfilled!</span>
                  </div>
                ) : isClaimed ? (
                  <div className="py-2.5 px-4 rounded-xl bg-amber-100 text-amber-900 font-extrabold text-xs text-center flex items-center justify-center gap-1.5 border border-amber-300">
                    <Clock className="w-4 h-4 text-amber-700" />
                    <span>Waiting for Parent to Give!</span>
                  </div>
                ) : (
                  <button
                    onClick={() => handleClaim(reward)}
                    disabled={!isAffordable}
                    className={`w-full py-2.5 px-4 rounded-xl font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      isAffordable
                        ? 'bg-gradient-to-r from-pink-500 via-rose-500 to-amber-500 text-white shadow-md shadow-pink-500/20 btn-tactile'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                    }`}
                  >
                    <Gift className="w-4 h-4" />
                    <span>{isAffordable ? 'Redeem Prize!' : `Need ${starsNeeded} More`}</span>
                  </button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Claim Success Celebration Modal */}
      <AnimatePresence>
        {claimSuccessReward && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/65 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.8, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: 20 }}
              className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl border-4 border-pink-400"
            >
              <div className="w-16 h-16 rounded-3xl bg-pink-100 flex items-center justify-center text-4xl mx-auto mb-3 shadow-inner">
                {claimSuccessReward.icon}
              </div>
              <h3 className="text-2xl font-black text-slate-900 mb-1">Prize Claimed! 🎉</h3>
              <p className="text-sm text-slate-600 font-medium mb-4">
                You claimed <strong className="text-pink-600">{claimSuccessReward.title}</strong>! Let your parent know so they can grant your prize.
              </p>
              <button
                onClick={() => setClaimSuccessReward(null)}
                className="w-full py-3 px-4 rounded-xl font-extrabold text-white bg-gradient-to-r from-pink-500 to-rose-500 shadow-md btn-tactile cursor-pointer"
              >
                Yay, Got It! ✨
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

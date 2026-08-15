import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Star, Check, X, Gift, CheckCircle2, RotateCcw } from 'lucide-react';
import type { Reward } from '../../types';
import { generateId } from '../../db';

interface RewardManagerProps {
  rewards: Reward[];
  onSaveReward: (reward: Reward) => Promise<void>;
  onDeleteReward: (id: string) => Promise<void>;
  onFulfillReward: (id: string) => Promise<void>;
  onCancelClaimedReward: (id: string) => Promise<void>;
}

const REWARD_EMOJIS = ['🎮', '🍦', '🎬', '🌙', '🍧', '🎁', '🍕', '🎡', '🧸', '🥞', '🚴‍♀️', '🎨', '🎪', '🍩', '🛍️'];

export const RewardManager: React.FC<RewardManagerProps> = ({
  rewards,
  onSaveReward,
  onDeleteReward,
  onFulfillReward,
  onCancelClaimedReward,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🎁');
  const [costInStars, setCostInStars] = useState<number>(10);

  const claimedRewards = rewards.filter((r) => r.status === 'claimed');

  const handleOpenNew = () => {
    setEditingId(null);
    setTitle('');
    setIcon('🎁');
    setCostInStars(10);
    setIsEditing(true);
  };

  const handleOpenEdit = (reward: Reward) => {
    setEditingId(reward.id);
    setTitle(reward.title);
    setIcon(reward.icon);
    setCostInStars(reward.costInStars);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const rewardToSave: Reward = {
      id: editingId || generateId(),
      title: title.trim(),
      icon,
      costInStars,
      status: 'available',
      createdAt: new Date().toISOString(),
    };

    await onSaveReward(rewardToSave);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Claimed Rewards Alert / Queue */}
      {claimedRewards.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-pink-50 border-2 border-pink-300 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Gift className="w-5 h-5 text-pink-600 animate-bounce" />
            <h4 className="font-extrabold text-sm sm:text-base text-pink-950">
              Rewards Waiting for You to Fulfill ({claimedRewards.length})
            </h4>
          </div>
          <div className="space-y-2">
            {claimedRewards.map((cr) => (
              <div
                key={cr.id}
                className="bg-white p-3 rounded-2xl border border-pink-200 flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{cr.icon}</span>
                  <div>
                    <h5 className="font-bold text-sm text-slate-900">{cr.title}</h5>
                    <span className="text-xs text-pink-700 font-semibold">Redeemed for {cr.costInStars} ⭐️</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => onCancelClaimedReward(cr.id)}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 flex items-center gap-1 cursor-pointer"
                    title="Refund stars and cancel claim"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Refund</span>
                  </button>
                  <button
                    onClick={() => onFulfillReward(cr.id)}
                    className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm flex items-center gap-1 cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark as Given</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top Action Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Manage Reward Store</h3>
          <p className="text-xs text-slate-500">Create real-world rewards and customize star prices</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-pink-500 hover:bg-pink-600 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Reward</span>
        </button>
      </div>

      {/* Modal Form */}
      <AnimatePresence>
        {isEditing && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200"
            >
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
                <h4 className="text-lg font-black text-slate-900">
                  {editingId ? 'Edit Reward' : 'Add New Reward'}
                </h4>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="rewardTitleInput" className="block text-xs font-bold text-slate-700 mb-1">Reward Title</label>
                  <input
                    id="rewardTitleInput"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. 30 Mins iPad Game Time"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-pink-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pick an Icon</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                    {REWARD_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setIcon(em)}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                          icon === em ? 'bg-pink-400 ring-2 ring-pink-500 scale-110' : 'hover:bg-slate-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label htmlFor="rewardCostInput" className="block text-xs font-bold text-slate-700 mb-1">Cost in Stars</label>
                  <div className="flex items-center gap-3">
                    <input
                      id="rewardCostInput"
                      type="number"
                      min="1"
                      max="500"
                      value={costInStars}
                      onChange={(e) => setCostInStars(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-28 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
                    />
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Stars required to purchase
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-2.5 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl font-bold text-white bg-pink-500 hover:bg-pink-600 shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Reward</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Rewards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {rewards.map((reward) => (
          <div
            key={reward.id}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-pink-50 border border-pink-200 flex items-center justify-center text-xl flex-shrink-0">
                {reward.icon}
              </span>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">{reward.title}</h4>
                <span className="text-xs text-amber-700 font-extrabold flex items-center gap-1 mt-0.5">
                  <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                  {reward.costInStars} Stars
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenEdit(reward)}
                className="p-2 text-slate-500 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors cursor-pointer"
                title="Edit reward"
                aria-label={`Edit reward: ${reward.title}`}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteReward(reward.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete reward"
                aria-label={`Delete reward: ${reward.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

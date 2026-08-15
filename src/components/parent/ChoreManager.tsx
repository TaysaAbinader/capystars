import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Trash2, Edit2, Star, Check, X } from 'lucide-react';
import type { Chore, RoutineType, RepeatType } from '../../types';
import { generateId } from '../../db';

interface ChoreManagerProps {
  chores: Chore[];
  onSaveChore: (chore: Chore) => Promise<void>;
  onDeleteChore: (id: string) => Promise<void>;
}

const COMMON_EMOJIS = ['🪥', '🛏️', '👗', '🥞', '🎒', '📖', '✏️', '🧸', '🌙', '📚', '💤', '🌿', '🍽️', '🧺', '🐶', '🐱', '🧼', '🚲', '🥛', '🍎'];

export const ChoreManager: React.FC<ChoreManagerProps> = ({
  chores,
  onSaveChore,
  onDeleteChore,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editingChoreId, setEditingChoreId] = useState<string | null>(null);

  // Form State
  const [title, setTitle] = useState('');
  const [icon, setIcon] = useState('🪥');
  const [routine, setRoutine] = useState<RoutineType>('morning');
  const [starsReward, setStarsReward] = useState<number>(1);
  const [repeat, setRepeat] = useState<RepeatType>('daily');

  const handleOpenNew = () => {
    setEditingChoreId(null);
    setTitle('');
    setIcon('⭐️');
    setRoutine('morning');
    setStarsReward(1);
    setRepeat('daily');
    setIsEditing(true);
  };

  const handleOpenEdit = (chore: Chore) => {
    setEditingChoreId(chore.id);
    setTitle(chore.title);
    setIcon(chore.icon);
    setRoutine(chore.routine);
    setStarsReward(chore.starsReward);
    setRepeat(chore.repeat);
    setIsEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const choreToSave: Chore = {
      id: editingChoreId || generateId(),
      title: title.trim(),
      icon,
      routine,
      starsReward,
      repeat,
      status: 'todo',
      createdAt: new Date().toISOString(),
      orderIndex: chores.length,
    };

    await onSaveChore(choreToSave);
    setIsEditing(false);
  };

  return (
    <div className="space-y-6">
      {/* Top action header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-black text-slate-900">Manage Chores & Routines</h3>
          <p className="text-xs text-slate-500">Create, edit, or adjust star values for your daughter's chores</p>
        </div>
        <button
          onClick={handleOpenNew}
          className="py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-md flex items-center gap-1.5 cursor-pointer transition-all active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Chore</span>
        </button>
      </div>

      {/* Add / Edit Chore Modal Form */}
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
                  {editingChoreId ? 'Edit Chore' : 'Add New Chore'}
                </h4>
                <button
                  onClick={() => setIsEditing(false)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Title */}
                <div>
                  <label htmlFor="choreTitle" className="block text-xs font-bold text-slate-700 mb-1">Chore Title</label>
                  <input
                    id="choreTitle"
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Brush Teeth & Hair"
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3.5 py-2 text-sm font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                {/* Emoji Picker */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Pick an Icon</label>
                  <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto p-1.5 bg-slate-50 rounded-xl border border-slate-200">
                    {COMMON_EMOJIS.map((em) => (
                      <button
                        key={em}
                        type="button"
                        onClick={() => setIcon(em)}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                          icon === em ? 'bg-amber-400 ring-2 ring-amber-500 scale-110' : 'hover:bg-slate-200'
                        }`}
                      >
                        {em}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Routine Category & Repeat Cadence */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="routineSelect" className="block text-xs font-bold text-slate-700 mb-1">Routine</label>
                    <select
                      id="routineSelect"
                      value={routine}
                      onChange={(e) => setRoutine(e.target.value as RoutineType)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
                    >
                      <option value="morning">🌅 Morning</option>
                      <option value="afternoon">☀️ Afternoon</option>
                      <option value="evening">🌙 Bedtime</option>
                      <option value="bonus">🌟 Bonus Quest</option>
                    </select>
                  </div>

                  <div>
                    <label htmlFor="repeatSelect" className="block text-xs font-bold text-slate-700 mb-1">Repeat Cadence</label>
                    <select
                      id="repeatSelect"
                      value={repeat}
                      onChange={(e) => setRepeat(e.target.value as RepeatType)}
                      className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-semibold text-slate-800"
                    >
                      <option value="daily">Every Day</option>
                      <option value="weekdays">Weekdays (Mon-Fri)</option>
                      <option value="weekends">Weekends Only</option>
                      <option value="once">One-Time Only</option>
                    </select>
                  </div>
                </div>

                {/* Star Reward Amount */}
                <div>
                  <label htmlFor="starsRewardInput" className="block text-xs font-bold text-slate-700 mb-1">Stars Awarded</label>
                  <div className="flex items-center gap-3">
                    <input
                      id="starsRewardInput"
                      type="number"
                      min="1"
                      max="20"
                      value={starsReward}
                      onChange={(e) => setStarsReward(Math.max(1, parseInt(e.target.value) || 1))}
                      className="w-24 bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
                    />
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      Stars earned per completion
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
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
                    className="flex-1 py-2.5 rounded-xl font-bold text-white bg-amber-500 hover:bg-amber-600 shadow-md flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Check className="w-4 h-4" />
                    <span>Save Chore</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* List of Existing Chores */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {chores.map((chore) => (
          <div
            key={chore.id}
            className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3 hover:border-slate-300 transition-all"
          >
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-xl flex-shrink-0">
                {chore.icon}
              </span>
              <div className="min-w-0">
                <h4 className="font-bold text-sm text-slate-900 truncate">{chore.title}</h4>
                <div className="flex items-center gap-2 text-[11px] text-slate-500 font-semibold mt-0.5">
                  <span className="capitalize text-amber-700 font-bold">{chore.routine}</span>
                  <span>•</span>
                  <span>{chore.repeat}</span>
                  <span>•</span>
                  <span className="text-amber-600 font-bold">+{chore.starsReward} ⭐️</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => handleOpenEdit(chore)}
                className="p-2 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors cursor-pointer"
                title="Edit chore"
                aria-label={`Edit chore: ${chore.title}`}
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => onDeleteChore(chore.id)}
                className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Delete chore"
                aria-label={`Delete chore: ${chore.title}`}
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

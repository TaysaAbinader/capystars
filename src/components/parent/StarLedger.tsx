import React, { useState } from 'react';
import { Star, PlusCircle, MinusCircle, History, Sparkles } from 'lucide-react';
import type { StarLog } from '../../types';

interface StarLedgerProps {
  currentStars: number;
  totalEarnedStars: number;
  starLogs: StarLog[];
  onAdjustStars: (amount: number, reason: string) => Promise<void>;
}

export const StarLedger: React.FC<StarLedgerProps> = ({
  currentStars,
  totalEarnedStars,
  starLogs,
  onAdjustStars,
}) => {
  const [amount, setAmount] = useState<number>(5);
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleBonus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    setIsSubmitting(true);
    await onAdjustStars(amount, reason.trim() || 'Parent Star Bonus ✨');
    setReason('');
    setIsSubmitting(false);
  };

  const handlePenalty = async () => {
    if (!amount || amount <= 0) return;
    setIsSubmitting(true);
    await onAdjustStars(-amount, reason.trim() || 'Star Deduction');
    setReason('');
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      {/* Balance Summary Cards */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Current Spendable Stars</div>
          <div className="text-2xl sm:text-3xl font-black text-amber-500 flex items-center gap-1.5">
            <Star className="w-6 h-6 fill-amber-400" />
            <span>{currentStars}</span>
          </div>
        </div>
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-2xs">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Lifetime Stars Earned</div>
          <div className="text-2xl sm:text-3xl font-black text-orange-600 flex items-center gap-1.5">
            <Sparkles className="w-6 h-6" />
            <span>{totalEarnedStars}</span>
          </div>
        </div>
      </div>

      {/* Manual Star Adjustment Form */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <h4 className="font-extrabold text-sm sm:text-base text-slate-900 mb-1">
          Award Bonus or Deduct Stars
        </h4>
        <p className="text-xs text-slate-500 mb-4">
          Instantly give your daughter bonus stars for great behavior or adjust her balance
        </p>

        <form onSubmit={handleBonus} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label htmlFor="starAmountInput" className="block text-xs font-bold text-slate-700 mb-1">Star Amount</label>
              <input
                id="starAmountInput"
                type="number"
                min="1"
                max="100"
                value={amount}
                onChange={(e) => setAmount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm font-bold text-slate-900"
              />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="bonusReasonInput" className="block text-xs font-bold text-slate-700 mb-1">Reason (Optional)</label>
              <input
                id="bonusReasonInput"
                type="text"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="e.g. Excellent sharing with sister!"
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-3 py-2 text-sm text-slate-900"
              />
            </div>
          </div>

          <div className="flex gap-2 pt-1">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Give +{amount} Bonus Stars</span>
            </button>
            <button
              type="button"
              onClick={handlePenalty}
              disabled={isSubmitting}
              className="py-2.5 px-4 rounded-xl font-bold text-xs sm:text-sm text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <MinusCircle className="w-4 h-4" />
              <span>Deduct -{amount} Stars</span>
            </button>
          </div>
        </form>
      </div>

      {/* Star Transaction History Log */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2 mb-3">
          <History className="w-4 h-4 text-slate-500" />
          <h4 className="font-extrabold text-sm text-slate-900">Recent Star Activity</h4>
        </div>

        {starLogs.length === 0 ? (
          <p className="text-xs text-slate-400 py-3 text-center">No star history recorded yet.</p>
        ) : (
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {starLogs.slice(0, 15).map((log) => (
              <div key={log.id} className="py-2.5 flex items-center justify-between gap-2 text-xs">
                <div className="min-w-0">
                  <p className="font-bold text-slate-800 truncate">{log.reason}</p>
                  <span className="text-[10px] text-slate-400">
                    {new Date(log.createdAt).toLocaleDateString()} at {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <span
                  className={`font-black text-sm whitespace-nowrap px-2 py-0.5 rounded-lg ${
                    log.amount > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}
                >
                  {log.amount > 0 ? `+${log.amount}` : log.amount} ⭐️
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

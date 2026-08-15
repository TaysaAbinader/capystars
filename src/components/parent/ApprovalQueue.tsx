import React from 'react';
import { CheckCircle2, XCircle, Clock, Star } from 'lucide-react';
import type { Chore } from '../../types';

interface ApprovalQueueProps {
  pendingChores: Chore[];
  onApprove: (choreId: string) => Promise<void>;
  onReject: (choreId: string) => Promise<void>;
}

export const ApprovalQueue: React.FC<ApprovalQueueProps> = ({
  pendingChores,
  onApprove,
  onReject,
}) => {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-black text-slate-900">Task Approval Queue</h3>
        <p className="text-xs text-slate-500">
          Review tasks submitted by your daughter before releasing stars
        </p>
      </div>

      {pendingChores.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 border border-slate-200 text-center">
          <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h4 className="font-bold text-slate-800 text-base">All Caught Up!</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
            No tasks are currently waiting for your review. When tasks are marked for approval, they'll appear here.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingChores.map((chore) => (
            <div
              key={chore.id}
              className="bg-white p-4 rounded-2xl border-2 border-amber-300 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
            >
              <div className="flex items-center gap-3">
                <span className="w-12 h-12 rounded-2xl bg-amber-100 flex items-center justify-center text-2xl flex-shrink-0">
                  {chore.icon}
                </span>
                <div>
                  <h4 className="font-extrabold text-sm sm:text-base text-slate-900">{chore.title}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    <span className="capitalize font-bold text-amber-700">{chore.routine}</span>
                    <span>•</span>
                    <span className="text-amber-600 font-extrabold flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      +{chore.starsReward} Stars
                    </span>
                    <span>•</span>
                    <span className="text-amber-800 flex items-center gap-1 font-semibold">
                      <Clock className="w-3 h-3" /> Waiting for review
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <button
                  onClick={() => onReject(chore.id)}
                  className="py-2 px-3.5 rounded-xl font-bold text-xs text-slate-600 hover:text-rose-600 bg-slate-100 hover:bg-rose-50 flex items-center gap-1 transition-colors cursor-pointer"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Needs Work</span>
                </button>
                <button
                  onClick={() => onApprove(chore.id)}
                  className="py-2 px-4 rounded-xl font-extrabold text-xs text-white bg-emerald-500 hover:bg-emerald-600 shadow-md flex items-center gap-1 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Approve (+{chore.starsReward} ⭐️)</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import {
  Clock,
  Settings as SettingsIcon,
  Check,
} from 'lucide-react';
import type { TimeframeGoals, ChoreCompletionRecord, AppSettings } from '../../types';
import { db } from '../../db';

interface ActivityReportsProps {
  settings: AppSettings;
  onUpdateGoals: (goals: TimeframeGoals) => Promise<void>;
}

export const ActivityReports: React.FC<ActivityReportsProps> = ({
  settings,
  onUpdateGoals,
}) => {
  const [history, setHistory] = useState<ChoreCompletionRecord[]>([]);
  const [filterRoutine, setFilterRoutine] = useState<string>('all');
  const [filterDayType, setFilterDayType] = useState<string>('all');
  const [goalsSaved, setGoalsSaved] = useState(false);

  // Goal Form State
  const initialGoals: TimeframeGoals = settings.goals || {
    dailyChoresTarget: 5,
    dailyStarsTarget: 10,
    weeklyChoresTarget: 30,
    weeklyStarsTarget: 60,
    monthlyChoresTarget: 120,
    monthlyStarsTarget: 250,
  };

  const [dailyChores, setDailyChores] = useState(initialGoals.dailyChoresTarget);
  const [dailyStars, setDailyStars] = useState(initialGoals.dailyStarsTarget);
  const [weeklyChores, setWeeklyChores] = useState(initialGoals.weeklyChoresTarget);
  const [weeklyStars, setWeeklyStars] = useState(initialGoals.weeklyStarsTarget);
  const [monthlyChores, setMonthlyChores] = useState(initialGoals.monthlyChoresTarget);
  const [monthlyStars, setMonthlyStars] = useState(initialGoals.monthlyStarsTarget);

  useEffect(() => {
    const loadHistory = async () => {
      const records = await db.choreHistory.orderBy('completedAt').reverse().toArray();
      setHistory(records);
    };
    loadHistory();
  }, []);

  const handleSaveGoals = async (e: React.FormEvent) => {
    e.preventDefault();
    const updatedGoals: TimeframeGoals = {
      dailyChoresTarget: Number(dailyChores) || 1,
      dailyStarsTarget: Number(dailyStars) || 1,
      weeklyChoresTarget: Number(weeklyChores) || 1,
      weeklyStarsTarget: Number(weeklyStars) || 1,
      monthlyChoresTarget: Number(monthlyChores) || 1,
      monthlyStarsTarget: Number(monthlyStars) || 1,
    };
    await onUpdateGoals(updatedGoals);
    setGoalsSaved(true);
    setTimeout(() => setGoalsSaved(false), 3000);
  };

  const totalCompletions = history.length;
  const totalStarsGiven = history.reduce((acc, h) => acc + h.starsAwarded, 0);
  const weekdayCount = history.filter((h) => !h.isWeekend).length;
  const weekendCount = history.filter((h) => h.isWeekend).length;

  // Filtered log
  const filteredHistory = history.filter((item) => {
    if (filterRoutine !== 'all' && item.routine !== filterRoutine) return false;
    if (filterDayType === 'weekday' && item.isWeekend) return false;
    if (filterDayType === 'weekend' && !item.isWeekend) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Metrics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Total Completed</span>
          <p className="text-2xl font-black text-slate-900 mt-1">{totalCompletions}</p>
          <span className="text-[11px] font-semibold text-emerald-600">All-time activities</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Stars Rewarded</span>
          <p className="text-2xl font-black text-amber-500 mt-1">+{totalStarsGiven} ⭐️</p>
          <span className="text-[11px] font-semibold text-slate-500">Earned via chores</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Weekday Chores</span>
          <p className="text-2xl font-black text-blue-600 mt-1">{weekdayCount}</p>
          <span className="text-[11px] font-semibold text-slate-500">Mon - Fri activities</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-bold text-slate-400">Weekend Chores</span>
          <p className="text-2xl font-black text-orange-600 mt-1">{weekendCount}</p>
          <span className="text-[11px] font-semibold text-slate-500">Sat - Sun activities</span>
        </div>
      </div>

      {/* Goal Targets Configuration Form */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs">
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <SettingsIcon className="w-4 h-4 text-amber-500" />
              <span>Target Goals Configuration</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set the milestones for daily, weekly, and monthly goal bars & achievements.
            </p>
          </div>
          {goalsSaved && (
            <span className="text-xs font-black text-emerald-600 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1">
              <Check className="w-3.5 h-3.5 stroke-[3]" /> Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveGoals} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Daily Goals */}
            <div className="p-3.5 bg-amber-50/50 rounded-2xl border border-amber-200/80 space-y-3">
              <h4 className="font-extrabold text-xs text-amber-950 uppercase tracking-wider">
                🌅 Daily Targets
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Daily Chores Goal
                </label>
                <input
                  type="number"
                  min="1"
                  max="30"
                  value={dailyChores}
                  onChange={(e) => setDailyChores(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Daily Stars Goal
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={dailyStars}
                  onChange={(e) => setDailyStars(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Weekly Goals */}
            <div className="p-3.5 bg-blue-50/50 rounded-2xl border border-blue-200/80 space-y-3">
              <h4 className="font-extrabold text-xs text-blue-950 uppercase tracking-wider">
                📊 Weekly Targets
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Weekly Chores Goal
                </label>
                <input
                  type="number"
                  min="5"
                  max="200"
                  value={weeklyChores}
                  onChange={(e) => setWeeklyChores(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Weekly Stars Goal
                </label>
                <input
                  type="number"
                  min="10"
                  max="500"
                  value={weeklyStars}
                  onChange={(e) => setWeeklyStars(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
            </div>

            {/* Monthly Goals */}
            <div className="p-3.5 bg-purple-50/50 rounded-2xl border border-purple-200/80 space-y-3">
              <h4 className="font-extrabold text-xs text-purple-950 uppercase tracking-wider">
                🗓️ Monthly Targets
              </h4>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Monthly Chores Goal
                </label>
                <input
                  type="number"
                  min="20"
                  max="1000"
                  value={monthlyChores}
                  onChange={(e) => setMonthlyChores(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-slate-600 mb-1">
                  Monthly Stars Goal
                </label>
                <input
                  type="number"
                  min="50"
                  max="2000"
                  value={monthlyStars}
                  onChange={(e) => setMonthlyStars(Number(e.target.value))}
                  className="w-full bg-white border border-slate-300 rounded-xl px-3 py-1.5 text-xs font-bold text-slate-900"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              className="py-2 px-5 rounded-xl font-extrabold text-xs text-white bg-slate-900 hover:bg-slate-800 shadow-sm cursor-pointer transition-all"
            >
              Update Goal Targets
            </button>
          </div>
        </form>
      </div>

      {/* Full Activity Completion History Log */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Chore Activity Log</span>
            </h3>
            <p className="text-xs text-slate-500">Detailed historical record of all completed activities</p>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2">
            <select
              value={filterRoutine}
              onChange={(e) => setFilterRoutine(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
            >
              <option value="all">All Routines</option>
              <option value="morning">🌅 Morning</option>
              <option value="afternoon">☀️ Afternoon</option>
              <option value="evening">🌙 Bedtime</option>
              <option value="bonus">🌟 Bonus</option>
            </select>

            <select
              value={filterDayType}
              onChange={(e) => setFilterDayType(e.target.value)}
              className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-700"
            >
              <option value="all">All Days</option>
              <option value="weekday">Weekdays Only</option>
              <option value="weekend">Weekends Only</option>
            </select>
          </div>
        </div>

        {filteredHistory.length === 0 ? (
          <div className="text-center py-8 text-slate-400 font-bold text-xs">
            No activity history records found matching your filters.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto space-y-2 pr-1">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 hover:bg-slate-100/80 transition-colors"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <span className="text-2xl flex-shrink-0">{item.icon}</span>
                  <div className="min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 truncate">{item.title}</h4>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-semibold mt-0.5">
                      <span className="capitalize text-amber-700 font-bold">{item.routine}</span>
                      <span>•</span>
                      <span
                        className={`px-1.5 py-0.2 rounded font-extrabold ${
                          item.isWeekend
                            ? 'bg-orange-100 text-orange-700'
                            : 'bg-blue-100 text-blue-700'
                        }`}
                      >
                        {item.isWeekend ? 'Weekend' : 'Weekday'}
                      </span>
                      <span>•</span>
                      <span>
                        {new Date(item.completedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                        })}{' '}
                        at{' '}
                        {new Date(item.completedAt).toLocaleTimeString(undefined, {
                          hour: 'numeric',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-xs font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-xl flex-shrink-0">
                  +{item.starsAwarded} ⭐️
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

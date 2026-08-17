import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Trophy,
  CheckCircle2,
  PieChart,
  Clock,
} from 'lucide-react';
import type { TimeframeGoals, Achievement, ChoreCompletionRecord } from '../../types';
import { getMonthKey, formatDateKey, db, isWeekendDay } from '../../db';
import { GoalProgressBar } from './GoalProgressBar';
import { playPopSound } from '../../utils/sound';

interface MonthlyHistoryViewProps {
  goals: TimeframeGoals;
  achievements: Achievement[];
  soundEnabled?: boolean;
}

export const MonthlyHistoryView: React.FC<MonthlyHistoryViewProps> = ({
  goals,
  achievements,
  soundEnabled = true,
}) => {
  const [selectedMonth, setSelectedMonth] = useState<Date>(new Date());
  const [historyRecords, setHistoryRecords] = useState<ChoreCompletionRecord[]>([]);
  const [activeDayInspect, setActiveDayInspect] = useState<string | null>(null);

  const monthKey = getMonthKey(selectedMonth);
  const todayStr = formatDateKey(new Date());

  // Load monthly history
  useEffect(() => {
    const loadMonthHistory = async () => {
      const records = await db.choreHistory.where('monthKey').equals(monthKey).toArray();
      setHistoryRecords(records);
    };
    loadMonthHistory();
  }, [monthKey]);

  // Month navigation
  const handlePrevMonth = () => {
    playPopSound(soundEnabled);
    const prev = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1, 1);
    setSelectedMonth(prev);
    setActiveDayInspect(null);
  };

  const handleNextMonth = () => {
    playPopSound(soundEnabled);
    const next = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 1);
    setSelectedMonth(next);
    setActiveDayInspect(null);
  };

  const handleCurrentMonth = () => {
    playPopSound(soundEnabled);
    setSelectedMonth(new Date());
    setActiveDayInspect(null);
  };

  // Group records by date
  const recordsByDate: Record<string, ChoreCompletionRecord[]> = {};
  for (const record of historyRecords) {
    if (!recordsByDate[record.completedDate]) {
      recordsByDate[record.completedDate] = [];
    }
    recordsByDate[record.completedDate].push(record);
  }

  const totalChores = historyRecords.length;
  const totalStars = historyRecords.reduce((acc, r) => acc + r.starsAwarded, 0);
  const activeDaysCount = Object.keys(recordsByDate).length;

  const routineCounts = {
    morning: historyRecords.filter((r) => r.routine === 'morning').length,
    afternoon: historyRecords.filter((r) => r.routine === 'afternoon').length,
    evening: historyRecords.filter((r) => r.routine === 'evening').length,
    bonus: historyRecords.filter((r) => r.routine === 'bonus').length,
  };

  // Calendar calculations
  const year = selectedMonth.getFullYear();
  const month = selectedMonth.getMonth();
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const daysInMonth = lastDayOfMonth.getDate();

  // Day offset for Monday start (0: Mon, ..., 6: Sun)
  const firstDayOfWeek = (firstDayOfMonth.getDay() + 6) % 7;

  const calendarCells = [];
  // Empty padding cells before first day
  for (let i = 0; i < firstDayOfWeek; i++) {
    calendarCells.push(null);
  }
  // Days of the month
  for (let day = 1; day <= daysInMonth; day++) {
    const d = new Date(year, month, day);
    calendarCells.push(d);
  }

  const monthName = selectedMonth.toLocaleDateString(undefined, {
    month: 'long',
    year: 'numeric',
  });

  const monthlyAchievements = achievements.filter((a) => a.timeframe === 'monthly');
  const inspectedRecords = activeDayInspect ? recordsByDate[activeDayInspect] || [] : [];
  const inspectedDayObj = activeDayInspect ? new Date(activeDayInspect + 'T00:00:00') : null;

  return (
    <div className="space-y-6">
      {/* 1. Header & Month Navigator */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-400 to-pink-500 text-white flex items-center justify-center text-2xl shadow-md shadow-purple-500/20">
            🗓️
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              Monthly Overview & Badges
            </h2>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
              <CalendarIcon className="w-3.5 h-3.5 text-purple-500" />
              {monthName} • {activeDaysCount} Active Days
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 transition-colors cursor-pointer"
            title="Previous Month"
            aria-label="Previous Month"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleCurrentMonth}
            className="px-3 py-1.5 rounded-xl font-extrabold text-xs bg-purple-600 text-white hover:bg-purple-700 transition-colors shadow-xs cursor-pointer"
          >
            This Month
          </button>

          <button
            onClick={handleNextMonth}
            className="p-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 transition-colors cursor-pointer"
            title="Next Month"
            aria-label="Next Month"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Monthly Goals Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GoalProgressBar
          current={totalChores}
          target={goals.monthlyChoresTarget}
          label="Monthly Chores Milestone"
          sublabel="Target total chore completions this month"
          icon="👑"
          colorScheme="purple"
          suffix="Chores"
        />

        <GoalProgressBar
          current={totalStars}
          target={goals.monthlyStarsTarget}
          label="Monthly Star Stash"
          sublabel="Total stars accumulated this month"
          icon="✨"
          colorScheme="amber"
          suffix="Stars"
        />
      </div>

      {/* 3. Monthly Calendar Heatmap Grid */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-purple-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <span>🗓️ Activity Calendar</span>
          </h3>
          <div className="flex items-center gap-2 text-xs font-bold text-slate-500">
            <span className="text-slate-400">Activity:</span>
            <span className="w-3 h-3 rounded-md bg-slate-100 border border-slate-200" title="0" />
            <span className="w-3 h-3 rounded-md bg-amber-200" title="1-3 Chores" />
            <span className="w-3 h-3 rounded-md bg-amber-400" title="4-6 Chores" />
            <span className="w-3 h-3 rounded-md bg-emerald-500" title="7+ Chores" />
          </div>
        </div>

        {/* Day headers Mon - Sun */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName, idx) => (
            <span
              key={dayName}
              className={`text-xs font-black py-1 uppercase ${
                idx >= 5 ? 'text-orange-600' : 'text-slate-400'
              }`}
            >
              {dayName}
            </span>
          ))}

          {/* Calendar Day Cells */}
          {calendarCells.map((dayDate, i) => {
            if (!dayDate) {
              return <div key={`empty-${i}`} className="p-2 sm:p-3 rounded-2xl opacity-0" />;
            }

            const dateStr = formatDateKey(dayDate);
            const isToday = dateStr === todayStr;
            const records = recordsByDate[dateStr] || [];
            const count = records.length;
            const stars = records.reduce((s, r) => s + r.starsAwarded, 0);
            const isSelected = activeDayInspect === dateStr;
            const isWeekend = isWeekendDay(dayDate);

            // Determine heatmap color style
            let bgStyle = 'bg-slate-50 border-slate-100 text-slate-700 hover:bg-slate-100';
            if (count >= 7) {
              bgStyle = 'bg-emerald-500 text-white border-emerald-600 shadow-sm';
            } else if (count >= 4) {
              bgStyle = 'bg-amber-400 text-amber-950 border-amber-500 shadow-sm';
            } else if (count >= 1) {
              bgStyle = 'bg-amber-100 text-amber-900 border-amber-200';
            }

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  playPopSound(soundEnabled);
                  setActiveDayInspect(isSelected ? null : dateStr);
                }}
                className={`p-2 sm:p-3 rounded-2xl border flex flex-col items-center justify-between min-h-[64px] sm:min-h-[72px] transition-all cursor-pointer relative ${bgStyle} ${
                  isSelected ? 'ring-2 ring-purple-600 shadow-md' : ''
                } ${isToday ? 'ring-2 ring-amber-500' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span className="text-xs font-black">{dayDate.getDate()}</span>
                  {isWeekend && (
                    <span className="text-[8px] font-extrabold uppercase opacity-75">wknd</span>
                  )}
                </div>

                {count > 0 ? (
                  <div className="flex flex-col items-center">
                    <span className="text-[11px] font-black">{count} done</span>
                    <span className="text-[10px] font-extrabold opacity-90 flex items-center gap-0.5">
                      +{stars}⭐️
                    </span>
                  </div>
                ) : (
                  <span className="text-[10px] opacity-40 font-semibold">-</span>
                )}

                {isToday && (
                  <span className="absolute -top-1.5 right-1 text-[8px] font-black bg-amber-500 text-white px-1 rounded-full">
                    Today
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. Inspected Day Drawer */}
      <AnimatePresence>
        {activeDayInspect && inspectedDayObj && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white p-5 rounded-3xl border border-purple-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h4 className="font-extrabold text-slate-900 text-sm">
                  {inspectedDayObj.toLocaleDateString(undefined, {
                    weekday: 'long',
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </h4>
                <p className="text-xs font-semibold text-slate-500">
                  {inspectedRecords.length} chores completed •{' '}
                  {inspectedRecords.reduce((s, r) => s + r.starsAwarded, 0)} stars earned
                </p>
              </div>

              <button
                onClick={() => setActiveDayInspect(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
              >
                Close
              </button>
            </div>

            {inspectedRecords.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-bold text-xs">
                No chores recorded on this date.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inspectedRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-purple-50/60 border border-purple-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{rec.title}</h5>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                          <span className="capitalize text-purple-700 font-bold">{rec.routine}</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(rec.completedAt).toLocaleTimeString(undefined, {
                              hour: 'numeric',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className="flex-shrink-0 text-xs font-black text-purple-600 bg-purple-100 px-2 py-0.5 rounded-xl">
                      +{rec.starsAwarded} ⭐️
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Routine Distribution Summary */}
      <div className="bg-white p-5 rounded-3xl border border-purple-200 shadow-sm space-y-4">
        <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
          <PieChart className="w-4 h-4 text-purple-500" />
          <span>Routine Activity Distribution</span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-center">
            <span className="text-2xl">🌅</span>
            <h4 className="text-xs font-bold text-amber-950 mt-1">Morning</h4>
            <p className="text-lg font-black text-amber-600">{routineCounts.morning}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-sky-50 border border-sky-200 text-center">
            <span className="text-2xl">☀️</span>
            <h4 className="text-xs font-bold text-sky-950 mt-1">Afternoon</h4>
            <p className="text-lg font-black text-sky-600">{routineCounts.afternoon}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 text-center">
            <span className="text-2xl">🌙</span>
            <h4 className="text-xs font-bold text-indigo-950 mt-1">Bedtime</h4>
            <p className="text-lg font-black text-indigo-600">{routineCounts.evening}</p>
          </div>

          <div className="p-3.5 rounded-2xl bg-pink-50 border border-pink-200 text-center">
            <span className="text-2xl">🌟</span>
            <h4 className="text-xs font-bold text-pink-950 mt-1">Bonus Quests</h4>
            <p className="text-lg font-black text-pink-600">{routineCounts.bonus}</p>
          </div>
        </div>
      </div>

      {/* 6. Monthly Trophies & Milestones */}
      <div className="bg-white p-5 rounded-3xl border border-purple-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-purple-500" />
            <span>Monthly Trophies</span>
          </h3>
          <span className="text-xs font-bold text-purple-700">
            {monthlyAchievements.filter((a) => a.unlocked).length} / {monthlyAchievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {monthlyAchievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-purple-50 border-purple-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  ach.unlocked ? 'bg-purple-400/30' : 'bg-slate-200'
                }`}
              >
                {ach.icon}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="font-extrabold text-xs text-slate-900 truncate">{ach.title}</h4>
                  {ach.unlocked && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />}
                </div>
                <p className="text-[10px] text-slate-500 font-medium line-clamp-2 leading-tight mt-0.5">
                  {ach.description}
                </p>
                <div className="mt-1.5 flex items-center justify-between text-[10px] font-extrabold text-slate-400">
                  <span>{ach.unlocked ? 'Unlocked! 🏆' : `${ach.currentValue} / ${ach.targetValue}`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

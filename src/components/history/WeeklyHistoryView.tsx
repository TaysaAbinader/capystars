import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Trophy,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import type { TimeframeGoals, Achievement, ChoreCompletionRecord } from '../../types';
import {
  getISOWeekKey,
  getWeekDays,
  formatDateKey,
  isWeekendDay,
  db,
} from '../../db';
import { GoalProgressBar } from './GoalProgressBar';
import { playPopSound } from '../../utils/sound';

interface WeeklyHistoryViewProps {
  goals: TimeframeGoals;
  achievements: Achievement[];
  soundEnabled?: boolean;
  onBackToChores?: () => void;
}

export const WeeklyHistoryView: React.FC<WeeklyHistoryViewProps> = ({
  goals,
  achievements,
  soundEnabled = true,
  onBackToChores,
}) => {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [historyRecords, setHistoryRecords] = useState<ChoreCompletionRecord[]>([]);
  const [activeDayInspect, setActiveDayInspect] = useState<string | null>(formatDateKey(new Date()));

  const weekDays = getWeekDays(selectedDate);
  const weekKey = getISOWeekKey(selectedDate);
  const todayStr = formatDateKey(new Date());

  // Load history records for current week key
  useEffect(() => {
    const loadWeekHistory = async () => {
      const records = await db.choreHistory.where('weekKey').equals(weekKey).toArray();
      setHistoryRecords(records);
    };
    loadWeekHistory();
  }, [weekKey]);

  // Navigate weeks
  const handlePrevWeek = () => {
    playPopSound(soundEnabled);
    const prev = new Date(selectedDate);
    prev.setDate(prev.getDate() - 7);
    setSelectedDate(prev);
    setActiveDayInspect(null);
  };

  const handleNextWeek = () => {
    playPopSound(soundEnabled);
    const next = new Date(selectedDate);
    next.setDate(next.getDate() + 7);
    setSelectedDate(next);
    setActiveDayInspect(null);
  };

  const handleTodayWeek = () => {
    playPopSound(soundEnabled);
    setSelectedDate(new Date());
    setActiveDayInspect(todayStr);
  };

  // Group records by day
  const recordsByDay: Record<string, ChoreCompletionRecord[]> = {};
  for (const day of weekDays) {
    recordsByDay[formatDateKey(day)] = [];
  }
  for (const record of historyRecords) {
    if (recordsByDay[record.completedDate]) {
      recordsByDay[record.completedDate].push(record);
    }
  }

  const totalChores = historyRecords.length;
  const totalStars = historyRecords.reduce((acc, r) => acc + r.starsAwarded, 0);
  const weekdayChores = historyRecords.filter((r) => !r.isWeekend).length;
  const weekendChores = historyRecords.filter((r) => r.isWeekend).length;

  const weekStartDate = weekDays[0];
  const weekEndDate = weekDays[6];
  const weekDateLabel = `${weekStartDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
  })} – ${weekEndDate.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const weeklyAchievements = achievements.filter((a) => a.timeframe === 'weekly');
  const inspectedRecords = activeDayInspect ? recordsByDay[activeDayInspect] || [] : [];
  const inspectedDayObj = activeDayInspect ? new Date(activeDayInspect + 'T00:00:00') : null;

  return (
    <div className="space-y-6">
      {/* 1. Header & Week Navigation Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-3xl border border-amber-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-400 to-orange-500 text-white flex items-center justify-center text-2xl shadow-md shadow-amber-500/20">
            📊
          </div>
          <div>
            <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
              Weekly Progress & History
            </h2>
            <p className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 mt-0.5">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              {weekDateLabel}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onBackToChores && (
            <button
              onClick={() => {
                playPopSound(soundEnabled);
                onBackToChores();
              }}
              className="px-3 py-1.5 rounded-xl font-bold text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer mr-1"
            >
              ← Today's Chores
            </button>
          )}

          <button
            onClick={handlePrevWeek}
            className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 transition-colors cursor-pointer"
            title="Previous Week"
            aria-label="Previous Week"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <button
            onClick={handleTodayWeek}
            className="px-3 py-1.5 rounded-xl font-extrabold text-xs bg-amber-500 text-white hover:bg-amber-600 transition-colors shadow-xs cursor-pointer"
          >
            This Week
          </button>

          <button
            onClick={handleNextWeek}
            className="p-2 rounded-xl bg-slate-100 hover:bg-amber-100 text-slate-700 transition-colors cursor-pointer"
            title="Next Week"
            aria-label="Next Week"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* 2. Weekly Goals Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <GoalProgressBar
          current={totalChores}
          target={goals.weeklyChoresTarget}
          label="Weekly Chores Goal"
          sublabel="Total completed activities this week"
          icon="🎯"
          colorScheme="amber"
          suffix="Chores"
        />

        <GoalProgressBar
          current={totalStars}
          target={goals.weeklyStarsTarget}
          label="Weekly Stars Goal"
          sublabel="Total stars earned this week"
          icon="⭐️"
          colorScheme="purple"
          suffix="Stars"
        />
      </div>

      {/* 3. 7-Day Day-by-Day Visual Activity Breakdown */}
      <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <span>📅 Day-by-Day Activity</span>
          </h3>
          <div className="flex items-center gap-3 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Weekdays: {weekdayChores}
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500" /> Weekends: {weekendChores}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3">
          {weekDays.map((day) => {
            const dateStr = formatDateKey(day);
            const isToday = dateStr === todayStr;
            const isWeekend = isWeekendDay(day);
            const records = recordsByDay[dateStr] || [];
            const count = records.length;
            const stars = records.reduce((s, r) => s + r.starsAwarded, 0);
            const isSelected = activeDayInspect === dateStr;

            const dayName = day.toLocaleDateString(undefined, { weekday: 'short' });
            const dayNum = day.getDate();

            return (
              <motion.button
                key={dateStr}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  playPopSound(soundEnabled);
                  setActiveDayInspect(isSelected ? null : dateStr);
                }}
                className={`flex flex-col items-center p-2.5 sm:p-3 rounded-2xl border-2 transition-all cursor-pointer text-center relative ${
                  isSelected
                    ? 'ring-2 ring-amber-500 bg-amber-50 border-amber-400 shadow-md'
                    : isToday
                    ? 'border-amber-400 bg-amber-50/50'
                    : 'border-slate-100 bg-slate-50 hover:bg-slate-100'
                }`}
              >
                {/* Weekday vs Weekend Tag */}
                <span
                  className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md mb-1 ${
                    isWeekend ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'
                  }`}
                >
                  {isWeekend ? 'Wknd' : 'Wkday'}
                </span>

                <span className="text-xs font-black text-slate-800">{dayName}</span>
                <span className="text-[11px] font-bold text-slate-400">{dayNum}</span>

                {/* Score / Chores done indicator */}
                <div className="mt-2 flex flex-col items-center gap-0.5">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-black text-xs ${
                      count > 0
                        ? isWeekend
                          ? 'bg-orange-500 text-white shadow-xs'
                          : 'bg-blue-500 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400'
                    }`}
                  >
                    {count}
                  </div>
                  {stars > 0 && (
                    <span className="text-[10px] font-extrabold text-amber-600 flex items-center">
                      +{stars}⭐️
                    </span>
                  )}
                </div>

                {isToday && (
                  <span className="absolute -bottom-2 text-[9px] font-black bg-amber-500 text-white px-1.5 py-0.2 rounded-full">
                    Today
                  </span>
                )}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* 4. Inspected Day Details (When tapped) */}
      <AnimatePresence>
        {activeDayInspect && inspectedDayObj && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-3"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">
                  {isWeekendDay(inspectedDayObj) ? '🏖️' : '🎒'}
                </span>
                <div>
                  <h4 className="font-extrabold text-slate-900 text-sm">
                    {inspectedDayObj.toLocaleDateString(undefined, {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500">
                    {inspectedRecords.length} chores completed •{' '}
                    {inspectedRecords.reduce((s, r) => s + r.starsAwarded, 0)} stars earned
                  </p>
                </div>
              </div>

              <span
                className={`text-xs font-black px-2.5 py-1 rounded-full ${
                  isWeekendDay(inspectedDayObj)
                    ? 'bg-orange-100 text-orange-700'
                    : 'bg-blue-100 text-blue-700'
                }`}
              >
                {isWeekendDay(inspectedDayObj) ? 'Weekend Schedule' : 'Weekday Schedule'}
              </span>
            </div>

            {inspectedRecords.length === 0 ? (
              <div className="text-center py-6 text-slate-400 font-bold text-xs">
                No completed chores logged for this day.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {inspectedRecords.map((rec) => (
                  <div
                    key={rec.id}
                    className="p-3 rounded-2xl bg-amber-50/60 border border-amber-200/80 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-2xl flex-shrink-0">{rec.icon}</span>
                      <div className="min-w-0">
                        <h5 className="font-bold text-xs text-slate-900 truncate">{rec.title}</h5>
                        <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                          <span className="capitalize text-amber-700 font-bold">{rec.routine}</span>
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

                    <span className="flex-shrink-0 text-xs font-black text-amber-600 bg-amber-100 px-2 py-0.5 rounded-xl">
                      +{rec.starsAwarded} ⭐️
                    </span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* 5. Weekly Badges & Achievements */}
      <div className="bg-white p-5 rounded-3xl border border-amber-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
            <Trophy className="w-4 h-4 text-amber-500" />
            <span>Weekly Achievements</span>
          </h3>
          <span className="text-xs font-bold text-amber-700">
            {weeklyAchievements.filter((a) => a.unlocked).length} / {weeklyAchievements.length} Unlocked
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {weeklyAchievements.map((ach) => (
            <div
              key={ach.id}
              className={`p-3.5 rounded-2xl border flex items-center gap-3 transition-all ${
                ach.unlocked
                  ? 'bg-amber-50 border-amber-300 shadow-xs'
                  : 'bg-slate-50 border-slate-200 opacity-60'
              }`}
            >
              <div
                className={`w-11 h-11 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  ach.unlocked ? 'bg-amber-400/30' : 'bg-slate-200'
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
                  <span>{ach.unlocked ? 'Unlocked! 🌟' : `${ach.currentValue} / ${ach.targetValue}`}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

import { useState } from 'react';
import type { TrackAvailabilityItem } from '@/services/trackService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const PILOT_CATEGORY_COLORS: Record<string, string> = {
  JUNIOR: 'text-green-400 bg-green-500/10 border-green-500/20',
  SENIOR: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
  BOTH: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
};

interface TrackAvailabilityCalendarProps {
  slots: TrackAvailabilityItem[];
  loading: boolean;
}

export function TrackAvailabilityCalendar({ slots, loading }: TrackAvailabilityCalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [filterCat, setFilterCat] = useState<string>('ALL');
  const [filterType, setFilterType] = useState<string>('ALL');

  function prevMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  }
  function nextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  }

  const filtered = slots.filter((s) => {
    const [y, m] = s.date.split('-').map(Number);
    if (y !== viewYear || m - 1 !== viewMonth) return false;
    if (filterCat !== 'ALL' && s.pilotCategory !== filterCat) return false;
    if (filterType !== 'ALL' && s.rentalType !== filterType) return false;
    return true;
  });

  const byDate: Record<string, TrackAvailabilityItem[]> = {};
  for (const s of filtered) {
    (byDate[s.date] ??= []).push(s);
  }
  const sortedDates = Object.keys(byDate).sort();

  const totalMonth = slots.filter((s) => {
    const [y, m] = s.date.split('-').map(Number);
    return y === viewYear && m - 1 === viewMonth;
  }).length;

  if (loading) return <p className="text-gray-500 text-sm animate-pulse">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          ‹
        </button>
        <div className="text-center">
          <span className="text-white font-bold text-base">
            {MONTH_NAMES[viewMonth]} {viewYear}
          </span>
          {totalMonth > 0 && (
            <span className="ml-2 text-xs text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-full px-2 py-0.5">
              {totalMonth} slot{totalMonth !== 1 ? 's' : ''}
            </span>
          )}
        </div>
        <button
          onClick={nextMonth}
          className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          ›
        </button>
      </div>

      <div className="flex flex-wrap gap-2 mb-5">
        {(['ALL', 'JUNIOR', 'SENIOR', 'BOTH'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setFilterCat(v)}
            className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
              filterCat === v
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            {v === 'ALL' ? 'All' : v === 'BOTH' ? 'Both' : v === 'JUNIOR' ? 'Junior' : 'Senior'}
          </button>
        ))}
        <span className="text-gray-600">|</span>
        {(['ALL', 'HALF_DAY', 'FULL_DAY'] as const).map((v) => (
          <button
            key={v}
            onClick={() => setFilterType(v)}
            className={`text-xs font-medium px-3 py-1 rounded-full border transition-colors ${
              filterType === v
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'border-gray-600 text-gray-400 hover:border-gray-400'
            }`}
          >
            {v === 'ALL' ? 'All' : v === 'HALF_DAY' ? 'Half day' : 'Full day'}
          </button>
        ))}
      </div>

      {sortedDates.length === 0 ? (
        <p className="text-gray-500 text-sm py-6 text-center">
          No availability for this month{filterCat !== 'ALL' || filterType !== 'ALL' ? ' with these filters' : ''}.
        </p>
      ) : (
        <div className="space-y-3">
          {sortedDates.map((dateStr) => {
            const daySlots = byDate[dateStr];
            const d = new Date(dateStr + 'T12:00:00');
            const dayName = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][d.getDay()];
            const dayNum = d.getDate();
            return (
              <div key={dateStr} className="flex gap-3">
                <div className="flex flex-col items-center justify-center w-12 shrink-0 bg-gray-700/60 border border-gray-600/50 rounded-xl py-2">
                  <span className="text-xs text-gray-400 font-medium">{dayName}</span>
                  <span className="text-lg font-bold text-white leading-none">{dayNum}</span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5 justify-center">
                  {daySlots.map((slot) => (
                    <div
                      key={slot.id}
                      className="flex flex-wrap items-center gap-2 bg-gray-700/30 border border-gray-600/40 rounded-lg px-3 py-1.5"
                    >
                      <span className="text-sm font-semibold text-orange-400 shrink-0">
                        {slot.startTime} – {slot.endTime}
                      </span>
                      <span className="text-xs text-gray-400 bg-gray-600/50 rounded-full px-2 py-0.5">
                        {slot.rentalType === 'HALF_DAY' ? 'Half day' : 'Full day'}
                      </span>
                      <span className={`text-xs font-medium border rounded-full px-2 py-0.5 ${
                        PILOT_CATEGORY_COLORS[slot.pilotCategory] ?? PILOT_CATEGORY_COLORS.BOTH
                      }`}>
                        {slot.pilotCategory === 'JUNIOR'
                          ? 'Junior'
                          : slot.pilotCategory === 'SENIOR'
                            ? 'Senior'
                            : 'Both'}
                      </span>
                      <span className="text-xs text-gray-500 ml-auto">
                        cap. {slot.capacity}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

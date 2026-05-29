import { useState } from 'react';
import type { AvailabilityItem, TrackRefResponse } from '@/services/coachSettingsService';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
const DAY_ABBR = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

interface CoachAvailabilityCalendarProps {
  slots: AvailabilityItem[];
  tracks: TrackRefResponse[];
}

export function CoachAvailabilityCalendar({
  slots,
  tracks,
}: CoachAvailabilityCalendarProps) {
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());
  const [filterTrackId, setFilterTrackId] = useState<string>('ALL');

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

  const totalMonth = slots.filter((s) => {
    const d = new Date(s.date + 'T12:00:00');
    return d.getFullYear() === viewYear && d.getMonth() === viewMonth;
  }).length;

  const filtered = slots.filter((s) => {
    const d = new Date(s.date + 'T12:00:00');
    if (d.getFullYear() !== viewYear || d.getMonth() !== viewMonth) return false;
    if (filterTrackId !== 'ALL' && String(s.trackId) !== filterTrackId) return false;
    return true;
  });

  const byDate: Record<string, AvailabilityItem[]> = {};
  filtered.forEach((s) => {
    if (!byDate[s.date]) byDate[s.date] = [];
    byDate[s.date].push(s);
  });
  const sortedDates = Object.keys(byDate).sort();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={prevMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-lg transition-colors"
        >
          ‹
        </button>
        <span className="text-white font-semibold flex items-center gap-2">
          {MONTH_NAMES[viewMonth]} {viewYear}
          <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-orange-500/20 border border-orange-500/30 text-orange-300">
            {totalMonth}
          </span>
        </span>
        <button
          onClick={nextMonth}
          className="w-8 h-8 flex items-center justify-center rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-300 text-lg transition-colors"
        >
          ›
        </button>
      </div>

      {tracks.length > 1 && (
        <div className="flex flex-wrap gap-2 mb-4">
          <button
            onClick={() => setFilterTrackId('ALL')}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              filterTrackId === 'ALL'
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-orange-500/50'
            }`}
          >
            All
          </button>
          {tracks.map((t) => (
            <button
              key={t.trackId}
              onClick={() => setFilterTrackId(String(t.trackId))}
              className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
                filterTrackId === String(t.trackId)
                  ? 'bg-orange-500 border-orange-500 text-white'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-orange-500/50'
              }`}
            >
              {t.trackName}
            </button>
          ))}
        </div>
      )}

      {sortedDates.length === 0 ? (
        <p className="text-gray-500 text-sm">
          {totalMonth === 0
            ? 'No time slots recorded for this month.'
            : 'No time slots for the selected filters.'}
        </p>
      ) : (
        <div className="space-y-4">
          {sortedDates.map((dateStr) => {
            const d = new Date(dateStr + 'T12:00:00');
            return (
              <div key={dateStr} className="flex gap-3">
                <div className="flex flex-col items-center justify-center w-12 shrink-0 bg-gray-700/60 border border-gray-600/50 rounded-xl py-2">
                  <span className="text-xs text-gray-400 font-medium">{DAY_ABBR[d.getDay()]}</span>
                  <span className="text-lg font-bold text-white leading-none">{d.getDate()}</span>
                </div>
                <div className="flex-1 flex flex-col gap-1.5 justify-center">
                  {byDate[dateStr].map((slot) => (
                    <div
                      key={slot.id}
                      className="flex items-center justify-between gap-2 bg-gray-700/30 border border-gray-600/50 rounded-xl px-4 py-2.5"
                    >
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-gray-300 text-xs bg-gray-700 px-2 py-0.5 rounded-lg border border-gray-600">
                          {slot.trackName}
                        </span>
                        <span className="text-gray-400 text-xs bg-gray-700/50 px-2 py-0.5 rounded-lg border border-gray-600/50">
                          {slot.classType === 'HOURLY' ? 'Hourly' : slot.classType === 'HALF_DAY' ? 'Half day' : 'Full day'}
                        </span>
                        <span className="text-gray-400 text-xs bg-gray-700/50 px-2 py-0.5 rounded-lg border border-gray-600/50">
                          {slot.mode === 'ONE_TO_ONE' ? '1:1' : `Group (max ${slot.maxStudents})`}
                        </span>
                      </div>
                      <span className="shrink-0 text-sm font-semibold text-orange-400 bg-orange-500/10 border border-orange-500/20 rounded-lg px-3 py-1">
                        {slot.startTime} – {slot.endTime}
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

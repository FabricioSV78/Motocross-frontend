import { useMemo, useState } from 'react';
import type { AvailabilityItem, TrackRefResponse } from '@/services/coachSettingsService';

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
type CalendarView = 'month' | 'agenda';

interface CoachAvailabilityCalendarProps {
  slots: AvailabilityItem[];
  tracks: TrackRefResponse[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

export function CoachAvailabilityCalendar({
  slots,
  tracks,
  selectedDate,
  onSelectDate,
}: CoachAvailabilityCalendarProps) {
  const initialDate = selectedDate ? new Date(`${selectedDate}T12:00:00`) : new Date();
  const [viewYear, setViewYear] = useState(initialDate.getFullYear());
  const [viewMonth, setViewMonth] = useState(initialDate.getMonth());
  const [filterTrackId, setFilterTrackId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<CalendarView>('month');

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      const slotDate = new Date(`${slot.date}T12:00:00`);
      if (slotDate.getFullYear() !== viewYear || slotDate.getMonth() !== viewMonth) return false;
      if (filterTrackId !== 'ALL' && String(slot.trackId) !== filterTrackId) return false;
      return true;
    });
  }, [filterTrackId, slots, viewMonth, viewYear]);

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, AvailabilityItem[]> = {};
    for (const slot of filteredSlots) {
      grouped[slot.date] ??= [];
      grouped[slot.date].push(slot);
    }

    Object.values(grouped).forEach((daySlots) => {
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [filteredSlots]);

  const calendarDays = useMemo(() => getCalendarDays(viewYear, viewMonth), [viewMonth, viewYear]);
  const activeDates = useMemo(() => Object.keys(slotsByDate), [slotsByDate]);
  const nextAvailabilityDate = useMemo(() => {
    const today = toDateInputValue(new Date());
    return [...filteredSlots]
      .filter((slot) => slot.date >= today)
      .sort((a, b) => `${a.date}-${a.startTime}`.localeCompare(`${b.date}-${b.startTime}`))[0]?.date;
  }, [filteredSlots]);

  function goToPreviousMonth() {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((current) => current - 1);
      return;
    }
    setViewMonth((current) => current - 1);
  }

  function goToNextMonth() {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((current) => current + 1);
      return;
    }
    setViewMonth((current) => current + 1);
  }

  function goToToday() {
    const today = new Date();
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    onSelectDate(toDateInputValue(today));
  }

  return (
    <section className="flex h-full min-h-[560px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between dark:border-slate-700 dark:bg-slate-800/70">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">
              {new Date(viewYear, viewMonth, 1).toLocaleDateString(undefined, {
                month: 'long',
                year: 'numeric',
              })}
            </h2>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {filteredSlots.length} lesson slot{filteredSlots.length === 1 ? '' : 's'}
            </span>
            <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
              {activeDates.length} active day{activeDates.length === 1 ? '' : 's'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {nextAvailabilityDate
              ? `Next availability: ${formatDateLabel(nextAvailabilityDate)}`
              : 'No upcoming coach availability in this view.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            {(['month', 'agenda'] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() => setViewMode(mode)}
                className={`rounded px-3 py-2 text-sm font-semibold transition ${
                  viewMode === mode
                    ? 'bg-orange-500 text-white shadow-sm'
                    : 'text-slate-500 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                }`}
              >
                {mode === 'month' ? 'Month' : 'Agenda'}
              </button>
            ))}
          </div>

          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={goToPreviousMonth}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={goToToday}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Today
            </button>
            <button
              type="button"
              onClick={goToNextMonth}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Next
            </button>
          </div>

          {tracks.length > 1 ? (
            <select
              value={filterTrackId}
              onChange={(event) => setFilterTrackId(event.target.value)}
              className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="ALL">All tracks</option>
              {tracks.map((track) => (
                <option key={track.trackId} value={String(track.trackId)}>
                  {track.trackName}
                </option>
              ))}
            </select>
          ) : null}
        </div>
      </div>

      {viewMode === 'month' ? (
        <>
          <div className="grid grid-cols-7 gap-px border-b border-slate-200 bg-slate-200 p-px dark:border-slate-700 dark:bg-slate-700">
            {WEEKDAY_HEADERS.map((label) => (
              <div
                key={label}
                className="bg-slate-50 px-2 py-2 text-center text-xs font-semibold uppercase tracking-wide text-slate-500 dark:bg-slate-900 dark:text-slate-300"
              >
                {label}
              </div>
            ))}
          </div>

          <div className="grid min-h-0 flex-1 grid-cols-7 gap-px bg-slate-200 p-px dark:bg-slate-700">
            {calendarDays.map((day) => {
              const dateKey = toDateInputValue(day);
              const daySlots = slotsByDate[dateKey] ?? [];
              const hasAvailability = daySlots.length > 0;
              const isCurrentMonth = day.getMonth() === viewMonth;
              const isSelected = selectedDate === dateKey;
              const isToday = toDateInputValue(new Date()) === dateKey;
              const isNextAvailability = nextAvailabilityDate === dateKey;

              return (
                <button
                  key={dateKey}
                  type="button"
                  onClick={() => onSelectDate(dateKey)}
                  className={`relative min-h-0 overflow-hidden p-2 text-left transition ${
                    hasAvailability
                      ? 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/12 dark:hover:bg-orange-500/18'
                      : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800'
                  } ${isSelected ? 'z-10 ring-2 ring-inset ring-orange-500' : ''} ${
                    isCurrentMonth ? '' : 'opacity-45'
                  }`}
                >
                  {hasAvailability ? (
                    <span className="absolute inset-x-0 top-0 h-1 bg-orange-500" />
                  ) : null}

                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                        isToday
                          ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                          : isSelected
                            ? 'bg-orange-500 text-white'
                            : hasAvailability
                              ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-100'
                              : 'text-slate-700 dark:text-white'
                      }`}
                    >
                      {day.getDate()}
                    </span>
                    {hasAvailability ? (
                      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-bold text-white">
                        {daySlots.length}
                      </span>
                    ) : null}
                  </div>

                  {isNextAvailability ? (
                    <div className="mt-2 rounded-lg bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-0">
                      Next
                    </div>
                  ) : null}

                  <div className="mt-2 space-y-1">
                    {daySlots.slice(0, 3).map((slot) => (
                      <div
                        key={slot.id}
                        className="truncate rounded-lg bg-white/85 px-2 py-1 text-[11px] font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100 dark:ring-slate-600"
                      >
                        {slot.startTime} - {slot.endTime}
                      </div>
                    ))}
                    {daySlots.length > 3 ? (
                      <p className="truncate text-[11px] font-semibold text-orange-700 dark:text-orange-200">
                        +{daySlots.length - 3} more
                      </p>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <AgendaView
          slots={filteredSlots}
          selectedDate={selectedDate}
          onSelectDate={onSelectDate}
        />
      )}
    </section>
  );
}

function AgendaView({
  slots,
  selectedDate,
  onSelectDate,
}: {
  slots: AvailabilityItem[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
}) {
  const sortedSlots = [...slots].sort((a, b) =>
    `${a.date}-${a.startTime}`.localeCompare(`${b.date}-${b.startTime}`)
  );

  if (sortedSlots.length === 0) {
    return (
      <div className="flex min-h-0 flex-1 items-center justify-center p-8 text-center">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">No availability in this view</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Use Add availability to publish your next coach slot.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto p-3">
      <div className="grid gap-2">
        {sortedSlots.map((slot) => {
          const selected = selectedDate === slot.date;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectDate(slot.date)}
              className={`grid gap-3 rounded-lg border px-4 py-3 text-left transition lg:grid-cols-[140px_minmax(0,1fr)_140px] lg:items-center ${
                selected
                  ? 'border-orange-500/60 bg-orange-500/12'
                  : 'border-slate-200 bg-white hover:border-slate-300 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-orange-500/50'
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-slate-950 dark:text-white">{formatDateLabel(slot.date)}</p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-300">{slot.trackName}</p>
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {slot.classType === 'HOURLY'
                    ? 'Hourly'
                    : slot.classType === 'HALF_DAY'
                      ? 'Half day'
                      : 'Full day'}
                </p>
                <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                  {slot.mode === 'ONE_TO_ONE' ? '1:1' : `Group max ${slot.maxStudents}`}
                </p>
              </div>
              <span className="rounded-lg bg-orange-50 px-3 py-2 text-center text-sm font-bold text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-100 dark:ring-0">
                {slot.startTime} - {slot.endTime}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const start = new Date(firstDay);
  const firstDayOffset = (firstDay.getDay() + 6) % 7;
  start.setDate(firstDay.getDate() - firstDayOffset);

  const end = new Date(lastDay);
  const lastDayOffset = (lastDay.getDay() + 6) % 7;
  end.setDate(lastDay.getDate() + (6 - lastDayOffset));

  const days: Date[] = [];
  const cursor = new Date(start);
  while (cursor <= end) {
    days.push(new Date(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }

  return days;
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

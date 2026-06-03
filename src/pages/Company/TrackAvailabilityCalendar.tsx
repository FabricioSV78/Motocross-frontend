import { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfWeek,
} from 'date-fns';
import type {
  PilotCategory,
  RentalType,
  TrackAvailabilityItem,
} from '@/services/trackService';

type CategoryFilter = 'ALL' | PilotCategory;
type RentalFilter = 'ALL' | RentalType;

interface TrackAvailabilityCalendarProps {
  slots: TrackAvailabilityItem[];
  loading: boolean;
  selectedDate: string;
  onSelectDate: (date: string) => void;
}

const WEEKDAY_HEADERS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const CATEGORY_LABELS: Record<CategoryFilter, string> = {
  ALL: 'All riders',
  JUNIOR: 'Junior',
  SENIOR: 'Senior',
  BOTH: 'All riders',
};

const RENTAL_LABELS: Record<RentalFilter, string> = {
  ALL: 'Any duration',
  HALF_DAY: 'Half day',
  FULL_DAY: 'Full day',
};

export function TrackAvailabilityCalendar({
  slots,
  loading,
  selectedDate,
  onSelectDate,
}: TrackAvailabilityCalendarProps) {
  const initialMonth = selectedDate ? parseISO(`${selectedDate}T00:00:00`) : new Date();
  const [visibleMonth, setVisibleMonth] = useState(startOfMonth(initialMonth));
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [rentalFilter, setRentalFilter] = useState<RentalFilter>('ALL');

  useEffect(() => {
    if (!selectedDate) return;
    setVisibleMonth(startOfMonth(parseISO(`${selectedDate}T00:00:00`)));
  }, [selectedDate]);

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (categoryFilter !== 'ALL' && slot.pilotCategory !== categoryFilter) return false;
      if (rentalFilter !== 'ALL' && slot.rentalType !== rentalFilter) return false;
      return true;
    });
  }, [categoryFilter, rentalFilter, slots]);

  const slotsByDate = useMemo(() => {
    const grouped: Record<string, TrackAvailabilityItem[]> = {};

    for (const slot of filteredSlots) {
      grouped[slot.date] ??= [];
      grouped[slot.date].push(slot);
    }

    Object.values(grouped).forEach((daySlots) => {
      daySlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    });

    return grouped;
  }, [filteredSlots]);

  const calendarDays = useMemo(() => {
    const start = startOfWeek(startOfMonth(visibleMonth), { weekStartsOn: 1 });
    const end = endOfWeek(endOfMonth(visibleMonth), { weekStartsOn: 1 });
    return eachDayOfInterval({ start, end });
  }, [visibleMonth]);

  const selectedDay = selectedDate ? parseISO(`${selectedDate}T00:00:00`) : null;
  const monthSlotCount = filteredSlots.filter((slot) =>
    isSameMonth(parseISO(`${slot.date}T00:00:00`), visibleMonth)
  ).length;

  if (loading) {
    return (
      <section className="flex h-full min-h-[520px] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div className="h-7 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-9 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="grid grid-cols-7 gap-px border-b border-slate-200 bg-slate-200 px-px py-px dark:border-slate-700 dark:bg-slate-700">
          {Array.from({ length: 7 }).map((_, index) => (
            <div key={index} className="h-8 animate-pulse bg-slate-50 dark:bg-slate-900" />
          ))}
        </div>
        <div className="grid min-h-0 flex-1 grid-cols-7 gap-px bg-slate-200 p-px dark:bg-slate-700">
          {Array.from({ length: 42 }).map((_, index) => (
            <div key={index} className="animate-pulse bg-slate-50 dark:bg-slate-900" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="flex h-full min-h-[520px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur lg:flex-row lg:items-center lg:justify-between dark:border-slate-700 dark:bg-slate-800/70">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl font-semibold text-slate-950 dark:text-white">{format(visibleMonth, 'MMMM yyyy')}</h2>
            <span className="rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              {monthSlotCount} slot{monthSlotCount === 1 ? '' : 's'}
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Select any day to create or review availability.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Prev
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth(startOfMonth(new Date()))}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Today
            </button>
            <button
              type="button"
              onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
              className="rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-white hover:text-slate-950 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            >
              Next
            </button>
          </div>

          <select
            value={categoryFilter}
            onChange={(event) => setCategoryFilter(event.target.value as CategoryFilter)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
          <select
            value={rentalFilter}
            onChange={(event) => setRentalFilter(event.target.value as RentalFilter)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            {Object.entries(RENTAL_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

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
          const dayKey = format(day, 'yyyy-MM-dd');
          const daySlots = slotsByDate[dayKey] ?? [];
          const isCurrentMonth = isSameMonth(day, visibleMonth);
          const isSelected = selectedDay ? isSameDay(day, selectedDay) : false;
          const isToday = isSameDay(day, new Date());

          return (
            <button
              key={dayKey}
              type="button"
              onClick={() => onSelectDate(dayKey)}
              className={`relative min-h-0 overflow-hidden p-2 text-left transition ${
                daySlots.length > 0
                  ? 'bg-orange-50 hover:bg-orange-100 dark:bg-orange-500/12 dark:hover:bg-orange-500/18'
                  : 'bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800'
              } ${
                isSelected ? 'z-10 ring-2 ring-inset ring-orange-500' : ''
              } ${isCurrentMonth ? '' : 'opacity-45'}`}
            >
              {daySlots.length > 0 ? <span className="absolute inset-x-0 top-0 h-1 bg-orange-500" /> : null}

              <div className="flex items-center justify-between gap-2">
                <span
                  className={`flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold ${
                    isToday
                      ? 'bg-slate-950 text-white dark:bg-white dark:text-slate-950'
                      : isSelected
                        ? 'bg-orange-500 text-white'
                        : daySlots.length > 0
                          ? 'bg-orange-100 text-orange-700 dark:bg-orange-500/20 dark:text-orange-100'
                          : 'text-slate-700 dark:text-white'
                  }`}
                >
                  {format(day, 'd')}
                </span>
                {daySlots.length > 0 ? (
                  <span className="rounded-full bg-orange-500 px-2 py-0.5 text-[11px] font-bold text-white">
                    {daySlots.length}
                  </span>
                ) : null}
              </div>

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
                  <p className="truncate text-[11px] font-semibold text-slate-500 dark:text-slate-400">
                    +{daySlots.length - 3} more
                  </p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}

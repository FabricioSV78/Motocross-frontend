import { useMemo, useState } from 'react';
import { AppCalendar, FlowbiteIcon, SelectField, SurfaceCard } from '@/components/ui';
import type { AvailabilityItem, TrackRefResponse } from '@/services/coachSettingsService';

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
  const [filterTrackId, setFilterTrackId] = useState<string>('ALL');
  const [viewMode, setViewMode] = useState<CalendarView>('month');

  const filteredSlots = useMemo(() => {
    return slots.filter((slot) => {
      if (slot.mode !== 'ONE_TO_ONE') return false;
      if (filterTrackId !== 'ALL' && String(slot.trackId) !== filterTrackId) return false;
      return true;
    });
  }, [filterTrackId, slots]);

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

  const activeDates = useMemo(() => Object.keys(slotsByDate), [slotsByDate]);
  const nextAvailabilityDate = useMemo(() => {
    const today = toDateInputValue(new Date());
    return [...filteredSlots]
      .filter((slot) => slot.date >= today)
      .sort((a, b) => `${a.date}-${a.startTime}`.localeCompare(`${b.date}-${b.startTime}`))[0]?.date;
  }, [filteredSlots]);
  const tileSummary = useMemo(() => {
    return Object.fromEntries(
      Object.entries(slotsByDate).map(([date, daySlots]) => [
        date,
        `${daySlots.length} lesson${daySlots.length === 1 ? '' : 's'}`,
      ])
    );
  }, [slotsByDate]);

  return (
    <SurfaceCard className="h-full">
      <div className="flex h-full min-h-[560px] flex-col">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <span className="grid h-11 w-11 place-items-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-200">
                <FlowbiteIcon name="calendar-plus" className="h-5 w-5" />
              </span>
              <div>
                <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                  Coach calendar
                </h2>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {nextAvailabilityDate
                    ? `Next availability: ${formatDateLabel(nextAvailabilityDate)}`
                    : 'No coach availability in this view.'}
                </p>
              </div>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
                {filteredSlots.length} lesson slots
              </span>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
                {activeDates.length} active days
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800">
              {(['month', 'agenda'] as const).map((mode) => (
                <button
                  key={mode}
                  type="button"
                  onClick={() => setViewMode(mode)}
                  className={`rounded-lg px-3 py-2 text-sm font-bold transition ${
                    viewMode === mode
                      ? 'bg-emerald-500 text-white shadow-sm'
                      : 'text-slate-500 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-white'
                  }`}
                >
                  {mode === 'month' ? 'Month' : 'Agenda'}
                </button>
              ))}
            </div>

            {tracks.length > 1 ? (
              <SelectField
                value={filterTrackId}
                onChange={setFilterTrackId}
                className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-emerald-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
                options={[
                  { value: 'ALL', label: 'All tracks' },
                  ...tracks.map((track) => ({
                    value: String(track.trackId),
                    label: track.trackName,
                  })),
                ]}
                ariaLabel="Filter track"
              />
            ) : null}
          </div>
        </div>

        <div className="mt-5 min-h-0 flex-1">
          {viewMode === 'month' ? (
            <AppCalendar
              value={selectedDate}
              onChange={onSelectDate}
              activeDates={activeDates}
              selectedDates={[selectedDate]}
              tileSummary={tileSummary}
              accent="emerald"
              density="spacious"
            />
          ) : (
            <AgendaView
              slots={filteredSlots}
              selectedDate={selectedDate}
              onSelectDate={onSelectDate}
            />
          )}
        </div>
      </div>
    </SurfaceCard>
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
      <div className="flex h-full min-h-[360px] items-center justify-center rounded-3xl border border-dashed border-slate-300 p-8 text-center dark:border-slate-700">
        <div>
          <p className="text-sm font-bold text-slate-950 dark:text-white">No availability in this view</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Use Add availability to publish your next coach slot.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full max-h-[560px] overflow-y-auto pr-1">
      <div className="grid gap-2">
        {sortedSlots.map((slot) => {
          const selected = selectedDate === slot.date;
          return (
            <button
              key={slot.id}
              type="button"
              onClick={() => onSelectDate(slot.date)}
              className={`grid gap-3 rounded-2xl border px-4 py-3 text-left transition lg:grid-cols-[150px_minmax(0,1fr)_150px] lg:items-center ${
                selected
                  ? 'border-emerald-500/60 bg-emerald-500/12'
                  : 'border-slate-200 bg-white/80 hover:border-emerald-300 dark:border-slate-800 dark:bg-slate-950/35 dark:hover:border-emerald-500/50'
              }`}
            >
              <div>
                <p className="text-sm font-bold text-slate-950 dark:text-white">{formatDateLabel(slot.date)}</p>
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
                  1:1
                </p>
              </div>
              <span className="rounded-xl bg-emerald-50 px-3 py-2 text-center text-sm font-black text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-100 dark:ring-0">
                {slot.startTime} - {slot.endTime}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
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

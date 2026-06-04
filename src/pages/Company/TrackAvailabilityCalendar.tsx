import { useMemo, useState } from 'react';
import { AppCalendar, FlowbiteIcon, SelectField, SurfaceCard } from '@/components/ui';
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
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('ALL');
  const [rentalFilter, setRentalFilter] = useState<RentalFilter>('ALL');

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

  const activeDates = useMemo(() => Object.keys(slotsByDate), [slotsByDate]);
  const tileSummary = useMemo(() => {
    return Object.fromEntries(
      Object.entries(slotsByDate).map(([date, daySlots]) => [
        date,
        `${daySlots.length} slot${daySlots.length === 1 ? '' : 's'}`,
      ])
    );
  }, [slotsByDate]);

  if (loading) {
    return (
      <SurfaceCard className="min-h-[520px]">
        <div className="space-y-5">
          <div className="flex items-center justify-between">
            <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
            <div className="h-10 w-56 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 35 }).map((_, index) => (
              <div key={index} className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800" />
            ))}
          </div>
        </div>
      </SurfaceCard>
    );
  }

  return (
    <SurfaceCard>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-2xl bg-orange-100 text-orange-600 dark:bg-orange-500/15 dark:text-orange-200">
              <FlowbiteIcon name="calendar" className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-slate-950 dark:text-white">
                Track calendar
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Select a date to create or review availability.
              </p>
            </div>
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-bold text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
              {filteredSlots.length} slots
            </span>
            <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700 dark:border-orange-500/25 dark:bg-orange-500/10 dark:text-orange-200">
              {activeDates.length} active days
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <SelectField
            value={categoryFilter}
            onChange={(value) => setCategoryFilter(value as CategoryFilter)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            options={Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label }))}
            ariaLabel="Filter rider category"
          />
          <SelectField
            value={rentalFilter}
            onChange={(value) => setRentalFilter(value as RentalFilter)}
            className="h-10 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
            options={Object.entries(RENTAL_LABELS).map(([value, label]) => ({ value, label }))}
            ariaLabel="Filter duration"
          />
        </div>
      </div>

      <div className="mt-5">
        <AppCalendar
          value={selectedDate}
          onChange={onSelectDate}
          activeDates={activeDates}
          selectedDates={[selectedDate]}
          tileSummary={tileSummary}
          density="spacious"
        />
      </div>
    </SurfaceCard>
  );
}

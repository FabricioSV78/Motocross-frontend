import { useState, type ReactNode } from 'react';
import type { TrackDetailPublic, AvailableSlot, CoachAvailableSlot, CoachForTrack } from '@/services/trackService';
import { AppCalendar, Button, FlowbiteIcon, SelectField } from '@/components/ui';

interface QuoteCheckoutFormProps {
  track: TrackDetailPublic;
  selectedCoach?: CoachForTrack;
  reservationDate: string;
  onReservationDateChange: (value: string) => void;
  availableSlots: AvailableSlot[];
  slotsLoading: boolean;
  selectedTrackSlotStart: string;
  selectedTrackSlotId: number | null;
  onTrackSlotChange: (slot: AvailableSlot) => void;
  pilotType: string;
  onPilotTypeChange: (value: string) => void;
  trackReservationType: 'FULL_DAY' | 'HALF_DAY';
  onTrackReservationTypeChange: (value: 'FULL_DAY' | 'HALF_DAY') => void;
  coachSlotsLoading: boolean;
  compatibleCoachSlots: CoachAvailableSlot[];
  selectedCoachSlotId: number | null;
  onCoachSlotSelect: (slot: CoachAvailableSlot) => void;
  participants: number;
  onCalculateQuote: () => void;
  quoteLoading: boolean;
}

export function QuoteCheckoutForm({
  track,
  selectedCoach,
  reservationDate,
  onReservationDateChange,
  availableSlots,
  slotsLoading,
  selectedTrackSlotStart,
  selectedTrackSlotId,
  onTrackSlotChange,
  pilotType,
  onPilotTypeChange,
  trackReservationType,
  onTrackReservationTypeChange,
  coachSlotsLoading,
  compatibleCoachSlots,
  selectedCoachSlotId,
  onCoachSlotSelect,
  participants,
  onCalculateQuote,
  quoteLoading,
}: QuoteCheckoutFormProps) {
  const step = !reservationDate ? 1 : selectedTrackSlotStart ? 2 : 1;
  const minReservationDate = toDateKey(addDays(new Date(), 1));
  const selectedTrackSlot = availableSlots.find((slot) =>
    selectedTrackSlotId != null
      ? slot.id === selectedTrackSlotId
      : slot.startTime === selectedTrackSlotStart
  );
  const selectedSlotRemaining = selectedTrackSlot ? getSlotRemaining(selectedTrackSlot) : 0;
  const selectedSlotCannotFit = Boolean(
    selectedTrackSlot && (isSlotFull(selectedTrackSlot) || selectedSlotRemaining < participants)
  );
  const allSlotsFull = availableSlots.length > 0 && availableSlots.every((slot) => isSlotFull(slot));

  return (
    <div className="quote-shell rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40 sm:p-5">
      <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-300">
            Session setup
          </p>
          <h2 className="text-xl font-black text-slate-950 dark:text-white">Booking details</h2>
        </div>
        <span className="w-fit rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-300">
          Step {quoteLoading ? 3 : step} of 3
        </span>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_minmax(0,1fr)]">
        <section className="quote-panel space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950">
          <SectionTitle icon="calendar" title="Date and rider" />

          <DateDropdownField
            value={reservationDate}
            minDateKey={minReservationDate}
            onChange={onReservationDateChange}
          />

          <FormField label="Rider category">
            <SelectField
              value={pilotType}
              onChange={onPilotTypeChange}
              options={[
                { value: 'JUNIOR', label: 'Junior' },
                { value: 'SENIOR', label: 'Senior' },
              ]}
              className={inputClass}
              ariaLabel="Rider category"
            />
          </FormField>

          <FormField label="Session length">
            <div className="grid grid-cols-2 gap-2">
              {(['FULL_DAY', 'HALF_DAY'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onTrackReservationTypeChange(value)}
                  className={`rounded-xl px-3 py-2 text-sm font-bold transition-colors ${
                    trackReservationType === value
                      ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                      : 'border border-slate-200 bg-white text-slate-600 hover:border-orange-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-orange-500/50'
                  }`}
                >
                  {value === 'FULL_DAY' ? 'Full day' : 'Half day'}
                </button>
              ))}
            </div>
          </FormField>

          <div className="quote-card rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-900">
            <p className="mb-2 text-xs font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Reference prices
            </p>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <PricePill label="Junior" value={track.prices.junior} />
              <PricePill label="Senior" value={track.prices.senior} />
            </div>
          </div>
        </section>

        <section className="quote-panel space-y-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle icon="clock" title="Track time" />
            {availableSlots.length > 0 && !slotsLoading && (
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                {availableSlots.length} option{availableSlots.length === 1 ? '' : 's'}
              </span>
            )}
          </div>

          {slotsLoading && (
            <div className="grid gap-2 md:grid-cols-2">
              {Array.from({ length: 4 }).map((_, index) => (
                <div key={index} className="h-24 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {availableSlots.length === 0 && reservationDate && !slotsLoading && (
            <Alert variant="warning">No availability for this date. Try another day.</Alert>
          )}

          {!reservationDate && !slotsLoading && (
            <Alert variant="info">Choose a date to see available track times.</Alert>
          )}

          {availableSlots.length > 0 && !slotsLoading && (
            <div className="grid gap-2 md:grid-cols-2 2xl:grid-cols-3 xl:max-h-[430px] xl:overflow-y-auto xl:pr-1">
              {availableSlots.map((slot) => {
                const hours = getSlotHours(slot);
                const reserved = getSlotReserved(slot);
                const remaining = getSlotRemaining(slot);
                const occupancy = getSlotOccupancy(slot);
                const full = isSlotFull(slot);
                const cannotFitParticipants = remaining < participants;
                const disabled = full || cannotFitParticipants;
                const selected =
                  selectedTrackSlotId != null
                    ? selectedTrackSlotId === slot.id
                    : selectedTrackSlotStart === slot.startTime;

                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={disabled}
                    aria-pressed={selected}
                    onClick={() => onTrackSlotChange(slot)}
                    className={`quote-option rounded-2xl border p-3 text-left transition-all ${
                      selected
                        ? 'quote-option-selected border-orange-500 bg-orange-50 shadow-lg shadow-orange-500/15 dark:bg-orange-500/15'
                        : 'border-slate-200 bg-white hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-500/50'
                    } ${disabled ? 'cursor-not-allowed opacity-60 hover:translate-y-0 hover:shadow-none' : ''}`}
                  >
                    <span className="flex items-start justify-between gap-3">
                      <span className="flex items-center gap-2 text-sm font-black text-slate-950 dark:text-white">
                        <FlowbiteIcon name="clock" className="h-4 w-4 text-orange-500" />
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <AvailabilityBadge full={full} cannotFit={cannotFitParticipants} remaining={remaining} />
                    </span>

                    <span className="mt-2 block text-xs font-semibold text-slate-500 dark:text-slate-400">
                      {hours.toFixed(1)}h - {reserved}/{slot.capacity} booked
                    </span>

                    <span className="mt-3 block h-2 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                      <span
                        className={`block h-full rounded-full ${
                          occupancy >= 100
                            ? 'bg-red-500'
                            : occupancy >= 75
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                        }`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {allSlotsFull && (
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-200">
              All time slots for this date are already full.
            </p>
          )}
          {selectedSlotCannotFit && (
            <p className="text-xs font-semibold text-red-600 dark:text-red-300">
              This time slot does not have enough remaining capacity.
            </p>
          )}
        </section>
      </div>

      {selectedCoach && (
        <section className="quote-panel mt-4 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 dark:border-slate-700 dark:bg-slate-950">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <SectionTitle icon="user" title={`Coach time: ${selectedCoach.name}`} />
            <span className="rounded-full bg-orange-500/10 px-3 py-1 text-xs font-bold text-orange-700 dark:text-orange-200">
              1:1 lesson
            </span>
          </div>

          {!selectedTrackSlotStart && (
            <Alert variant="info">Select a track time slot first to see coach availability.</Alert>
          )}

          {selectedTrackSlotStart && coachSlotsLoading && (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {Array.from({ length: 3 }).map((_, index) => (
                <div key={index} className="h-14 animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-800" />
              ))}
            </div>
          )}

          {selectedTrackSlotStart && !coachSlotsLoading && compatibleCoachSlots.length === 0 && (
            <Alert variant="warning">No coach slots overlap with your selected track time.</Alert>
          )}

          {selectedTrackSlotStart && !coachSlotsLoading && compatibleCoachSlots.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
              {compatibleCoachSlots.map((slot) => {
                const typeLabel =
                  slot.classType === 'HOURLY'
                    ? 'Hourly'
                    : slot.classType === 'HALF_DAY'
                      ? 'Half day'
                      : 'Full day';
                const selected = selectedCoachSlotId === slot.id;

                return (
                  <label
                    key={slot.id}
                    className={`quote-option flex cursor-pointer items-center gap-3 rounded-2xl border p-3 transition ${
                      selected
                        ? 'quote-option-selected border-orange-500 bg-orange-50 dark:bg-orange-500/15'
                        : 'border-slate-200 bg-white hover:border-orange-300 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-500/50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="coachSlot"
                      checked={selected}
                      onChange={() => onCoachSlotSelect(slot)}
                      className="accent-orange-500"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="block text-sm font-black text-slate-950 dark:text-white">
                        {slot.startTime} - {slot.endTime}
                      </span>
                      <span className="block text-xs font-semibold text-slate-500 dark:text-slate-400">
                        {typeLabel} - 1:1
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </section>
      )}

      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
          Calculate the quote after selecting a valid date and time.
        </p>
        <Button
          type="button"
          variant="primary"
          className="sm:min-w-52"
          onClick={onCalculateQuote}
          isLoading={quoteLoading}
          disabled={quoteLoading || selectedSlotCannotFit}
        >
          {quoteLoading ? 'Calculating...' : 'Calculate quote'}
        </Button>
      </div>
    </div>
  );
}

function DateDropdownField({
  value,
  minDateKey,
  onChange,
}: {
  value: string;
  minDateKey: string;
  onChange: (value: string) => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="quote-input flex w-full items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-left shadow-sm transition hover:border-orange-300 dark:border-slate-700 dark:bg-slate-950"
      >
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-300">
            <FlowbiteIcon name="calendar" className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-[10px] font-bold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
              Date
            </span>
            <span className="block text-sm font-black text-slate-950 dark:text-white">
              {formatDisplayDate(value)}
            </span>
          </span>
        </span>
        <FlowbiteIcon name={open ? 'chevron-left' : 'chevron-right'} className="h-4 w-4 text-slate-400" />
      </button>

      {open && (
        <div className="quote-calendar-popover absolute left-0 z-30 mt-2 w-[min(20rem,calc(100vw-3rem))] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/40">
          <AppCalendar
            value={value}
            onChange={(nextValue) => {
              onChange(nextValue);
              setOpen(false);
            }}
            minDateKey={minDateKey}
            accent="orange"
            density="compact"
            locale="en-US"
          />
        </div>
      )}
    </div>
  );
}

function SectionTitle({ icon, title }: { icon: 'calendar' | 'clock' | 'user'; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-orange-500/10 text-orange-600 dark:text-orange-300">
        <FlowbiteIcon name={icon} className="h-4 w-4" />
      </span>
      <h3 className="text-sm font-black text-slate-950 dark:text-white">{title}</h3>
    </div>
  );
}

function PricePill({ label, value }: { label: string; value: number }) {
  return (
    <div className="quote-card rounded-xl bg-slate-50 px-3 py-2 dark:bg-slate-900">
      <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="text-sm font-black text-orange-600 dark:text-orange-300">${value}</p>
    </div>
  );
}

function AvailabilityBadge({
  full,
  cannotFit,
  remaining,
}: {
  full: boolean;
  cannotFit: boolean;
  remaining: number;
}) {
  const className = full
    ? 'bg-red-500/10 text-red-600 dark:text-red-300'
    : cannotFit
      ? 'bg-amber-500/10 text-amber-700 dark:text-amber-200'
      : 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';

  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-black ${className}`}>
      {full ? 'Full' : cannotFit ? `Need more` : `${remaining} left`}
    </span>
  );
}

const inputClass =
  'quote-input w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-950 placeholder-slate-400 shadow-sm focus:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500/30 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder-slate-500';

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
        {required && <span className="ml-1 text-orange-500">*</span>}
      </label>
      {children}
      {hint && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function Alert({
  children,
  variant,
}: {
  children: ReactNode;
  variant: 'info' | 'warning';
}) {
  const styles =
    variant === 'info'
      ? 'border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-200'
      : 'border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-200';
  return <div className={`rounded-xl border p-3 text-sm ${styles}`}>{children}</div>;
}

function formatDisplayDate(value: string) {
  if (!value) return 'Select date';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getSlotReserved(slot: AvailableSlot) {
  return Math.max(slot.reserved ?? 0, 0);
}

function getSlotRemaining(slot: AvailableSlot) {
  return Math.max(slot.remaining ?? slot.capacity - getSlotReserved(slot), 0);
}

function getSlotOccupancy(slot: AvailableSlot) {
  const fallback = slot.capacity > 0 ? (getSlotReserved(slot) / slot.capacity) * 100 : 100;
  return Math.min(Math.max(Math.round(slot.occupancyPercent ?? fallback), 0), 100);
}

function isSlotFull(slot: AvailableSlot) {
  return slot.isFull ?? getSlotRemaining(slot) <= 0;
}

function getSlotHours(slot: AvailableSlot) {
  const start = new Date(`2000-01-01T${slot.startTime}`);
  const end = new Date(`2000-01-01T${slot.endTime}`);
  return (end.getTime() - start.getTime()) / 3600000;
}

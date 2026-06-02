import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import type { TrackRefResponse, ServiceItemResponse } from '@/services/coachSettingsService';
import type { AvailableSlot } from '@/services/trackService';
import { WEEKDAYS, TODAY, generateDates } from './coachAvailabilityUtils';

type Mode = 'single' | 'weekly';

export interface AvailabilityFormState {
  mode: Mode;
  trackId: string;
  startTime: string;
  endTime: string;
  selectedServiceId: string;
  date: string;
  fromDate: string;
  toDate: string;
  weekdays: number[];
}

interface CoachAvailabilityFormProps {
  coachTracks: TrackRefResponse[];
  coachServices: ServiceItemResponse[];
  trackSlots: AvailableSlot[];
  trackSlotsLoading: boolean;
  weeklyTrackSlots: Record<string, AvailableSlot[]>;
  weeklyTrackSlotsLoading: boolean;
  state: AvailabilityFormState;
  saving: boolean;
  error: string | null;
  success: string | null;
  onModeChange: (mode: Mode) => void;
  onFieldChange: <K extends keyof AvailabilityFormState>(
    key: K,
    value: AvailabilityFormState[K]
  ) => void;
  onToggleWeekday: (value: number) => void;
  onTrackSlotSelect: (slot: AvailableSlot) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export function CoachAvailabilityForm({
  coachTracks,
  coachServices,
  trackSlots,
  trackSlotsLoading,
  weeklyTrackSlots,
  weeklyTrackSlotsLoading,
  state,
  saving,
  error,
  success,
  onModeChange,
  onFieldChange,
  onToggleWeekday,
  onTrackSlotSelect,
  onSubmit,
}: CoachAvailabilityFormProps) {
  const previewDates =
    state.mode === 'weekly'
      ? generateDates(state.fromDate, state.toDate, state.weekdays)
      : [];

  if (coachTracks.length === 0) {
    return (
      <p className="text-amber-300/90 text-sm">
        No tracks enabled. Configure them in{' '}
        <Link to={ROUTES.COACH_SETTINGS} className="text-orange-400 underline">
          Settings
        </Link>{' '}
        first.
      </p>
    );
  }

  if (coachServices.length === 0) {
    return (
      <p className="text-amber-300/90 text-sm">
        No services defined. Add rates in{' '}
        <Link to={ROUTES.COACH_SETTINGS} className="text-orange-400 underline">
          Settings
        </Link>{' '}
        before adding availability.
      </p>
    );
  }

  const inputClass =
    'w-full bg-gray-900 border border-gray-600 text-white text-sm rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-orange-500/50';
  const selectedService = coachServices.find(
    (service) => String(service.id) === state.selectedServiceId
  );
  const matchingTrackSlot = trackSlots.find(
    (slot) =>
      state.startTime >= slot.startTime &&
      state.endTime <= slot.endTime &&
      (!selectedService || selectedService.classType !== 'FULL_DAY' || slot.rentalType === 'FULL_DAY')
  );
  const weeklyMatchingDates = previewDates.filter((date) =>
    (weeklyTrackSlots[date] ?? []).some(
      (slot) =>
        state.startTime >= slot.startTime &&
        state.endTime <= slot.endTime &&
        (!selectedService || selectedService.classType !== 'FULL_DAY' || slot.rentalType === 'FULL_DAY')
    )
  );

  return (
    <>
      <div className="mb-5 grid gap-3 sm:grid-cols-3">
        <StepPill number="1" title="Choose track" text="Pick where you teach." />
        <StepPill number="2" title="Check the track" text="Use a real open window." />
        <StepPill number="3" title="Publish your time" text="Riders only see matching slots." />
      </div>

      <div className="flex gap-1 mb-5 bg-gray-900/60 border border-gray-700 rounded-xl p-1">
        {(['single', 'weekly'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => onModeChange(m)}
            className={`flex-1 py-2.5 px-3 rounded-lg text-sm font-semibold transition-all ${
              state.mode === m
                ? 'bg-orange-500 text-white'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {m === 'single' ? 'Single date' : 'Repeating days'}
          </button>
        ))}
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Session
          </legend>

          <Field label="Track" required>
            <select
              value={state.trackId}
              onChange={(e) => onFieldChange('trackId', e.target.value)}
              required
              className={inputClass}
            >
              {coachTracks.map((t) => (
                <option key={t.trackId} value={String(t.trackId)}>
                  {t.trackName}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Service" required hint="Rates come from your settings">
            <select
              value={state.selectedServiceId}
              onChange={(e) => onFieldChange('selectedServiceId', e.target.value)}
              required
              className={inputClass}
            >
              <option value="">Select a service</option>
              {coachServices.map((service) => (
                <option key={service.id} value={String(service.id)}>
                  {formatServiceLabel(service)}
                </option>
              ))}
            </select>
            {selectedService && (
              <p className="mt-2 rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-2 text-xs leading-relaxed text-gray-400">
                {getServiceGuidance(selectedService)}
              </p>
            )}
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Schedule
          </legend>

          {state.mode === 'single' ? (
            <>
              <Field label="Date" required>
                <input
                  type="date"
                  required
                  value={state.date}
                  min={TODAY}
                  onChange={(e) => onFieldChange('date', e.target.value)}
                  className={inputClass}
                />
              </Field>
              <TrackWindowsGuide
                date={state.date}
                slots={trackSlots}
                loading={trackSlotsLoading}
                selectedService={selectedService}
                selectedSlotId={matchingTrackSlot?.id}
                onUseSlot={onTrackSlotSelect}
              />
            </>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3">
                <Field label="From" required>
                  <input
                    type="date"
                    required
                    value={state.fromDate}
                    min={TODAY}
                    onChange={(e) => onFieldChange('fromDate', e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <Field label="To" required>
                  <input
                    type="date"
                    required
                    value={state.toDate}
                    min={state.fromDate || TODAY}
                    onChange={(e) => onFieldChange('toDate', e.target.value)}
                    className={inputClass}
                  />
                </Field>
              </div>

              <div>
                <span className="block text-xs text-gray-400 mb-2">Weekdays</span>
                <div className="flex gap-2">
                  {WEEKDAYS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => onToggleWeekday(value)}
                      className={`flex-1 h-10 rounded-lg text-sm font-bold transition-all ${
                        state.weekdays.includes(value)
                          ? 'bg-orange-500 text-white'
                          : 'bg-gray-800 text-gray-400 border border-gray-600 hover:border-gray-500'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {(state.fromDate || state.toDate) && (
                <div
                  className={`rounded-lg px-4 py-3 text-sm ${
                    weeklyMatchingDates.length > 0
                      ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200'
                      : 'bg-gray-800/50 border border-gray-600 text-gray-400'
                  }`}
                >
                  {state.startTime && state.endTime && weeklyMatchingDates.length > 0
                    ? `${weeklyMatchingDates.length} of ${previewDates.length} date${previewDates.length !== 1 ? 's' : ''} match your selected hours`
                    : previewDates.length > 0
                      ? `${previewDates.length} date${previewDates.length !== 1 ? 's' : ''} selected. Choose a track window below.`
                    : state.weekdays.length === 0
                      ? 'Select at least one weekday'
                      : 'No valid dates in this range'}
                </div>
              )}

              {previewDates.length > 90 && (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
                  This range has more than 90 matching dates. Shorten it before saving.
                </div>
              )}

              <WeeklyTrackWindowsGuide
                dates={previewDates}
                slotsByDate={weeklyTrackSlots}
                loading={weeklyTrackSlotsLoading}
                selectedService={selectedService}
                startTime={state.startTime}
                endTime={state.endTime}
                onUseSlot={onTrackSlotSelect}
              />
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field
              label="Your start time"
              required
              hint="For hourly lessons, choose the exact lesson hours inside the track window."
            >
              <input
                type="time"
                required
                value={state.startTime}
                onChange={(e) => onFieldChange('startTime', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Your end time" required>
              <input
                type="time"
                required
                value={state.endTime}
                onChange={(e) => onFieldChange('endTime', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
          {state.mode === 'single' && state.startTime && state.endTime && state.date && (
            <div
              className={`rounded-lg border px-4 py-3 text-sm ${
                matchingTrackSlot
                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                  : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
              }`}
            >
              {matchingTrackSlot
                ? `This teaching time fits inside ${matchingTrackSlot.startTime} - ${matchingTrackSlot.endTime} at the track.`
                : 'This teaching time does not fit inside the track windows shown above.'}
            </div>
          )}
        </fieldset>

        {error && (
          <p className="text-red-300 text-sm bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {success && (
          <p className="text-emerald-300 text-sm bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3">
            {success}
          </p>
        )}

        <Button type="submit" variant="primary" fullWidth isLoading={saving} disabled={saving}>
          {saving
            ? 'Saving...'
            : state.mode === 'single'
              ? 'Save availability'
              : `Save ${previewDates.length > 0 ? previewDates.length + ' ' : ''}slots`}
        </Button>
      </form>
    </>
  );
}

function StepPill({
  number,
  title,
  text,
}: {
  number: string;
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
      <div className="flex items-center gap-2">
        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-orange-500 text-xs font-bold text-white">
          {number}
        </span>
        <span className="text-sm font-semibold text-white">{title}</span>
      </div>
      <p className="mt-1 text-xs leading-relaxed text-gray-500">{text}</p>
    </div>
  );
}

function TrackWindowsGuide({
  date,
  slots,
  loading,
  selectedService,
  selectedSlotId,
  onUseSlot,
}: {
  date: string;
  slots: AvailableSlot[];
  loading: boolean;
  selectedService?: ServiceItemResponse;
  selectedSlotId?: number;
  onUseSlot: (slot: AvailableSlot) => void;
}) {
  if (!date) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-400">
        Choose a date to see the availability already published by this track.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
        <div className="h-4 w-40 rounded bg-gray-700/70" />
        <div className="mt-3 h-10 rounded bg-gray-700/40" />
      </div>
    );
  }

  if (slots.length === 0) {
    return (
      <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
        This track has not published availability for this date yet. Ask the track owner
        to add a time window before publishing coach lessons here.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Track windows for this date</p>
          <p className="text-xs text-gray-500">Your coach time must fit inside one of these.</p>
        </div>
      </div>

      <div className="space-y-2">
        {slots.map((slot) => {
          const isFullDayCoach = selectedService?.classType === 'FULL_DAY';
          const compatible = !isFullDayCoach || slot.rentalType === 'FULL_DAY';
          const selected = selectedSlotId === slot.id;
          return (
            <button
              key={slot.id}
              type="button"
              disabled={!compatible}
              onClick={() => onUseSlot(slot)}
              className={`w-full rounded-lg border px-3 py-3 text-left transition-colors ${
                selected
                  ? 'border-emerald-500/60 bg-emerald-500/10'
                  : compatible
                    ? 'border-gray-700 bg-gray-800/50 hover:border-orange-500/50'
                    : 'border-gray-700 bg-gray-800/20 opacity-60'
              }`}
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="text-sm font-semibold text-white">
                    {slot.startTime} - {slot.endTime}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    {formatTrackSlotType(slot.rentalType)} - capacity {slot.capacity}
                  </span>
                </div>
                <span className={`text-xs font-semibold ${compatible ? 'text-orange-300' : 'text-gray-500'}`}>
                  {compatible ? 'Use this window' : 'Needs full-day track window'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeeklyTrackWindowsGuide({
  dates,
  slotsByDate,
  loading,
  selectedService,
  startTime,
  endTime,
  onUseSlot,
}: {
  dates: string[];
  slotsByDate: Record<string, AvailableSlot[]>;
  loading: boolean;
  selectedService?: ServiceItemResponse;
  startTime: string;
  endTime: string;
  onUseSlot: (slot: AvailableSlot) => void;
}) {
  if (dates.length === 0) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900/50 px-4 py-3 text-sm text-gray-400">
        Choose a date range and weekdays to preview track windows.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
        <div className="h-4 w-56 rounded bg-gray-700/70" />
        <div className="mt-3 space-y-2">
          {[1, 2, 3].map((item) => (
            <div key={item} className="h-12 rounded bg-gray-700/40" />
          ))}
        </div>
      </div>
    );
  }

  const datesWithCompatibleWindows = dates.filter((date) =>
    (slotsByDate[date] ?? []).some((slot) => isServiceCompatibleWithTrackSlot(slot, selectedService))
  );
  const matchingDates =
    startTime && endTime
      ? dates.filter((date) =>
          (slotsByDate[date] ?? []).some(
            (slot) =>
              startTime >= slot.startTime &&
              endTime <= slot.endTime &&
              isServiceCompatibleWithTrackSlot(slot, selectedService)
          )
        )
      : [];

  return (
    <div className="rounded-lg border border-gray-700 bg-gray-900/50 p-3">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-white">Track windows for selected days</p>
          <p className="text-xs text-gray-500">
            Pick a window from any day, then check how many dates match those hours.
          </p>
        </div>
        <span
          className={`rounded-md border px-2 py-1 text-xs font-semibold ${
            startTime && endTime && matchingDates.length > 0
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
              : 'border-amber-500/30 bg-amber-500/10 text-amber-200'
          }`}
        >
          {startTime && endTime
            ? `${matchingDates.length}/${dates.length} will be saved`
            : `${datesWithCompatibleWindows.length}/${dates.length} have windows`}
        </span>
      </div>

      <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
        {dates.map((date) => {
          const slots = slotsByDate[date] ?? [];
          const compatibleSlots = slots.filter((slot) =>
            isServiceCompatibleWithTrackSlot(slot, selectedService)
          );
          const selectedHoursFit = compatibleSlots.some(
            (slot) => startTime >= slot.startTime && endTime <= slot.endTime
          );

          return (
            <div
              key={date}
              className={`rounded-lg border px-3 py-3 ${
                selectedHoursFit
                  ? 'border-emerald-500/30 bg-emerald-500/10'
                  : compatibleSlots.length > 0
                    ? 'border-gray-700 bg-gray-800/40'
                    : 'border-amber-500/25 bg-amber-500/10'
              }`}
            >
              <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                <span className="text-sm font-semibold text-white">{formatDateLabel(date)}</span>
                <span
                  className={`text-xs ${
                    selectedHoursFit
                      ? 'text-emerald-200'
                      : compatibleSlots.length > 0
                        ? 'text-gray-400'
                        : 'text-amber-200'
                  }`}
                >
                  {selectedHoursFit
                    ? 'Matches selected hours'
                    : compatibleSlots.length > 0
                      ? `${compatibleSlots.length} usable window${compatibleSlots.length !== 1 ? 's' : ''}`
                      : 'No usable track window'}
                </span>
              </div>

              {compatibleSlots.length === 0 ? (
                <p className="text-xs text-amber-200">
                  This day will be skipped unless the track owner opens availability.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {compatibleSlots.map((slot) => {
                    const selected =
                      startTime >= slot.startTime &&
                      endTime <= slot.endTime &&
                      Boolean(startTime && endTime);
                    return (
                      <button
                        key={slot.id}
                        type="button"
                        onClick={() => onUseSlot(slot)}
                        className={`rounded-md border px-2.5 py-1.5 text-xs font-semibold transition-colors ${
                          selected
                            ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200'
                            : 'border-gray-600 bg-gray-900/60 text-gray-300 hover:border-orange-500/50'
                        }`}
                      >
                        {slot.startTime} - {slot.endTime}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Field({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm text-gray-300 mb-1.5">
        {label}
        {required && <span className="text-orange-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function formatServiceLabel(service: ServiceItemResponse) {
  const type =
    service.classType === 'HOURLY'
      ? 'Hourly'
      : service.classType === 'HALF_DAY'
        ? 'Half day'
        : 'Full day';
  const mode =
    service.mode === 'ONE_TO_ONE'
      ? '1:1'
      : `Group (max ${service.maxStudents})`;
  return `${type} - ${mode} - $${service.price}`;
}

function getServiceGuidance(service: ServiceItemResponse) {
  if (service.classType === 'HOURLY') {
    return 'Hourly: choose only the exact hours you want to teach, as long as they are inside a track window.';
  }
  if (service.classType === 'HALF_DAY') {
    return 'Half day: use a half-day window, or a shorter block inside a full-day track window.';
  }
  return 'Full day: use a full-day track window so the rider can book the track and your lesson together.';
}

function formatTrackSlotType(rentalType: string) {
  return rentalType === 'FULL_DAY' ? 'Full day track' : 'Half day track';
}

function isServiceCompatibleWithTrackSlot(
  slot: AvailableSlot,
  selectedService?: ServiceItemResponse
) {
  return !selectedService || selectedService.classType !== 'FULL_DAY' || slot.rentalType === 'FULL_DAY';
}

function formatDateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import type { TrackRefResponse, ServiceItemResponse } from '@/services/coachSettingsService';
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
  onSubmit: (e: React.FormEvent) => void;
}

export function CoachAvailabilityForm({
  coachTracks,
  coachServices,
  state,
  saving,
  error,
  success,
  onModeChange,
  onFieldChange,
  onToggleWeekday,
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

  return (
    <>
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
          </Field>
        </fieldset>

        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Schedule
          </legend>

          {state.mode === 'single' ? (
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
                    previewDates.length > 0
                      ? 'bg-orange-500/10 border border-orange-500/30 text-orange-200'
                      : 'bg-gray-800/50 border border-gray-600 text-gray-400'
                  }`}
                >
                  {previewDates.length > 0
                    ? `${previewDates.length} date${previewDates.length !== 1 ? 's' : ''} will be created`
                    : state.weekdays.length === 0
                      ? 'Select at least one weekday'
                      : 'No valid dates in this range'}
                </div>
              )}
            </>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Start time" required>
              <input
                type="time"
                required
                value={state.startTime}
                onChange={(e) => onFieldChange('startTime', e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="End time" required>
              <input
                type="time"
                required
                value={state.endTime}
                onChange={(e) => onFieldChange('endTime', e.target.value)}
                className={inputClass}
              />
            </Field>
          </div>
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
  return `${type} · ${mode} · $${service.price}`;
}

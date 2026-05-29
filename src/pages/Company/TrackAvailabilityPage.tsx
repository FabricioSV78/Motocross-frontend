import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  createTrackAvailability,
  createTrackAvailabilityBatch,
  getTrackAvailability,
} from '@/services/trackService';
import type { RentalType, PilotCategory, TrackAvailabilityItem } from '@/services/trackService';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/pilot';
import { ROUTES } from '@/router/routes';
import { TrackAvailabilityCalendar } from './TrackAvailabilityCalendar';
import { WEEKDAYS, TODAY, generateDates } from './trackAvailabilityUtils';

const RENTAL_TYPE_LABELS: Record<RentalType, string> = {
  HALF_DAY: 'Half day (4h)',
  FULL_DAY: 'Full day (8h+)',
};

const PILOT_CATEGORY_LABELS: Record<PilotCategory, string> = {
  JUNIOR: 'Junior',
  SENIOR: 'Senior',
  BOTH: 'Both',
};

type Mode = 'single' | 'weekly';

export function TrackAvailabilityPage() {
  const { id } = useParams<{ id: string }>();
  const [mode, setMode] = useState<Mode>('single');

  // Existing slots
  const [slots, setSlots] = useState<TrackAvailabilityItem[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  function reloadSlots() {
    setLoadingSlots(true);
    getTrackAvailability(Number(id))
      .then(setSlots)
      .finally(() => setLoadingSlots(false));
  }

  useEffect(() => { reloadSlots(); }, [id]); // eslint-disable-line react-hooks/exhaustive-deps

  // Common fields
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [rentalType, setRentalType] = useState<RentalType>('HALF_DAY');
  const [pilotCategory, setPilotCategory] = useState<PilotCategory>('BOTH');

  // Single mode
  const [date, setDate] = useState('');

  // Weekly mode
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [weekdays, setWeekdays] = useState<number[]>([1, 2, 3, 4, 5]); // Mon–Fri by default

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const previewDates = mode === 'weekly' ? generateDates(fromDate, toDate, weekdays) : [];

  function toggleWeekday(v: number) {
    setWeekdays((prev) => (prev.includes(v) ? prev.filter((d) => d !== v) : [...prev, v]));
  }

  function resetCommon() {
    setStartTime('');
    setEndTime('');
    setCapacity('');
    setRentalType('HALF_DAY');
    setPilotCategory('BOTH');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (startTime >= endTime) {
      setError('Start time must be earlier than end time.');
      return;
    }
    const cap = parseInt(capacity);
    if (isNaN(cap) || cap <= 0) {
      setError('Capacity must be greater than 0.');
      return;
    }

    setSaving(true);
    try {
      if (mode === 'single') {
        const res = await createTrackAvailability(Number(id), {
          date, startTime, endTime, capacity: cap, rentalType, pilotCategory,
        });
        setSuccess(res.message);
        setDate('');
        resetCommon();
      } else {
        if (previewDates.length === 0) {
          setError('No dates selected. Adjust the range or weekdays.');
          setSaving(false);
          return;
        }
        const res = await createTrackAvailabilityBatch(Number(id), {
          dates: previewDates,
          startTime,
          endTime,
          capacity: cap,
          rentalType,
          pilotCategory,
        });
        setSuccess(res.message);
        setFromDate('');
        setToDate('');
        setWeekdays([1, 2, 3, 4, 5]);
        resetCommon();
      }
      reloadSlots();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to create availability';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title="Track availability"
        subtitle="Define time slots and capacity so riders can book."
        action={
          <Link to={ROUTES.COMPANY_TRACKS}>
            <Button variant="outline" size="sm">
              ← Tracks
            </Button>
          </Link>
        }
      />

      {/* Mode Toggle */}
      <div className="flex gap-1 mb-6 bg-gray-800/50 border border-gray-700 rounded-xl p-1">
        {(['single', 'weekly'] as Mode[]).map((m) => (
          <button
            key={m}
            type="button"
            onClick={() => { setMode(m); setError(null); setSuccess(null); }}
            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-semibold transition-all ${
              mode === m
                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                : 'text-gray-400 hover:text-white'
            }`}
          >
            {m === 'single' ? 'Single date' : 'Repeating days'}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <section className="bg-gray-800/50 border border-gray-700 rounded-2xl p-6 space-y-5">

          {mode === 'single' ? (
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                Date
              </label>
              <input
                type="date"
                required
                value={date}
                min={TODAY}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
          ) : (
            <>
              {/* Date range */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                    From
                  </label>
                  <input
                    type="date"
                    required
                    value={fromDate}
                    min={TODAY}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                    To
                  </label>
                  <input
                    type="date"
                    required
                    value={toDate}
                    min={fromDate || TODAY}
                    onChange={(e) => setToDate(e.target.value)}
                    className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
                  />
                </div>
              </div>

              {/* Weekday pills */}
              <div>
                <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
                  Weekdays
                </label>
                <div className="flex gap-2">
                  {WEEKDAYS.map(({ label, value }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => toggleWeekday(value)}
                      className={`flex-1 h-11 rounded-xl text-sm font-bold transition-all ${
                        weekdays.includes(value)
                          ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/25'
                          : 'bg-gray-700 text-gray-400 hover:bg-gray-600 hover:text-white border border-gray-600'
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview badge */}
              {(fromDate || toDate) && (
                <div className={`rounded-xl px-4 py-3 text-sm font-medium ${
                  previewDates.length > 0
                    ? 'bg-orange-500/10 border border-orange-500/30 text-orange-300'
                    : 'bg-gray-700/50 border border-gray-600 text-gray-400'
                }`}>
                  {previewDates.length > 0
                    ? `✓ ${previewDates.length} date${previewDates.length !== 1 ? 's' : ''} will be created`
                    : weekdays.length === 0
                      ? '⚠ Select at least one weekday'
                      : '⚠ No valid dates in the selected range'}
                </div>
              )}
            </>
          )}

          {/* Time range */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                Start time
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
                End time
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
              />
            </div>
          </div>

          {/* Capacity */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-1 uppercase tracking-wide">
              Maximum capacity (riders)
            </label>
            <input
              type="number"
              min="1"
              required
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="e.g., 20"
              className="w-full bg-gray-700 border border-gray-600 text-white text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Rental Type */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              Rental type
            </label>
            <div className="grid grid-cols-2 gap-3">
              {(['HALF_DAY', 'FULL_DAY'] as RentalType[]).map((rt) => (
                <label
                  key={rt}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    rentalType === rt
                      ? 'border-orange-500/60 bg-orange-500/10 text-white'
                      : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="rentalType"
                    value={rt}
                    checked={rentalType === rt}
                    onChange={() => setRentalType(rt)}
                    className="accent-orange-500"
                  />
                  <span className="text-sm font-medium">{RENTAL_TYPE_LABELS[rt]}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Pilot Category */}
          <div>
            <label className="block text-xs font-semibold text-gray-400 mb-2 uppercase tracking-wide">
              Rider category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['JUNIOR', 'SENIOR', 'BOTH'] as PilotCategory[]).map((cat) => (
                <label
                  key={cat}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border cursor-pointer transition-all ${
                    pilotCategory === cat
                      ? 'border-orange-500/60 bg-orange-500/10 text-white'
                      : 'border-gray-600 bg-gray-700/30 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="pilotCategory"
                    value={cat}
                    checked={pilotCategory === cat}
                    onChange={() => setPilotCategory(cat)}
                    className="sr-only"
                  />
                  <span className="text-sm font-medium">{PILOT_CATEGORY_LABELS[cat]}</span>
                </label>
              ))}
            </div>
          </div>
        </section>

        {/* Feedback */}
        {error && (
          <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3">
            {error}
          </p>
        )}
        {success && (
          <p className="text-green-400 text-sm bg-green-500/10 border border-green-500/20 rounded-xl px-4 py-3">
            ✓ {success}
          </p>
        )}

        <Button type="submit" disabled={saving} className="w-full">
          {saving
            ? 'Saving...'
            : mode === 'single'
              ? 'Create availability'
              : `Create ${previewDates.length > 0 ? previewDates.length + ' ' : ''}availability${previewDates.length !== 1 ? 'slots' : 'slot'}`}
        </Button>
      </form>

      {/* ── Registered slots – calendar view ─────────────────────────── */}
      <section className="mt-8 bg-gray-800/50 border border-gray-700 rounded-2xl p-6">
        <h2 className="text-white font-bold text-lg mb-5">Recorded availability</h2>
        {slots.length === 0 && !loadingSlots ? (
          <p className="text-gray-500 text-sm">No availability recorded for this track.</p>
        ) : (
          <TrackAvailabilityCalendar slots={slots} loading={loadingSlots} />
        )}
      </section>
    </div>
  );
}

import { useState, useEffect } from 'react';
import {
  createAvailability,
  createAvailabilityBatch,
  getAvailability,
  getCoachSettings,
  type AvailabilityItem,
  type TrackRefResponse,
  type ServiceItemResponse,
  type ClassType,
  type ClassMode,
} from '@/services/coachSettingsService';
import {
  getAvailableSlotsForDate,
  type AvailableSlot,
} from '@/services/trackService';
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/pilot';
import { CoachAvailabilityCalendar } from './CoachAvailabilityCalendar';
import {
  CoachAvailabilityForm,
  type AvailabilityFormState,
} from './CoachAvailabilityForm';
import { generateDates } from './coachAvailabilityUtils';

type TrackSlotsByDate = Record<string, AvailableSlot[]>;

export function CoachAvailabilityPage() {
  const [coachTracks, setCoachTracks] = useState<TrackRefResponse[]>([]);
  const [coachServices, setCoachServices] = useState<ServiceItemResponse[]>([]);
  const [slots, setSlots] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trackSlots, setTrackSlots] = useState<AvailableSlot[]>([]);
  const [trackSlotsLoading, setTrackSlotsLoading] = useState(false);
  const [weeklyTrackSlots, setWeeklyTrackSlots] = useState<TrackSlotsByDate>({});
  const [weeklyTrackSlotsLoading, setWeeklyTrackSlotsLoading] = useState(false);

  const [form, setForm] = useState<AvailabilityFormState>({
    mode: 'single',
    trackId: '',
    startTime: '',
    endTime: '',
    selectedServiceId: '',
    date: '',
    fromDate: '',
    toDate: '',
    weekdays: [1, 2, 3, 4, 5],
  });

  const setField = <K extends keyof AvailabilityFormState>(
    key: K,
    value: AvailabilityFormState[K]
  ) => setForm((prev) => ({ ...prev, [key]: value }));

  const loadData = () =>
    Promise.all([getCoachSettings(), getAvailability()])
      .then(([settings, avail]) => {
        setCoachTracks(settings.tracks);
        setCoachServices(settings.services);
        setSlots(avail);
        setForm((prev) => ({
          ...prev,
          trackId: prev.trackId || (settings.tracks[0] ? String(settings.tracks[0].trackId) : ''),
          selectedServiceId:
            prev.selectedServiceId ||
            (settings.services[0] ? String(settings.services[0].id) : ''),
        }));
      })
      .catch(() => setError('Availability could not be loaded'))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (form.mode !== 'single' || !form.trackId || !form.date) {
      setTrackSlots([]);
      setTrackSlotsLoading(false);
      return;
    }

    let active = true;
    setTrackSlotsLoading(true);
    getAvailableSlotsForDate(parseInt(form.trackId, 10), form.date)
      .then((slotsForDate) => {
        if (active) setTrackSlots(slotsForDate);
      })
      .catch(() => {
        if (active) setTrackSlots([]);
      })
      .finally(() => {
        if (active) setTrackSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.mode, form.trackId, form.date]);

  useEffect(() => {
    const dates = generateDates(form.fromDate, form.toDate, form.weekdays);
    if (form.mode !== 'weekly' || !form.trackId || dates.length === 0) {
      setWeeklyTrackSlots({});
      setWeeklyTrackSlotsLoading(false);
      return;
    }

    let active = true;
    setWeeklyTrackSlotsLoading(true);
    Promise.all(
      dates.slice(0, 90).map((date) =>
        getAvailableSlotsForDate(parseInt(form.trackId, 10), date)
          .then((slotsForDate) => [date, slotsForDate] as const)
          .catch(() => [date, []] as const)
      )
    )
      .then((entries) => {
        if (!active) return;
        setWeeklyTrackSlots(Object.fromEntries(entries));
      })
      .finally(() => {
        if (active) setWeeklyTrackSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.mode, form.trackId, form.fromDate, form.toDate, form.weekdays]);

  function toggleWeekday(v: number) {
    setForm((prev) => ({
      ...prev,
      weekdays: prev.weekdays.includes(v)
        ? prev.weekdays.filter((d) => d !== v)
        : [...prev.weekdays, v],
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    const { trackId, startTime, endTime, selectedServiceId, mode, date, fromDate, toDate, weekdays } =
      form;

    if (!trackId || !startTime || !endTime || !selectedServiceId) {
      setError('Please complete all required fields.');
      return;
    }
    if (startTime >= endTime) {
      setError('Start time must be before end time.');
      return;
    }

    const selectedService = coachServices.find((s) => String(s.id) === selectedServiceId);
    if (!selectedService) {
      setError('Invalid service selected.');
      return;
    }

    if (mode === 'single') {
      if (trackSlotsLoading) {
        setError('Wait a moment while the track availability loads.');
        return;
      }
      if (trackSlots.length === 0) {
        setError('This track has no published availability on the selected date.');
        return;
      }
      const fitsTrackWindow = trackSlots.some(
        (slot) =>
          startTime >= slot.startTime &&
          endTime <= slot.endTime &&
          (selectedService.classType !== 'FULL_DAY' || slot.rentalType === 'FULL_DAY')
      );
      if (!fitsTrackWindow) {
        setError('Your teaching time must fit inside one of the track availability windows shown for this date.');
        return;
      }
    }

    setSaving(true);
    try {
      if (mode === 'single') {
        if (!date) {
          setError('Select a date.');
          setSaving(false);
          return;
        }
        const res = await createAvailability({
          trackId: parseInt(trackId, 10),
          date,
          startTime,
          endTime,
          classType: selectedService.classType as ClassType,
          mode: selectedService.mode as ClassMode,
        });
        setSuccess(res.message);
        setForm((prev) => ({ ...prev, date: '', startTime: '', endTime: '' }));
      } else {
        const dates = generateDates(fromDate, toDate, weekdays);
        if (dates.length === 0) {
          setError('No dates match your range and weekdays.');
          setSaving(false);
          return;
        }
        if (dates.length > 90) {
          setError('Choose 90 dates or fewer. Shorten the range or select fewer weekdays.');
          setSaving(false);
          return;
        }
        if (weeklyTrackSlotsLoading) {
          setError('Wait a moment while the track availability preview loads.');
          setSaving(false);
          return;
        }
        const matchingDates = dates.filter((d) =>
          (weeklyTrackSlots[d] ?? []).some(
            (slot) =>
              startTime >= slot.startTime &&
              endTime <= slot.endTime &&
              serviceFitsTrackSlot(selectedService, slot)
          )
        );
        if (matchingDates.length === 0) {
          setError('These hours do not fit inside any track window in the selected date range.');
          setSaving(false);
          return;
        }
        const res = await createAvailabilityBatch({
          trackId: parseInt(trackId, 10),
          dates: matchingDates,
          startTime,
          endTime,
          classType: selectedService.classType as ClassType,
          mode: selectedService.mode as ClassMode,
        });
        setSuccess(res.message);
        setForm((prev) => ({
          ...prev,
          fromDate: '',
          toDate: '',
          weekdays: [1, 2, 3, 4, 5],
          startTime: '',
          endTime: '',
        }));
      }
      setLoading(true);
      await loadData();
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to save availability';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 text-sm">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Availability"
        subtitle="Create coach lessons only inside the time windows already opened by each track."
      />

      <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6 mb-6">
        <div className="mb-5">
          <h2 className="text-white font-semibold">Add availability</h2>
          <p className="mt-1 text-sm text-gray-500">
            First choose a track and date. Then use one of the track's published windows
            or choose hours inside it.
          </p>
        </div>
        <CoachAvailabilityForm
          coachTracks={coachTracks}
          coachServices={coachServices}
          trackSlots={trackSlots}
          trackSlotsLoading={trackSlotsLoading}
          weeklyTrackSlots={weeklyTrackSlots}
          weeklyTrackSlotsLoading={weeklyTrackSlotsLoading}
          state={form}
          saving={saving}
          error={error}
          success={success}
          onModeChange={(mode) => {
            setForm((prev) => ({ ...prev, mode }));
            setError(null);
            setSuccess(null);
          }}
          onFieldChange={setField}
          onToggleWeekday={toggleWeekday}
          onTrackSlotSelect={(slot) => {
            setForm((prev) => ({
              ...prev,
              startTime: slot.startTime,
              endTime: slot.endTime,
            }));
            setError(null);
            setSuccess(null);
          }}
          onSubmit={handleSubmit}
        />
      </section>

      <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6">
        <h2 className="text-white font-semibold mb-1">Your schedule</h2>
        <p className="text-gray-500 text-sm mb-4">Recorded slots by month and track</p>
        {slots.length === 0 ? (
          <p className="text-gray-500 text-sm">No availability yet. Add your first slot above.</p>
        ) : (
          <CoachAvailabilityCalendar slots={slots} tracks={coachTracks} />
        )}
      </section>
    </div>
  );
}

function serviceFitsTrackSlot(service: ServiceItemResponse, slot: AvailableSlot) {
  return service.classType !== 'FULL_DAY' || slot.rentalType === 'FULL_DAY';
}

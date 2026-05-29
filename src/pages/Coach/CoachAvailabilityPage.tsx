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
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/pilot';
import { CoachAvailabilityCalendar } from './CoachAvailabilityCalendar';
import {
  CoachAvailabilityForm,
  type AvailabilityFormState,
} from './CoachAvailabilityForm';
import { generateDates } from './coachAvailabilityUtils';

export function CoachAvailabilityPage() {
  const [coachTracks, setCoachTracks] = useState<TrackRefResponse[]>([]);
  const [coachServices, setCoachServices] = useState<ServiceItemResponse[]>([]);
  const [slots, setSlots] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
        const res = await createAvailabilityBatch({
          trackId: parseInt(trackId, 10),
          dates,
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
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Availability"
        subtitle="Add time slots so riders can book lessons with you."
      />

      <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6 mb-6">
        <h2 className="text-white font-semibold mb-4">Add time slot</h2>
        <CoachAvailabilityForm
          coachTracks={coachTracks}
          coachServices={coachServices}
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

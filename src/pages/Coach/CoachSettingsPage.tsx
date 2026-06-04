import { useState, useEffect } from 'react';
import {
  updateCoachSettings,
  getCoachSettings,
  getAllTracks,
  type ServiceItem,
  type ClassType,
  type ClassMode,
  type AllTracksItem,
  type CoachSettingsGetResponse,
} from '@/services/coachSettingsService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/pilot';
import {
  CoachSettingsServicesSection,
  type ServiceRow,
} from './CoachSettingsServicesSection';
import { CoachSettingsTracksSection } from './CoachSettingsTracksSection';

const DEFAULT_SERVICE: ServiceRow = {
  classType: 'HOURLY',
  mode: 'ONE_TO_ONE',
  price: '',
  maxStudents: '1',
};

export function CoachSettingsPage() {
  const [allTracks, setAllTracks] = useState<AllTracksItem[]>([]);
  const [trackSearch, setTrackSearch] = useState('');
  const [selectedTrackIds, setSelectedTrackIds] = useState<number[]>([]);
  const [services, setServices] = useState<ServiceRow[]>([{ ...DEFAULT_SERVICE }]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([getAllTracks(), getCoachSettings()])
      .then(([tracks, settings]: [AllTracksItem[], CoachSettingsGetResponse]) => {
        setAllTracks(tracks);
        setSelectedTrackIds(settings.tracks.map((t) => t.trackId));
        const oneToOneServices = settings.services.filter((s) => s.mode === 'ONE_TO_ONE');
        if (oneToOneServices.length > 0) {
          setServices(
            oneToOneServices.map((s) => ({
              classType: s.classType as ClassType,
              mode: 'ONE_TO_ONE' as ClassMode,
              price: String(s.price),
              maxStudents: '1',
            }))
          );
        }
      })
      .catch(() => setError('Settings could not be loaded'))
      .finally(() => setLoading(false));
  }, []);

  function toggleTrack(id: number) {
    setSelectedTrackIds((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function updateService(index: number, field: keyof ServiceRow, value: string) {
    setServices((prev) =>
      prev.map((s, i) => {
        if (i !== index) return s;
        const updated = { ...s, [field]: value };
        if (field === 'mode') {
          updated.maxStudents = value === 'ONE_TO_ONE' ? '1' : updated.maxStudents || '2';
        }
        return updated;
      })
    );
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (selectedTrackIds.length === 0) {
      setError('Select at least one track where you coach.');
      return;
    }

    for (let i = 0; i < services.length; i++) {
      const s = services[i];
      const price = parseFloat(s.price);
      if (!s.price || isNaN(price) || price <= 0) {
        setError(`Service ${i + 1}: enter a price greater than 0.`);
        return;
      }
    }

    const combos = services.map((s) => `${s.classType}/ONE_TO_ONE`);
    if (combos.length !== new Set(combos).size) {
      setError('Duplicate services: each class type can only be configured once for 1:1 lessons.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateCoachSettings({
        tracks: selectedTrackIds.map((id) => ({ trackId: id })),
        services: services.map((s) => ({
          classType: s.classType,
          mode: 'ONE_TO_ONE',
          price: parseFloat(s.price),
          maxStudents: undefined,
        } satisfies ServiceItem)),
      });
      setSuccess(res.message);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to save settings';
      setError(msg);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 text-sm">Loading settings...</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Coach settings"
        subtitle="Choose your tracks and define the services riders can book."
      />

      <form onSubmit={handleSubmit} className="space-y-6">
        <CoachSettingsTracksSection
          allTracks={allTracks}
          trackSearch={trackSearch}
          onTrackSearchChange={setTrackSearch}
          selectedTrackIds={selectedTrackIds}
          onToggleTrack={toggleTrack}
        />

        <CoachSettingsServicesSection
          services={services}
          onUpdate={updateService}
          onAdd={() => setServices((prev) => [...prev, { ...DEFAULT_SERVICE }])}
          onRemove={(index) => setServices((prev) => prev.filter((_, i) => i !== index))}
        />

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
          {saving ? 'Saving...' : 'Save settings'}
        </Button>
      </form>
    </div>
  );
}

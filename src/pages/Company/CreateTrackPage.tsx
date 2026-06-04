import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { createTrack, uploadTrackPhoto } from '@/services/trackService';
import type { TrackCreatePayload, DifficultyLevel } from '@/services/trackService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { SelectField } from '@/components/ui';
import { PageHeader } from '@/components/pilot';
import { TrackLocationPicker, TrackPhotosUpload } from '@/components/company';
import { ROUTES } from '@/router/routes';

const DIFFICULTY_OPTIONS: { value: DifficultyLevel; label: string }[] = [
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
];

export function CreateTrackPage() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [priceJunior, setPriceJunior] = useState('');
  const [priceSenior, setPriceSenior] = useState('');
  const [priceJuniorHalf, setPriceJuniorHalf] = useState('');
  const [priceSeniorHalf, setPriceSeniorHalf] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('INTERMEDIATE');
  const [capacity, setCapacity] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async (payload: TrackCreatePayload) => createTrack(payload),
    onSuccess: () => navigate(ROUTES.COMPANY_TRACKS, { state: { created: true } }),
    onError: (err: unknown) => {
      const detail = (err as { response?: { data?: { detail?: string }; status?: number } })
        ?.response?.data?.detail;
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 403) setApiError(detail ?? 'Your company is not approved to create tracks yet');
      else if (status === 400) setApiError(detail ?? 'Invalid data. Check the form fields');
      else setApiError(err instanceof Error ? err.message : 'Server error. Please try again');
    },
  });

  function validate(): boolean {
    const errors: Record<string, string> = {};
    if (!name.trim()) errors.name = 'Name is required';
    const lat = Number(latitude);
    const lng = Number(longitude);
    if (!latitude.trim() || isNaN(lat)) errors.latitude = 'Select a location on the map';
    else if (lat < -90 || lat > 90) errors.latitude = 'Invalid latitude';
    if (!longitude.trim() || isNaN(lng)) errors.longitude = 'Select a location on the map';
    else if (lng < -180 || lng > 180) errors.longitude = 'Invalid longitude';
    if (!priceJunior.trim() || Number(priceJunior) <= 0) errors.price_junior = 'Required';
    if (!priceSenior.trim() || Number(priceSenior) <= 0) errors.price_senior = 'Required';
    if (!capacity.trim() || !Number.isInteger(Number(capacity)) || Number(capacity) <= 0) {
      errors.capacity = 'Enter a valid capacity';
    }
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    setApiError(null);

    try {
      const uploaded = await Promise.all(pendingPhotos.map((f) => uploadTrackPhoto(f)));
      const payload: TrackCreatePayload = {
        name: name.trim(),
        description: description.trim() || undefined,
        latitude: Number(latitude),
        longitude: Number(longitude),
        price_junior: Number(priceJunior),
        price_senior: Number(priceSenior),
        price_junior_half: priceJuniorHalf.trim() ? Number(priceJuniorHalf) : undefined,
        price_senior_half: priceSeniorHalf.trim() ? Number(priceSeniorHalf) : undefined,
        difficulty_level: difficulty,
        capacity: Number(capacity),
        photos: [...photoUrls, ...uploaded],
      };
      mutation.mutate(payload);
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Failed to upload photos');
    }
  }

  const textareaClass =
    'w-full px-4 py-2.5 border border-gray-600 rounded-lg bg-gray-900/50 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 resize-none text-sm';

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Create track"
        subtitle="Register a new track so riders can find and book it."
        action={
          <Link to={ROUTES.COMPANY_TRACKS}>
            <Button variant="outline" size="sm">
              ← My tracks
            </Button>
          </Link>
        }
      />

      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6 space-y-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Basic info
          </h2>
          <Input
            label="Track name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. North Motocross Park"
            error={fieldErrors.name}
            fullWidth
            required
          />
          <div>
            <label className="text-sm font-medium text-gray-200">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Facilities, terrain, rules..."
              rows={3}
              className={`${textareaClass} mt-1.5`}
            />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">
              Difficulty <span className="text-orange-400">*</span>
            </label>
            <SelectField
              value={difficulty}
              onChange={(value) => setDifficulty(value as DifficultyLevel)}
              className={`${textareaClass} mt-1.5`}
              options={DIFFICULTY_OPTIONS}
              ariaLabel="Difficulty"
            />
          </div>
          <Input
            label="Capacity (riders)"
            type="number"
            value={capacity}
            onChange={(e) => setCapacity(e.target.value)}
            placeholder="e.g. 20"
            error={fieldErrors.capacity}
            fullWidth
            required
            min={1}
          />
        </section>

        <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6">
          <TrackLocationPicker
            latitude={latitude}
            longitude={longitude}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            error={fieldErrors.latitude || fieldErrors.longitude}
          />
        </section>

        <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6">
          <TrackPhotosUpload
            photoUrls={photoUrls}
            pendingFiles={pendingPhotos}
            onAddFiles={(files) => setPendingPhotos((p) => [...p, ...files])}
            onRemoveUrl={(i) => setPhotoUrls((u) => u.filter((_, idx) => idx !== i))}
            onRemovePending={(i) => setPendingPhotos((p) => p.filter((_, idx) => idx !== i))}
            disabled={mutation.isPending}
          />
        </section>

        <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6 space-y-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Pricing (USD)
          </h2>
          <p className="text-xs text-gray-500 -mt-2">Full day prices are required</p>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Junior (full day)"
              type="number"
              value={priceJunior}
              onChange={(e) => setPriceJunior(e.target.value)}
              error={fieldErrors.price_junior}
              fullWidth
              required
              min={0}
              step="0.01"
            />
            <Input
              label="Senior (full day)"
              type="number"
              value={priceSenior}
              onChange={(e) => setPriceSenior(e.target.value)}
              error={fieldErrors.price_senior}
              fullWidth
              required
              min={0}
              step="0.01"
            />
            <Input
              label="Junior (half day)"
              type="number"
              value={priceJuniorHalf}
              onChange={(e) => setPriceJuniorHalf(e.target.value)}
              fullWidth
              min={0}
              step="0.01"
            />
            <Input
              label="Senior (half day)"
              type="number"
              value={priceSeniorHalf}
              onChange={(e) => setPriceSeniorHalf(e.target.value)}
              fullWidth
              min={0}
              step="0.01"
            />
          </div>
        </section>

        <Button
          type="submit"
          variant="primary"
          size="lg"
          fullWidth
          isLoading={mutation.isPending}
        >
          {mutation.isPending ? 'Creating track...' : 'Create track'}
        </Button>
      </form>
    </div>
  );
}

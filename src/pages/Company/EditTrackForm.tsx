import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateTrack, uploadTrackPhoto } from '@/services/trackService';
import type { TrackDetail, TrackUpdatePayload } from '@/services/trackService';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { TrackLocationPicker, TrackPhotosUpload } from '@/components/company';
import { ROUTES } from '@/router/routes';

interface EditTrackFormProps {
  track: TrackDetail;
  trackId: number;
}

function parseLines(raw: string): string[] {
  return raw
    .split(/[\n,]/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function EditTrackForm({ track, trackId }: EditTrackFormProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [priceJunior, setPriceJunior] = useState(String(track.price_junior));
  const [priceSenior, setPriceSenior] = useState(String(track.price_senior));
  const [priceJuniorHalf, setPriceJuniorHalf] = useState(
    track.price_junior_half ? String(track.price_junior_half) : ''
  );
  const [priceSeniorHalf, setPriceSeniorHalf] = useState(
    track.price_senior_half ? String(track.price_senior_half) : ''
  );
  const [description, setDescription] = useState(track.description ?? '');
  const [schedulesRaw, setSchedulesRaw] = useState((track.schedule ?? []).join('\n'));
  const [latitude, setLatitude] = useState(String(track.latitude));
  const [longitude, setLongitude] = useState(String(track.longitude));
  const [photoUrls, setPhotoUrls] = useState<string[]>(track.photos ?? []);
  const [pendingPhotos, setPendingPhotos] = useState<File[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: (payload: TrackUpdatePayload) => updateTrack(trackId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['track', trackId] });
      queryClient.invalidateQueries({ queryKey: ['company', 'tracks'] });
      navigate(ROUTES.COMPANY_TRACKS, { state: { updated: true } });
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      if (status === 403) setApiError(detail ?? 'You cannot edit this track');
      else if (status === 404) setApiError('Track not found');
      else setApiError(detail ?? 'Could not save changes');
    },
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setApiError(null);

    const lat = Number(latitude);
    const lng = Number(longitude);
    if (isNaN(lat) || isNaN(lng)) {
      setFieldErrors({ latitude: 'Invalid location' });
      return;
    }
    setFieldErrors({});

    try {
      const uploaded = await Promise.all(pendingPhotos.map((f) => uploadTrackPhoto(f)));
      const payload: TrackUpdatePayload = {
        price_junior: priceJunior.trim() ? Number(priceJunior) : undefined,
        price_senior: priceSenior.trim() ? Number(priceSenior) : undefined,
        price_junior_half: priceJuniorHalf.trim() ? Number(priceJuniorHalf) : undefined,
        price_senior_half: priceSeniorHalf.trim() ? Number(priceSeniorHalf) : undefined,
        description: description.trim(),
        latitude: lat,
        longitude: lng,
        schedule: parseLines(schedulesRaw),
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
    <>
      {apiError && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
          {apiError}
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        <div className="bg-gray-800/40 rounded-xl p-4 flex flex-wrap gap-4 text-sm text-gray-400 border border-gray-700/60">
          <span>
            <span className="text-gray-500">Name:</span>{' '}
            <span className="text-white font-medium">{track.name}</span>
          </span>
          <span>
            <span className="text-gray-500">Level:</span>{' '}
            <span className="text-white font-medium">{track.difficulty_level}</span>
          </span>
          <span>
            <span className="text-gray-500">Capacity:</span>{' '}
            <span className="text-white font-medium">{track.capacity}</span>
          </span>
        </div>

        <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6">
          <TrackLocationPicker
            latitude={latitude}
            longitude={longitude}
            onLatitudeChange={setLatitude}
            onLongitudeChange={setLongitude}
            error={fieldErrors.latitude}
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
          <h2 className="text-xs font-semibold uppercase tracking-widest text-gray-500">Pricing</h2>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Junior (full day)" type="number" value={priceJunior} onChange={(e) => setPriceJunior(e.target.value)} fullWidth step="0.01" />
            <Input label="Senior (full day)" type="number" value={priceSenior} onChange={(e) => setPriceSenior(e.target.value)} fullWidth step="0.01" />
            <Input label="Junior (half day)" type="number" value={priceJuniorHalf} onChange={(e) => setPriceJuniorHalf(e.target.value)} fullWidth step="0.01" />
            <Input label="Senior (half day)" type="number" value={priceSeniorHalf} onChange={(e) => setPriceSeniorHalf(e.target.value)} fullWidth step="0.01" />
          </div>
        </section>

        <section className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-gray-200">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={`${textareaClass} mt-1.5`} />
          </div>
          <div>
            <label className="text-sm font-medium text-gray-200">Available times</label>
            <p className="text-xs text-gray-500 mb-1">One per line, e.g. 08:00-10:00</p>
            <textarea value={schedulesRaw} onChange={(e) => setSchedulesRaw(e.target.value)} rows={4} className={`${textareaClass} font-mono`} />
          </div>
        </section>

        <Button type="submit" variant="primary" fullWidth size="lg" isLoading={mutation.isPending}>
          {mutation.isPending ? 'Saving...' : 'Save changes'}
        </Button>
      </form>
    </>
  );
}

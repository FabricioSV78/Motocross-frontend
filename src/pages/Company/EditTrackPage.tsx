import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getTrackById } from '@/services/trackService';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/pilot';
import { EditTrackForm } from './EditTrackForm';
import { ROUTES } from '@/router/routes';

export function EditTrackPage() {
  const { id } = useParams<{ id: string }>();
  const trackId = Number(id);

  const { data: track, isLoading, isError, error } = useQuery({
    queryKey: ['track', trackId],
    queryFn: () => getTrackById(trackId),
    enabled: !isNaN(trackId),
    retry: false,
  });

  if (isError) {
    const status = (error as { response?: { status?: number } })?.response?.status;
    const msg =
      status === 403 ? 'You cannot edit this track' : status === 404 ? 'Track not found' : 'Track could not be loaded';

    return (
      <div className="max-w-3xl mx-auto text-center py-16">
        <p className="text-red-300 mb-6">{msg}</p>
        <Link to={ROUTES.COMPANY_TRACKS}>
          <Button variant="outline">Back to my tracks</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Edit track"
        subtitle={track?.name ?? 'Update location, photos, and pricing'}
        action={
          <Link to={ROUTES.COMPANY_TRACKS}>
            <Button variant="outline" size="sm">
              ← My tracks
            </Button>
          </Link>
        }
      />

      {isLoading && (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {track && <EditTrackForm key={track.id} track={track} trackId={trackId} />}
    </div>
  );
}

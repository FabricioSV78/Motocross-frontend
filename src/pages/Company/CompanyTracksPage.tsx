import { useEffect, useState, useMemo } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getCompanyTracks } from '@/services/trackService';
import type { TrackDetail } from '@/services/trackService';
import { Button } from '@/components/ui/Button';
import { PageHeader, EmptyState, DashboardCardSkeleton } from '@/components/pilot';
import { getMediaUrl } from '@/utils/media';
import { ROUTES } from '@/router/routes';

const DIFFICULTY_LABELS: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
};

const DIFFICULTY_BADGE: Record<string, string> = {
  BEGINNER: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
  INTERMEDIATE: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  ADVANCED: 'bg-red-500/15 text-red-300 border-red-500/30',
};

export function CompanyTracksPage() {
  const location = useLocation();
  const [search, setSearch] = useState('');
  const [successMessage, setSuccessMessage] = useState<string | null>(
    location.state?.created
      ? 'Track created successfully'
      : location.state?.updated
        ? 'Track updated successfully'
        : null
  );

  useEffect(() => {
    if (!successMessage) return;
    const t = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(t);
  }, [successMessage]);

  const { data: tracks, isLoading, isError, refetch } = useQuery({
    queryKey: ['company', 'tracks'],
    queryFn: getCompanyTracks,
    staleTime: 30_000,
  });

  const filtered = useMemo(() => {
    if (!tracks) return [];
    const q = search.trim().toLowerCase();
    if (!q) return tracks;
    return tracks.filter((t) => t.name.toLowerCase().includes(q));
  }, [tracks, search]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="My tracks"
        subtitle="Manage locations, photos, pricing, and availability"
        action={
          <Link to={ROUTES.CREATE_TRACK}>
            <Button variant="primary" size="sm">
              + New track
            </Button>
          </Link>
        }
      />

      {successMessage && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-sm">
          {successMessage}
        </div>
      )}

      {!isLoading && (tracks?.length ?? 0) > 0 && (
        <input
          type="search"
          placeholder="Search tracks..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full mb-6 bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
        />
      )}

      {isLoading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <DashboardCardSkeleton key={i} />
          ))}
        </div>
      )}

      {isError && (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center">
          <p className="text-red-300 mb-4">Could not load tracks</p>
          <Button variant="outline" size="sm" onClick={() => refetch()}>
            Retry
          </Button>
        </div>
      )}

      {!isLoading && !isError && tracks?.length === 0 && (
        <EmptyState
          icon="🏁"
          title="No tracks yet"
          description="Create your first track with map location and photos from your computer."
          actionLabel="Create track"
          actionTo={ROUTES.CREATE_TRACK}
        />
      )}

      {!isLoading && filtered.length === 0 && (tracks?.length ?? 0) > 0 && (
        <EmptyState icon="🔍" title="No matches" description="Try a different search term." />
      )}

      {!isLoading && filtered.length > 0 && (
        <div className="space-y-4">
          {filtered.map((track) => (
            <TrackCard key={track.id} track={track} />
          ))}
        </div>
      )}
    </div>
  );
}

function TrackCard({ track }: { track: TrackDetail }) {
  const thumb = track.photos?.[0] ? getMediaUrl(track.photos[0]) : null;
  const diffBadge =
    DIFFICULTY_BADGE[track.difficulty_level] ?? 'bg-gray-500/15 text-gray-300 border-gray-500/30';

  return (
    <article className="bg-gray-800/40 border border-gray-700/80 rounded-xl overflow-hidden flex flex-col sm:flex-row">
      <div className="sm:w-36 h-32 sm:h-auto shrink-0 bg-gray-900">
        {thumb ? (
          <img src={thumb} alt="" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-600 text-sm">
            No photo
          </div>
        )}
      </div>
      <div className="flex-1 p-5 flex flex-col sm:flex-row sm:items-center gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <h3 className="text-lg font-bold text-white truncate">{track.name}</h3>
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${diffBadge}`}>
              {DIFFICULTY_LABELS[track.difficulty_level] ?? track.difficulty_level}
            </span>
          </div>
          {track.description && (
            <p className="text-gray-400 text-sm line-clamp-2 mb-2">{track.description}</p>
          )}
          <p className="text-sm text-gray-400">
            Junior <span className="text-orange-400 font-semibold">${track.price_junior}</span>
            {' · '}
            Senior <span className="text-orange-400 font-semibold">${track.price_senior}</span>
            {' · '}
            Capacity <span className="text-white">{track.capacity}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2 shrink-0">
          <Link to={ROUTES.TRACK_AVAILABILITY(String(track.id))}>
            <Button variant="primary" size="sm">
              Availability
            </Button>
          </Link>
          <Link to={`/company/tracks/${track.id}/reservations`}>
            <Button variant="outline" size="sm">
              Bookings
            </Button>
          </Link>
          <Link to={ROUTES.EDIT_TRACK(String(track.id))}>
            <Button variant="outline" size="sm">
              Edit
            </Button>
          </Link>
        </div>
      </div>
    </article>
  );
}

import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { getTrackDetailPublic, type TrackDetailPublic } from '@/services/trackService';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common';
import { TrackPhotoCarousel } from '@/components/tracks/TrackPhotoCarousel';
const DIFFICULTY: Record<string, { label: string; className: string }> = {
  BEGINNER: { label: 'Beginner', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  INTERMEDIATE: { label: 'Intermediate', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  ADVANCED: { label: 'Advanced', className: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

export function TrackDetailPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [track, setTrack] = useState<TrackDetailPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getTrackDetailPublic(parseInt(trackId, 10));
        setTrack(data);
        setError(null);
      } catch {
        setError('Could not load track details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [trackId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 text-sm">Loading track...</p>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-red-300 mb-6">{error ?? 'Track not found'}</p>
        <Link to={ROUTES.MAP}>
          <Button variant="primary">Back to map</Button>
        </Link>
      </div>
    );
  }

  const difficulty = DIFFICULTY[track.difficulty_level] ?? {
    label: track.difficulty_level,
    className: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  };

  const isPilot = user?.role === 'PILOT';

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to={ROUTES.MAP}
        className="inline-flex items-center text-sm text-gray-400 hover:text-orange-400 mb-6 transition-colors"
      >
        ← Back to map
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Contenido principal */}
        <div className="lg:col-span-2 space-y-6">
          <TrackPhotoCarousel photos={track.photos} trackName={track.name} />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${difficulty.className}`}
              >
                {difficulty.label}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{track.name}</h1>
            {track.description && (
              <p className="text-gray-400 mt-3 leading-relaxed">{track.description}</p>
            )}
          </div>

          {/* Coaches */}
          <section>
            <h2 className="text-lg font-bold text-white mb-4">Available coaches</h2>
            {track.coaches.length === 0 ? (
              <p className="text-gray-500 text-sm p-4 rounded-xl border border-gray-700/80 bg-gray-800/30">
                No coaches at this track. You can still book track time only.
              </p>
            ) : (
              <div className="space-y-4">
                {track.coaches.map((coach) => (
                  <div
                    key={coach.id}
                    className="rounded-xl border border-gray-700/80 bg-gray-800/30 p-5"
                  >
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <h3 className="font-semibold text-white">{coach.name}</h3>
                      {coach.status === 'APPROVED' && (
                        <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          Verified
                        </span>
                      )}
                    </div>
                    <div className="space-y-2 mb-4">
                      {coach.services.length === 0 ? (
                        <p className="text-gray-500 text-sm">No services listed</p>
                      ) : (
                        coach.services.map((service, idx) => (
                          <div
                            key={idx}
                            className="flex justify-between text-sm py-2 px-3 rounded-lg bg-gray-900/50"
                          >
                            <span className="text-gray-300">
                              {service.class_type.replace('_', ' ')} ·{' '}
                              {service.mode === 'ONE_TO_ONE' ? '1:1' : `Group (${service.max_students})`}
                            </span>
                            <span className="text-orange-400 font-semibold">${service.price}</span>
                          </div>
                        ))
                      )}
                    </div>
                    {isPilot && (
                      <Button
                        variant="primary"
                        fullWidth
                        size="sm"
                        onClick={() =>
                          navigate(ROUTES.QUOTE_CHECKOUT(trackId!, coach.id.toString()))
                        }
                      >
                        Book with {coach.name}
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Panel lateral — precios y CTA */}
        <aside className="lg:col-span-1">
          <div className="lg:sticky lg:top-24 rounded-2xl border border-gray-700/80 bg-gray-800/40 p-6 space-y-5">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500">
              Pricing
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <PriceTile label="Junior" value={track.prices.junior} />
              <PriceTile label="Senior" value={track.prices.senior} />
              {track.prices.junior_half != null && (
                <PriceTile label="Junior ½ day" value={track.prices.junior_half} />
              )}
              {track.prices.senior_half != null && (
                <PriceTile label="Senior ½ day" value={track.prices.senior_half} />
              )}
            </div>

            {isPilot ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(ROUTES.QUOTE_CHECKOUT(trackId!))}
              >
                Book track only
              </Button>
            ) : (
              <p className="text-gray-500 text-sm text-center">
                Sign in as a rider to book this track.
              </p>
            )}

            <p className="text-xs text-gray-500 text-center">
              Prices in USD. Select date and time on the next step.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PriceTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-gray-900/50 p-3 text-center border border-gray-700/50">
      <p className="text-xs text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-orange-400">${value}</p>
    </div>
  );
}

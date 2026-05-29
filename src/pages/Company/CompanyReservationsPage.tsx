import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import { reservationService } from '@/services/reservationService';
import { formatDate, formatTime } from '@/utils/date';
import { getReservationFields, type ReservationRow } from '@/utils/reservationFields';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  ReservationCardSkeleton,
} from '@/components/pilot';

type FilterKey = 'all' | 'CONFIRMED' | 'PENDING_PAYMENT' | 'CANCELLED';

export function CompanyReservationsPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackName, setTrackName] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (!trackId) return;
    loadReservations();
  }, [trackId]);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.listTrackReservations(parseInt(trackId!, 10));
      setReservations(
        data.map((r) => getReservationFields(r as unknown as Record<string, unknown>))
      );
      if (data.length > 0) {
        const first = getReservationFields(data[0] as unknown as Record<string, unknown>);
        setTrackName(first.trackName);
      }
    } catch {
      setError('Could not load bookings. Check that you own this track.');
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(
    () => ({
      all: reservations.length,
      CONFIRMED: reservations.filter((r) => r.status === 'CONFIRMED').length,
      PENDING_PAYMENT: reservations.filter((r) => r.status === 'PENDING_PAYMENT').length,
      CANCELLED: reservations.filter((r) => r.status === 'CANCELLED').length,
    }),
    [reservations]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchesFilter = filter === 'all' || r.status === filter;
      const matchesSearch =
        !q ||
        r.coachName?.toLowerCase().includes(q) ||
        r.pilotName?.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [reservations, filter, search]);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title={trackName ? `Bookings · ${trackName}` : 'Track bookings'}
        subtitle="Reservations for this track"
        action={
          <Link to={ROUTES.COMPANY_TRACKS}>
            <Button variant="outline" size="sm">
              ← Tracks
            </Button>
          </Link>
        }
      />

      {!loading && reservations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            placeholder="Search coach or rider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as FilterKey)}
            className="bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm sm:w-44"
          >
            <option value="all">All ({counts.all})</option>
            <option value="CONFIRMED">Confirmed ({counts.CONFIRMED})</option>
            <option value="PENDING_PAYMENT">Pending ({counts.PENDING_PAYMENT})</option>
            <option value="CANCELLED">Cancelled ({counts.CANCELLED})</option>
          </select>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex justify-between items-center gap-3">
          <p className="text-red-300 text-sm">{error}</p>
          <Button variant="outline" size="sm" onClick={loadReservations}>
            Retry
          </Button>
        </div>
      )}

      {loading && (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <ReservationCardSkeleton key={i} />
          ))}
        </div>
      )}

      {!loading && !error && reservations.length === 0 && (
        <EmptyState
          icon="📋"
          title="No bookings yet"
          description="When riders book this track, reservations will appear here."
        />
      )}

      {!loading && filtered.length > 0 && (
        <>
        <div className="grid gap-3 sm:grid-cols-2 mb-4">
          <StatCard label="Total" value={counts.all} />
          <StatCard label="Confirmed" value={counts.CONFIRMED} />
        </div>
        <div className="space-y-3">
          {filtered.map((r) => (
            <article
              key={r.id}
              className="bg-gray-800/40 border border-gray-700/80 rounded-xl p-5"
            >
              <div className="flex justify-between gap-3 mb-3">
                <p className="text-white font-semibold">
                  {formatDate(r.reservationDate)} · {formatTime(r.startTime)} –{' '}
                  {formatTime(r.endTime)}
                </p>
                <StatusBadge status={r.status} size="sm" />
              </div>
              <dl className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <dt className="text-gray-500 text-xs">Coach</dt>
                  <dd className="text-gray-200">{r.coachName ?? 'Track only'}</dd>
                </div>
                <div>
                  <dt className="text-gray-500 text-xs">Amount</dt>
                  <dd className="text-orange-400 font-bold">${Number(r.totalAmount).toFixed(2)}</dd>
                </div>
              </dl>
            </article>
          ))}
        </div>
        </>
      )}
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-gray-700/80 bg-gray-800/30 p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

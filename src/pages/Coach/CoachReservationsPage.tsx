import { useState, useEffect, useMemo } from 'react';
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

type FilterKey = 'all' | 'upcoming' | 'pending' | 'completed';

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'upcoming', label: 'Upcoming' },
  { value: 'pending', label: 'Pending payment' },
  { value: 'completed', label: 'Past' },
];

export function CoachReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.listCoachReservations();
      setReservations(
        data.map((r) => getReservationFields(r as unknown as Record<string, unknown>))
      );
    } catch {
      setError('Could not load your lessons. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const counts = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return {
      all: reservations.length,
      upcoming: reservations.filter((r) => new Date(r.reservationDate) >= now).length,
      pending: reservations.filter((r) => r.status === 'PENDING_PAYMENT').length,
      completed: reservations.filter((r) => new Date(r.reservationDate) < now).length,
    };
  }, [reservations]);

  const filtered = useMemo(() => {
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    const q = search.trim().toLowerCase();

    return reservations.filter((r) => {
      const resDate = new Date(r.reservationDate);
      resDate.setHours(0, 0, 0, 0);

      let matchesFilter = true;
      switch (filter) {
        case 'upcoming':
          matchesFilter = resDate >= now;
          break;
        case 'completed':
          matchesFilter = resDate < now;
          break;
        case 'pending':
          matchesFilter = r.status === 'PENDING_PAYMENT';
          break;
        default:
          break;
      }

      const matchesSearch =
        !q ||
        r.trackName?.toLowerCase().includes(q) ||
        r.pilotName?.toLowerCase().includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [reservations, filter, search]);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="My lessons"
        subtitle="Sessions where riders booked you as their coach"
        action={
          <Button variant="outline" size="sm" onClick={loadReservations} disabled={loading}>
            Refresh
          </Button>
        }
      />

      {!loading && reservations.length > 0 && (
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="search"
            placeholder="Search by track or rider..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <div className="flex flex-wrap gap-2">
            {FILTERS.map(({ value, label }) => (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                  filter === value
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-800 text-gray-400 border border-gray-700 hover:border-gray-600'
                }`}
              >
                {label} ({counts[value]})
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
          icon="📚"
          title="No lessons yet"
          description="When riders book you on a track, their sessions will appear here. Add availability so they can find you."
          actionLabel="Add availability"
          actionTo={ROUTES.COACH_AVAILABILITY}
        />
      )}

      {!loading && reservations.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No matches"
          description="Try another filter or search term."
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((reservation) => (
            <LessonCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  );
}

function LessonCard({ reservation }: { reservation: ReservationRow }) {
  return (
    <article className="bg-gray-800/40 border border-gray-700/80 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <h3 className="text-lg font-bold text-white">{reservation.trackName}</h3>
          <p className="text-gray-400 text-sm mt-0.5">
            {formatDate(reservation.reservationDate)} · {formatTime(reservation.startTime)} –{' '}
            {formatTime(reservation.endTime)}
          </p>
        </div>
        <StatusBadge status={reservation.status} />
      </div>

      <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm mb-0">
        <div>
          <dt className="text-gray-500 text-xs uppercase tracking-wide">Rider</dt>
          <dd className="text-white font-medium mt-0.5">
            {reservation.pilotName ?? `Booking #${reservation.id}`}
          </dd>
        </div>
        <div>
          <dt className="text-gray-500 text-xs uppercase tracking-wide">Earnings</dt>
          <dd className="text-orange-400 font-bold mt-0.5">
            ${Number(reservation.coachEarnings ?? 0).toFixed(2)}
          </dd>
        </div>
        <div className="hidden sm:block">
          <dt className="text-gray-500 text-xs uppercase tracking-wide">Booked</dt>
          <dd className="text-gray-300 mt-0.5">
            {new Date(reservation.createdAt).toLocaleDateString()}
          </dd>
        </div>
      </dl>
    </article>
  );
}

import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '@/services/reservationService';
import { formatDate, formatTime } from '@/utils/date';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  ReservationCardSkeleton,
} from '@/components/pilot';
import { getReservationFields, type ReservationRow } from '@/utils/reservationFields';

const STATUS_FILTERS = [
  { value: 'ALL', label: 'All' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING_PAYMENT', label: 'Pending' },
  { value: 'COMPLETED', label: 'Completed' },
  { value: 'CANCELLED', label: 'Cancelled' },
] as const;

export function MyReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    loadReservations();
  }, []);

  const loadReservations = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.listMyReservations();
      setReservations(
        data.map((r) => getReservationFields(r as unknown as Record<string, unknown>))
      );
    } catch {
      setError('Could not load your reservations. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchesStatus = statusFilter === 'ALL' || r.status === statusFilter;
      const matchesSearch =
        !q ||
        r.trackName?.toLowerCase().includes(q) ||
        r.coachName?.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [reservations, search, statusFilter]);

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="My reservations"
        subtitle="Track bookings and lessons in one place"
        action={
          <Link to={ROUTES.MAP}>
            <Button variant="primary" size="sm">
              New booking
            </Button>
          </Link>
        }
      />

      {!loading && reservations.length > 0 && (
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="search"
            placeholder="Search by track or coach..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
          />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50 sm:w-44"
            aria-label="Filter by status"
          >
            {STATUS_FILTERS.map(({ value, label }) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
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
          icon="🏁"
          title="No reservations yet"
          description="Explore the map to find tracks and book your first session."
          actionLabel="Browse tracks"
          actionTo={ROUTES.MAP}
        />
      )}

      {!loading && reservations.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon="🔍"
          title="No matches"
          description="Try a different search term or status filter."
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((reservation) => (
            <ReservationCard key={reservation.id} reservation={reservation} />
          ))}
        </div>
      )}
    </div>
  );
}

function ReservationCard({ reservation }: { reservation: ReservationRow }) {
  return (
    <article className="bg-gray-800/40 border border-gray-700/80 rounded-xl p-5 hover:border-gray-600 transition-colors">
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="text-lg font-bold text-white">{reservation.trackName}</h3>
            <p className="text-gray-400 text-sm mt-0.5">
              {formatDate(reservation.reservationDate)} · {formatTime(reservation.startTime)} –{' '}
              {formatTime(reservation.endTime)}
            </p>
          </div>
          <StatusBadge status={reservation.status} />
        </div>

        <dl className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
          <div>
            <dt className="text-gray-500 text-xs uppercase tracking-wide">Coach</dt>
            <dd className="text-white font-medium mt-0.5">
              {reservation.coachName || 'Track only'}
            </dd>
          </div>
          <div>
            <dt className="text-gray-500 text-xs uppercase tracking-wide">Total</dt>
            <dd className="text-orange-400 font-bold mt-0.5">
              ${Number(reservation.totalAmount).toFixed(2)}
            </dd>
          </div>
          <div className="hidden sm:block">
            <dt className="text-gray-500 text-xs uppercase tracking-wide">Booked</dt>
            <dd className="text-gray-300 mt-0.5">
              {new Date(reservation.createdAt).toLocaleDateString()}
            </dd>
          </div>
        </dl>

        <div className="flex flex-wrap gap-2 pt-1 border-t border-gray-700/60">
          <Link to={ROUTES.RESERVATION_DETAIL(String(reservation.id))}>
            <Button variant="outline" size="sm">
              View details
            </Button>
          </Link>
          {reservation.status === 'PENDING_PAYMENT' && (
            <Button variant="primary" size="sm" disabled title="Payment coming soon">
              Complete payment
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}

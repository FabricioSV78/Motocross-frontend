import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { reservationService } from '@/services/reservationService';
import { getTrackById } from '@/services/trackService';
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

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PENDING_PAYMENT', label: 'Pending' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export function CompanyReservationsPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [trackName, setTrackName] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');

  const loadReservations = useCallback(async () => {
    if (!trackId) return;

    try {
      setLoading(true);
      setError(null);
      const numericTrackId = parseInt(trackId, 10);
      const [data, track] = await Promise.all([
        reservationService.listTrackReservations(numericTrackId),
        getTrackById(numericTrackId),
      ]);

      setReservations(
        data.map((r) => getReservationFields(r as unknown as Record<string, unknown>))
      );
      setTrackName(track.name);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not load bookings. Check that you own this track.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, [trackId]);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const counts = useMemo(
    () => ({
      all: reservations.length,
      CONFIRMED: reservations.filter((r) => r.status === 'CONFIRMED').length,
      PENDING_PAYMENT: reservations.filter((r) => r.status === 'PENDING_PAYMENT').length,
      CANCELLED: reservations.filter((r) => r.status === 'CANCELLED').length,
    }),
    [reservations]
  );

  const upcomingCount = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return reservations.filter((r) => {
      const date = new Date(`${r.reservationDate}T12:00:00`);
      return date >= today && r.status !== 'CANCELLED';
    }).length;
  }, [reservations]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchesFilter = filter === 'all' || r.status === filter;
      const matchesSearch =
        !q ||
        r.coachName?.toLowerCase().includes(q) ||
        r.pilotName?.toLowerCase().includes(q) ||
        String(r.id).includes(q);
      return matchesFilter && matchesSearch;
    });
  }, [reservations, filter, search]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title={trackName ? `Bookings - ${trackName}` : 'Track bookings'}
        subtitle="See who is coming, when they ride, and whether a coach is involved."
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={loadReservations} disabled={loading}>
              Refresh
            </Button>
            <Link to={ROUTES.COMPANY_TRACKS}>
              <Button variant="outline" size="sm">
                Tracks
              </Button>
            </Link>
          </div>
        }
      />

      {!loading && reservations.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <StatCard label="Total" value={counts.all} />
            <StatCard label="Upcoming" value={upcomingCount} />
            <StatCard label="Confirmed" value={counts.CONFIRMED} />
            <StatCard label="Pending" value={counts.PENDING_PAYMENT} />
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="search"
              placeholder="Search rider, coach, or booking ID..."
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
        </div>
      )}

      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/30 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
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
          icon="0"
          title="No bookings yet"
          description="When riders reserve this track, the booking details will appear here."
        />
      )}

      {!loading && reservations.length > 0 && filtered.length === 0 && (
        <EmptyState
          icon="0"
          title="No matches"
          description="Try a different status filter or search term."
        />
      )}

      {!loading && filtered.length > 0 && (
        <div className="space-y-3">
          {filtered.map((booking) => (
            <BookingCard key={booking.id} booking={booking} />
          ))}
        </div>
      )}
    </div>
  );
}

function BookingCard({ booking }: { booking: ReservationRow }) {
  return (
    <article className="bg-gray-800/40 border border-gray-700/80 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">
              {booking.pilotName ?? `Booking #${booking.id}`}
            </h3>
            <span className="rounded-md border border-gray-700 bg-gray-900/70 px-2 py-0.5 text-xs text-gray-400">
              #{booking.id}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {formatDate(booking.reservationDate)} - {formatTime(booking.startTime)} to{' '}
            {formatTime(booking.endTime)}
          </p>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-4">
        <InfoItem label="Rider type" value={formatValue(booking.pilotType)} />
        <InfoItem label="Participants" value={String(booking.participants)} />
        <InfoItem label="Coach" value={booking.coachName ?? 'Track only'} />
        <InfoItem label="Service" value={formatService(booking)} />
      </dl>

      <div className="mt-4 grid gap-2 rounded-lg border border-gray-700/70 bg-gray-900/40 p-3 text-sm sm:grid-cols-3">
        <MoneyItem label="Track" value={booking.trackPrice} />
        <MoneyItem label="Coach" value={booking.coachPrice} empty="No coach" />
        <MoneyItem label="Total" value={booking.totalAmount} highlight />
      </div>
    </article>
  );
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-gray-500 text-xs uppercase tracking-wide">{label}</dt>
      <dd className="text-white font-medium mt-0.5">{value}</dd>
    </div>
  );
}

function MoneyItem({
  label,
  value,
  empty = '$0.00',
  highlight,
}: {
  label: string;
  value?: number;
  empty?: string;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
      <p className={`font-bold mt-0.5 ${highlight ? 'text-orange-400' : 'text-gray-200'}`}>
        {value != null ? `$${Number(value).toFixed(2)}` : empty}
      </p>
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

function formatService(booking: ReservationRow) {
  if (!booking.classType) return 'Track only';
  const type = formatValue(booking.classType);
  const mode = booking.classMode ? ` - ${formatValue(booking.classMode)}` : '';
  return `${type}${mode}`;
}

function formatValue(value?: string) {
  if (!value) return 'Not specified';
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '@/services/reservationService';
import { formatDate, formatTime } from '@/utils/date';
import { getReservationFields, sortReservationsBySchedule, type ReservationRow } from '@/utils/reservationFields';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { PaginationControls } from '@/components/common/PaginationControls';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  ReservationCardSkeleton,
} from '@/components/pilot';

type FilterKey = 'all' | 'CONFIRMED' | 'CANCELLED' | 'PAST';

const FILTERS: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'PAST', label: 'Past' },
];

const CARDS_PER_PAGE = 10;

export function CoachReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterKey>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadReservations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await reservationService.listCoachReservations();
      setReservations(
        data.map((r) => getReservationFields(r as unknown as Record<string, unknown>))
      );
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not load your lessons. Please try again.';
      setError(detail);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const counts = useMemo(() => {
    return {
      all: reservations.length,
      CONFIRMED: reservations.filter((r) => r.status === 'CONFIRMED').length,
      CANCELLED: reservations.filter((r) => r.status === 'CANCELLED').length,
      PAST: reservations.filter((r) => r.status === 'PAST').length,
    };
  }, [reservations]);

  const expectedEarnings = useMemo(
    () =>
      reservations
        .filter((r) => r.status === 'CONFIRMED')
        .reduce((sum, r) => sum + Number(r.coachEarnings ?? r.coachPrice ?? 0), 0),
    [reservations]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    return reservations.filter((r) => {
      const matchesFilter = filter === 'all' || r.status === filter;

      const matchesSearch =
        !q ||
        r.trackName?.toLowerCase().includes(q) ||
        r.pilotName?.toLowerCase().includes(q) ||
        String(r.id).includes(q);

      return matchesFilter && matchesSearch;
    });
  }, [reservations, filter, search]);

  const ordered = useMemo(() => sortReservationsBySchedule(filtered), [filtered]);
  const pageCount = Math.max(1, Math.ceil(ordered.length / CARDS_PER_PAGE));
  const currentPageItems = useMemo(
    () => ordered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE),
    [ordered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [filter, search, reservations]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="My lessons"
        subtitle="See every booked lesson, who is coming, where to meet, and what you earn."
        action={
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={loadReservations} disabled={loading}>
              Refresh
            </Button>
            <Link to={ROUTES.COACH_AVAILABILITY}>
              <Button variant="outline" size="sm">
                Availability
              </Button>
            </Link>
          </div>
        }
      />

      {!loading && reservations.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <StatCard label="Total" value={counts.all} />
            <StatCard label="Confirmed" value={counts.CONFIRMED} />
            <StatCard label="Past" value={counts.PAST} />
            <StatCard label="Expected earnings" value={`$${expectedEarnings.toFixed(2)}`} />
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="search"
              placeholder="Search track, rider, or lesson ID..."
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
          icon="0"
          title="No lessons yet"
          description="When riders book you on a track, their sessions will appear here."
          actionLabel="Add availability"
          actionTo={ROUTES.COACH_AVAILABILITY}
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
          {currentPageItems.map((lesson) => (
            <LessonCard key={lesson.id} lesson={lesson} />
          ))}
        </div>
      )}

      {!loading && filtered.length > 0 && (
        <PaginationControls
          page={page}
          pageCount={pageCount}
          pageSize={CARDS_PER_PAGE}
          totalItems={ordered.length}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}

function LessonCard({ lesson }: { lesson: ReservationRow }) {
  const earnings = lesson.coachEarnings ?? lesson.coachPrice ?? 0;

  return (
    <article className="bg-gray-800/40 border border-gray-700/80 rounded-xl p-5">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-bold text-white">{lesson.trackName}</h3>
            <span className="rounded-md border border-gray-700 bg-gray-900/70 px-2 py-0.5 text-xs text-gray-400">
              #{lesson.id}
            </span>
          </div>
          <p className="text-gray-400 text-sm mt-1">
            {formatDate(lesson.reservationDate)} - {formatTime(lesson.startTime)} to{' '}
            {formatTime(lesson.endTime)}
          </p>
        </div>
        <StatusBadge status={lesson.status} />
      </div>

      <dl className="grid gap-3 text-sm sm:grid-cols-4">
        <InfoItem label="Rider" value={lesson.pilotName ?? `Booking #${lesson.id}`} />
        <InfoItem label="Rider type" value={formatValue(lesson.pilotType)} />
        <InfoItem label="Participants" value={String(lesson.participants)} />
        <InfoItem label="Lesson type" value={formatLessonType(lesson)} />
      </dl>

      <div className="mt-4 grid gap-2 rounded-lg border border-gray-700/70 bg-gray-900/40 p-3 text-sm sm:grid-cols-3">
        <MoneyItem label="Your earnings" value={earnings} highlight />
        <MoneyItem label="Track fee" value={lesson.trackPrice} />
        <MoneyItem label="Booking total" value={lesson.totalAmount} />
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
  highlight,
}: {
  label: string;
  value?: number;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
      <p className={`font-bold mt-0.5 ${highlight ? 'text-orange-400' : 'text-gray-200'}`}>
        {value != null ? `$${Number(value).toFixed(2)}` : '$0.00'}
      </p>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-gray-700/80 bg-gray-800/30 p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function formatLessonType(lesson: ReservationRow) {
  if (!lesson.classType) return 'Not specified';
  const type = formatValue(lesson.classType);
  const mode = lesson.classMode === 'ONE_TO_ONE' ? ' - 1:1' : '';
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

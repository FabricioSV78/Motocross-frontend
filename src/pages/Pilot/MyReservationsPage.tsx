import { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { reservationService } from '@/services/reservationService';
import { formatDate, formatTime } from '@/utils/date';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common';
import { PaginationControls } from '@/components/common/PaginationControls';
import {
  PageHeader,
  StatusBadge,
  EmptyState,
  ReservationCardSkeleton,
} from '@/components/pilot';
import { getReservationFields, normalizeReservationDetail, sortReservationsBySchedule, type ReservationRow } from '@/utils/reservationFields';
import type { ReservationDetail } from '@/types/reservation.types';

type FilterKey = 'all' | 'CONFIRMED' | 'CANCELLED' | 'PAST';

const STATUS_FILTERS: { value: FilterKey; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'CANCELLED', label: 'Cancelled' },
  { value: 'PAST', label: 'Past' },
];

const CARDS_PER_PAGE = 10;

export function MyReservationsPage() {
  const [reservations, setReservations] = useState<ReservationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<FilterKey>('all');
  const [cancellingId, setCancellingId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [selectedReservationId, setSelectedReservationId] = useState<number | null>(null);
  const [selectedReservationDetail, setSelectedReservationDetail] = useState<ReservationDetail | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);

  const loadReservations = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    loadReservations();
  }, [loadReservations]);

  const counts = useMemo(
    () => ({
      all: reservations.length,
      CONFIRMED: reservations.filter((r) => r.status === 'CONFIRMED').length,
      CANCELLED: reservations.filter((r) => r.status === 'CANCELLED').length,
      PAST: reservations.filter((r) => r.status === 'PAST').length,
    }),
    [reservations]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return reservations.filter((r) => {
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch =
        !q ||
        r.trackName?.toLowerCase().includes(q) ||
        r.coachName?.toLowerCase().includes(q) ||
        String(r.id).includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [reservations, search, statusFilter]);

  const ordered = useMemo(() => sortReservationsBySchedule(filtered), [filtered]);
  const pageCount = Math.max(1, Math.ceil(ordered.length / CARDS_PER_PAGE));
  const currentPageItems = useMemo(
    () => ordered.slice((page - 1) * CARDS_PER_PAGE, page * CARDS_PER_PAGE),
    [ordered, page]
  );

  useEffect(() => {
    setPage(1);
  }, [search, statusFilter, reservations]);

  useEffect(() => {
    if (page > pageCount) setPage(pageCount);
  }, [page, pageCount]);

  const handleCancel = async (reservation: ReservationRow) => {
    const confirmed = window.confirm(
      `Cancel your booking at ${reservation.trackName} on ${formatDate(reservation.reservationDate)}?`
    );
    if (!confirmed) return;

    try {
      setCancellingId(reservation.id);
      setError(null);
      await reservationService.cancelReservation(reservation.id);
      setReservations((prev) =>
        prev.map((item) =>
          item.id === reservation.id ? { ...item, status: 'CANCELLED' } : item
        )
      );
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not cancel this reservation. Please try again.';
      setError(detail);
    } finally {
      setCancellingId(null);
    }
  };

  const handleOpenDetails = async (reservationId: number) => {
    setSelectedReservationId(reservationId);
    setSelectedReservationDetail(null);
    setDetailError(null);

    try {
      setDetailLoading(true);
      const data = await reservationService.getReservationDetail(reservationId);
      setSelectedReservationDetail(normalizeReservationDetail(data as unknown as Record<string, unknown>));
    } catch {
      setDetailError('Could not load reservation details.');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleCloseDetails = () => {
    setSelectedReservationId(null);
    setSelectedReservationDetail(null);
    setDetailError(null);
    setDetailLoading(false);
  };

  const handleCancelFromModal = async () => {
    if (!selectedReservationDetail) return;

    const confirmed = window.confirm(
      `Cancel your booking at ${selectedReservationDetail.track.name} on ${formatDate(selectedReservationDetail.reservationDate)}?`
    );
    if (!confirmed) return;

    try {
      setCancellingId(selectedReservationDetail.id);
      setDetailError(null);
      await reservationService.cancelReservation(selectedReservationDetail.id);
      setReservations((prev) =>
        prev.map((item) =>
          item.id === selectedReservationDetail.id ? { ...item, status: 'CANCELLED' } : item
        )
      );
      setSelectedReservationDetail((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not cancel this reservation. Please try again.';
      setDetailError(detail);
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title="My reservations"
        subtitle="See every booking, track session, and coaching lesson in one place."
        action={
          <Link to={ROUTES.MAP}>
            <Button variant="primary" size="sm">
              New booking
            </Button>
          </Link>
        }
      />

      {!loading && reservations.length > 0 && (
        <div className="mb-6 space-y-4">
          <div className="grid gap-3 sm:grid-cols-4">
            <StatCard label="Total" value={counts.all} />
            <StatCard label="Confirmed" value={counts.CONFIRMED} />
            <StatCard label="Past" value={counts.PAST} />
            <StatCard label="Cancelled" value={counts.CANCELLED} />
          </div>

          <div className="flex flex-col gap-3">
            <input
              type="search"
              placeholder="Search track, coach, or booking ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-gray-900/80 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50"
            />
            <div className="flex flex-wrap gap-2">
              {STATUS_FILTERS.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatusFilter(value)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    statusFilter === value
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
          {currentPageItems.map((reservation) => (
            <ReservationCard
              key={reservation.id}
              reservation={reservation}
              cancelling={cancellingId === reservation.id}
              onOpenDetails={handleOpenDetails}
              onCancel={handleCancel}
            />
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

      {(selectedReservationId != null || detailLoading) && (
        <ReservationDetailsModal
          reservation={selectedReservationDetail}
          loading={detailLoading}
          error={detailError}
          cancelling={cancellingId === selectedReservationDetail?.id}
          onCancel={handleCancelFromModal}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

function ReservationCard({
  reservation,
  cancelling,
  onOpenDetails,
  onCancel,
}: {
  reservation: ReservationRow;
  cancelling: boolean;
  onOpenDetails: (reservationId: number) => void;
  onCancel: (reservation: ReservationRow) => void;
}) {
  const cancellable = canCancelReservation(reservation);

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
          <Button variant="outline" size="sm" onClick={() => onOpenDetails(reservation.id)}>
            View details
          </Button>
          {cancellable && (
            <Button
              variant="danger"
              size="sm"
              onClick={() => onCancel(reservation)}
              isLoading={cancelling}
              disabled={cancelling}
            >
              Cancel booking
            </Button>
          )}
          {reservation.status === 'CANCELLED' && (
            <span className="rounded-lg border border-gray-700 bg-gray-900/60 px-3 py-1.5 text-sm text-gray-400">
              Cancelled by rider
            </span>
          )}
        </div>
      </div>
    </article>
  );
}

function canCancelReservation(reservation: ReservationRow) {
  if (reservation.status !== 'CONFIRMED') return false;
  const start = new Date(`${reservation.reservationDate}T${reservation.startTime}`);
  return start > new Date();
}

function canCancelReservationDetail(detail: ReservationDetail) {
  if (detail.status !== 'CONFIRMED') return false;
  const start = new Date(`${detail.reservationDate}T${detail.startTime}`);
  return start > new Date();
}

function StatCard({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-xl border border-gray-700/80 bg-gray-800/30 p-4 text-center">
      <p className="text-2xl font-bold text-white">{value}</p>
      <p className="text-xs text-gray-500 uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

function ReservationDetailsModal({
  reservation,
  loading,
  error,
  cancelling,
  onCancel,
  onClose,
}: {
  reservation: ReservationDetail | null;
  loading: boolean;
  error: string | null;
  cancelling: boolean;
  onCancel: () => void;
  onClose: () => void;
}) {
  const cancellable = reservation ? canCancelReservationDetail(reservation) : false;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 px-4 py-6 backdrop-blur-sm">
      <div className="w-full max-w-2xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-orange-500 dark:text-orange-300">
              Reservation details
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950 dark:text-white">
              {reservation ? reservation.track.name : 'Loading reservation'}
            </h2>
            {reservation ? (
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Booking #{reservation.id}</p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="p-5">
          {loading ? (
            <div className="flex min-h-[220px] flex-col items-center justify-center gap-4">
              <LoadingSpinner size="lg" />
              <p className="text-sm text-slate-500 dark:text-slate-400">Loading reservation...</p>
            </div>
          ) : error ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
              {error}
            </div>
          ) : reservation ? (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <StatusBadge status={reservation.status} />
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Booked on {new Date(reservation.createdAt).toLocaleDateString()}
                </p>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <ModalInfoCard label="Date" value={formatDate(reservation.reservationDate)} />
                <ModalInfoCard label="Time" value={`${formatTime(reservation.startTime)} - ${formatTime(reservation.endTime)}`} />
                <ModalInfoCard label="Coach" value={reservation.coach?.nombre ?? 'Track only'} />
                <ModalInfoCard label="Participants" value={String(reservation.participants)} />
                <ModalInfoCard label="Rider type" value={reservation.pilotType} />
                <ModalInfoCard
                  label="Class"
                  value={
                    reservation.classType
                      ? `${reservation.classType}${reservation.classMode === 'ONE_TO_ONE' ? ' - 1:1' : ''}`
                      : 'Track only'
                  }
                />
              </div>

              <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/70">
                <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
                  Payment summary
                </p>
                <div className="mt-3 space-y-2 text-sm">
                  <ModalRow label="Track" value={`$${Number(reservation.trackPrice).toFixed(2)}`} />
                  {reservation.coachPrice != null && reservation.coachPrice > 0 ? (
                    <ModalRow label="Coach" value={`$${Number(reservation.coachPrice).toFixed(2)}`} />
                  ) : null}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-200 pt-3 dark:border-slate-700">
                    <span className="font-semibold text-slate-700 dark:text-slate-200">Total</span>
                    <span className="text-lg font-bold text-orange-500 dark:text-orange-300">
                      ${Number(reservation.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to={ROUTES.TRACK_DETAIL(String(reservation.track.id))} className="sm:flex-1" onClick={onClose}>
                  <Button variant="outline" fullWidth>
                    View track
                  </Button>
                </Link>
                {cancellable ? (
                  <div className="sm:flex-1">
                    <Button
                      variant="danger"
                      fullWidth
                      onClick={onCancel}
                      isLoading={cancelling}
                      disabled={cancelling}
                    >
                      Cancel booking
                    </Button>
                  </div>
                ) : null}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ModalInfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-700 dark:bg-slate-800/70">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function ModalRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between text-slate-600 dark:text-slate-300">
      <span>{label}</span>
      <span className="font-semibold text-slate-950 dark:text-white">{value}</span>
    </div>
  );
}

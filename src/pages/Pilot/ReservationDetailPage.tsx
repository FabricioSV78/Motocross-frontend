import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { reservationService } from '@/services/reservationService';
import { formatDate, formatTime } from '@/utils/date';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/common';
import { PageHeader, StatusBadge } from '@/components/pilot';
import type { ReservationDetail } from '@/types/reservation.types';
import { getReservationDisplayStatus } from '@/utils/reservationFields';

function normalizeDetail(raw: Record<string, unknown>): ReservationDetail {
  const track = (raw.track ?? {}) as Record<string, unknown>;
  const coach = raw.coach as Record<string, unknown> | undefined;
  return {
    id: raw.id as number,
    track: {
      id: (track.id as number) ?? 0,
      name: (track.name as string) ?? 'Track',
      location: (track.location as string) ?? '',
    },
    coach: coach
      ? { id: coach.id as number, nombre: (coach.nombre as string) ?? '' }
      : undefined,
    reservationDate: (raw.reservation_date ?? raw.reservationDate) as string,
    startTime: (raw.start_time ?? raw.startTime) as string,
    endTime: (raw.end_time ?? raw.endTime) as string,
    participants: (raw.participants as number) ?? 1,
    pilotType: (raw.pilot_type ?? raw.pilotType) as ReservationDetail['pilotType'],
    classType: (raw.class_type ?? raw.classType) as string | undefined,
    classMode: (raw.class_mode ?? raw.classMode) as string | undefined,
    trackPrice: (raw.track_price ?? raw.trackPrice) as number,
    coachPrice: (raw.coach_price ?? raw.coachPrice) as number | undefined,
    totalAmount: (raw.total_amount ?? raw.totalAmount) as number,
    status: getReservationDisplayStatus(
      raw.status,
      (raw.reservation_date ?? raw.reservationDate) as string,
      (raw.end_time ?? raw.endTime) as string
    ),
    createdAt: (raw.created_at ?? raw.createdAt) as string,
  };
}

export function ReservationDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [detail, setDetail] = useState<ReservationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await reservationService.getReservationDetail(parseInt(id, 10));
        setDetail(normalizeDetail(data as unknown as Record<string, unknown>));
      } catch {
        setError('Could not load booking details.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 text-sm">Loading booking...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="max-w-2xl mx-auto text-center py-16">
        <p className="text-red-300 mb-6">{error ?? 'Booking not found'}</p>
        <Link to={ROUTES.RESERVATIONS}>
          <Button variant="outline">Back to reservations</Button>
        </Link>
      </div>
    );
  }

  const cancellable = canCancelReservation(detail);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      `Cancel your booking at ${detail.track.name} on ${formatDate(detail.reservationDate)}?`
    );
    if (!confirmed) return;

    try {
      setCancelling(true);
      setError(null);
      await reservationService.cancelReservation(detail.id);
      setDetail((prev) => (prev ? { ...prev, status: 'CANCELLED' } : prev));
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Could not cancel this booking.';
      setError(msg);
    } finally {
      setCancelling(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <PageHeader
        title={detail.track.name}
        subtitle={`Booking #${detail.id}`}
        action={<StatusBadge status={detail.status} />}
      />

      <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl overflow-hidden">
        {error && (
          <div className="m-6 mb-0 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}

        <div className="p-6 border-b border-gray-700/80">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Session details
          </h2>
          <dl className="grid gap-4 sm:grid-cols-2">
            <InfoItem label="Date" value={formatDate(detail.reservationDate)} />
            <InfoItem
              label="Time"
              value={`${formatTime(detail.startTime)} – ${formatTime(detail.endTime)}`}
            />
            <InfoItem label="Rider type" value={detail.pilotType} />
            <InfoItem label="Participants" value={String(detail.participants)} />
            <InfoItem label="Coach" value={detail.coach?.nombre ?? 'None (track only)'} />
            {detail.classType && <InfoItem label="Class type" value={detail.classType} />}
          </dl>
        </div>

        <div className="p-6">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-gray-500 mb-4">
            Payment summary
          </h2>
          <div className="space-y-2 text-sm">
            <Row label="Track" value={`$${Number(detail.trackPrice).toFixed(2)}`} />
            {detail.coachPrice != null && detail.coachPrice > 0 && (
              <Row label="Coach" value={`$${Number(detail.coachPrice).toFixed(2)}`} />
            )}
            <div className="border-t border-gray-700 pt-3 flex justify-between">
              <span className="text-white font-semibold">Total</span>
              <span className="text-orange-400 font-bold text-lg">
                ${Number(detail.totalAmount).toFixed(2)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-col sm:flex-row gap-3">
        <Link to={ROUTES.RESERVATIONS} className="flex-1">
          <Button variant="outline" fullWidth>
            All reservations
          </Button>
        </Link>
        <Link to={ROUTES.TRACK_DETAIL(String(detail.track.id))} className="flex-1">
          <Button variant="primary" fullWidth>
            View track
          </Button>
        </Link>
        {cancellable && (
          <div className="flex-1">
            <Button
              variant="danger"
              fullWidth
              onClick={handleCancel}
              isLoading={cancelling}
              disabled={cancelling}
            >
              Cancel booking
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function canCancelReservation(detail: ReservationDetail) {
  if (detail.status !== 'CONFIRMED') return false;
  const start = new Date(`${detail.reservationDate}T${detail.startTime}`);
  return start > new Date();
}

function InfoItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs text-gray-500 uppercase tracking-wide">{label}</dt>
      <dd className="text-white font-medium mt-1">{value}</dd>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between text-gray-300">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

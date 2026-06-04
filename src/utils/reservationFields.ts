import type { ReservationDetail } from '@/types/reservation.types';

export type ReservationDisplayStatus = 'CONFIRMED' | 'CANCELLED' | 'PAST';

export function getReservationDisplayStatus(
  status: unknown,
  reservationDate: string,
  reservationEndTime?: string
): ReservationDisplayStatus {
  if (status === 'CANCELLED') return 'CANCELLED';

  if (reservationEndTime) {
    const reservationEnd = new Date(`${reservationDate}T${reservationEndTime}`);
    if (!Number.isNaN(reservationEnd.getTime()) && reservationEnd <= new Date()) {
      return 'PAST';
    }
  }

  const reservationDay = new Date(`${reservationDate}T23:59:59`);
  if (!Number.isNaN(reservationDay.getTime()) && reservationDay < new Date()) {
    return 'PAST';
  }

  return 'CONFIRMED';
}

/** Normaliza campos de reserva (API puede devolver snake_case o camelCase) */
export function getReservationFields(r: Record<string, unknown>) {
  const reservationDate = (r.reservation_date ?? r.reservationDate) as string;
  const endTime = (r.end_time ?? r.endTime) as string;

  return {
    id: r.id as number,
    trackName: (r.track_name ?? r.trackName) as string,
    coachName: (r.coach_name ?? r.coachName) as string | undefined,
    pilotName: (r.pilot_name ?? r.pilotName) as string | undefined,
    reservationDate,
    startTime: (r.start_time ?? r.startTime) as string,
    endTime,
    participants: ((r.participants ?? 1) as number) || 1,
    pilotType: (r.pilot_type ?? r.pilotType) as string | undefined,
    classType: (r.class_type ?? r.classType) as string | undefined,
    classMode: (r.class_mode ?? r.classMode) as string | undefined,
    trackPrice: (r.track_price ?? r.trackPrice) as number | undefined,
    coachPrice: (r.coach_price ?? r.coachPrice) as number | undefined,
    totalAmount: (r.total_amount ?? r.totalAmount) as number,
    coachEarnings: (r.coach_earnings ?? r.coachEarnings) as number | undefined,
    status: getReservationDisplayStatus(r.status, reservationDate, endTime),
    createdAt: (r.created_at ?? r.createdAt) as string,
    trackId: (r.track_id ?? r.trackId) as number | undefined,
  };
}

export type ReservationRow = ReturnType<typeof getReservationFields>;

export function normalizeReservationDetail(raw: Record<string, unknown>): ReservationDetail {
  const track = (raw.track ?? {}) as Record<string, unknown>;
  const coach = raw.coach as Record<string, unknown> | undefined;
  const reservationDate = (raw.reservation_date ?? raw.reservationDate) as string;
  const endTime = (raw.end_time ?? raw.endTime) as string;

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
    reservationDate,
    startTime: (raw.start_time ?? raw.startTime) as string,
    endTime,
    participants: (raw.participants as number) ?? 1,
    pilotType: (raw.pilot_type ?? raw.pilotType) as ReservationDetail['pilotType'],
    classType: (raw.class_type ?? raw.classType) as string | undefined,
    classMode: (raw.class_mode ?? raw.classMode) as string | undefined,
    trackPrice: (raw.track_price ?? raw.trackPrice) as number,
    coachPrice: (raw.coach_price ?? raw.coachPrice) as number | undefined,
    totalAmount: (raw.total_amount ?? raw.totalAmount) as number,
    status: getReservationDisplayStatus(raw.status, reservationDate, endTime),
    createdAt: (raw.created_at ?? raw.createdAt) as string,
  };
}

export function sortReservationsBySchedule<T extends { reservationDate: string; startTime: string }>(
  reservations: T[]
) {
  const now = Date.now();

  return [...reservations].sort((a, b) => {
    const aTime = toReservationTimestamp(a.reservationDate, a.startTime);
    const bTime = toReservationTimestamp(b.reservationDate, b.startTime);
    const aFuture = aTime >= now;
    const bFuture = bTime >= now;

    if (aFuture !== bFuture) return aFuture ? -1 : 1;
    if (aFuture) return aTime - bTime;
    return bTime - aTime;
  });
}

function toReservationTimestamp(reservationDate: string, startTime: string) {
  const dateTime = new Date(`${reservationDate}T${startTime}`);
  if (!Number.isNaN(dateTime.getTime())) return dateTime.getTime();

  const dateOnly = new Date(`${reservationDate}T12:00:00`);
  return Number.isNaN(dateOnly.getTime()) ? 0 : dateOnly.getTime();
}

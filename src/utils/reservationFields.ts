/** Normaliza campos de reserva (API puede devolver snake_case o camelCase) */
export function getReservationFields(r: Record<string, unknown>) {
  return {
    id: r.id as number,
    trackName: (r.track_name ?? r.trackName) as string,
    coachName: (r.coach_name ?? r.coachName) as string | undefined,
    pilotName: (r.pilot_name ?? r.pilotName) as string | undefined,
    reservationDate: (r.reservation_date ?? r.reservationDate) as string,
    startTime: (r.start_time ?? r.startTime) as string,
    endTime: (r.end_time ?? r.endTime) as string,
    participants: ((r.participants ?? 1) as number) || 1,
    pilotType: (r.pilot_type ?? r.pilotType) as string | undefined,
    classType: (r.class_type ?? r.classType) as string | undefined,
    classMode: (r.class_mode ?? r.classMode) as string | undefined,
    trackPrice: (r.track_price ?? r.trackPrice) as number | undefined,
    coachPrice: (r.coach_price ?? r.coachPrice) as number | undefined,
    totalAmount: (r.total_amount ?? r.totalAmount) as number,
    coachEarnings: (r.coach_earnings ?? r.coachEarnings) as number | undefined,
    status: (r.status as string) ?? 'UNKNOWN',
    createdAt: (r.created_at ?? r.createdAt) as string,
    trackId: (r.track_id ?? r.trackId) as number | undefined,
  };
}

export type ReservationRow = ReturnType<typeof getReservationFields>;

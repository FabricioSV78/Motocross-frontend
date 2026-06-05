import { apiClient } from '@/lib/axios';
import type {
  CancelReservationResponse,
  PaymentIntentResponse,
  ReservationCalculateRequest,
  ReservationCalculateResponse,
  ReservationCreateRequest,
  ReservationDetail,
  ReservationListItem,
} from '@/types/reservation.types';

export const reservationService = {
  async calculateQuote(
    request: ReservationCalculateRequest
  ): Promise<ReservationCalculateResponse> {
    const requestBody: Record<string, unknown> = {
      track_id: request.trackId,
      date: request.date,
      start_time: request.startTime,
      end_time: request.endTime,
      pilot_type: request.pilotType,
      participants: request.participants,
    };

    if (request.coachId !== undefined) {
      requestBody.coach_id = request.coachId;
    }
    if (request.classType !== undefined) {
      requestBody.class_type = request.classType;
    }
    if (request.trackReservationType !== undefined) {
      requestBody.track_reservation_type = request.trackReservationType;
    }
    if (request.mode !== undefined) {
      requestBody.mode = request.mode;
    }

    const response = await apiClient.post<ReservationCalculateResponse>(
      '/reservations/calculate',
      requestBody
    );
    return response.data;
  },

  async createReservation(
    request: ReservationCreateRequest
  ): Promise<PaymentIntentResponse> {
    const requestBody: Record<string, unknown> = {
      track_id: request.trackId,
      date: request.date,
      start_time: request.startTime,
      end_time: request.endTime,
      pilot_type: request.pilotType,
      participants: request.participants,
    };

    if (request.coachId !== undefined) {
      requestBody.coach_id = request.coachId;
    }
    if (request.classType !== undefined) {
      requestBody.class_type = request.classType;
    }
    if (request.trackReservationType !== undefined) {
      requestBody.track_reservation_type = request.trackReservationType;
    }
    if (request.mode !== undefined) {
      requestBody.mode = request.mode;
    }

    const response = await apiClient.post<PaymentIntentResponse>(
      '/reservations',
      requestBody
    );
    return response.data;
  },

  async createReservationDirectConfirm(
    request: ReservationCreateRequest
  ): Promise<{
    reservation_id: number;
    total: number;
    status: string;
    currency: string;
    message: string;
  }> {
    const requestBody: Record<string, unknown> = {
      track_id: request.trackId,
      date: request.date,
      start_time: request.startTime,
      end_time: request.endTime,
      pilot_type: request.pilotType,
      participants: request.participants,
    };

    if (request.coachId !== undefined) {
      requestBody.coach_id = request.coachId;
    }
    if (request.classType !== undefined) {
      requestBody.class_type = request.classType;
    }
    if (request.trackReservationType !== undefined) {
      requestBody.track_reservation_type = request.trackReservationType;
    }
    if (request.mode !== undefined) {
      requestBody.mode = request.mode;
    }

    const response = await apiClient.post<{
      reservation_id: number;
      total: number;
      status: string;
      currency: string;
      message: string;
    }>('/reservations/direct-confirm', requestBody);
    return response.data;
  },

  async listMyReservations(): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>('/reservations');
    return response.data;
  },

  async getReservationDetail(reservationId: number): Promise<ReservationDetail> {
    const response = await apiClient.get<ReservationDetail>(`/reservations/${reservationId}`);
    return response.data;
  },

  async cancelReservation(reservationId: number): Promise<CancelReservationResponse> {
    const response = await apiClient.patch<CancelReservationResponse>(
      `/reservations/${reservationId}/cancel`
    );
    return response.data;
  },

  async listCoachReservations(): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>('/reservations/coach/mine');
    return response.data;
  },

  async listTrackReservations(trackId: number): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>(`/reservations/track/${trackId}`);
    return response.data;
  },
};

export default reservationService;

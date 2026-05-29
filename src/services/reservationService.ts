/**
 * Servicio Axios para Reservas y Pagos
 * Wrapper de endpoints de reservations
 */

import { apiClient } from '@/lib/axios';
import type {
  ReservationCalculateRequest,
  ReservationCalculateResponse,
  ReservationCreateRequest,
  PaymentIntentResponse,
  ReservationListItem,
  ReservationDetail,
} from '@/types/reservation.types';

export const reservationService = {
  /**
   * HU-18: Calcular cotización
   * POST /reservations/calculate
   */
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

  /**
   * HU-19: Crear reserva + obtener PaymentIntent
   * POST /reservations
   */
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

  /**
   * Crear reserva confirmada directamente SIN pago
   * POST /reservations/direct-confirm
   */
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

  /**
   * Listar todas las reservas del usuario
   * GET /reservations
   */
  async listMyReservations(): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>(
      '/reservations'
    );
    return response.data;
  },

  /**
   * Obtener detalle de una reserva
   * GET /reservations/{id}
   */
  async getReservationDetail(
    reservationId: number
  ): Promise<ReservationDetail> {
    const response = await apiClient.get<ReservationDetail>(
      `/reservations/${reservationId}`
    );
    return response.data;
  },

  /**
   * Obtener todas las reservas del coach autenticado
   * GET /reservations/coach/mine
   */
  async listCoachReservations(): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>(
      '/reservations/coach/mine'
    );
    return response.data;
  },

  /**
   * Obtener todas las reservas de una pista
   * GET /reservations/track/{trackId}
   */
  async listTrackReservations(trackId: number): Promise<ReservationListItem[]> {
    const response = await apiClient.get<ReservationListItem[]>(
      `/reservations/track/${trackId}`
    );
    return response.data;
  },

  /**
   * Webhook de Stripe (normalmente se envía automáticamente desde Stripe)
   * POST /webhooks/stripe
   * NO se usa desde frontend, pero aquí para referencia
   */
  async notifyStripePayment(event: any): Promise<any> {
    const response = await apiClient.post('/webhooks/stripe', event);
    return response.data;
  },
};

export default reservationService;

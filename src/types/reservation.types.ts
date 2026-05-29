/**
 * Tipos TypeScript para Reservas y Pagos
 * HU-18, HU-19, HU-20, HU-21
 */

// ============================================================================
// Constants (instead of enums for Vite compatibility)
// ============================================================================

export const ReservationStatus = {
  PENDING_PAYMENT: "PENDING_PAYMENT",
  CONFIRMED: "CONFIRMED",
  CANCELLED: "CANCELLED",
  COMPLETED: "COMPLETED",
} as const;

export const PaymentStatus = {
  PENDING: "PENDING",
  SUCCESS: "SUCCESS",
  FAILED: "FAILED",
} as const;

export const PilotCategory = {
  JUNIOR: "JUNIOR",
  SENIOR: "SENIOR",
} as const;

export const ClassType = {
  HOURLY: "HOURLY",
  HALF_DAY: "HALF_DAY",
  FULL_DAY: "FULL_DAY",
} as const;

export const ClassMode = {
  ONE_TO_ONE: "ONE_TO_ONE",
  GROUP: "GROUP",
} as const;

// Types from constants
export type ReservationStatusType = (typeof ReservationStatus)[keyof typeof ReservationStatus];
export type PaymentStatusType = (typeof PaymentStatus)[keyof typeof PaymentStatus];
export type PilotCategoryType = (typeof PilotCategory)[keyof typeof PilotCategory];
export type ClassTypeType = (typeof ClassType)[keyof typeof ClassType];
export type ClassModeType = (typeof ClassMode)[keyof typeof ClassMode];

// ============================================================================
// HU-18: Cotización
// ============================================================================

export interface ReservationCalculateRequest {
  trackId: number;
  date: string; // "2026-05-20"
  startTime: string; // "09:00"
  endTime: string; // "12:00"
  pilotType: PilotCategoryType;
  coachId?: number;
  classType?: ClassTypeType;
  trackReservationType?: ClassTypeType;
  mode?: ClassModeType;
  participants: number;
}

export interface ReservationCalculateResponse {
  trackPrice: number;
  coachPrice?: number;
  totalDurationHours: number;
  subtotal: number;
  tax: number;
  total: number;
  currency: string;
  availabilityAvailable: boolean;
}

// ============================================================================
// HU-19: Checkout
// ============================================================================

export interface ReservationCreateRequest {
  trackId: number;
  date: string;
  startTime: string;
  endTime: string;
  pilotType: PilotCategoryType;
  coachId?: number;
  classType?: ClassTypeType;
  trackReservationType?: ClassTypeType;
  mode?: ClassModeType;
  participants: number;
}

export interface PaymentIntentResponse {
  reservationId: number;
  stripePaymentIntentId: string;
  clientSecret: string;
  total: number;
  status: ReservationStatusType;
  currency: string;
  demoMode?: boolean;
}

// ============================================================================
// HU-20: Webhook (automático)
// ============================================================================

export interface StripeWebhookEvent {
  id: string;
  type: "payment_intent.succeeded" | "payment_intent.payment_failed";
  data: {
    object: {
      id: string;
      amount: number;
      currency: string;
      status: string;
    };
  };
}

// ============================================================================
// Listar y Obtener Reservas
// ============================================================================

export interface CoachForReservation {
  id: number;
  nombre: string;
}

export interface TrackForReservation {
  id: number;
  name: string;
  location: string;
}

export interface PaymentDetail {
  id: number;
  stripePaymentIntentId: string;
  amount: number;
  currency: string;
  status: PaymentStatusType;
  createdAt: string;
}

export interface ReservationListItem {
  id: number;
  trackId: number;
  trackName: string;
  coachId?: number;
  coachName?: string;
  pilotName?: string;
  coachEarnings?: number;
  reservationDate: string;
  startTime: string;
  endTime: string;
  totalAmount: number;
  status: ReservationStatusType;
  createdAt: string;
}

export interface ReservationDetail {
  id: number;
  track: TrackForReservation;
  coach?: CoachForReservation;
  reservationDate: string;
  startTime: string;
  endTime: string;
  participants: number;
  pilotType: PilotCategoryType;
  classType?: string;
  classMode?: string;
  trackPrice: number;
  coachPrice?: number;
  totalAmount: number;
  status: ReservationStatusType;
  payment?: PaymentDetail;
  createdAt: string;
}

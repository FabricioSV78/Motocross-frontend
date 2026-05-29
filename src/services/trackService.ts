import { apiClient } from '@/services/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export type DifficultyLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ClassType = 'HOURLY' | 'HALF_DAY' | 'FULL_DAY';
export type ClassMode = 'ONE_TO_ONE' | 'GROUP';

export interface TrackCreatePayload {
  name: string;
  description?: string;
  latitude: number;
  longitude: number;
  price_junior: number;
  price_senior: number;
  price_junior_half?: number;
  price_senior_half?: number;
  difficulty_level: DifficultyLevel;
  capacity: number;
  schedule?: string[];
  photos?: string[];
}

export interface TrackResponse {
  id: number;
  name: string;
  price_junior: number;
  price_senior: number;
  price_junior_half?: number | null;
  price_senior_half?: number | null;
  difficulty_level: string;
  capacity: number;
  company_id: number;
}

export interface TrackDetail {
  id: number;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  price_junior: number;
  price_senior: number;
  price_junior_half?: number | null;
  price_senior_half?: number | null;
  difficulty_level: string;
  capacity: number;
  photos: string[] | null;
  schedule: string[] | null;
  company_id: number;
  created_at: string | null;
}

export interface TrackUpdatePayload {
  price_junior?: number;
  price_senior?: number;
  price_junior_half?: number | null;
  price_senior_half?: number | null;
  description?: string;
  latitude?: number;
  longitude?: number;
  schedule?: string[];
  photos?: string[];
}

export interface TrackUpdateResponse {
  id: number;
  name: string;
  price_junior: number;
  price_senior: number;
  price_junior_half?: number | null;
  price_senior_half?: number | null;
  description: string | null;
  schedule: string[] | null;
  photos: string[] | null;
}

// ── HU-17: Public Track Detail ────────────────────────────────────────────────

export interface CoachServiceForTrack {
  class_type: ClassType;
  mode: ClassMode;
  price: number;
  max_students: number;
}

export interface CoachForTrack {
  id: number;
  name: string;
  status: string;
  services: CoachServiceForTrack[];
}

export interface TrackDetailPublic {
  id: number;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  difficulty_level: string;
  photos: string[] | null;
  prices: {
    junior: number;
    senior: number;
    junior_half?: number;
    senior_half?: number;
  };
  coaches: CoachForTrack[];
}

// ── HU-11: Schema mínimo para renderizar markers en el mapa ───────────────────

export interface TrackMapItem {
  id: number;
  name: string;
  lat: number;
  lng: number;
  price: number;
  rating: number;
  difficulty_level: string;
}

/** HU-11: Endpoint público — pistas de empresas APPROVED para el mapa. */
export async function getPublicTracks(): Promise<TrackMapItem[]> {
  const { data } = await apiClient.get<TrackMapItem[]>('/tracks');
  return data;
}

/** HU-17: Obtener detalles públicos de una pista con coaches. */
export async function getTrackDetailPublic(trackId: number): Promise<TrackDetailPublic> {
  const { data } = await apiClient.get<TrackDetailPublic>(`/tracks/detail/${trackId}`);
  return data;
}

export async function getAvailableSlotsForDate(
  trackId: number,
  date: string
): Promise<AvailableSlot[]> {
  const { data } = await apiClient.get<AvailableSlot[]>(
    `/tracks/${trackId}/available-slots`,
    { params: { date } }
  );
  return data;
}

export async function getCoachAvailableSlotsForDate(
  coachId: number,
  trackId: number,
  date: string
): Promise<CoachAvailableSlot[]> {
  const { data } = await apiClient.get<CoachAvailableSlot[]>(
    `/coach/${coachId}/available-slots`,
    { params: { track_id: trackId, date } }
  );
  return data;
}

export interface CoachAvailableSlot {
  id: number;
  trackId: number;
  trackName: string;
  date: string;
  startTime: string;
  endTime: string;
  classType: ClassType;
  mode: ClassMode;
  maxStudents: number;
}

export interface AvailableSlot {
  id: number;
  track_id: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  rentalType: string;
  pilotCategory: string;
}

/** Sube una foto de pista desde el dispositivo (empresa aprobada). */
export async function uploadTrackPhoto(file: File): Promise<string> {
  const formData = new FormData();
  formData.append('file', file);

  const token = localStorage.getItem('auth_token');
  const baseUrl = (apiClient.defaults.baseURL ?? '').replace(/\/$/, '');

  const response = await fetch(`${baseUrl}/tracks/upload-photo`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token ?? ''}` },
    body: formData,
  });

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as { detail?: string };
    throw new Error(data.detail || 'Failed to upload image');
  }

  const data = (await response.json()) as { url: string };
  return data.url;
}

/** HU-08: Crear una pista. Requiere rol COMPANY con status APPROVED. */
export async function createTrack(payload: TrackCreatePayload): Promise<TrackResponse> {
  const { data } = await apiClient.post<TrackResponse>('/tracks', payload);
  return data;
}

/** HU-09: Obtener datos de una pista (para rellenar el formulario de edición). */
export async function getTrackById(trackId: number): Promise<TrackDetail> {
  const { data } = await apiClient.get<TrackDetail>(`/tracks/${trackId}`);
  return data;
}

/** HU-09: Actualizar campos editables de una pista. */
export async function updateTrack(trackId: number, payload: TrackUpdatePayload): Promise<TrackUpdateResponse> {
  const { data } = await apiClient.put<TrackUpdateResponse>(`/tracks/${trackId}`, payload);
  return data;
}

/** HU-10: Obtener las pistas de la empresa autenticada. */
export async function getCompanyTracks(): Promise<TrackDetail[]> {
  const { data } = await apiClient.get<TrackDetail[]>('/companies/tracks');
  return data;
}

// ── HU-12: Track Availability ─────────────────────────────────────────────────

export type RentalType = 'HALF_DAY' | 'FULL_DAY';
export type PilotCategory = 'JUNIOR' | 'SENIOR' | 'BOTH';

export interface TrackAvailabilityPayload {
  date: string;          // YYYY-MM-DD
  startTime: string;     // HH:MM
  endTime: string;       // HH:MM
  capacity: number;
  rentalType: RentalType;
  pilotCategory: PilotCategory;
}

export interface TrackAvailabilityItem {
  id: number;
  track_id: number;
  date: string;
  startTime: string;
  endTime: string;
  capacity: number;
  rentalType: string;
  pilotCategory: string;
}

/** HU-12: Crear disponibilidad de una pista. Requiere rol COMPANY. */
export async function createTrackAvailability(
  trackId: number,
  payload: TrackAvailabilityPayload,
): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>(
    `/tracks/${trackId}/availability`,
    payload,
  );
  return data;
}

export interface TrackAvailabilityBatchPayload {
  dates: string[];       // Array of YYYY-MM-DD
  startTime: string;     // HH:MM
  endTime: string;       // HH:MM
  capacity: number;
  rentalType: RentalType;
  pilotCategory: PilotCategory;
}

export interface TrackAvailabilityBatchResult {
  created: number;
  skipped: number;
  message: string;
}

/** HU-12: Crear múltiples slots de disponibilidad en lote (semana repetida). */
export async function createTrackAvailabilityBatch(
  trackId: number,
  payload: TrackAvailabilityBatchPayload,
): Promise<TrackAvailabilityBatchResult> {
  const { data } = await apiClient.post<TrackAvailabilityBatchResult>(
    `/tracks/${trackId}/availability/batch`,
    payload,
  );
  return data;
}

/** HU-12: Obtener disponibilidades de una pista. */
export async function getTrackAvailability(
  trackId: number,
): Promise<TrackAvailabilityItem[]> {
  const { data } = await apiClient.get<TrackAvailabilityItem[]>(
    `/tracks/${trackId}/availability`,
  );
  return data;
}

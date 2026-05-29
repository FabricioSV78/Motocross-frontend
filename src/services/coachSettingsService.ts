import { apiClient } from '@/services/apiClient';

// ── Types ─────────────────────────────────────────────────────────────────────

export type ClassType = 'HOURLY' | 'HALF_DAY' | 'FULL_DAY';
export type ClassMode = 'ONE_TO_ONE' | 'GROUP';

export interface TrackRef {
  trackId: number;
}

export interface ServiceItem {
  classType: ClassType;
  mode: ClassMode;
  price: number;
  maxStudents?: number;
}

export interface CoachSettingsPayload {
  tracks: TrackRef[];
  services: ServiceItem[];
}

export interface TrackRefResponse {
  trackId: number;
  trackName: string;
}

export interface ServiceItemResponse {
  id: number;
  classType: string;
  mode: string;
  price: number;
  maxStudents: number;
}

export interface CoachSettingsGetResponse {
  tracks: TrackRefResponse[];
  services: ServiceItemResponse[];
}

export interface AvailabilityPayload {
  trackId: number;
  date: string;       // YYYY-MM-DD
  startTime: string;  // HH:MM
  endTime: string;    // HH:MM
  classType: ClassType;
  mode: ClassMode;
}

export interface AvailabilityItem {
  id: number;
  trackId: number;
  trackName: string;
  date: string;
  startTime: string;
  endTime: string;
  classType: string;
  mode: string;
  maxStudents: number;
}

export interface AllTracksItem {
  id: number;
  name: string;
}

// ── API functions ─────────────────────────────────────────────────────────────

/** HU-10: Replace coach tracks and services. */
export async function updateCoachSettings(payload: CoachSettingsPayload): Promise<{ message: string }> {
  const { data } = await apiClient.put<{ message: string }>('/coach/settings', payload);
  return data;
}

/** HU-10: Get current coach settings. */
export async function getCoachSettings(): Promise<CoachSettingsGetResponse> {
  const { data } = await apiClient.get<CoachSettingsGetResponse>('/coach/settings');
  return data;
}

/** HU-13: Create an availability slot. */
export async function createAvailability(payload: AvailabilityPayload): Promise<{ message: string }> {
  const { data } = await apiClient.post<{ message: string }>('/coach/availability', payload);
  return data;
}

export interface AvailabilityBatchPayload {
  trackId: number;
  dates: string[];      // Array of YYYY-MM-DD
  startTime: string;   // HH:MM
  endTime: string;     // HH:MM
  classType: ClassType;
  mode: ClassMode;
}

export interface AvailabilityBatchResult {
  created: number;
  skipped: number;
  message: string;
}

/** HU-13: Create multiple availability slots in batch (repeated week). */
export async function createAvailabilityBatch(payload: AvailabilityBatchPayload): Promise<AvailabilityBatchResult> {
  const { data } = await apiClient.post<AvailabilityBatchResult>('/coach/availability/batch', payload);
  return data;
}

/** HU-13: Get all availability slots for the coach. */
export async function getAvailability(): Promise<AvailabilityItem[]> {
  const { data } = await apiClient.get<AvailabilityItem[]>('/coach/availability');
  return data;
}

/** Fetch all tracks from the platform (for selector). */
export async function getAllTracks(): Promise<AllTracksItem[]> {
  const { data } = await apiClient.get<AllTracksItem[]>('/tracks');
  return data;
}

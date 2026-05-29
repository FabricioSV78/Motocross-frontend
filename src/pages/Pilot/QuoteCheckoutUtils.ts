import type { AvailableSlot, CoachAvailableSlot } from '@/services/trackService';

export function toMinutes(value: string): number {
  const [h, m] = value.split(':').map(Number);
  return (h * 60) + m;
}

export function toHHMM(minutes: number): string {
  const h = Math.floor(minutes / 60).toString().padStart(2, '0');
  const m = (minutes % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
}

export function getCompatibleCoachSlots(
  trackSlot: AvailableSlot | undefined,
  coachSlots: CoachAvailableSlot[]
): CoachAvailableSlot[] {
  if (!trackSlot) return [];
  const trackStart = toMinutes(trackSlot.startTime);
  const trackEnd = toMinutes(trackSlot.endTime);
  return coachSlots.filter((slot) => {
    const coachStart = toMinutes(slot.startTime);
    const coachEnd = toMinutes(slot.endTime);
    return coachStart < trackEnd && coachEnd > trackStart;
  });
}

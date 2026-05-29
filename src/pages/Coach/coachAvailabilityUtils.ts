export const WEEKDAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

export const TODAY = new Date().toISOString().split('T')[0];

export function generateDates(from: string, to: string, weekdays: number[]): string[] {
  if (!from || !to || weekdays.length === 0) return [];
  const dates: string[] = [];
  const d = new Date(from + 'T12:00:00');
  const end = new Date(to + 'T12:00:00');
  if (d > end) return [];
  while (d <= end) {
    if (weekdays.includes(d.getDay())) {
      dates.push(d.toISOString().split('T')[0]);
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

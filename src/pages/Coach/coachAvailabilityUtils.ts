export const WEEKDAYS = [
  { label: 'Mon', value: 1 },
  { label: 'Tue', value: 2 },
  { label: 'Wed', value: 3 },
  { label: 'Thu', value: 4 },
  { label: 'Fri', value: 5 },
  { label: 'Sat', value: 6 },
  { label: 'Sun', value: 0 },
];

export function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export const TODAY = toDateInputValue(new Date());

export function generateDates(from: string, to: string, weekdays: number[]): string[] {
  if (!from || !to || weekdays.length === 0) return [];
  const dates: string[] = [];
  const d = new Date(from + 'T12:00:00');
  const end = new Date(to + 'T12:00:00');
  if (d > end) return [];
  while (d <= end) {
    if (weekdays.includes(d.getDay())) {
      dates.push(toDateInputValue(d));
    }
    d.setDate(d.getDate() + 1);
  }
  return dates;
}

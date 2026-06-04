import { useMemo } from 'react';
import Calendar from 'react-calendar';
import type { CalendarProps } from 'react-calendar';
import type { TileArgs, Value } from 'react-calendar/dist/shared/types.js';
import { clsx } from 'clsx';
import { FlowbiteIcon } from './FlowbiteIcon';

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function fromDateKey(value?: string | null) {
  if (!value) return null;
  return new Date(`${value}T12:00:00`);
}

interface AppCalendarProps
  extends Omit<CalendarProps, 'value' | 'onChange' | 'tileClassName' | 'tileContent'> {
  value?: string;
  onChange: (value: string) => void;
  activeDates?: string[];
  selectedDates?: string[];
  tileSummary?: Record<string, string | number>;
  minDateKey?: string;
  accent?: 'orange' | 'emerald';
  density?: 'compact' | 'comfortable' | 'spacious';
  className?: string;
}

export function AppCalendar({
  value,
  onChange,
  activeDates = [],
  selectedDates = [],
  tileSummary,
  minDateKey,
  accent = 'orange',
  density = 'comfortable',
  className,
  ...props
}: AppCalendarProps) {
  const activeDateSet = useMemo(() => new Set(activeDates), [activeDates]);
  const selectedDateSet = useMemo(() => new Set(selectedDates), [selectedDates]);
  const calendarValue = fromDateKey(value);

  function handleChange(nextValue: Value) {
    const nextDate = Array.isArray(nextValue) ? nextValue[0] : nextValue;
    if (nextDate instanceof Date) {
      onChange(toDateKey(nextDate));
    }
  }

  function tileClassName({ date, view }: TileArgs) {
    if (view !== 'month') return null;
    const dateKey = toDateKey(date);
    return clsx(
      activeDateSet.has(dateKey) && 'has-availability',
      selectedDateSet.has(dateKey) && 'is-soft-selected',
      accent === 'emerald' && 'calendar-accent-emerald'
    );
  }

  function tileContent({ date, view }: TileArgs) {
    if (view !== 'month') return null;
    const dateKey = toDateKey(date);
    const summary = tileSummary?.[dateKey];
    if (!summary) return null;
    return <span className="calendar-tile-summary">{summary}</span>;
  }

  return (
    <Calendar
      calendarType="gregory"
      className={clsx('motocross-calendar', `calendar-density-${density}`, className)}
      formatShortWeekday={(_, date) =>
        date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)
      }
      minDate={fromDateKey(minDateKey) ?? undefined}
      next2Label={null}
      nextLabel={<FlowbiteIcon name="chevron-right" className="h-4 w-4" />}
      onChange={handleChange}
      prev2Label={null}
      prevLabel={<FlowbiteIcon name="chevron-left" className="h-4 w-4" />}
      tileClassName={tileClassName}
      tileContent={tileContent}
      value={calendarValue}
      {...props}
    />
  );
}

interface DatePickerFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  minDateKey?: string;
  required?: boolean;
  hint?: string;
  activeDates?: string[];
  accent?: 'orange' | 'emerald';
  density?: 'compact' | 'comfortable';
}

interface DateRangePickerFieldProps {
  label: string;
  fromValue: string;
  toValue: string;
  onChange: (fromValue: string, toValue: string) => void;
  minDateKey?: string;
  required?: boolean;
  hint?: string;
  accent?: 'orange' | 'emerald';
  density?: 'compact' | 'comfortable';
}

export function DatePickerField({
  label,
  value,
  onChange,
  minDateKey,
  required,
  hint,
  activeDates,
  accent = 'orange',
  density = 'compact',
}: DatePickerFieldProps) {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
        {required && <span className="ml-1 text-orange-500">*</span>}
      </label>
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-3">
        <AppCalendar
          value={value}
          onChange={onChange}
          minDateKey={minDateKey}
          activeDates={activeDates}
          accent={accent}
          density={density}
        />
      </div>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

export function DateRangePickerField({
  label,
  fromValue,
  toValue,
  onChange,
  minDateKey,
  required,
  hint,
  accent = 'orange',
  density = 'compact',
}: DateRangePickerFieldProps) {
  const selectedRange = useMemo<Value>(() => {
    const fromDate = fromDateKey(fromValue);
    const toDate = fromDateKey(toValue);
    return [fromDate, toDate];
  }, [fromValue, toValue]);

  function handleRangeChange(nextValue: Value) {
    if (!Array.isArray(nextValue)) return;
    const [fromDate, toDate] = nextValue;
    onChange(fromDate ? toDateKey(fromDate) : '', toDate ? toDateKey(toDate) : '');
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
        {label}
        {required && <span className="ml-1 text-orange-500">*</span>}
      </label>
      <div className="rounded-2xl border border-slate-200 bg-white/90 p-2.5 shadow-sm dark:border-slate-700 dark:bg-slate-900/80 sm:p-3">
        <Calendar
          allowPartialRange
          calendarType="gregory"
          className={clsx(
            'motocross-calendar calendar-range',
            `calendar-density-${density}`,
            accent === 'emerald' && 'calendar-accent-emerald'
          )}
          formatShortWeekday={(_, date) =>
            date.toLocaleDateString(undefined, { weekday: 'short' }).slice(0, 2)
          }
          minDate={fromDateKey(minDateKey) ?? undefined}
          next2Label={null}
          nextLabel={<FlowbiteIcon name="chevron-right" className="h-4 w-4" />}
          onChange={handleRangeChange}
          prev2Label={null}
          prevLabel={<FlowbiteIcon name="chevron-left" className="h-4 w-4" />}
          selectRange
          value={selectedRange}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <RangeValue label="From" value={fromValue} accent={accent} />
        <RangeValue label="To" value={toValue} accent={accent} />
      </div>
      {hint && <p className="text-xs text-slate-500 dark:text-slate-400">{hint}</p>}
    </div>
  );
}

function RangeValue({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: 'orange' | 'emerald';
}) {
  const accentClass =
    accent === 'emerald'
      ? 'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-200'
      : 'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/20 dark:bg-orange-500/10 dark:text-orange-200';

  return (
    <div className={clsx('rounded-xl border px-3 py-2', value ? accentClass : 'border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-800/70 dark:text-slate-400')}>
      <p className="text-[10px] font-black uppercase tracking-[0.16em] opacity-75">{label}</p>
      <p className="mt-0.5 text-xs font-bold">{value || 'Select'}</p>
    </div>
  );
}

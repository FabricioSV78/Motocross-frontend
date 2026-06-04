import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { Link, useParams } from 'react-router-dom';
import { format, parseISO } from 'date-fns';
import {
  createTrackAvailability,
  createTrackAvailabilityBatch,
  getTrackAvailability,
  getTrackById,
} from '@/services/trackService';
import type {
  PilotCategory,
  RentalType,
  TrackAvailabilityItem,
  TrackDetail,
} from '@/services/trackService';
import { Button, DatePickerField, DateRangePickerField } from '@/components/ui';
import { ROUTES } from '@/router/routes';
import { TrackAvailabilityCalendar } from './TrackAvailabilityCalendar';
import { TODAY, generateDates } from './trackAvailabilityUtils';

const RENTAL_TYPE_OPTIONS: Array<{
  value: RentalType;
  label: string;
  description: string;
}> = [
  {
    value: 'HALF_DAY',
    label: 'Half day',
    description: 'Best for a morning or afternoon session.',
  },
  {
    value: 'FULL_DAY',
    label: 'Full day',
    description: 'For longer track availability.',
  },
];

const PILOT_CATEGORY_OPTIONS: Array<{
  value: PilotCategory;
  label: string;
  description: string;
}> = [
  {
    value: 'JUNIOR',
    label: 'Junior',
    description: 'Young riders only.',
  },
  {
    value: 'SENIOR',
    label: 'Senior',
    description: 'Adult riders only.',
  },
  {
    value: 'BOTH',
    label: 'All riders',
    description: 'Visible to every rider.',
  },
];

const TIME_PRESETS = [
  { label: 'Morning', start: '08:00', end: '12:00', rentalType: 'HALF_DAY' as const },
  { label: 'Afternoon', start: '13:00', end: '17:00', rentalType: 'HALF_DAY' as const },
  { label: 'Full day', start: '09:00', end: '17:00', rentalType: 'FULL_DAY' as const },
];

type Mode = 'single' | 'weekly';
type WizardStep = 1 | 2 | 3;

export function TrackAvailabilityPage() {
  const { id } = useParams<{ id: string }>();
  const trackId = Number(id);

  const [track, setTrack] = useState<TrackDetail | null>(null);
  const [slots, setSlots] = useState<TrackAvailabilityItem[]>([]);
  const [loadingPage, setLoadingPage] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mode, setMode] = useState<Mode>('single');
  const [activeStep, setActiveStep] = useState<WizardStep>(1);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [date, setDate] = useState(TODAY);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [capacity, setCapacity] = useState('');
  const [rentalType, setRentalType] = useState<RentalType>('HALF_DAY');
  const [pilotCategory, setPilotCategory] = useState<PilotCategory>('BOTH');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);

  const previewDates = useMemo(
    () => (mode === 'weekly' ? generateDates(fromDate, toDate) : []),
    [fromDate, mode, toDate]
  );

  const parsedCapacity = Number.parseInt(capacity, 10);
  const isCapacityValid = Number.isFinite(parsedCapacity) && parsedCapacity > 0;
  const hasValidTimeRange = Boolean(startTime && endTime && startTime < endTime);
  const hasValidDateSelection =
    mode === 'single' ? Boolean(date) : Boolean(fromDate && toDate && previewDates.length > 0);
  const canOpenStepTwo = hasValidDateSelection;
  const canOpenStepThree = hasValidDateSelection && hasValidTimeRange;
  const isSubmitDisabled =
    saving || !hasValidDateSelection || !hasValidTimeRange || !isCapacityValid || !reviewConfirmed;

  const upcomingSlotCount = slots.length;
  const nextOpenDate = slots[0]?.date ?? null;
  const selectedDaySlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [selectedDate, slots]
  );

  useEffect(() => {
    if (!Number.isFinite(trackId) || trackId <= 0) {
      setLoadError('This track could not be identified.');
      setLoadingPage(false);
      setLoadingSlots(false);
      return;
    }

    let active = true;

    async function loadPage() {
      setLoadingPage(true);
      setLoadingSlots(true);
      setLoadError(null);

      try {
        const [trackData, slotData] = await Promise.all([
          getTrackById(trackId),
          getTrackAvailability(trackId),
        ]);

        if (!active) return;

        setTrack(trackData);
        setSlots(slotData);
        setCapacity((current) => current || String(trackData.capacity));
      } catch {
        if (!active) return;
        setLoadError('We could not load this track calendar.');
      } finally {
        if (active) {
          setLoadingPage(false);
          setLoadingSlots(false);
        }
      }
    }

    void loadPage();

    return () => {
      active = false;
    };
  }, [trackId]);

  async function reloadSlots() {
    if (!Number.isFinite(trackId) || trackId <= 0) return;

    setLoadingSlots(true);
    try {
      const slotData = await getTrackAvailability(trackId);
      setSlots(slotData);
    } catch {
      setLoadError('We could not refresh the published availability.');
    } finally {
      setLoadingSlots(false);
    }
  }

  function openRegisterModal() {
    setIsModalOpen(true);
    setActiveStep(1);
    setError(null);
    setSuccess(null);
    setReviewConfirmed(false);

    if (mode === 'single') {
      setDate(selectedDate || TODAY);
    }
  }

  function closeRegisterModal() {
    if (saving) return;
    setIsModalOpen(false);
    setError(null);
    setReviewConfirmed(false);
  }

  function handleModeChange(nextMode: Mode) {
    setMode(nextMode);
    setActiveStep(1);
    setError(null);
    setSuccess(null);
    setReviewConfirmed(false);

    if (nextMode === 'single' && !date) {
      setDate(selectedDate || TODAY);
    }
  }

  function handleCalendarSelect(nextDate: string) {
    setSelectedDate(nextDate);

    if (mode === 'single') {
      setDate(nextDate);
    }
  }

  function applyTimePreset(start: string, end: string, presetRentalType: RentalType) {
    setStartTime(start);
    setEndTime(end);
    setRentalType(presetRentalType);
    setReviewConfirmed(false);
  }

  function handleStepChange(step: WizardStep) {
    if (step === 1) {
      setActiveStep(1);
      return;
    }

    if (step === 2 && canOpenStepTwo) {
      setActiveStep(2);
      return;
    }

    if (step === 3 && canOpenStepThree) {
      setActiveStep(3);
      setReviewConfirmed(false);
    }
  }

  function handleContinue() {
    if (activeStep === 1 && canOpenStepTwo) {
      setActiveStep(2);
      return;
    }

    if (activeStep === 2 && canOpenStepThree) {
      setActiveStep(3);
      setReviewConfirmed(false);
    }
  }

  function resetAfterSave() {
    setStartTime('');
    setEndTime('');
    setError(null);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeStep !== 3) return;

    setError(null);
    setSuccess(null);

    if (!hasValidDateSelection) {
      setError('Choose when this availability should be open.');
      setActiveStep(1);
      return;
    }

    if (!hasValidTimeRange) {
      setError('Choose a valid time range before publishing.');
      setActiveStep(2);
      return;
    }

    if (!isCapacityValid) {
      setError('Capacity must be greater than 0.');
      setActiveStep(3);
      return;
    }

    if (!reviewConfirmed) {
      setError('Review the step 3 options and confirm before publishing.');
      setActiveStep(3);
      return;
    }

    setSaving(true);

    try {
      if (mode === 'single') {
        const response = await createTrackAvailability(trackId, {
          date,
          startTime,
          endTime,
          capacity: parsedCapacity,
          rentalType,
          pilotCategory,
        });

        setSelectedDate(date);
        setSuccess(response.message);
      } else {
        const response = await createTrackAvailabilityBatch(trackId, {
          dates: previewDates,
          startTime,
          endTime,
          capacity: parsedCapacity,
          rentalType,
          pilotCategory,
        });

        setSuccess(response.message);
      }

      resetAfterSave();
      await reloadSlots();
      setIsModalOpen(false);
    } catch (err: unknown) {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'We could not publish this availability.';

      setError(
        detail.includes('overlap')
          ? 'That time overlaps with existing availability. Review the calendar or choose another time.'
          : detail
      );
    } finally {
      setSaving(false);
    }
  }

  const reviewText = useMemo(() => {
    const riderLabel =
      pilotCategory === 'BOTH'
        ? 'all riders'
        : pilotCategory === 'JUNIOR'
          ? 'junior riders'
          : 'senior riders';

    const durationLabel = rentalType === 'FULL_DAY' ? 'full day' : 'half day';

    if (mode === 'single') {
      const readableDate = date ? format(parseISO(`${date}T00:00:00`), 'EEE, MMM d') : 'this day';
      return `${readableDate} - ${startTime || '--:--'} to ${endTime || '--:--'} - ${durationLabel} - ${capacity || '--'} riders - ${riderLabel}`;
    }

    if (previewDates.length === 0) {
      return 'Choose a date range to preview the schedule.';
    }

    return `${previewDates.length} days - ${startTime || '--:--'} to ${endTime || '--:--'} - ${durationLabel} - ${capacity || '--'} riders - ${riderLabel}`;
  }, [capacity, date, endTime, mode, pilotCategory, previewDates.length, rentalType, startTime]);

  if (loadingPage) {
    return <TrackAvailabilitySkeleton />;
  }

  return (
    <div className="relative left-1/2 -my-8 flex h-[calc(100svh-4rem)] min-h-[720px] w-screen -translate-x-1/2 flex-col gap-3 overflow-hidden bg-slate-100 px-4 py-4 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 xl:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">
            {track ? `${track.name} availability` : 'Track availability'}
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Full calendar view for reviewing and creating track availability without losing context.
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Link to={ROUTES.COMPANY_TRACKS}>
            <Button variant="outline" size="sm">
              Back to tracks
            </Button>
          </Link>
          <Button type="button" size="sm" onClick={openRegisterModal}>
            Register
          </Button>
        </div>
      </div>

      {loadError ? (
        <section className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-700 shadow-sm dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200">
          <h2 className="text-lg font-semibold text-red-800 dark:text-red-100">Calendar unavailable</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-200">
            {loadError} Try again to continue.
          </p>
          <div className="mt-4">
            <Button variant="outline" size="sm" onClick={() => window.location.reload()}>
              Retry
            </Button>
          </div>
        </section>
      ) : (
        <>
          <section className="flex flex-wrap items-center gap-2">
            <FactChip label={track?.capacity ? `${track.capacity} riders default capacity` : 'Track ready'} />
            <FactChip label={`${upcomingSlotCount} published slot${upcomingSlotCount === 1 ? '' : 's'}`} />
            <FactChip
              label={
                nextOpenDate
                  ? `Next opening ${format(parseISO(`${nextOpenDate}T00:00:00`), 'MMM d')}`
                  : 'No openings published'
              }
            />
            <FactChip label={`${selectedDaySlots.length} slot${selectedDaySlots.length === 1 ? '' : 's'} on selected day`} />
          </section>

          <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
            <TrackAvailabilityCalendar
              slots={slots}
              loading={loadingSlots}
              selectedDate={selectedDate}
              onSelectDate={handleCalendarSelect}
            />
            <SelectedDayPanel date={selectedDate} slots={selectedDaySlots} />
          </div>
        </>
      )}

      {isModalOpen ? (
        <RegisterAvailabilityModal
          activeStep={activeStep}
          canOpenStepTwo={canOpenStepTwo}
          canOpenStepThree={canOpenStepThree}
          capacity={capacity}
          date={date}
          endTime={endTime}
          error={error}
          fromDate={fromDate}
          hasValidDateSelection={hasValidDateSelection}
          hasValidTimeRange={hasValidTimeRange}
          isSubmitDisabled={isSubmitDisabled}
          mode={mode}
          pilotCategory={pilotCategory}
          previewDates={previewDates}
          rentalType={rentalType}
          reviewConfirmed={reviewConfirmed}
          reviewText={reviewText}
          saving={saving}
          selectedDate={selectedDate}
          selectedDaySlots={selectedDaySlots}
          startTime={startTime}
          success={success}
          toDate={toDate}
          trackCapacity={track?.capacity}
          onApplyPreset={applyTimePreset}
          onClose={closeRegisterModal}
          onContinue={handleContinue}
          onFieldDateChange={(value) => {
            setDate(value);
            setSelectedDate(value);
          }}
          onFromDateChange={setFromDate}
          onModeChange={handleModeChange}
          onPilotCategoryChange={(value) => {
            setPilotCategory(value);
            setReviewConfirmed(false);
          }}
          onRentalTypeChange={(value) => {
            setRentalType(value);
            setReviewConfirmed(false);
          }}
          onReviewConfirmedChange={setReviewConfirmed}
          onSetActiveStep={handleStepChange}
          onSetCapacity={(value) => {
            setCapacity(value);
            setReviewConfirmed(false);
          }}
          onSetEndTime={(value) => {
            setEndTime(value);
            setReviewConfirmed(false);
          }}
          onSetStartTime={(value) => {
            setStartTime(value);
            setReviewConfirmed(false);
          }}
          onSubmit={handleSubmit}
          onToDateChange={setToDate}
        />
      ) : null}
    </div>
  );
}

function RegisterAvailabilityModal({
  activeStep,
  canOpenStepTwo,
  canOpenStepThree,
  capacity,
  date,
  endTime,
  error,
  fromDate,
  hasValidDateSelection,
  hasValidTimeRange,
  isSubmitDisabled,
  mode,
  pilotCategory,
  previewDates,
  rentalType,
  reviewConfirmed,
  reviewText,
  saving,
  selectedDate,
  selectedDaySlots,
  startTime,
  success,
  toDate,
  trackCapacity,
  onApplyPreset,
  onClose,
  onContinue,
  onFieldDateChange,
  onFromDateChange,
  onModeChange,
  onPilotCategoryChange,
  onRentalTypeChange,
  onReviewConfirmedChange,
  onSetActiveStep,
  onSetCapacity,
  onSetEndTime,
  onSetStartTime,
  onSubmit,
  onToDateChange,
}: {
  activeStep: WizardStep;
  canOpenStepTwo: boolean;
  canOpenStepThree: boolean;
  capacity: string;
  date: string;
  endTime: string;
  error: string | null;
  fromDate: string;
  hasValidDateSelection: boolean;
  hasValidTimeRange: boolean;
  isSubmitDisabled: boolean;
  mode: Mode;
  pilotCategory: PilotCategory;
  previewDates: string[];
  rentalType: RentalType;
  reviewConfirmed: boolean;
  reviewText: string;
  saving: boolean;
  selectedDate: string;
  selectedDaySlots: TrackAvailabilityItem[];
  startTime: string;
  success: string | null;
  toDate: string;
  trackCapacity?: number;
  onApplyPreset: (start: string, end: string, rentalType: RentalType) => void;
  onClose: () => void;
  onContinue: () => void;
  onFieldDateChange: (value: string) => void;
  onFromDateChange: (value: string) => void;
  onModeChange: (mode: Mode) => void;
  onPilotCategoryChange: (category: PilotCategory) => void;
  onRentalTypeChange: (rentalType: RentalType) => void;
  onReviewConfirmedChange: (value: boolean) => void;
  onSetActiveStep: (step: WizardStep) => void;
  onSetCapacity: (value: string) => void;
  onSetEndTime: (value: string) => void;
  onSetStartTime: (value: string) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onToDateChange: (value: string) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4 py-4 backdrop-blur-sm">
      <form
        onSubmit={onSubmit}
        className="flex h-[min(720px,calc(100vh-32px))] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white text-slate-950 shadow-2xl shadow-slate-950/20 dark:border-slate-700 dark:bg-slate-900 dark:text-white"
      >
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-4 dark:border-slate-700">
          <div>
            <p className="text-xs font-semibold uppercase text-orange-300">Add availability</p>
            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Create a track availability slot</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              It only publishes when you confirm on step 3.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white"
          >
            Close
          </button>
        </div>

        <div className="grid min-h-0 flex-1 md:grid-cols-[230px_minmax(0,1fr)]">
          <aside className="border-b border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-900/80 md:border-b-0 md:border-r">
            <div className="grid grid-cols-3 gap-2 md:grid-cols-1">
              <WizardStepButton
                step={1}
                title="Setup"
                active={activeStep === 1}
                completed={hasValidDateSelection}
                onClick={() => onSetActiveStep(1)}
              />
              <WizardStepButton
                step={2}
                title="Time"
                active={activeStep === 2}
                completed={hasValidTimeRange}
                disabled={!canOpenStepTwo}
                onClick={() => onSetActiveStep(2)}
              />
              <WizardStepButton
                step={3}
                title="Review"
                active={activeStep === 3}
                completed={reviewConfirmed}
                disabled={!canOpenStepThree}
                onClick={() => onSetActiveStep(3)}
              />
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Current selection</p>
              <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                {format(parseISO(`${selectedDate}T00:00:00`), 'EEE, MMM d')}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {selectedDaySlots.length} existing slot{selectedDaySlots.length === 1 ? '' : 's'}
              </p>
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-5">
            {activeStep === 1 ? (
              <StepPanel title="Choose when the track is open">
                <div className="rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="grid grid-cols-2 gap-1">
                    {([
                      { value: 'single', label: 'One date' },
                      { value: 'weekly', label: 'Repeat days' },
                    ] as const).map((option) => (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onModeChange(option.value)}
                        className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                          mode === option.value
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {mode === 'single' ? (
                  <DatePickerField
                    label="Date"
                    required
                    value={date}
                    onChange={onFieldDateChange}
                    minDateKey={TODAY}
                  />
                ) : (
                  <div className="space-y-4">
                    <DateRangePickerField
                      label="Date range"
                      required
                      fromValue={fromDate}
                      toValue={toDate}
                      minDateKey={TODAY}
                      onChange={(nextFromDate, nextToDate) => {
                        onFromDateChange(nextFromDate);
                        onToDateChange(nextToDate);
                      }}
                      hint="Select the first day, then the last day. The range will be highlighted."
                    />

                    <div className="rounded-xl border border-orange-200 bg-orange-50 p-3 dark:border-orange-500/20 dark:bg-orange-500/10">
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">
                        {previewDates.length > 0
                          ? `${previewDates.length} selected date${previewDates.length === 1 ? '' : 's'}`
                          : 'No dates selected yet'}
                      </p>
                      <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                        {previewDates.length > 0
                          ? previewDates
                              .slice(0, 5)
                              .map((value) => format(parseISO(`${value}T00:00:00`), 'EEE, MMM d'))
                              .join(' / ')
                          : 'Choose a start and end date.'}
                      </p>
                    </div>
                  </div>
                )}
              </StepPanel>
            ) : null}

            {activeStep === 2 ? (
              <StepPanel title="Define the time window">
                <div className="grid gap-2 sm:grid-cols-3">
                  {TIME_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => onApplyPreset(preset.start, preset.end, preset.rentalType)}
                      className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-orange-500/50"
                    >
                      <p className="text-sm font-semibold text-slate-950 dark:text-white">{preset.label}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {preset.start} - {preset.end}
                      </p>
                    </button>
                  ))}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    Start time
                    <input
                      type="time"
                      value={startTime}
                      onChange={(event) => onSetStartTime(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-950 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
                    End time
                    <input
                      type="time"
                      value={endTime}
                      onChange={(event) => onSetEndTime(event.target.value)}
                      className="mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-950 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
                    />
                  </label>
                </div>

                <div className="grid gap-2 sm:grid-cols-2">
                  {RENTAL_TYPE_OPTIONS.map((option) => {
                    const selected = rentalType === option.value;
                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() => onRentalTypeChange(option.value)}
                        className={`rounded-lg border px-3 py-3 text-left transition ${
                          selected
                            ? 'border-orange-500/50 bg-orange-500/10'
                            : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-orange-500/50'
                        }`}
                      >
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">{option.label}</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                      </button>
                    );
                  })}
                </div>
              </StepPanel>
            ) : null}

            {activeStep === 3 ? (
              <StepPanel title="Options and confirmation">
                <div className="grid gap-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)]">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800/80">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-950 dark:text-white">Capacity</p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Rider limit for this slot.</p>
                      </div>
                      {trackCapacity ? (
                        <button
                          type="button"
                          onClick={() => onSetCapacity(String(trackCapacity))}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-slate-950 dark:border-slate-700 dark:text-slate-300 dark:hover:text-white"
                        >
                          Use {trackCapacity}
                        </button>
                      ) : null}
                    </div>
                    <input
                      type="number"
                      min="1"
                      value={capacity}
                      onChange={(event) => onSetCapacity(event.target.value)}
                      placeholder="20"
                      className="mt-3 h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-slate-950 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400"
                    />
                  </div>

                  <div className="grid gap-2">
                    {PILOT_CATEGORY_OPTIONS.map((option) => {
                      const selected = pilotCategory === option.value;
                      return (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() => onPilotCategoryChange(option.value)}
                          className={`rounded-lg border px-3 py-3 text-left transition ${
                            selected
                              ? 'border-orange-500/50 bg-orange-500/10'
                              : 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-orange-500/50'
                          }`}
                        >
                          <p className="text-sm font-semibold text-slate-950 dark:text-white">{option.label}</p>
                          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{option.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
                  <p className="text-xs font-semibold uppercase text-orange-300">Review</p>
                  <p className="mt-2 text-sm font-medium text-slate-800 dark:text-white">{reviewText}</p>
                </div>

                <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/10">
                  <input
                    type="checkbox"
                    checked={reviewConfirmed}
                    onChange={(event) => onReviewConfirmedChange(event.target.checked)}
                    className="mt-1 h-4 w-4 accent-orange-500"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-slate-950 dark:text-white">
                      I reviewed the options and want to publish this availability.
                    </span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      The publish button will unlock after this confirmation.
                    </span>
                  </span>
                </label>
              </StepPanel>
            ) : null}
          </main>
        </div>

        {error ? (
          <div className="mx-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700 dark:border-red-500/25 dark:bg-red-500/10 dark:text-red-200">
            {error}
          </div>
        ) : null}

        {success ? (
          <div className="mx-5 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 dark:border-emerald-500/25 dark:bg-emerald-500/10 dark:text-emerald-200">
            {success}
          </div>
        ) : null}

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {activeStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onSetActiveStep((activeStep - 1) as WizardStep)}
              >
                Back
              </Button>
            ) : null}

            {activeStep < 3 ? (
              <Button
                type="button"
                onClick={onContinue}
                disabled={
                  (activeStep === 1 && !canOpenStepTwo) || (activeStep === 2 && !canOpenStepThree)
                }
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" isLoading={saving} disabled={isSubmitDisabled}>
                Publish availability
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function StepPanel({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <section>
      <h3 className="text-lg font-semibold text-slate-950 dark:text-white">{title}</h3>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function WizardStepButton({
  title,
  step,
  active,
  completed,
  disabled,
  onClick,
}: {
  title: string;
  step: number;
  active: boolean;
  completed?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`rounded-lg border px-3 py-3 text-left transition ${
        active
          ? 'border-orange-500/40 bg-orange-500/10'
          : completed
            ? 'border-orange-300 bg-orange-50 text-slate-950 dark:border-slate-600 dark:bg-slate-800 dark:text-white'
            : 'border-slate-200 bg-white text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300'
      } ${disabled ? 'cursor-not-allowed opacity-50' : 'hover:border-orange-300 hover:text-slate-950 dark:hover:border-orange-500/50 dark:hover:text-white'}`}
    >
      <p className="mt-2 text-[10px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-200/80">Step {step}</p>
      <p className="mt-1 text-sm font-semibold text-current">{title}</p>
    </button>
  );
}

function FactChip({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      {label}
    </div>
  );
}

function SelectedDayPanel({
  date,
  slots,
}: {
  date: string;
  slots: TrackAvailabilityItem[];
}) {
  const firstSlot = slots[0];
  const rentalTypes = new Set(slots.map((slot) => slot.rentalType)).size;
  const categories = new Set(slots.map((slot) => slot.pilotCategory)).size;

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
      <div className="border-b border-slate-200 bg-white/90 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/70">
        <p className="text-xs font-semibold uppercase text-orange-300">Selected day</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">
          {format(parseISO(`${date}T00:00:00`), 'EEEE, MMM d')}
        </h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <MiniStat label="Slots" value={String(slots.length)} />
          <MiniStat label="Windows" value={String(rentalTypes)} />
          <MiniStat label="Categories" value={String(categories)} />
        </div>
        {firstSlot ? (
          <div className="mt-3 rounded-xl border border-orange-200 bg-orange-50 px-3 py-2 dark:border-orange-500/25 dark:bg-orange-500/10">
            <p className="text-xs font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-200">First slot</p>
            <p className="mt-1 text-sm font-semibold text-slate-950 dark:text-white">
              {firstSlot.startTime} - {firstSlot.endTime}
            </p>
          </div>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 space-y-2 overflow-y-auto p-4">
        {slots.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center dark:border-slate-600 dark:bg-slate-800/70">
            <p className="text-sm font-semibold text-slate-950 dark:text-white">No slots on this day</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use the primary action above to register availability.</p>
          </div>
        ) : (
          slots.map((slot) => (
            <article
              key={slot.id}
              className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-orange-500/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    {slot.startTime} - {slot.endTime}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">
                    {formatPilotCategory(slot.pilotCategory)}
                  </p>
                </div>
                <span className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-0">
                  {formatRentalType(slot.rentalType)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">Capacity {slot.capacity}</p>
            </article>
          ))
        )}
      </div>
    </aside>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-2 py-2 text-center dark:border-slate-700 dark:bg-slate-800/80">
      <p className="text-base font-bold text-slate-950 dark:text-white">{value}</p>
      <p className="mt-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{label}</p>
    </div>
  );
}

function TrackAvailabilitySkeleton() {
  return (
    <div className="relative left-1/2 -my-8 flex h-[calc(100svh-4rem)] min-h-[720px] w-screen -translate-x-1/2 flex-col gap-3 overflow-hidden bg-slate-100 px-4 py-4 dark:bg-slate-950 sm:px-6 xl:px-8">
      <div className="flex items-end justify-between gap-3">
        <div className="space-y-3">
          <div className="h-9 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
          <div className="h-5 w-96 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        </div>
        <div className="h-9 w-32 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      </div>

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div key={index} className="h-10 w-52 animate-pulse rounded-full bg-slate-200 dark:bg-slate-900/80" />
        ))}
      </div>

      <div className="h-[calc(100vh-175px)] min-h-[560px] animate-pulse rounded-2xl bg-slate-200 dark:bg-slate-900/80" />
    </div>
  );
}

function formatRentalType(value: RentalType) {
  return RENTAL_TYPE_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

function formatPilotCategory(value: PilotCategory) {
  return PILOT_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

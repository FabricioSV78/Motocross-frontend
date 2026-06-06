import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  createAvailability,
  createAvailabilityBatch,
  getAvailability,
  getCoachSettings,
  type AvailabilityItem,
  type TrackRefResponse,
  type ServiceItemResponse,
  type ClassType,
  type ClassMode,
} from '@/services/coachSettingsService';
import {
  getAvailableSlotsForDate,
  type AvailableSlot,
} from '@/services/trackService';
import { LoadingSpinner } from '@/components/common';
import { Button, DatePickerField, DateRangePickerField, SelectField } from '@/components/ui';
import { ROUTES } from '@/router/routes';
import { CoachAvailabilityCalendar } from './CoachAvailabilityCalendar';
import { TODAY, generateDates } from './coachAvailabilityUtils';

type Mode = 'single' | 'weekly';
type WizardStep = 1 | 2 | 3;
type TrackSlotsByDate = Record<string, AvailableSlot[]>;

interface AvailabilityFormState {
  mode: Mode;
  trackId: string;
  selectedServiceId: string;
  date: string;
  fromDate: string;
  toDate: string;
  startTime: string;
  endTime: string;
}

const EMPTY_FORM: AvailabilityFormState = {
  mode: 'single',
  trackId: '',
  selectedServiceId: '',
  date: TODAY,
  fromDate: '',
  toDate: '',
  startTime: '',
  endTime: '',
};

const COACH_CLASS_MODE: ClassMode = 'ONE_TO_ONE';

export function CoachAvailabilityPage() {
  const [coachTracks, setCoachTracks] = useState<TrackRefResponse[]>([]);
  const [coachServices, setCoachServices] = useState<ServiceItemResponse[]>([]);
  const [slots, setSlots] = useState<AvailabilityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [trackSlots, setTrackSlots] = useState<AvailableSlot[]>([]);
  const [trackSlotsLoading, setTrackSlotsLoading] = useState(false);
  const [weeklyTrackSlots, setWeeklyTrackSlots] = useState<TrackSlotsByDate>({});
  const [weeklyTrackSlotsLoading, setWeeklyTrackSlotsLoading] = useState(false);
  const [selectedDate, setSelectedDate] = useState(TODAY);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeStep, setActiveStep] = useState<WizardStep>(1);
  const [reviewConfirmed, setReviewConfirmed] = useState(false);
  const [form, setForm] = useState<AvailabilityFormState>(EMPTY_FORM);

  const selectedService = coachServices.find((service) => String(service.id) === form.selectedServiceId);
  const previewDates = form.mode === 'weekly'
    ? generateDates(form.fromDate, form.toDate)
    : [];
  const selectedDaySlots = useMemo(
    () =>
      slots
        .filter((slot) => slot.date === selectedDate)
        .sort((a, b) => a.startTime.localeCompare(b.startTime)),
    [selectedDate, slots]
  );
  const matchingTrackSlot = selectedService
    ? trackSlots.find(
        (slot) =>
          form.startTime >= slot.startTime &&
          form.endTime <= slot.endTime &&
          serviceFitsTrackSlot(selectedService, slot)
      )
    : undefined;
  const matchingWeeklyDates =
    form.startTime && form.endTime && selectedService
      ? previewDates.filter((date) =>
          (weeklyTrackSlots[date] ?? []).some(
            (slot) =>
              form.startTime >= slot.startTime &&
              form.endTime <= slot.endTime &&
              serviceFitsTrackSlot(selectedService, slot)
          )
        )
      : [];
  const stepOneComplete =
    Boolean(form.trackId && form.selectedServiceId) &&
    (form.mode === 'single'
      ? Boolean(form.date)
      : Boolean(form.fromDate && form.toDate && previewDates.length > 0));
  const stepTwoComplete =
    Boolean(form.startTime && form.endTime && form.startTime < form.endTime) &&
    (form.mode === 'single'
      ? Boolean(matchingTrackSlot)
      : matchingWeeklyDates.length > 0);
  const canPublish = stepOneComplete && stepTwoComplete && reviewConfirmed && !saving;
  const nextTrackDate = slots[0]?.date ?? null;

  const loadData = () =>
    Promise.all([getCoachSettings(), getAvailability()])
      .then(([settings, availability]) => {
        const oneToOneServices = settings.services.filter((service) => service.mode === 'ONE_TO_ONE');
        const oneToOneAvailability = availability.filter((slot) => slot.mode === 'ONE_TO_ONE');
        setCoachTracks(settings.tracks);
        setCoachServices(oneToOneServices);
        setSlots(oneToOneAvailability);
        setForm((current) => ({
          ...current,
          trackId: current.trackId || (settings.tracks[0] ? String(settings.tracks[0].trackId) : ''),
          selectedServiceId:
            current.selectedServiceId || (oneToOneServices[0] ? String(oneToOneServices[0].id) : ''),
        }));
      })
      .catch(() => setError('Availability could not be loaded.'))
      .finally(() => setLoading(false));

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (form.mode !== 'single' || !form.trackId || !form.date) {
      setTrackSlots([]);
      setTrackSlotsLoading(false);
      return;
    }

    let active = true;
    setTrackSlotsLoading(true);
    getAvailableSlotsForDate(parseInt(form.trackId, 10), form.date)
      .then((slotsForDate) => {
        if (active) setTrackSlots(slotsForDate);
      })
      .catch(() => {
        if (active) setTrackSlots([]);
      })
      .finally(() => {
        if (active) setTrackSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.mode, form.trackId, form.date]);

  useEffect(() => {
    const dates = generateDates(form.fromDate, form.toDate);
    if (form.mode !== 'weekly' || !form.trackId || dates.length === 0) {
      setWeeklyTrackSlots({});
      setWeeklyTrackSlotsLoading(false);
      return;
    }

    let active = true;
    setWeeklyTrackSlotsLoading(true);
    Promise.all(
      dates.slice(0, 90).map((date) =>
        getAvailableSlotsForDate(parseInt(form.trackId, 10), date)
          .then((slotsForDate) => [date, slotsForDate] as const)
          .catch(() => [date, []] as const)
      )
    )
      .then((entries) => {
        if (!active) return;
        setWeeklyTrackSlots(Object.fromEntries(entries));
      })
      .finally(() => {
        if (active) setWeeklyTrackSlotsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [form.mode, form.trackId, form.fromDate, form.toDate]);

  function setField<K extends keyof AvailabilityFormState>(key: K, value: AvailabilityFormState[K]) {
    setForm((current) => ({ ...current, [key]: value }));
    setSuccess(null);
    setError(null);
    setReviewConfirmed(false);
  }

  function openModal() {
    setIsModalOpen(true);
    setActiveStep(1);
    setReviewConfirmed(false);
    setError(null);
    setSuccess(null);
    setForm((current) => ({
      ...current,
      date: selectedDate || current.date || TODAY,
      trackId: current.trackId || (coachTracks[0] ? String(coachTracks[0].trackId) : ''),
      selectedServiceId: current.selectedServiceId || (coachServices[0] ? String(coachServices[0].id) : ''),
    }));
  }

  function closeModal() {
    if (saving) return;
    setIsModalOpen(false);
    setError(null);
    setReviewConfirmed(false);
  }

  function useTrackSlot(slot: AvailableSlot) {
    setForm((current) => ({
      ...current,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
    setReviewConfirmed(false);
    setError(null);
  }

  function continueToNextStep() {
    if (activeStep === 1 && stepOneComplete) {
      setActiveStep(2);
      return;
    }
    if (activeStep === 2 && stepTwoComplete) {
      setActiveStep(3);
      setReviewConfirmed(false);
    }
  }

  function goToStep(step: WizardStep) {
    if (step === 1) {
      setActiveStep(1);
      return;
    }
    if (step === 2 && stepOneComplete) {
      setActiveStep(2);
      return;
    }
    if (step === 3 && stepTwoComplete) {
      setActiveStep(3);
      setReviewConfirmed(false);
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (activeStep !== 3) return;
    setError(null);
    setSuccess(null);

    if (!selectedService) {
      setError('Select a service before publishing.');
      setActiveStep(1);
      return;
    }
    if (!stepOneComplete) {
      setError('Complete the date and service step first.');
      setActiveStep(1);
      return;
    }
    if (!stepTwoComplete) {
      setError('Choose a coach time that fits inside a track window.');
      setActiveStep(2);
      return;
    }
    if (!reviewConfirmed) {
      setError('Review and confirm step 3 before publishing.');
      return;
    }

    setSaving(true);
    try {
      if (form.mode === 'single') {
        const response = await createAvailability({
          trackId: parseInt(form.trackId, 10),
          date: form.date,
          startTime: form.startTime,
          endTime: form.endTime,
          classType: selectedService.classType as ClassType,
          mode: COACH_CLASS_MODE,
        });
        setSuccess(response.message);
        setSelectedDate(form.date);
      } else {
        if (previewDates.length > 90) {
          setError('Choose 90 dates or fewer.');
          setSaving(false);
          return;
        }
        const response = await createAvailabilityBatch({
          trackId: parseInt(form.trackId, 10),
          dates: matchingWeeklyDates,
          startTime: form.startTime,
          endTime: form.endTime,
          classType: selectedService.classType as ClassType,
          mode: COACH_CLASS_MODE,
        });
        setSuccess(response.message);
      }

      setForm((current) => ({
        ...current,
        date: form.mode === 'single' ? TODAY : current.date,
        fromDate: '',
        toDate: '',
        startTime: '',
        endTime: '',
      }));
      setReviewConfirmed(false);
      setIsModalOpen(false);
      setLoading(true);
      await loadData();
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to save availability.';
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm text-slate-500 dark:text-slate-400">Loading availability...</p>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 w-full flex-col gap-3 overflow-hidden bg-slate-100 px-4 py-4 text-slate-950 dark:bg-slate-950 dark:text-white sm:px-6 xl:px-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold text-slate-950 dark:text-white sm:text-3xl">Availability</h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Publish coach lesson times only inside track windows that are already open.
          </p>
        </div>
        <Button type="button" size="sm" onClick={openModal}>
          Add availability
        </Button>
      </div>

      <section className="flex flex-wrap items-center gap-2">
        <FactChip label={`${coachTracks.length} teaching track${coachTracks.length === 1 ? '' : 's'}`} />
        <FactChip label={`${coachServices.length} service${coachServices.length === 1 ? '' : 's'} configured`} />
        <FactChip label={`${slots.length} published slot${slots.length === 1 ? '' : 's'}`} />
        <FactChip
          label={
            nextTrackDate
              ? `Next lesson ${formatDateLabel(nextTrackDate)}`
              : 'No lessons published yet'
          }
        />
      </section>

      {success ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
          {success}
        </div>
      ) : null}

      {coachTracks.length === 0 || coachServices.length === 0 ? (
        <SetupWarning hasTracks={coachTracks.length > 0} hasServices={coachServices.length > 0} />
      ) : null}

      <div className="grid min-h-0 flex-1 gap-4 xl:grid-cols-[minmax(0,1fr)_360px] 2xl:grid-cols-[minmax(0,1fr)_390px]">
        <CoachAvailabilityCalendar
          slots={slots}
          tracks={coachTracks}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />

        <SelectedDayPanel
          date={selectedDate}
          slots={selectedDaySlots}
        />
      </div>

      {isModalOpen ? (
        <AvailabilityWizardModal
          activeStep={activeStep}
          coachTracks={coachTracks}
          coachServices={coachServices}
          error={error}
          form={form}
          matchingTrackSlot={matchingTrackSlot}
          matchingWeeklyDates={matchingWeeklyDates}
          previewDates={previewDates}
          reviewConfirmed={reviewConfirmed}
          saving={saving}
          selectedService={selectedService}
          stepOneComplete={stepOneComplete}
          stepTwoComplete={stepTwoComplete}
          trackSlots={trackSlots}
          trackSlotsLoading={trackSlotsLoading}
          weeklyTrackSlots={weeklyTrackSlots}
          weeklyTrackSlotsLoading={weeklyTrackSlotsLoading}
          onClose={closeModal}
          onContinue={continueToNextStep}
          onFieldChange={setField}
          onGoToStep={goToStep}
          onReviewConfirmedChange={setReviewConfirmed}
          onSubmit={handleSubmit}
          onUseTrackSlot={useTrackSlot}
          canPublish={canPublish}
        />
      ) : null}
    </div>
  );
}

function AvailabilityWizardModal({
  activeStep,
  coachTracks,
  coachServices,
  error,
  form,
  matchingTrackSlot,
  matchingWeeklyDates,
  previewDates,
  reviewConfirmed,
  saving,
  selectedService,
  stepOneComplete,
  stepTwoComplete,
  trackSlots,
  trackSlotsLoading,
  weeklyTrackSlots,
  weeklyTrackSlotsLoading,
  onClose,
  onContinue,
  onFieldChange,
  onGoToStep,
  onReviewConfirmedChange,
  onSubmit,
  onUseTrackSlot,
  canPublish,
}: {
  activeStep: WizardStep;
  coachTracks: TrackRefResponse[];
  coachServices: ServiceItemResponse[];
  error: string | null;
  form: AvailabilityFormState;
  matchingTrackSlot?: AvailableSlot;
  matchingWeeklyDates: string[];
  previewDates: string[];
  reviewConfirmed: boolean;
  saving: boolean;
  selectedService?: ServiceItemResponse;
  stepOneComplete: boolean;
  stepTwoComplete: boolean;
  trackSlots: AvailableSlot[];
  trackSlotsLoading: boolean;
  weeklyTrackSlots: TrackSlotsByDate;
  weeklyTrackSlotsLoading: boolean;
  onClose: () => void;
  onContinue: () => void;
  onFieldChange: <K extends keyof AvailabilityFormState>(key: K, value: AvailabilityFormState[K]) => void;
  onGoToStep: (step: WizardStep) => void;
  onReviewConfirmedChange: (value: boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onUseTrackSlot: (slot: AvailableSlot) => void;
  canPublish: boolean;
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
            <h2 className="mt-1 text-xl font-semibold text-slate-950 dark:text-white">Create a coach lesson slot</h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              The slot must fit inside an open track window.
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
                completed={stepOneComplete}
                onClick={() => onGoToStep(1)}
              />
              <WizardStepButton
                step={2}
                title="Track window"
                active={activeStep === 2}
                completed={stepTwoComplete}
                disabled={!stepOneComplete}
                onClick={() => onGoToStep(2)}
              />
              <WizardStepButton
                step={3}
                title="Review"
                active={activeStep === 3}
                completed={reviewConfirmed}
                disabled={!stepTwoComplete}
                onClick={() => onGoToStep(3)}
              />
            </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-800/70">
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">Current selection</p>
              <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">
                {selectedService ? formatServiceLabel(selectedService) : 'No service selected'}
              </p>
              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {form.mode === 'single'
                  ? form.date || 'No date selected'
                  : `${previewDates.length} repeating date${previewDates.length === 1 ? '' : 's'}`}
              </p>
            </div>
          </aside>

          <main className="min-h-0 overflow-y-auto p-5">
            {activeStep === 1 ? (
              <StepPanel title="Choose track, service, and date">
                <div className="grid gap-4 lg:grid-cols-2">
                  <Field label="Track" required>
                    <SelectField
                      value={form.trackId}
                      onChange={(value) => onFieldChange('trackId', value)}
                      className={inputClass}
                      options={coachTracks.map((track) => ({
                        value: String(track.trackId),
                        label: track.trackName,
                      }))}
                      ariaLabel="Track"
                    />
                  </Field>

                  <Field label="Service" required>
                    <SelectField
                      value={form.selectedServiceId}
                      onChange={(value) => onFieldChange('selectedServiceId', value)}
                      className={inputClass}
                      options={[
                        { value: '', label: 'Select a service' },
                        ...coachServices.map((service) => ({
                          value: String(service.id),
                          label: formatServiceLabel(service),
                        })),
                      ]}
                      ariaLabel="Service"
                    />
                  </Field>
                </div>

                <div className="rounded-xl border border-slate-200 bg-slate-100 p-1 dark:border-slate-700 dark:bg-slate-800/80">
                  <div className="grid grid-cols-2 gap-1">
                    {(['single', 'weekly'] as const).map((mode) => (
                      <button
                        key={mode}
                        type="button"
                        onClick={() => onFieldChange('mode', mode)}
                        className={`rounded-md px-4 py-3 text-sm font-semibold transition ${
                          form.mode === mode
                            ? 'bg-orange-500 text-white shadow-sm'
                            : 'text-slate-500 hover:bg-white hover:text-slate-950 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                        }`}
                      >
                        {mode === 'single' ? 'Single date' : 'Repeating days'}
                      </button>
                    ))}
                  </div>
                </div>

                {form.mode === 'single' ? (
                  <DatePickerField
                    label="Date"
                    required
                    value={form.date}
                    onChange={(value) => onFieldChange('date', value)}
                    minDateKey={TODAY}
                    accent="emerald"
                  />
                ) : (
                  <div className="space-y-4">
                    <DateRangePickerField
                      label="Date range"
                      required
                      fromValue={form.fromDate}
                      toValue={form.toDate}
                      minDateKey={TODAY}
                      accent="emerald"
                      onChange={(nextFromDate, nextToDate) => {
                        onFieldChange('fromDate', nextFromDate);
                        onFieldChange('toDate', nextToDate);
                      }}
                      hint="Select the first day, then the last day. The range will be highlighted."
                    />

                  </div>
                )}
              </StepPanel>
            ) : null}

            {activeStep === 2 ? (
              <StepPanel title="Choose a real track window">
                {form.mode === 'single' ? (
                  <SingleTrackWindowPicker
                    loading={trackSlotsLoading}
                    selectedService={selectedService}
                    selectedSlotId={matchingTrackSlot?.id}
                    slots={trackSlots}
                    startTime={form.startTime}
                    endTime={form.endTime}
                    onFieldChange={onFieldChange}
                    onUseTrackSlot={onUseTrackSlot}
                  />
                ) : (
                  <WeeklyTrackWindowPicker
                    dates={previewDates}
                    loading={weeklyTrackSlotsLoading}
                    matchingDates={matchingWeeklyDates}
                    selectedService={selectedService}
                    slotsByDate={weeklyTrackSlots}
                    startTime={form.startTime}
                    endTime={form.endTime}
                    onFieldChange={onFieldChange}
                    onUseTrackSlot={onUseTrackSlot}
                  />
                )}
              </StepPanel>
            ) : null}

            {activeStep === 3 ? (
              <StepPanel title="Review and publish">
                <div className="grid gap-3 sm:grid-cols-2">
                  <ReviewTile label="Track" value={getTrackName(coachTracks, form.trackId)} />
                  <ReviewTile label="Service" value={selectedService ? formatServiceLabel(selectedService) : '-'} />
                  <ReviewTile
                    label="Date"
                    value={
                      form.mode === 'single'
                        ? formatDateLabel(form.date)
                        : `${matchingWeeklyDates.length} matching date${matchingWeeklyDates.length === 1 ? '' : 's'}`
                    }
                  />
                  <ReviewTile label="Time" value={`${form.startTime} - ${form.endTime}`} />
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
                      I reviewed the track, service, date, and time.
                    </span>
                    <span className="mt-1 block text-xs text-slate-500 dark:text-slate-400">
                      The publish button unlocks after this confirmation.
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

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-5 py-4 dark:border-slate-700">
          <Button type="button" variant="ghost" onClick={onClose}>
            Cancel
          </Button>

          <div className="flex items-center gap-3">
            {activeStep > 1 ? (
              <Button
                type="button"
                variant="outline"
                onClick={() => onGoToStep((activeStep - 1) as WizardStep)}
              >
                Back
              </Button>
            ) : null}

            {activeStep < 3 ? (
              <Button
                type="button"
                onClick={onContinue}
                disabled={(activeStep === 1 && !stepOneComplete) || (activeStep === 2 && !stepTwoComplete)}
              >
                Continue
              </Button>
            ) : (
              <Button type="submit" isLoading={saving} disabled={!canPublish}>
                Publish availability
              </Button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}

function SingleTrackWindowPicker({
  loading,
  selectedService,
  selectedSlotId,
  slots,
  startTime,
  endTime,
  onFieldChange,
  onUseTrackSlot,
}: {
  loading: boolean;
  selectedService?: ServiceItemResponse;
  selectedSlotId?: number;
  slots: AvailableSlot[];
  startTime: string;
  endTime: string;
  onFieldChange: <K extends keyof AvailabilityFormState>(key: K, value: AvailabilityFormState[K]) => void;
  onUseTrackSlot: (slot: AvailableSlot) => void;
}) {
  if (loading) {
    return <SkeletonPanel rows={4} />;
  }

  return (
    <>
      <TrackWindowList
        emptyText="This track has no published availability for the selected date."
        selectedService={selectedService}
        selectedSlotId={selectedSlotId}
        slots={slots}
        onUseTrackSlot={onUseTrackSlot}
      />
      <TimePresetButtons
        selectedService={selectedService}
        trackSlots={slots}
        onApplyPreset={(startTime, endTime) => {
          onFieldChange('startTime', startTime);
          onFieldChange('endTime', endTime);
        }}
      />
      <TimeFields
        startTime={startTime}
        endTime={endTime}
        onFieldChange={onFieldChange}
      />
    </>
  );
}

function WeeklyTrackWindowPicker({
  dates,
  loading,
  matchingDates,
  selectedService,
  slotsByDate,
  startTime,
  endTime,
  onFieldChange,
  onUseTrackSlot,
}: {
  dates: string[];
  loading: boolean;
  matchingDates: string[];
  selectedService?: ServiceItemResponse;
  slotsByDate: TrackSlotsByDate;
  startTime: string;
  endTime: string;
  onFieldChange: <K extends keyof AvailabilityFormState>(key: K, value: AvailabilityFormState[K]) => void;
  onUseTrackSlot: (slot: AvailableSlot) => void;
}) {
  const sampleSlots = dates
    .flatMap((date) => slotsByDate[date] ?? [])
    .filter((slot) => serviceFitsTrackSlot(selectedService, slot))
    .slice(0, 12);

  if (loading) {
    return <SkeletonPanel rows={5} />;
  }

  return (
    <>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-slate-950 dark:text-white">Repeating preview</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Pick one track window, then the system saves only dates where your hours fit.
            </p>
          </div>
          <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-200">
            {startTime && endTime ? `${matchingDates.length}/${dates.length} match` : `${dates.length} dates`}
          </span>
        </div>
      </div>

      <TrackWindowList
        emptyText="No usable track windows were found in this range."
        selectedService={selectedService}
        slots={sampleSlots}
        onUseTrackSlot={onUseTrackSlot}
      />
      <TimePresetButtons
        selectedService={selectedService}
        trackSlots={sampleSlots}
        onApplyPreset={(presetStartTime, presetEndTime) => {
          onFieldChange('startTime', presetStartTime);
          onFieldChange('endTime', presetEndTime);
        }}
      />
      <TimeFields
        startTime={startTime}
        endTime={endTime}
        onFieldChange={onFieldChange}
      />
    </>
  );
}

function TimePresetButtons({
  selectedService,
  trackSlots,
  onApplyPreset,
}: {
  selectedService?: ServiceItemResponse;
  trackSlots: AvailableSlot[];
  onApplyPreset: (startTime: string, endTime: string) => void;
}) {
  const presets = getTimePresetsForService(selectedService, trackSlots);

  if (presets.length === 0) return null;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800/80">
      <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-slate-950 dark:text-white">Quick time presets</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Presets use the real start and end times published by the track.
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {presets.map((preset) => (
          <button
            key={preset.label}
            type="button"
            onClick={() => onApplyPreset(preset.startTime, preset.endTime)}
            className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-left transition hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-orange-500/50 dark:hover:bg-slate-800"
          >
            <p className="text-sm font-semibold text-slate-950 dark:text-white">{preset.label}</p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {preset.startTime} - {preset.endTime}
            </p>
          </button>
        ))}
      </div>
    </div>
  );
}

function TrackWindowList({
  emptyText,
  selectedService,
  selectedSlotId,
  slots,
  onUseTrackSlot,
}: {
  emptyText: string;
  selectedService?: ServiceItemResponse;
  selectedSlotId?: number;
  slots: AvailableSlot[];
  onUseTrackSlot: (slot: AvailableSlot) => void;
}) {
  if (slots.length === 0) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {slots.map((slot) => {
        const compatible = serviceFitsTrackSlot(selectedService, slot);
        const selected = selectedSlotId === slot.id;
        return (
          <button
            key={`${slot.id}-${slot.date}`}
            type="button"
            disabled={!compatible}
            onClick={() => onUseTrackSlot(slot)}
            className={`rounded-lg border px-3 py-3 text-left transition ${
              selected
                ? 'border-emerald-500/60 bg-emerald-500/10'
                : compatible
                  ? 'border-slate-200 bg-white hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-orange-500/50'
                  : 'cursor-not-allowed border-slate-200 bg-slate-100 opacity-50 dark:border-slate-700 dark:bg-slate-800/40'
            }`}
          >
            <p className="text-sm font-semibold text-slate-950 dark:text-white">
              {slot.startTime} - {slot.endTime}
            </p>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {formatTrackSlotType(slot.rentalType)} / capacity {slot.capacity}
            </p>
          </button>
        );
      })}
    </div>
  );
}

function TimeFields({
  startTime,
  endTime,
  onFieldChange,
}: {
  startTime: string;
  endTime: string;
  onFieldChange: <K extends keyof AvailabilityFormState>(key: K, value: AvailabilityFormState[K]) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Field label="Coach start time" required>
        <input
          type="time"
          value={startTime}
          onChange={(event) => onFieldChange('startTime', event.target.value)}
          className={inputClass}
        />
      </Field>
      <Field label="Coach end time" required>
        <input
          type="time"
          value={endTime}
          onChange={(event) => onFieldChange('endTime', event.target.value)}
          className={inputClass}
        />
      </Field>
    </div>
  );
}

function SelectedDayPanel({
  date,
  slots,
}: {
  date: string;
  slots: AvailabilityItem[];
}) {
  const firstSlot = slots[0];
  const trackCount = new Set(slots.map((slot) => slot.trackId)).size;
  const serviceTypes = new Set(slots.map((slot) => formatServiceType(slot.classType))).size;

  return (
    <aside className="flex min-h-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-200/70 dark:border-slate-700 dark:bg-slate-900 dark:shadow-black/30">
      <div className="border-b border-slate-200 bg-white/90 px-4 py-4 dark:border-slate-700 dark:bg-slate-800/70">
        <p className="text-xs font-semibold uppercase text-orange-300">Selected day</p>
        <h2 className="mt-1 text-lg font-semibold text-slate-950 dark:text-white">{formatDateLabel(date)}</h2>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <MiniStat label="Slots" value={String(slots.length)} />
          <MiniStat label="Tracks" value={String(trackCount)} />
          <MiniStat label="Types" value={String(serviceTypes)} />
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
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">Use the primary action above to add availability.</p>
          </div>
        ) : (
          slots.map((slot) => (
            <article key={slot.id} className="rounded-xl border border-slate-200 bg-slate-50 p-3 transition hover:border-orange-300 hover:bg-orange-50 dark:border-slate-700 dark:bg-slate-800/80 dark:hover:border-orange-500/50">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-950 dark:text-white">
                    {slot.startTime} - {slot.endTime}
                  </p>
                  <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400">{slot.trackName}</p>
                </div>
                <span className="rounded-lg bg-orange-50 px-2 py-1 text-xs font-semibold text-orange-700 ring-1 ring-orange-200 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-0">
                  {formatServiceType(slot.classType)}
                </span>
              </div>
              <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">1:1</p>
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

function SetupWarning({
  hasTracks,
  hasServices,
}: {
  hasTracks: boolean;
  hasServices: boolean;
}) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
      {!hasTracks ? 'Add teaching tracks in ' : null}
      {!hasTracks ? (
        <Link to={ROUTES.COACH_SETTINGS} className="font-semibold underline">
          Settings
        </Link>
      ) : null}
      {!hasTracks && !hasServices ? ' and configure services before publishing availability.' : null}
      {hasTracks && !hasServices ? 'Configure services in ' : null}
      {hasTracks && !hasServices ? (
        <Link to={ROUTES.COACH_SETTINGS} className="font-semibold underline">
          Settings
        </Link>
      ) : null}
      {hasTracks && !hasServices ? ' before publishing availability.' : null}
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
      <p className="text-[10px] font-semibold uppercase tracking-wide text-orange-700 dark:text-orange-200/80">Step {step}</p>
      <p className="mt-1 text-sm font-semibold text-current">{title}</p>
    </button>
  );
}

function ReviewTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-700 dark:bg-slate-800/80">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{label}</p>
      <p className="mt-2 text-sm font-semibold text-slate-950 dark:text-white">{value}</p>
    </div>
  );
}

function FactChip({ label }: { label: string }) {
  return (
    <div className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1.5 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
      {label}
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
      {label}
      {required ? <span className="ml-1 text-orange-400">*</span> : null}
      <div className="mt-2">{children}</div>
    </label>
  );
}

function SkeletonPanel({ rows }: { rows: number }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/80">
      <div className="h-4 w-44 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
      <div className="mt-4 space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className="h-12 animate-pulse rounded bg-slate-200/80 dark:bg-slate-800/80" />
        ))}
      </div>
    </div>
  );
}

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm font-medium text-slate-950 shadow-sm focus:border-orange-500 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white dark:placeholder:text-slate-400';

function serviceFitsTrackSlot(service: ServiceItemResponse | undefined, slot: AvailableSlot) {
  return !service || service.classType !== 'FULL_DAY' || slot.rentalType === 'FULL_DAY';
}

function formatServiceLabel(service: ServiceItemResponse) {
  return `${formatServiceType(service.classType)} / 1:1 / $${service.price}`;
}

function formatServiceType(classType: string) {
  if (classType === 'HOURLY') return 'Hourly';
  if (classType === 'HALF_DAY') return 'Half day';
  return 'Full day';
}

function formatTrackSlotType(rentalType: string) {
  return rentalType === 'FULL_DAY' ? 'Full day track' : 'Half day track';
}

function getTimePresetsForService(
  selectedService: ServiceItemResponse | undefined,
  trackSlots: AvailableSlot[]
) {
  if (!selectedService) return [];

  const compatibleSlots = trackSlots
    .filter((slot) => serviceFitsTrackSlot(selectedService, slot))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  if (selectedService.classType === 'HALF_DAY') {
    const presets: Array<{ label: string; startTime: string; endTime: string }> = [];

    compatibleSlots.forEach((slot) => {
      const duration = diffMinutes(slot.startTime, slot.endTime);

      if (slot.rentalType === 'FULL_DAY' && duration >= 480) {
        const middleTime = addMinutes(slot.startTime, Math.floor(duration / 2));
        presets.push({
          label: 'Morning',
          startTime: slot.startTime,
          endTime: middleTime,
        });
        presets.push({
          label: 'Afternoon',
          startTime: middleTime,
          endTime: slot.endTime,
        });
        return;
      }

      presets.push({
        label: `${slot.startTime} - ${slot.endTime}`,
        startTime: slot.startTime,
        endTime: slot.endTime,
      });
    });

    return dedupePresets(presets);
  }

  if (selectedService.classType === 'FULL_DAY') {
    return dedupePresets(
      compatibleSlots
        .filter((slot) => slot.rentalType === 'FULL_DAY')
        .map((slot) => ({
          label: 'Full day',
          startTime: slot.startTime,
          endTime: slot.endTime,
        }))
    );
  }

  return [];
}

function diffMinutes(startTime: string, endTime: string) {
  return timeToMinutes(endTime) - timeToMinutes(startTime);
}

function addMinutes(time: string, minutesToAdd: number) {
  const totalMinutes = timeToMinutes(time) + minutesToAdd;
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
}

function dedupePresets(presets: Array<{ label: string; startTime: string; endTime: string }>) {
  const seen = new Set<string>();
  return presets.filter((preset) => {
    const key = `${preset.label}-${preset.startTime}-${preset.endTime}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function formatDateLabel(date: string) {
  return new Date(`${date}T12:00:00`).toLocaleDateString(undefined, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

function getTrackName(tracks: TrackRefResponse[], trackId: string) {
  return tracks.find((track) => String(track.trackId) === trackId)?.trackName ?? '-';
}

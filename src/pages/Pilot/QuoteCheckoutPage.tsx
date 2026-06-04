import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  getTrackDetailPublic,
  getAvailableSlotsForDate,
  getCoachAvailableSlotsForDate,
  type TrackDetailPublic,
  type CoachForTrack,
  type AvailableSlot,
} from '@/services/trackService';
import { reservationService } from '@/services/reservationService';
import { ROUTES } from '@/router/routes';
import { QuoteCheckoutForm } from './QuoteCheckoutForm';
import { QuoteSummary } from './QuoteSummary';
import InlineToast from '@/components/common/InlineToast';
import { getCompatibleCoachSlots, toHHMM, toMinutes } from './QuoteCheckoutUtils';
import { LoadingSpinner } from '@/components/common';
import type { ReservationCalculateResponse } from '@/types/reservation.types';

export function QuoteCheckoutPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const coachId = searchParams.get('coach') ? parseInt(searchParams.get('coach')!, 10) : null;
  const minReservationDate = toDateKey(addDays(new Date(), 1));
  const initialDateParam = searchParams.get('date') ?? '';
  const initialDate = initialDateParam >= minReservationDate ? initialDateParam : '';
  const initialTrackSlotStart = searchParams.get('trackSlot') ?? '';
  const initialTrackSlotId = parseOptionalNumber(searchParams.get('trackSlotId'));
  const initialCoachSlotId = parseOptionalNumber(searchParams.get('coachSlot'));

  const [track, setTrack] = useState<TrackDetailPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    title?: string;
    message: string;
    type?: 'success' | 'error';
    visible: boolean;
  }>({ title: '', message: '', type: 'success', visible: false });

  const [reservationDate, setReservationDate] = useState(initialDate);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [pilotType, setPilotType] = useState('JUNIOR');
  const [classType, setClassType] = useState('HOURLY');
  const [mode, setMode] = useState<'ONE_TO_ONE'>('ONE_TO_ONE');
  const [participants, setParticipants] = useState(1);
  const [trackReservationType, setTrackReservationType] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY');

  const [quote, setQuote] = useState<ReservationCalculateResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Awaited<ReturnType<typeof getAvailableSlotsForDate>>>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [coachAvailableSlots, setCoachAvailableSlots] = useState<Awaited<ReturnType<typeof getCoachAvailableSlotsForDate>>>([]);
  const [coachSlotsLoading, setCoachSlotsLoading] = useState(false);
  const [selectedTrackSlotStart, setSelectedTrackSlotStart] = useState(initialTrackSlotStart);
  const [selectedTrackSlotId, setSelectedTrackSlotId] = useState<number | null>(initialTrackSlotId);
  const [selectedCoachSlotId, setSelectedCoachSlotId] = useState<number | null>(initialCoachSlotId);

  useEffect(() => {
    if (!trackId) return;
    getTrackDetailPublic(parseInt(trackId, 10))
      .then(setTrack)
      .catch(() => setError('Failed to load track'))
      .finally(() => setLoading(false));
  }, [trackId]);

  useEffect(() => {
    if (!reservationDate || !trackId) {
      setAvailableSlots([]);
      setSelectedTrackSlotStart('');
      setSelectedTrackSlotId(null);
      return;
    }
    setSlotsLoading(true);
    getAvailableSlotsForDate(parseInt(trackId, 10), reservationDate)
      .then(setAvailableSlots)
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [reservationDate, trackId]);

  useEffect(() => {
    const selectedCoach = getOneToOneCoach(track, coachId);
    if (!selectedCoach || !reservationDate || !trackId) {
      setCoachAvailableSlots([]);
      return;
    }
    setCoachSlotsLoading(true);
    getCoachAvailableSlotsForDate(selectedCoach.id, parseInt(trackId, 10), reservationDate)
      .then((slots) => setCoachAvailableSlots(slots.filter((slot) => slot.mode === 'ONE_TO_ONE')))
      .catch(() => setCoachAvailableSlots([]))
      .finally(() => setCoachSlotsLoading(false));
  }, [track, coachId, reservationDate, trackId]);

  const selectedCoach = getOneToOneCoach(track, coachId);
  const selectedTrackSlot = availableSlots.find((slot) =>
    selectedTrackSlotId != null
      ? slot.id === selectedTrackSlotId
      : slot.startTime === selectedTrackSlotStart
  );
  const compatibleCoachSlots = getCompatibleCoachSlots(selectedTrackSlot, coachAvailableSlots).filter(
    (slot) => slot.mode === 'ONE_TO_ONE'
  );
  const selectedCoachSlot = compatibleCoachSlots.find((slot) => slot.id === selectedCoachSlotId);

  useEffect(() => {
    if (!selectedTrackSlot) return;
    setStartTime(selectedTrackSlot.startTime);
    setEndTime(selectedTrackSlot.endTime);
  }, [selectedTrackSlot]);

  useEffect(() => {
    if (!selectedCoachSlot) return;
    setClassType(selectedCoachSlot.classType);
    setMode('ONE_TO_ONE');
    setParticipants(1);
  }, [selectedCoachSlot]);

  useEffect(() => {
    if (!selectedCoach || compatibleCoachSlots.length === 0) return;
    if (!selectedCoachSlotId && compatibleCoachSlots[0]) {
      const first = compatibleCoachSlots[0];
      setSelectedCoachSlotId(first.id);
      setClassType(first.classType);
      setMode('ONE_TO_ONE');
      setParticipants(1);
    }
  }, [selectedCoach, compatibleCoachSlots, selectedCoachSlotId]);

  const coachHasService = () => {
    if (!selectedCoach) return true;
    return selectedCoach.services.some((s) => s.class_type === classType && s.mode === mode);
  };

  const handleTrackSlotChange = (slot: AvailableSlot) => {
    setSelectedTrackSlotStart(slot.startTime);
    setSelectedTrackSlotId(slot.id);
    setSelectedCoachSlotId(null);
    setQuote(null);
    setStartTime(slot.startTime);
    setEndTime(slot.endTime);
  };

  const handleCoachSlotSelect = (slot: (typeof compatibleCoachSlots)[0]) => {
    setSelectedCoachSlotId(slot.id);
    setClassType(slot.classType);
    setMode('ONE_TO_ONE');
    setParticipants(1);
    setQuote(null);
  };

  const handleReservationDateChange = (value: string) => {
    setReservationDate(value);
    setSelectedTrackSlotStart('');
    setSelectedTrackSlotId(null);
    setSelectedCoachSlotId(null);
    setQuote(null);
    setError(null);
  };

  const handleCalculateQuote = async () => {
    if (!reservationDate || !startTime || !endTime) {
      setError('Please complete date and time');
      return;
    }
    if (!selectedTrackSlot) {
      setError('Select a valid track time slot first');
      return;
    }
    if (!slotHasCapacityForParticipants(selectedTrackSlot, participants)) {
      setError(`This time slot only has ${getSlotRemaining(selectedTrackSlot)} spot(s) left`);
      return;
    }
    if (coachId && !selectedCoachSlotId) {
      setError('Select a coach time slot');
      return;
    }
    if (coachId && compatibleCoachSlots.length === 0) {
      setError('Coach not available for the selected track time');
      return;
    }

    let requestStartTime = startTime;
    let requestEndTime = endTime;

    if (coachId && selectedTrackSlot) {
      const coachSlot = compatibleCoachSlots.find((s) => s.id === selectedCoachSlotId);
      if (!coachSlot) {
        setError('Invalid coach slot');
        return;
      }
      const overlapStart = Math.max(
        toMinutes(selectedTrackSlot.startTime),
        toMinutes(coachSlot.startTime)
      );
      const overlapEnd = Math.min(
        toMinutes(selectedTrackSlot.endTime),
        toMinutes(coachSlot.endTime)
      );
      if (overlapEnd <= overlapStart) {
        setError('No overlap between track and coach times');
        return;
      }
      requestStartTime = toHHMM(overlapStart);
      requestEndTime = toHHMM(overlapEnd);
    }

    if (coachId && !coachHasService()) {
      setError('Coach does not offer this service configuration');
      return;
    }

    try {
      setQuoteLoading(true);
      const classTypeForRequest = coachId ? classType : trackReservationType;
      const modeForRequest = coachId ? mode : undefined;
      const response = await reservationService.calculateQuote({
        trackId: parseInt(trackId!, 10),
        date: reservationDate,
        startTime: requestStartTime,
        endTime: requestEndTime,
        pilotType: pilotType as 'JUNIOR' | 'SENIOR',
        coachId: coachId || undefined,
        classType: classTypeForRequest as 'HOURLY' | 'HALF_DAY' | 'FULL_DAY',
        trackReservationType: trackReservationType,
        mode: modeForRequest as 'ONE_TO_ONE' | undefined,
        participants,
      });
      setStartTime(requestStartTime);
      setEndTime(requestEndTime);
      setQuote(response);
      setError(null);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Failed to calculate quote');
      setError(msg);
      setQuote(null);
    } finally {
      setQuoteLoading(false);
    }
  };

  const handleConfirmReservation = async () => {
    if (!quote) {
      setError('Calculate the quote before confirming');
      return;
    }
    if (!selectedTrackSlot || !slotHasCapacityForParticipants(selectedTrackSlot, participants)) {
      setError('This time slot is full or no longer has enough capacity');
      return;
    }
    try {
      setSubmitting(true);
      const classTypeForRequest = coachId ? classType : trackReservationType;
      const modeForRequest = coachId ? mode : undefined;
      const response = await reservationService.createReservationDirectConfirm({
        trackId: parseInt(trackId!, 10),
        date: reservationDate,
        startTime,
        endTime,
        pilotType: pilotType as 'JUNIOR' | 'SENIOR',
        coachId: coachId || undefined,
        classType: classTypeForRequest as 'HOURLY' | 'HALF_DAY' | 'FULL_DAY',
        trackReservationType,
        mode: modeForRequest as 'ONE_TO_ONE' | undefined,
        participants,
      });
      setToast({
        title: 'Reservation confirmed',
        message: `Your booking #${response.reservation_id} was created successfully.`,
        type: 'success',
        visible: true,
      });
      setTimeout(() => navigate(ROUTES.RESERVATIONS), 1400);
    } catch (err: unknown) {
      const msg = getErrorMessage(err, 'Could not create booking');
      setError(msg);
      setToast({
        title: 'Reservation could not be completed',
        message: msg,
        type: 'error',
        visible: true,
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 text-sm">Loading booking form...</p>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-red-300 mb-6">Track not found</p>
        <Link to={ROUTES.MAP}>
          <button type="button" className="text-orange-400 hover:underline">
            Back to map
          </button>
        </Link>
      </div>
    );
  }

  const quoteForSummary = quote
    ? {
        track_price: quote.trackPrice ?? (quote as { track_price?: number }).track_price ?? 0,
        coach_price: quote.coachPrice ?? (quote as { coach_price?: number }).coach_price,
        subtotal: quote.subtotal,
        total: quote.total,
        availability_available:
          quote.availabilityAvailable ??
          (quote as { availability_available?: boolean }).availability_available ??
          true,
      }
    : null;

  return (
    <div className="mx-auto max-w-7xl">
      <Link
        to={ROUTES.TRACK_DETAIL(trackId!)}
        className="mb-4 inline-flex text-sm font-semibold text-slate-500 transition-colors hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400"
      >
        Back to track
      </Link>

      <div className="mb-5">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-300">
          Checkout
        </p>
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-white sm:text-3xl">
          Book session
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
          {selectedCoach ? `${track.name} - Coach ${selectedCoach.name}` : track.name}
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm font-semibold text-red-700 dark:text-red-200">
          {error}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <QuoteCheckoutForm
          track={track}
          selectedCoach={selectedCoach}
          reservationDate={reservationDate}
          onReservationDateChange={handleReservationDateChange}
          availableSlots={availableSlots}
          slotsLoading={slotsLoading}
          selectedTrackSlotStart={selectedTrackSlotStart}
          selectedTrackSlotId={selectedTrackSlotId}
          onTrackSlotChange={handleTrackSlotChange}
          pilotType={pilotType}
          onPilotTypeChange={(value) => {
            setPilotType(value);
            setQuote(null);
          }}
          trackReservationType={trackReservationType}
          onTrackReservationTypeChange={(value) => {
            setTrackReservationType(value);
            setQuote(null);
          }}
          coachSlotsLoading={coachSlotsLoading}
          compatibleCoachSlots={compatibleCoachSlots}
          selectedCoachSlotId={selectedCoachSlotId}
          onCoachSlotSelect={handleCoachSlotSelect}
          participants={participants}
          onCalculateQuote={handleCalculateQuote}
          quoteLoading={quoteLoading}
        />

        <aside className="xl:sticky xl:top-24 xl:self-start">
          {quoteForSummary ? (
            <QuoteSummary
              quote={quoteForSummary}
              submitting={submitting}
              onConfirm={handleConfirmReservation}
            />
          ) : (
            <BookingSidePanel
              trackName={track.name}
              coachName={selectedCoach?.name}
              hasTrackSlot={Boolean(selectedTrackSlot)}
              hasCoachSlot={Boolean(selectedCoachSlot)}
            />
          )}
        </aside>
      </div>

      <InlineToast
        title={toast.title}
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, title: '', message: '', visible: false }))}
      />
    </div>
  );
}

function BookingSidePanel({
  trackName,
  coachName,
  hasTrackSlot,
  hasCoachSlot,
}: {
  trackName: string;
  coachName?: string;
  hasTrackSlot: boolean;
  hasCoachSlot: boolean;
}) {
  return (
    <div className="quote-shell rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-xl shadow-slate-200/60 backdrop-blur dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/25">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-600 dark:text-orange-300">
        Booking summary
      </p>
      <h2 className="mt-2 text-xl font-black text-slate-950 dark:text-white">
        Review before checkout
      </h2>
      <div className="mt-5 space-y-3">
        <SummaryStep done label="Track" value={trackName} />
        {coachName && <SummaryStep done label="Coach" value={coachName} />}
        <SummaryStep done={hasTrackSlot} label="Track time" value={hasTrackSlot ? 'Selected' : 'Choose a time'} />
        {coachName && (
          <SummaryStep done={hasCoachSlot} label="Coach time" value={hasCoachSlot ? 'Selected' : 'Choose a coach time'} />
        )}
      </div>
      <div className="quote-card mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-950/60 dark:text-slate-300">
        Select the required options, then calculate your quote. Your final total will appear here.
      </div>
    </div>
  );
}

function SummaryStep({
  done,
  label,
  value,
}: {
  done: boolean;
  label: string;
  value: string;
}) {
  return (
    <div className="quote-card flex items-start gap-3 rounded-2xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-950/60">
      <span
        className={`mt-0.5 flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-black ${
          done
            ? 'bg-emerald-500 text-white'
            : 'bg-slate-200 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}
      >
        {done ? 'OK' : '-'}
      </span>
      <span className="min-w-0">
        <span className="block text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
          {label}
        </span>
        <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">
          {value}
        </span>
      </span>
    </div>
  );
}

function getSlotRemaining(slot: AvailableSlot) {
  return Math.max(slot.remaining ?? slot.capacity - Math.max(slot.reserved ?? 0, 0), 0);
}

function slotHasCapacityForParticipants(slot: AvailableSlot, participants: number) {
  if (slot.isFull) return false;
  return getSlotRemaining(slot) >= participants;
}

function parseOptionalNumber(value: string | null) {
  if (!value) return null;
  const parsed = parseInt(value, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const response = (error as { response?: { data?: { detail?: unknown } } }).response;
    const detail = response?.data?.detail;
    if (typeof detail === 'string') return detail;
  }
  return error instanceof Error ? error.message : fallback;
}

function getOneToOneCoach(track: TrackDetailPublic | null, coachId: number | null) {
  if (!track || coachId == null) return undefined;

  const coach = track.coaches.find((c: CoachForTrack) => c.id === coachId);
  if (!coach) return undefined;

  const services = coach.services.filter((service) => service.mode === 'ONE_TO_ONE');
  if (services.length === 0) return undefined;

  return { ...coach, services };
}

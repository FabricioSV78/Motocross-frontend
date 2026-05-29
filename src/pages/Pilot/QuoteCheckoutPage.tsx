import { useState, useEffect } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  getTrackDetailPublic,
  getAvailableSlotsForDate,
  getCoachAvailableSlotsForDate,
  type TrackDetailPublic,
  type CoachForTrack,
} from '@/services/trackService';
import { reservationService } from '@/services/reservationService';
import { ROUTES } from '@/router/routes';
import { QuoteCheckoutForm } from './QuoteCheckoutForm';
import { QuoteSummary } from './QuoteSummary';
import InlineToast from '@/components/common/InlineToast';
import { getCompatibleCoachSlots, toHHMM, toMinutes } from './QuoteCheckoutUtils';
import { LoadingSpinner } from '@/components/common';
import { PageHeader } from '@/components/pilot';
import type { ReservationCalculateResponse } from '@/types/reservation.types';

export function QuoteCheckoutPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const coachId = searchParams.get('coach') ? parseInt(searchParams.get('coach')!, 10) : null;

  const [track, setTrack] = useState<TrackDetailPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{
    message: string;
    type?: 'success' | 'error';
    visible: boolean;
  }>({ message: '', type: 'success', visible: false });

  const [reservationDate, setReservationDate] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [pilotType, setPilotType] = useState('JUNIOR');
  const [classType, setClassType] = useState('HOURLY');
  const [mode, setMode] = useState('ONE_TO_ONE');
  const [participants, setParticipants] = useState(1);
  const [trackReservationType, setTrackReservationType] = useState<'FULL_DAY' | 'HALF_DAY'>('FULL_DAY');

  const [quote, setQuote] = useState<ReservationCalculateResponse | null>(null);
  const [quoteLoading, setQuoteLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<Awaited<ReturnType<typeof getAvailableSlotsForDate>>>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [coachAvailableSlots, setCoachAvailableSlots] = useState<Awaited<ReturnType<typeof getCoachAvailableSlotsForDate>>>([]);
  const [coachSlotsLoading, setCoachSlotsLoading] = useState(false);
  const [selectedTrackSlotStart, setSelectedTrackSlotStart] = useState('');
  const [selectedCoachSlotId, setSelectedCoachSlotId] = useState<number | null>(null);

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
      return;
    }
    setSlotsLoading(true);
    getAvailableSlotsForDate(parseInt(trackId, 10), reservationDate)
      .then(setAvailableSlots)
      .catch(() => setAvailableSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [reservationDate, trackId]);

  useEffect(() => {
    const selectedCoach = track?.coaches.find((c: CoachForTrack) => c.id === coachId);
    if (!selectedCoach || !reservationDate || !trackId) {
      setCoachAvailableSlots([]);
      return;
    }
    setCoachSlotsLoading(true);
    getCoachAvailableSlotsForDate(selectedCoach.id, parseInt(trackId, 10), reservationDate)
      .then(setCoachAvailableSlots)
      .catch(() => setCoachAvailableSlots([]))
      .finally(() => setCoachSlotsLoading(false));
  }, [track, coachId, reservationDate, trackId]);

  const selectedCoach = track?.coaches.find((c: CoachForTrack) => c.id === coachId);
  const selectedTrackSlot = availableSlots.find((slot) => slot.startTime === selectedTrackSlotStart);
  const compatibleCoachSlots = getCompatibleCoachSlots(selectedTrackSlot, coachAvailableSlots);
  const selectedCoachSlot = compatibleCoachSlots.find((slot) => slot.id === selectedCoachSlotId);
  const maxParticipants = selectedCoachSlot?.maxStudents ?? 4;

  useEffect(() => {
    if (!selectedCoach || compatibleCoachSlots.length === 0) return;
    if (!selectedCoachSlotId && compatibleCoachSlots[0]) {
      const first = compatibleCoachSlots[0];
      setSelectedCoachSlotId(first.id);
      setClassType(first.classType);
      setMode(first.mode);
    }
  }, [selectedCoach, compatibleCoachSlots, selectedCoachSlotId]);

  const coachHasService = () => {
    if (!selectedCoach) return true;
    return selectedCoach.services.some((s) => s.class_type === classType && s.mode === mode);
  };

  const handleTrackSlotChange = (value: string) => {
    setSelectedTrackSlotStart(value);
    setSelectedCoachSlotId(null);
    const slot = availableSlots.find((s) => s.startTime === value);
    if (slot) {
      setStartTime(slot.startTime);
      setEndTime(slot.endTime);
    }
  };

  const handleCoachSlotSelect = (slot: (typeof compatibleCoachSlots)[0]) => {
    setSelectedCoachSlotId(slot.id);
    setClassType(slot.classType);
    setMode(slot.mode);
  };

  const handleCalculateQuote = async () => {
    if (!reservationDate || !startTime || !endTime) {
      setError('Please complete date and time');
      return;
    }
    if (coachId && !selectedTrackSlotStart) {
      setError('Select a track time slot first');
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
        mode: modeForRequest as 'ONE_TO_ONE' | 'GROUP' | undefined,
        participants,
      });
      setStartTime(requestStartTime);
      setEndTime(requestEndTime);
      setQuote(response);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to calculate quote';
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
        mode: modeForRequest as 'ONE_TO_ONE' | 'GROUP' | undefined,
        participants,
      });
      setToast({
        message: `Booking confirmed · #${response.reservation_id}`,
        type: 'success',
        visible: true,
      });
      setTimeout(() => navigate(ROUTES.RESERVATIONS), 1400);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not create booking';
      setError(msg);
      setToast({ message: msg, type: 'error', visible: true });
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
        tax: quote.tax,
        total: quote.total,
        availability_available:
          quote.availabilityAvailable ??
          (quote as { availability_available?: boolean }).availability_available ??
          true,
      }
    : null;

  return (
    <div className="max-w-xl mx-auto">
      <Link
        to={ROUTES.TRACK_DETAIL(trackId!)}
        className="inline-flex text-sm text-gray-400 hover:text-orange-400 mb-4 transition-colors"
      >
        ← Back to track
      </Link>

      <PageHeader
        title="Book session"
        subtitle={
          selectedCoach
            ? `${track.name} · Coach ${selectedCoach.name}`
            : track.name
        }
      />

      {error && (
        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm">
          {error}
        </div>
      )}

      <QuoteCheckoutForm
        track={track}
        selectedCoach={selectedCoach}
        reservationDate={reservationDate}
        onReservationDateChange={setReservationDate}
        availableSlots={availableSlots}
        slotsLoading={slotsLoading}
        selectedTrackSlotStart={selectedTrackSlotStart}
        onTrackSlotChange={handleTrackSlotChange}
        pilotType={pilotType}
        onPilotTypeChange={setPilotType}
        trackReservationType={trackReservationType}
        onTrackReservationTypeChange={setTrackReservationType}
        coachSlotsLoading={coachSlotsLoading}
        compatibleCoachSlots={compatibleCoachSlots}
        selectedCoachSlotId={selectedCoachSlotId}
        onCoachSlotSelect={handleCoachSlotSelect}
        participants={participants}
        onParticipantsChange={setParticipants}
        maxParticipants={maxParticipants}
        showGroupParticipants={mode === 'GROUP'}
        onCalculateQuote={handleCalculateQuote}
        quoteLoading={quoteLoading}
      />

      {quoteForSummary && (
        <QuoteSummary
          quote={quoteForSummary}
          submitting={submitting}
          onConfirm={handleConfirmReservation}
        />
      )}

      <InlineToast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onClose={() => setToast((t) => ({ ...t, visible: false }))}
      />
    </div>
  );
}

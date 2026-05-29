import type { TrackDetailPublic, AvailableSlot, CoachAvailableSlot, CoachForTrack } from '@/services/trackService';
import { Button } from '@/components/ui/Button';

interface QuoteCheckoutFormProps {
  track: TrackDetailPublic;
  selectedCoach?: CoachForTrack;
  reservationDate: string;
  onReservationDateChange: (value: string) => void;
  availableSlots: AvailableSlot[];
  slotsLoading: boolean;
  selectedTrackSlotStart: string;
  onTrackSlotChange: (value: string) => void;
  pilotType: string;
  onPilotTypeChange: (value: string) => void;
  trackReservationType: 'FULL_DAY' | 'HALF_DAY';
  onTrackReservationTypeChange: (value: 'FULL_DAY' | 'HALF_DAY') => void;
  coachSlotsLoading: boolean;
  compatibleCoachSlots: CoachAvailableSlot[];
  selectedCoachSlotId: number | null;
  onCoachSlotSelect: (slot: CoachAvailableSlot) => void;
  participants: number;
  onParticipantsChange: (value: number) => void;
  maxParticipants: number;
  showGroupParticipants: boolean;
  onCalculateQuote: () => void;
  quoteLoading: boolean;
}

export function QuoteCheckoutForm({
  track,
  selectedCoach,
  reservationDate,
  onReservationDateChange,
  availableSlots,
  slotsLoading,
  selectedTrackSlotStart,
  onTrackSlotChange,
  pilotType,
  onPilotTypeChange,
  trackReservationType,
  onTrackReservationTypeChange,
  coachSlotsLoading,
  compatibleCoachSlots,
  selectedCoachSlotId,
  onCoachSlotSelect,
  participants,
  onParticipantsChange,
  maxParticipants,
  showGroupParticipants,
  onCalculateQuote,
  quoteLoading,
}: QuoteCheckoutFormProps) {
  const step = !reservationDate ? 1 : selectedTrackSlotStart ? 2 : 1;
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-lg font-bold text-white">Booking details</h2>
        <span className="text-xs text-gray-500 font-medium">Step {quoteLoading ? 3 : step} of 3</span>
      </div>

      <div className="space-y-6">
        {/* Date & time */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            When
          </legend>

          <FormField label="Date" required hint="Choose your riding day">
            <input
              type="date"
              min={today}
              value={reservationDate}
              onChange={(e) => onReservationDateChange(e.target.value)}
              className={inputClass}
              aria-label="Reservation date"
            />
          </FormField>

          {slotsLoading && (
            <div className="space-y-2">
              <div className="h-10 bg-gray-700/40 rounded-lg animate-pulse" />
            </div>
          )}

          {availableSlots.length === 0 && reservationDate && !slotsLoading && (
            <Alert variant="warning">No availability for this date. Try another day.</Alert>
          )}

          {availableSlots.length > 0 && !slotsLoading && (
            <FormField label="Time slot" required>
              <select
                value={selectedTrackSlotStart}
                onChange={(e) => onTrackSlotChange(e.target.value)}
                className={inputClass}
              >
                <option value="">Select a time</option>
                {availableSlots.map((slot) => {
                  const start = new Date(`2000-01-01T${slot.startTime}`);
                  const end = new Date(`2000-01-01T${slot.endTime}`);
                  const hours = (end.getTime() - start.getTime()) / 3600000;
                  return (
                    <option key={slot.id} value={slot.startTime}>
                      {slot.startTime} – {slot.endTime} ({hours.toFixed(1)}h)
                    </option>
                  );
                })}
              </select>
            </FormField>
          )}
        </fieldset>

        {/* Rider & booking type */}
        <fieldset className="space-y-4">
          <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
            Rider & duration
          </legend>

          <div className="rounded-xl bg-gray-900/50 border border-gray-700/60 p-4">
            <p className="text-xs text-gray-500 mb-2">Reference prices (AUD)</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <span className="text-gray-400">
                Junior <strong className="text-orange-400">${track.prices.junior}</strong>
              </span>
              <span className="text-gray-400">
                Senior <strong className="text-orange-400">${track.prices.senior}</strong>
              </span>
            </div>
          </div>

          <FormField label="Rider category" hint="Junior or Senior pricing applies">
            <select
              value={pilotType}
              onChange={(e) => onPilotTypeChange(e.target.value)}
              className={inputClass}
            >
              <option value="JUNIOR">Junior</option>
              <option value="SENIOR">Senior</option>
            </select>
          </FormField>

          <FormField label="Session length">
            <div className="grid grid-cols-2 gap-2">
              {(['FULL_DAY', 'HALF_DAY'] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => onTrackReservationTypeChange(value)}
                  className={`py-2.5 px-3 rounded-lg text-sm font-semibold transition-colors ${
                    trackReservationType === value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-900 border border-gray-600 text-gray-300 hover:border-orange-500/50'
                  }`}
                >
                  {value === 'FULL_DAY' ? 'Full day' : 'Half day'}
                </button>
              ))}
            </div>
          </FormField>
        </fieldset>

        {/* Coach slots */}
        {selectedCoach && (
          <fieldset className="space-y-4">
            <legend className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-2">
              Coach: {selectedCoach.name}
            </legend>

            {!selectedTrackSlotStart && (
              <Alert variant="info">Select a track time slot first to see coach availability.</Alert>
            )}

            {selectedTrackSlotStart && coachSlotsLoading && (
              <p className="text-gray-400 text-sm">Loading coach slots...</p>
            )}

            {selectedTrackSlotStart && !coachSlotsLoading && compatibleCoachSlots.length === 0 && (
              <Alert variant="warning">
                No coach slots overlap with your selected track time.
              </Alert>
            )}

            {selectedTrackSlotStart && !coachSlotsLoading && compatibleCoachSlots.length > 0 && (
              <FormField label="Coach time" required>
                <div className="space-y-2 rounded-lg border border-gray-700 bg-gray-900/50 p-2">
                  {compatibleCoachSlots.map((slot) => {
                    const typeLabel =
                      slot.classType === 'HOURLY'
                        ? 'Hourly'
                        : slot.classType === 'HALF_DAY'
                          ? 'Half day'
                          : 'Full day';
                    return (
                      <label
                        key={slot.id}
                        className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="coachSlot"
                          checked={selectedCoachSlotId === slot.id}
                          onChange={() => onCoachSlotSelect(slot)}
                          className="accent-orange-500"
                        />
                        <span className="text-sm text-gray-200 flex-1">
                          {slot.startTime} – {slot.endTime}
                        </span>
                        <span className="text-xs text-gray-500">{typeLabel}</span>
                        <span className="text-xs text-gray-500">
                          {slot.mode === 'ONE_TO_ONE' ? '1:1' : 'Group'}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </FormField>
            )}

            {showGroupParticipants && (
              <FormField label="Participants" hint={`Max ${maxParticipants} for this session`}>
                <input
                  type="number"
                  min={1}
                  max={maxParticipants}
                  value={participants}
                  onChange={(e) => onParticipantsChange(parseInt(e.target.value, 10) || 1)}
                  className={inputClass}
                />
              </FormField>
            )}
          </fieldset>
        )}
      </div>

      <Button
        type="button"
        variant="primary"
        fullWidth
        className="mt-6"
        onClick={onCalculateQuote}
        isLoading={quoteLoading}
        disabled={quoteLoading}
      >
        {quoteLoading ? 'Calculating...' : 'Calculate quote'}
      </Button>
    </div>
  );
}

const inputClass =
  'w-full bg-gray-900 border border-gray-600 rounded-lg px-4 py-2.5 text-white text-sm placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-orange-500';

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-200 mb-1.5">
        {label}
        {required && <span className="text-orange-400 ml-1">*</span>}
      </label>
      {children}
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  );
}

function Alert({
  children,
  variant,
}: {
  children: React.ReactNode;
  variant: 'info' | 'warning';
}) {
  const styles =
    variant === 'info'
      ? 'bg-blue-500/10 border-blue-500/30 text-blue-200'
      : 'bg-amber-500/10 border-amber-500/30 text-amber-200';
  return (
    <div className={`rounded-lg border p-3 text-sm ${styles}`}>{children}</div>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import {
  getAvailableSlotsForDate,
  getCoachAvailableSlotsForDate,
  getTrackDetailPublic,
  type AvailableSlot,
  type CoachAvailableSlot,
  type CoachForTrack,
  type TrackDetailPublic,
} from '@/services/trackService';
import { ROUTES } from '@/router/routes';
import { AppCalendar, Button, FlowbiteIcon, type FlowbiteIconName } from '@/components/ui';
import { LoadingSpinner } from '@/components/common';
import { TrackPhotoCarousel } from '@/components/tracks/TrackPhotoCarousel';
import { toHHMM, toMinutes } from './QuoteCheckoutUtils';
import { getMediaUrl } from '@/utils/media';

const DIFFICULTY: Record<string, { label: string; className: string }> = {
  BEGINNER: { label: 'Beginner', className: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30' },
  INTERMEDIATE: { label: 'Intermediate', className: 'bg-amber-500/15 text-amber-300 border-amber-500/30' },
  ADVANCED: { label: 'Advanced', className: 'bg-red-500/15 text-red-300 border-red-500/30' },
};

interface CrossedCoachSlot {
  coachSlotId: number;
  trackSlotId: number;
  trackSlotStart: string;
  startTime: string;
  endTime: string;
  classType: string;
  remaining?: number;
}

interface CoachScheduleState {
  open: boolean;
  loading: boolean;
  slots: CrossedCoachSlot[];
  error: string | null;
}

type CoachWithOneToOneServices = CoachForTrack & {
  services: CoachForTrack['services'];
};

export function TrackDetailPage() {
  const { trackId } = useParams<{ trackId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [track, setTrack] = useState<TrackDetailPublic | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCoachDate, setSelectedCoachDate] = useState(toDateInputValue(addDays(new Date(), 1)));
  const [datePickerOpen, setDatePickerOpen] = useState(false);
  const [coachSchedules, setCoachSchedules] = useState<Record<number, CoachScheduleState>>({});
  const [selectedCoachForModal, setSelectedCoachForModal] = useState<CoachWithOneToOneServices | null>(null);

  useEffect(() => {
    if (!trackId) return;
    const load = async () => {
      try {
        setLoading(true);
        const data = await getTrackDetailPublic(parseInt(trackId, 10));
        setTrack(data);
        setError(null);
      } catch {
        setError('Could not load track details');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [trackId]);

  useEffect(() => {
    setCoachSchedules({});
  }, [selectedCoachDate]);

  const isPilot = user?.role === 'PILOT';
  const visibleCoaches: CoachWithOneToOneServices[] =
    track?.coaches
      .map((coach) => ({
        ...coach,
        services: coach.services.filter((service) => service.mode === 'ONE_TO_ONE'),
      }))
      .filter((coach) => coach.services.length > 0) ?? [];

  const goToCoachBooking = (
    coachId: number,
    slot?: { coachSlotId: number; trackSlotId: number; trackSlotStart: string }
  ) => {
    if (!trackId) return;

    const params = new URLSearchParams({
      coach: String(coachId),
      date: selectedCoachDate,
    });

    if (slot) {
      params.set('coachSlot', String(slot.coachSlotId));
      params.set('trackSlotId', String(slot.trackSlotId));
      params.set('trackSlot', slot.trackSlotStart);
    }

    navigate(`/quote/checkout/${trackId}?${params.toString()}`);
  };

  const toggleCoachSchedule = async (coachId: number) => {
    if (!trackId) return;

    const current = coachSchedules[coachId];
    if (current?.open) {
      setCoachSchedules((previous) => ({
        ...previous,
        [coachId]: { ...current, open: false },
      }));
      return;
    }

    setCoachSchedules((previous) => ({
      ...previous,
      [coachId]: {
        open: true,
        loading: true,
        slots: previous[coachId]?.slots ?? [],
        error: null,
      },
    }));

    try {
      const numericTrackId = parseInt(trackId, 10);
      const [trackSlots, coachSlots] = await Promise.all([
        getAvailableSlotsForDate(numericTrackId, selectedCoachDate),
        getCoachAvailableSlotsForDate(coachId, numericTrackId, selectedCoachDate),
      ]);

      setCoachSchedules((previous) => ({
        ...previous,
        [coachId]: {
          open: true,
          loading: false,
          slots: buildCrossedSlots(trackSlots, coachSlots),
          error: null,
        },
      }));
    } catch {
      setCoachSchedules((previous) => ({
        ...previous,
        [coachId]: {
          open: true,
          loading: false,
          slots: [],
          error: 'Could not load shared availability',
        },
      }));
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-gray-400 text-sm">Loading track...</p>
      </div>
    );
  }

  if (error || !track) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <p className="text-red-300 mb-6">{error ?? 'Track not found'}</p>
        <Link to={ROUTES.MAP}>
          <Button variant="primary">Back to map</Button>
        </Link>
      </div>
    );
  }

  const difficulty = DIFFICULTY[track.difficulty_level] ?? {
    label: track.difficulty_level,
    className: 'bg-gray-500/15 text-gray-300 border-gray-500/30',
  };

  return (
    <div className="max-w-6xl mx-auto">
      <Link
        to={ROUTES.MAP}
        className="inline-flex items-center text-sm text-slate-500 hover:text-orange-500 dark:text-gray-400 dark:hover:text-orange-400 mb-6 transition-colors"
      >
        Back to map
      </Link>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <TrackPhotoCarousel photos={track.photos} trackName={track.name} />

          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span
                className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${difficulty.className}`}
              >
                {difficulty.label}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-950 dark:text-white">{track.name}</h1>
            {track.description && (
              <p className="text-slate-600 dark:text-gray-400 mt-3 leading-relaxed">{track.description}</p>
            )}
          </div>

          <section className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h2 className="text-lg font-bold text-slate-950 dark:text-white">
                Available coaches
              </h2>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setDatePickerOpen((open) => !open)}
                  className="inline-flex w-full items-center justify-between gap-2.5 rounded-xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:border-orange-300 hover:bg-orange-50/60 dark:border-gray-700 dark:bg-gray-800/70 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/10 sm:w-auto sm:min-w-56"
                >
                  <span className="inline-flex items-center gap-2.5">
                    <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-500/10 text-orange-600 dark:text-orange-300">
                      <FlowbiteIcon name="calendar" className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-[10px] font-bold uppercase tracking-[0.16em] leading-tight text-slate-500 dark:text-gray-400">
                        Lesson date
                      </span>
                      <span className="block text-sm font-bold leading-tight text-slate-950 dark:text-white">
                        {formatDisplayDate(selectedCoachDate)}
                      </span>
                    </span>
                  </span>
                  <FlowbiteIcon
                    name={datePickerOpen ? 'chevron-left' : 'chevron-right'}
                    className="h-4 w-4 text-slate-400"
                  />
                </button>

                {datePickerOpen && (
                  <div className="absolute right-0 z-30 mt-2 w-full min-w-[20rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 dark:border-gray-700 dark:bg-gray-900 dark:shadow-black/40 sm:w-80">
                    <AppCalendar
                      value={selectedCoachDate}
                      onChange={(value) => {
                        setSelectedCoachDate(value);
                        setDatePickerOpen(false);
                      }}
                      minDateKey={toDateInputValue(addDays(new Date(), 1))}
                      accent="orange"
                      density="compact"
                      locale="en-US"
                    />
                  </div>
                )}
              </div>
            </div>

            {visibleCoaches.length === 0 ? (
              <p className="text-slate-500 dark:text-gray-500 text-sm p-4 rounded-xl border border-slate-200 bg-white dark:border-gray-700/80 dark:bg-gray-800/30">
                No 1:1 coach lessons are available at this track yet. You can still book track time only.
              </p>
            ) : (
              <div className="grid gap-4 xl:grid-cols-2">
                {visibleCoaches.map((coach) => (
                  <CoachBookingCard
                    key={coach.id}
                    coach={coach}
                    schedule={coachSchedules[coach.id]}
                    selectedDate={selectedCoachDate}
                    isPilot={isPilot}
                    onToggleSchedule={() => toggleCoachSchedule(coach.id)}
                    onBook={() => goToCoachBooking(coach.id)}
                    onBookSlot={(slot) =>
                      goToCoachBooking(coach.id, {
                        coachSlotId: slot.coachSlotId,
                        trackSlotId: slot.trackSlotId,
                        trackSlotStart: slot.trackSlotStart,
                      })
                    }
                    onShowInfo={() => setSelectedCoachForModal(coach)}
                  />
                ))}
              </div>
            )}
          </section>
        </div>

        <aside className="lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-sm dark:border-gray-700/80 dark:bg-gray-800/40">
            <h2 className="text-sm font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-500">
              Pricing
            </h2>
            <div className="grid grid-cols-2 gap-3">
              <PriceTile label="Junior" value={track.prices.junior} />
              <PriceTile label="Senior" value={track.prices.senior} />
              {track.prices.junior_half != null && (
                <PriceTile label="Junior half day" value={track.prices.junior_half} />
              )}
              {track.prices.senior_half != null && (
                <PriceTile label="Senior half day" value={track.prices.senior_half} />
              )}
            </div>

            {isPilot ? (
              <Button
                variant="primary"
                fullWidth
                onClick={() => navigate(ROUTES.QUOTE_CHECKOUT(trackId!))}
              >
                Book track only
              </Button>
            ) : (
              <p className="text-slate-500 dark:text-gray-500 text-sm text-center">
                Sign in as a rider to book this track.
              </p>
            )}

            <p className="text-xs text-slate-500 dark:text-gray-500 text-center">
              Prices in USD. Select date and time on the next step.
            </p>
          </div>
        </aside>
      </div>

      {/* Coach Profile Details Modal */}
      {selectedCoachForModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-800 w-full max-w-lg rounded-2xl border border-slate-200 dark:border-gray-700 overflow-hidden shadow-2xl animate-scaleIn">
            
            {/* Modal Header Banner */}
            <div className="relative min-h-32 bg-gradient-to-br from-slate-950 via-slate-800 to-orange-950 p-6 text-white flex items-end gap-4">
              <button
                type="button"
                onClick={() => setSelectedCoachForModal(null)}
                className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-1.5 hover:bg-white/25 transition-colors text-white"
              >
                <FlowbiteIcon name="close" className="h-4 w-4" />
              </button>
              
              {selectedCoachForModal.foto ? (
                <img
                  src={getMediaUrl(selectedCoachForModal.foto) ?? undefined}
                  alt={selectedCoachForModal.name}
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-white/20 shadow-lg ring-1 ring-white/10 shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-white/15 flex items-center justify-center text-2xl font-bold ring-1 ring-white/20 shadow-lg shrink-0">
                  {getInitials(selectedCoachForModal.name)}
                </div>
              )}
              
              <div>
                <h3 className="text-xl font-bold">{selectedCoachForModal.name}</h3>
                <p className="text-xs text-orange-200 uppercase tracking-widest font-semibold mt-1">Verified Motocross Coach</p>
              </div>
            </div>
            
            {/* Modal Content */}
            <div className="p-6 space-y-5 max-h-[50vh] overflow-y-auto">
              
              {/* Bio Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Biography</h4>
                {selectedCoachForModal.bio ? (
                  <p className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-300">
                    {selectedCoachForModal.bio}
                  </p>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm italic text-slate-400 dark:border-slate-700/70 dark:bg-slate-900/10">
                    No biography provided yet.
                  </p>
                )}
              </div>
              
              {/* Experience Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Experience</h4>
                {selectedCoachForModal.experience ? (
                  <p className="whitespace-pre-wrap rounded-xl border border-slate-100 bg-slate-50 p-4 text-sm leading-relaxed text-slate-700 dark:border-slate-800/80 dark:bg-slate-900/40 dark:text-slate-300">
                    {selectedCoachForModal.experience}
                  </p>
                ) : (
                  <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 p-4 text-sm italic text-slate-400 dark:border-slate-700/70 dark:bg-slate-900/10">
                    No experience details specified yet.
                  </p>
                )}
              </div>
              
              {/* Rates Section */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-2">Coaching Rates</h4>
                <div className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700/80 dark:divide-slate-700 dark:bg-slate-900/10">
                  {selectedCoachForModal.services.map((svc, idx) => (
                    <div key={idx} className="flex justify-between items-center px-4 py-3.5 text-sm">
                      <div>
                        <span className="font-semibold text-slate-800 dark:text-white">{formatClassType(svc.class_type)}</span>
                        <span className="ml-1.5 text-xs text-slate-400 dark:text-slate-500">({svc.mode === 'ONE_TO_ONE' ? '1:1 Session' : 'Group Session'})</span>
                      </div>
                      <span className="font-bold text-orange-500 dark:text-orange-400">${svc.price}</span>
                    </div>
                  ))}
                </div>
              </div>

            </div>
            
            {/* Modal Footer */}
            <div className="flex justify-end border-t border-slate-100 bg-slate-50 px-6 py-4 dark:border-slate-700 dark:bg-slate-900/20">
              <Button onClick={() => setSelectedCoachForModal(null)} variant="outline">
                Close
              </Button>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}

interface CoachBookingCardProps {
  coach: CoachWithOneToOneServices;
  schedule?: CoachScheduleState;
  selectedDate: string;
  isPilot: boolean;
  onToggleSchedule: () => void;
  onBook: () => void;
  onBookSlot: (slot: CrossedCoachSlot) => void;
  onShowInfo: () => void;
}

function CoachBookingCard({
  coach,
  schedule,
  selectedDate,
  isPilot,
  onToggleSchedule,
  onBook,
  onBookSlot,
  onShowInfo,
}: CoachBookingCardProps) {
  const minPrice = Math.min(...coach.services.map((service) => service.price));
  const serviceLabels = Array.from(new Set(coach.services.map((service) => formatClassType(service.class_type))));
  const maxStudents = Math.max(...coach.services.map((service) => service.max_students || 1));

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg dark:border-gray-700/80 dark:bg-gray-800/40">
      <div className="relative min-h-28 bg-gradient-to-br from-slate-950 via-slate-800 to-orange-950 p-4 text-white">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onShowInfo(); }}
          className="absolute right-4 top-4 rounded-full border border-white/20 bg-white/10 p-1.5 hover:bg-white/25 transition-colors text-white z-10"
          title="View coach profile"
        >
          <FlowbiteIcon name="user" className="h-4 w-4" />
        </button>
        <div className="flex h-full items-end gap-3 pt-8">
          {coach.foto ? (
            <img
              src={getMediaUrl(coach.foto) ?? undefined}
              alt={coach.name}
              onClick={(e) => { e.stopPropagation(); onShowInfo(); }}
              className="flex h-14 w-14 rounded-2xl bg-white/15 ring-1 ring-white/20 object-cover cursor-pointer hover:opacity-85 transition-opacity"
            />
          ) : (
            <div
              onClick={(e) => { e.stopPropagation(); onShowInfo(); }}
              className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold ring-1 ring-white/20 cursor-pointer hover:bg-white/25 transition-colors"
            >
              {getInitials(coach.name)}
            </div>
          )}
          <div className="min-w-0">
            <h3
              onClick={(e) => { e.stopPropagation(); onShowInfo(); }}
              className="truncate text-lg font-bold cursor-pointer hover:text-orange-200 transition-colors"
            >
              {coach.name}
            </h3>
            <p className="text-sm text-orange-100">Personal motocross coaching</p>
          </div>
        </div>
      </div>

      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-semibold text-orange-600 dark:text-orange-400">
            1:1 lesson
          </p>
          {coach.status === 'APPROVED' && (
            <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-1 text-xs font-semibold text-emerald-600 dark:text-emerald-300">
              <FlowbiteIcon name="badge-check" className="h-3.5 w-3.5" />
              Verified
            </span>
          )}
        </div>

        <div className="grid grid-cols-3 gap-2">
          <CoachStat icon="wallet" label="From" value={`$${minPrice}`} />
          <CoachStat icon="ticket" label="Services" value={String(serviceLabels.length)} />
          <CoachStat icon="users" label="Class" value={maxStudents > 1 ? '1:1' : '1:1'} />
        </div>

        <div className="flex flex-wrap gap-2">
          {serviceLabels.map((label) => (
            <span
              key={label}
              className="rounded-full bg-orange-50 px-3 py-1 text-xs font-semibold text-orange-700 dark:bg-orange-500/10 dark:text-orange-300"
            >
              {label}
            </span>
          ))}
        </div>

        <button
          type="button"
          onClick={onToggleSchedule}
          className="flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-sm font-semibold text-slate-800 transition hover:border-orange-300 hover:bg-orange-50 dark:border-gray-700 dark:bg-gray-900/60 dark:text-gray-100 dark:hover:border-orange-500/50 dark:hover:bg-orange-500/10"
        >
          <span className="inline-flex items-center gap-2">
            <FlowbiteIcon name="clock" className="h-4 w-4 text-orange-500" />
            View available times
          </span>
          <FlowbiteIcon
            name={schedule?.open ? 'chevron-left' : 'chevron-right'}
            className="h-4 w-4 text-slate-500 dark:text-gray-400"
          />
        </button>

        {schedule?.open && (
          <CoachSchedulePanel
            schedule={schedule}
            selectedDate={selectedDate}
            onBookSlot={onBookSlot}
          />
        )}

        {isPilot && (
          <Button variant="primary" fullWidth size="sm" onClick={onBook}>
            Book
            <FlowbiteIcon name="arrow-right" className="h-4 w-4" />
          </Button>
        )}
      </div>
    </article>
  );
}

function CoachSchedulePanel({
  schedule,
  selectedDate,
  onBookSlot,
}: {
  schedule: CoachScheduleState;
  selectedDate: string;
  onBookSlot: (slot: CrossedCoachSlot) => void;
}) {
  if (schedule.loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
        Loading shared availability...
      </div>
    );
  }

  if (schedule.error) {
    return (
      <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-600 dark:text-red-300">
        {schedule.error}
      </div>
    );
  }

  if (schedule.slots.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-500 dark:border-gray-700 dark:bg-gray-900/50 dark:text-gray-400">
        No shared availability for {formatShortDate(selectedDate)}.
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 dark:border-gray-700 dark:bg-gray-900/50">
      <div className="mb-2 flex items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-gray-500">
          Available times
        </p>
        <span className="text-xs font-medium text-slate-500 dark:text-gray-400">
          {formatShortDate(selectedDate)}
        </span>
      </div>
      <div className="space-y-2">
        {schedule.slots.slice(0, 5).map((slot) => (
          <div
            key={`${slot.coachSlotId}-${slot.startTime}-${slot.endTime}`}
            className="flex items-center justify-between gap-3 rounded-lg bg-white px-3 py-2 text-sm shadow-sm dark:bg-gray-800"
          >
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                {slot.startTime} - {slot.endTime}
              </p>
              <p className="text-xs text-slate-500 dark:text-gray-400">
                {formatClassType(slot.classType)}
                {slot.remaining != null ? ` - ${slot.remaining} spot(s) left` : ''}
              </p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onBookSlot(slot)}>
              Book
            </Button>
          </div>
        ))}
      </div>
      {schedule.slots.length > 5 && (
        <p className="mt-2 text-xs text-slate-500 dark:text-gray-400">
          Showing the first 5 options. Continue booking to review more details.
        </p>
      )}
    </div>
  );
}

function CoachStat({
  icon,
  label,
  value,
}: {
  icon: FlowbiteIconName;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-2 dark:border-gray-700 dark:bg-gray-900/60">
      <FlowbiteIcon name={icon} className="mb-1 h-4 w-4 text-slate-500 dark:text-gray-400" />
      <p className="text-[11px] font-medium text-slate-500 dark:text-gray-500">{label}</p>
      <p className="truncate text-sm font-bold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}

function PriceTile({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-lg bg-slate-50 p-3 text-center border border-slate-200 dark:bg-gray-900/50 dark:border-gray-700/50">
      <p className="text-xs text-slate-500 dark:text-gray-500 mb-1">{label}</p>
      <p className="text-lg font-bold text-orange-500">${value}</p>
    </div>
  );
}

function buildCrossedSlots(
  trackSlots: AvailableSlot[],
  coachSlots: CoachAvailableSlot[]
): CrossedCoachSlot[] {
  const crossedSlots = new Map<string, CrossedCoachSlot>();

  trackSlots.forEach((trackSlot) => {
    const remaining = getTrackSlotRemaining(trackSlot);
    if (trackSlot.isFull || remaining <= 0) return;

    const trackStart = toMinutes(trackSlot.startTime);
    const trackEnd = toMinutes(trackSlot.endTime);

    coachSlots
      .filter((slot) => slot.mode === 'ONE_TO_ONE')
      .forEach((coachSlot) => {
        const coachStart = toMinutes(coachSlot.startTime);
        const coachEnd = toMinutes(coachSlot.endTime);
        const overlapStart = Math.max(trackStart, coachStart);
        const overlapEnd = Math.min(trackEnd, coachEnd);

        if (overlapEnd <= overlapStart) return;

        const startTime = toHHMM(overlapStart);
        const endTime = toHHMM(overlapEnd);
        const key = `${coachSlot.id}-${startTime}-${endTime}`;
        const previous = crossedSlots.get(key);

        crossedSlots.set(key, {
          coachSlotId: coachSlot.id,
          trackSlotId: trackSlot.id,
          trackSlotStart: trackSlot.startTime,
          startTime,
          endTime,
          classType: coachSlot.classType,
          remaining: Math.max(previous?.remaining ?? 0, remaining),
        });
      });
  });

  return Array.from(crossedSlots.values()).sort(
    (a, b) => toMinutes(a.startTime) - toMinutes(b.startTime)
  );
}

function getTrackSlotRemaining(slot: AvailableSlot) {
  return Math.max(slot.remaining ?? slot.capacity - Math.max(slot.reserved ?? 0, 0), 0);
}

function formatClassType(value: string) {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
}

function toDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number) {
  const nextDate = new Date(date);
  nextDate.setDate(nextDate.getDate() + days);
  return nextDate;
}

function formatShortDate(value: string) {
  if (!value) return '';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}

function formatDisplayDate(value: string) {
  if (!value) return 'Select date';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
}

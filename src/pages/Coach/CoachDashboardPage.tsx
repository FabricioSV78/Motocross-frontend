import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { ROUTES } from '@/router/routes';
import { Button, FlowbiteIcon, MetricCard, SectionEyebrow, StatusPill, SurfaceCard } from '@/components/ui';
import { PageHeader } from '@/components/pilot';

export function CoachDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Coach';

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Coach workspace"
        title={`Hello, ${displayName}`}
        subtitle="Keep services, tracks, and lesson availability synchronized so riders can book confidently."
        action={<StatusPill color="success">Approved</StatusPill>}
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard label="Availability" value="Publish" detail="Add lesson slots on open track windows" icon="calendar-plus" tone="emerald" />
        <MetricCard label="Lessons" value="Review" detail="See assigned rider bookings" icon="users" tone="sky" />
        <MetricCard label="Nearby tracks" value="Map" detail="Find tracks close to your area" icon="map-pin" />
        <MetricCard label="Profile" value="Trust" detail="Keep public coach details current" icon="shield-check" tone="slate" />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
        <SurfaceCard className="relative overflow-hidden">
          <div className="absolute -right-16 top-0 h-72 w-72 rounded-full bg-emerald-500/15 blur-3xl" />
          <div className="relative">
            <SectionEyebrow>Scheduling focus</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Publish only lessons that fit track availability.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Select a track, service, and time window. The availability flow checks compatibility
              so riders see realistic coaching options.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <ChecklistItem icon="flag" title="Track" text="Teach where windows exist" />
              <ChecklistItem icon="users" title="Mode" text="Focused 1:1 coaching" />
              <ChecklistItem icon="clock" title="Time" text="Avoid overlap and gaps" />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to={ROUTES.COACH_AVAILABILITY}>
                <Button variant="primary" fullWidth className="sm:min-w-44">
                  <FlowbiteIcon name="calendar-plus" className="h-4 w-4" />
                  Add availability
                </Button>
              </Link>
              <Link to={ROUTES.COACH_RESERVATIONS}>
                <Button variant="outline" fullWidth className="sm:min-w-44">
                  <FlowbiteIcon name="users" className="h-4 w-4" />
                  View lessons
                </Button>
              </Link>
              <Link to={ROUTES.MAP}>
                <Button variant="outline" fullWidth className="sm:min-w-44">
                  <FlowbiteIcon name="map-pin" className="h-4 w-4" />
                  Open map
                </Button>
              </Link>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionEyebrow>Manage</SectionEyebrow>
          <div className="mt-4 grid gap-3">
            <QuickLink title="Availability" description="Publish coaching time slots" to={ROUTES.COACH_AVAILABILITY} icon="calendar-plus" />
            <QuickLink title="My lessons" description="Bookings assigned to you" to={ROUTES.COACH_RESERVATIONS} icon="users" />
            <QuickLink title="Settings" description="Tracks, services, and rates" to={ROUTES.COACH_SETTINGS} icon="cog" />
            <QuickLink title="Profile" description="Your public coach details" to={ROUTES.PROFILE} icon="user-settings" />
          </div>
        </SurfaceCard>
      </section>
    </div>
  );
}

function ChecklistItem({
  icon,
  title,
  text,
}: {
  icon: 'flag' | 'users' | 'clock';
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/35">
      <FlowbiteIcon name={icon} className="h-5 w-5 text-emerald-500" />
      <p className="mt-3 text-sm font-bold text-slate-950 dark:text-white">{title}</p>
      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{text}</p>
    </div>
  );
}

function QuickLink({
  title,
  description,
  to,
  icon,
}: {
  title: string;
  description: string;
  to: string;
  icon: 'calendar-plus' | 'users' | 'cog' | 'user-settings';
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-emerald-500/40"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-emerald-100 group-hover:text-emerald-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-emerald-500/15 dark:group-hover:text-emerald-200">
          <FlowbiteIcon name={icon} className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">{title}</span>
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{description}</span>
        </span>
      </span>
      <FlowbiteIcon name="arrow-right" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-emerald-500" />
    </Link>
  );
}

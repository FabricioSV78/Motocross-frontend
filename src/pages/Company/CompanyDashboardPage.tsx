import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { ROUTES } from '@/router/routes';
import { Button, FlowbiteIcon, MetricCard, SectionEyebrow, SurfaceCard } from '@/components/ui';
import { PageHeader } from '@/components/pilot';

export function CompanyDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Company';

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Company operations"
        title={`Hello, ${displayName}`}
        subtitle="Manage tracks, publish availability, and keep rider reservations moving smoothly."
        action={
          <Link to={ROUTES.CREATE_TRACK}>
            <Button variant="primary" size="md">
              <FlowbiteIcon name="plus" className="h-4 w-4" />
              Create track
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-4">
        <MetricCard label="Tracks" value="Manage" detail="Edit locations, pricing, and media" icon="flag" />
        <MetricCard label="Availability" value="Calendar" detail="Open dates and capacity windows" icon="calendar-plus" tone="sky" />
        <MetricCard label="Riders" value="Bookings" detail="Review reservations per track" icon="users" tone="emerald" />
        <MetricCard label="Public view" value="Map" detail="See how riders discover you" icon="map-pin" tone="slate" />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,0.62fr)_minmax(0,0.38fr)]">
        <SurfaceCard className="relative overflow-hidden">
          <div className="absolute -right-16 -top-20 h-72 w-72 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="relative">
            <SectionEyebrow>Launch checklist</SectionEyebrow>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-slate-950 dark:text-white">
              Turn track inventory into bookable sessions.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
              Create a track, place it on the map, upload strong visuals, then publish availability
              so riders can quote and reserve with confidence.
            </p>
            <div className="mt-6 grid gap-3 md:grid-cols-3">
              <ChecklistItem icon="map-pin" title="Location" text="Pin the track precisely" />
              <ChecklistItem icon="wallet" title="Pricing" text="Set junior and senior rates" />
              <ChecklistItem icon="calendar" title="Dates" text="Publish clean time windows" />
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link to={ROUTES.CREATE_TRACK}>
                <Button variant="primary" fullWidth className="sm:min-w-40">
                  <FlowbiteIcon name="plus" className="h-4 w-4" />
                  New track
                </Button>
              </Link>
              <Link to={ROUTES.COMPANY_TRACKS}>
                <Button variant="outline" fullWidth className="sm:min-w-40">
                  <FlowbiteIcon name="flag" className="h-4 w-4" />
                  My tracks
                </Button>
              </Link>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionEyebrow>Quick access</SectionEyebrow>
          <div className="mt-4 grid gap-3">
            <QuickLink title="My tracks" description="Edit, availability, bookings" to={ROUTES.COMPANY_TRACKS} icon="flag" />
            <QuickLink title="Create track" description="New location and photos" to={ROUTES.CREATE_TRACK} icon="plus" />
            <QuickLink title="Public map" description="Audit rider-facing listings" to={ROUTES.MAP} icon="map-pin" />
            <QuickLink title="Profile" description="Company account details" to={ROUTES.PROFILE} icon="building" />
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
  icon: 'map-pin' | 'wallet' | 'calendar';
  title: string;
  text: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/70 p-4 dark:border-slate-800 dark:bg-slate-950/35">
      <FlowbiteIcon name={icon} className="h-5 w-5 text-orange-500" />
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
  icon: 'flag' | 'plus' | 'map-pin' | 'building';
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white/70 p-4 transition hover:-translate-y-0.5 hover:border-orange-300 hover:shadow-lg dark:border-slate-800 dark:bg-slate-950/40 dark:hover:border-orange-500/40"
    >
      <span className="flex min-w-0 items-center gap-3">
        <span className="grid h-10 w-10 place-items-center rounded-xl bg-slate-100 text-slate-600 group-hover:bg-orange-100 group-hover:text-orange-600 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-orange-500/15 dark:group-hover:text-orange-200">
          <FlowbiteIcon name={icon} className="h-5 w-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate text-sm font-bold text-slate-950 dark:text-white">{title}</span>
          <span className="block truncate text-xs text-slate-500 dark:text-slate-400">{description}</span>
        </span>
      </span>
      <FlowbiteIcon name="arrow-right" className="h-4 w-4 text-slate-400 transition group-hover:translate-x-0.5 group-hover:text-orange-500" />
    </Link>
  );
}

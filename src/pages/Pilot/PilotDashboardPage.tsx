import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { ROUTES } from '@/router/routes';
import { Button, FlowbiteIcon, MetricCard, SectionEyebrow, SurfaceCard } from '@/components/ui';
import { PageHeader } from '@/components/pilot';

export function PilotDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Rider';

  return (
    <div className="mx-auto max-w-7xl">
      <PageHeader
        eyebrow="Rider cockpit"
        title={`Hello, ${displayName}`}
        subtitle="Find the right track, choose your date, and keep every reservation easy to review."
        action={
          <Link to={ROUTES.MAP}>
            <Button variant="primary" size="md">
              <FlowbiteIcon name="map-pin" className="h-4 w-4" />
              Find tracks
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4 lg:grid-cols-3">
        <MetricCard
          label="Discovery"
          value="Map"
          detail="Browse tracks by location and availability"
          icon="map-pin"
          tone="orange"
        />
        <MetricCard
          label="Bookings"
          value="Live"
          detail="Review confirmed, past, and cancelled reservations"
          icon="ticket"
          tone="sky"
        />
        <MetricCard
          label="Profile"
          value="Ready"
          detail="Keep rider level and bike details current"
          icon="user"
          tone="slate"
        />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.55fr)]">
        <SurfaceCard className="relative overflow-hidden">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-orange-500/15 blur-3xl" />
          <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
            <div>
              <SectionEyebrow>Next best action</SectionEyebrow>
              <h2 className="mt-3 max-w-2xl text-3xl font-black tracking-tight text-slate-950 dark:text-white">
                Book the next ride without losing context.
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
                Start on the map, compare track details, then calculate the quote in one focused
                checkout flow. Less wandering, more riding.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link to={ROUTES.MAP}>
                  <Button variant="primary" fullWidth className="sm:min-w-40">
                    <FlowbiteIcon name="map-pin" className="h-4 w-4" />
                    Open map
                  </Button>
                </Link>
                <Link to={ROUTES.RESERVATIONS}>
                  <Button variant="outline" fullWidth className="sm:min-w-40">
                    <FlowbiteIcon name="ticket" className="h-4 w-4" />
                    My bookings
                  </Button>
                </Link>
              </div>
            </div>

            <div className="rounded-3xl border border-orange-200/80 bg-orange-50/70 p-5 dark:border-orange-500/20 dark:bg-orange-500/10">
              <p className="text-sm font-bold text-orange-700 dark:text-orange-200">Booking flow</p>
              <div className="mt-5 space-y-4">
                {['Choose track', 'Pick date', 'Confirm quote'].map((step, index) => (
                  <div key={step} className="flex items-center gap-3">
                    <span className="grid h-8 w-8 place-items-center rounded-full bg-white text-sm font-black text-orange-600 shadow-sm dark:bg-slate-950 dark:text-orange-300">
                      {index + 1}
                    </span>
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">{step}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </SurfaceCard>

        <SurfaceCard>
          <SectionEyebrow>Quick access</SectionEyebrow>
          <div className="mt-4 grid gap-3">
            <QuickLink title="Track map" description="Explore nearby riding options" to={ROUTES.MAP} icon="map-pin" />
            <QuickLink title="Reservations" description="See booking history and details" to={ROUTES.RESERVATIONS} icon="ticket" />
            <QuickLink title="Profile" description="Update rider and account details" to={ROUTES.PROFILE} icon="user-settings" />
          </div>
        </SurfaceCard>
      </section>
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
  icon: 'map-pin' | 'ticket' | 'user-settings';
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

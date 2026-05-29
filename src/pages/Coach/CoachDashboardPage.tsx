import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/pilot';

export function CoachDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Coach';

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title={`Hello, ${displayName}`}
        subtitle="Manage your schedule, rates, and assigned lessons."
        action={
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-emerald-500/15 border border-emerald-500/30 text-emerald-300">
            Approved
          </span>
        }
      />

      <section className="mb-8 rounded-2xl bg-gradient-to-br from-emerald-500/15 via-transparent to-transparent border border-emerald-500/25 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-emerald-400 mb-2">
          Priority
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
          Keep your calendar up to date
        </h2>
        <p className="text-gray-400 text-sm max-w-lg mb-5">
          Riders book when you publish availability. Set your tracks and rates first, then add
          time slots.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={ROUTES.COACH_AVAILABILITY}>
            <Button variant="primary" fullWidth className="sm:min-w-[180px]">
              Add availability
            </Button>
          </Link>
          <Link to={ROUTES.COACH_RESERVATIONS}>
            <Button variant="outline" fullWidth className="sm:min-w-[180px]">
              View lessons
            </Button>
          </Link>
        </div>
      </section>

      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
        Manage
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <QuickLink
          title="Availability"
          description="Publish coaching time slots"
          to={ROUTES.COACH_AVAILABILITY}
        />
        <QuickLink
          title="My lessons"
          description="Bookings assigned to you"
          to={ROUTES.COACH_RESERVATIONS}
        />
        <QuickLink
          title="Settings"
          description="Tracks, services, and rates"
          to={ROUTES.COACH_SETTINGS}
        />
        <QuickLink
          title="Profile"
          description="Your public coach details"
          to={ROUTES.PROFILE}
        />
        <QuickLink
          title="Track map"
          description="See where you teach"
          to={ROUTES.MAP}
        />
      </div>
    </div>
  );
}

function QuickLink({
  title,
  description,
  to,
}: {
  title: string;
  description: string;
  to: string;
}) {
  return (
    <Link
      to={to}
      className="group flex flex-col p-5 rounded-xl border border-gray-700/80 bg-gray-800/30 hover:border-emerald-500/30 transition-all"
    >
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-gray-500 text-sm flex-1">{description}</p>
      <span className="mt-3 text-sm text-gray-400 group-hover:text-emerald-400 transition-colors">
        Open →
      </span>
    </Link>
  );
}

import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/pilot';

export function PilotDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Rider';

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title={`Hello, ${displayName}`}
        subtitle="Find a track, book a session, and manage your rides."
        action={
          <Link to={ROUTES.MAP}>
            <Button variant="primary" size="md">
              Find tracks
            </Button>
          </Link>
        }
      />

      {/* Acción principal — visible en <5s */}
      <section className="mb-8 rounded-2xl bg-gradient-to-br from-orange-500/20 via-orange-600/10 to-transparent border border-orange-500/25 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">
              Next step
            </p>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Book your next ride</h2>
            <p className="text-gray-400 text-sm max-w-md">
              Browse tracks on the map, compare prices, and reserve with or without a coach.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 shrink-0">
            <Link to={ROUTES.MAP}>
              <Button variant="primary" fullWidth className="sm:min-w-[160px]">
                Open map
              </Button>
            </Link>
            <Link to={ROUTES.RESERVATIONS}>
              <Button variant="outline" fullWidth className="sm:min-w-[160px]">
                My bookings
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Accesos secundarios */}
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
        Quick access
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <QuickLink
          title="Track map"
          description="Explore tracks near you"
          to={ROUTES.MAP}
          accent="orange"
        />
        <QuickLink
          title="Reservations"
          description="View booking history"
          to={ROUTES.RESERVATIONS}
          accent="blue"
        />
        <QuickLink
          title="Profile"
          description="Level, bike, and photos"
          to={ROUTES.PROFILE}
          accent="purple"
        />
      </div>
    </div>
  );
}

interface QuickLinkProps {
  title: string;
  description: string;
  to: string;
  accent: 'orange' | 'blue' | 'purple';
}

const ACCENT: Record<QuickLinkProps['accent'], { border: string; dot: string }> = {
  orange: { border: 'hover:border-orange-500/40', dot: 'bg-orange-500' },
  blue: { border: 'hover:border-blue-500/40', dot: 'bg-blue-500' },
  purple: { border: 'hover:border-purple-500/40', dot: 'bg-purple-500' },
};

function QuickLink({ title, description, to, accent }: QuickLinkProps) {
  const styles = ACCENT[accent];
  return (
    <Link
      to={to}
      className={`group flex flex-col p-5 rounded-xl border border-gray-700/80 bg-gray-800/30 transition-all duration-200 ${styles.border}`}
    >
      <span className={`w-2 h-2 rounded-full mb-3 ${styles.dot}`} />
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-gray-500 text-sm flex-1">{description}</p>
      <span className="mt-3 text-sm text-gray-400 group-hover:text-orange-400 transition-colors">
        Open →
      </span>
    </Link>
  );
}

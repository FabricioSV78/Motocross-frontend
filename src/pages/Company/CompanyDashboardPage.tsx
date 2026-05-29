import { Link } from 'react-router-dom';
import { useAuth } from '@/providers/useAuth';
import { ROUTES } from '@/router/routes';
import { Button } from '@/components/ui/Button';
import { PageHeader } from '@/components/pilot';

export function CompanyDashboardPage() {
  const { user } = useAuth();
  const displayName = user?.name ?? user?.email?.split('@')[0] ?? 'Company';

  return (
    <div className="max-w-5xl mx-auto">
      <PageHeader
        title={`Hello, ${displayName}`}
        subtitle="Manage your tracks, availability, and bookings."
      />

      <section className="mb-8 rounded-2xl bg-gradient-to-br from-orange-500/15 via-transparent to-transparent border border-orange-500/25 p-6 sm:p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-orange-400 mb-2">
          Next step
        </p>
        <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Publish a new track</h2>
        <p className="text-gray-400 text-sm max-w-lg mb-5">
          Add location on the map, upload photos from your computer, set prices, and open
          availability for riders.
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to={ROUTES.CREATE_TRACK}>
            <Button variant="primary" fullWidth className="sm:min-w-[160px]">
              Create track
            </Button>
          </Link>
          <Link to={ROUTES.COMPANY_TRACKS}>
            <Button variant="outline" fullWidth className="sm:min-w-[160px]">
              My tracks
            </Button>
          </Link>
        </div>
      </section>

      <p className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-4">
        Quick access
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickLink title="My tracks" description="Edit, availability, bookings" to={ROUTES.COMPANY_TRACKS} />
        <QuickLink title="Create track" description="New location and photos" to={ROUTES.CREATE_TRACK} />
        <QuickLink title="Public map" description="How riders see your tracks" to={ROUTES.MAP} />
        <QuickLink title="Profile" description="Company account details" to={ROUTES.PROFILE} />
      </div>
    </div>
  );
}

function QuickLink({ title, description, to }: { title: string; description: string; to: string }) {
  return (
    <Link
      to={to}
      className="group flex flex-col p-5 rounded-xl border border-gray-700/80 bg-gray-800/30 hover:border-orange-500/30 transition-all"
    >
      <h3 className="text-white font-semibold mb-1">{title}</h3>
      <p className="text-gray-500 text-sm flex-1">{description}</p>
      <span className="mt-3 text-sm text-gray-400 group-hover:text-orange-400 transition-colors">
        Open →
      </span>
    </Link>
  );
}

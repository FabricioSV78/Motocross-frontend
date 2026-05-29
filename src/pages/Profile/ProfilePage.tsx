import { useProfile } from '@/features/profile';
import { ProfileCard } from '@/features/profile/components/ProfileCard';
import { LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/router/routes';
import { useAuth } from '@/providers/useAuth';
import { useQuery } from '@tanstack/react-query';
import { userService } from '@/services/userService';

/**
 * Página de perfil de usuario — adaptada según el rol:
 * - PILOT: muestra la tarjeta de perfil completa (foto, nivel, moto)
 * - COMPANY / COACH: muestra información básica desde /users/me
 */
export function ProfilePage() {
  const { user } = useAuth();

  if (user?.role === 'PILOT') {
    return <PilotProfileView />;
  }
  return <BasicProfileView />;
}

// ---------------------------------------------------------------------------
// Vista de piloto (HU-05)
// ---------------------------------------------------------------------------
function PilotProfileView() {
  const { profile, isLoading, error, refetch } = useProfile();

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Failed to load profile</h2>
          <p className="text-gray-400 mb-6">
            {error instanceof Error ? error.message : 'An unexpected error occurred'}
          </p>
          <div className="flex gap-3 justify-center">
            <Button onClick={() => refetch()} variant="primary">
              Try again
            </Button>
            <Link to={ROUTES.DASHBOARD}>
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-400">No profile data found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">My profile</h1>
          <p className="text-gray-400 text-sm mt-1">Your rider identity for bookings</p>
        </div>
        <Link to={ROUTES.EDIT_PROFILE}>
          <Button variant="primary" size="sm">
            Edit profile
          </Button>
        </Link>
      </div>

      <ProfileCard profile={profile} />

      <div className="mt-6">
        <Link to={ROUTES.DASHBOARD}>
          <Button variant="outline" fullWidth>
            Back to dashboard
          </Button>
        </Link>
      </div>

      <div className="mt-4 p-4 rounded-xl border border-gray-700/80 bg-gray-800/20">
        <p className="text-sm text-gray-400">
          <span className="text-gray-300 font-medium">Tip:</span> A complete profile with bike
          photo and level helps coaches prepare for your session.
        </p>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Vista básica para COMPANY y COACH
// ---------------------------------------------------------------------------

const ROLE_LABELS: Record<string, string> = {
  COMPANY: 'Company',
  COACH: 'Coach',
  ADMIN: 'Administrator',
  PILOT: 'Rider',
};

const STATUS_BADGE: Record<string, string> = {
  ACTIVE:   'bg-green-500/15 border-green-500/30 text-green-400',
  APPROVED: 'bg-green-500/15 border-green-500/30 text-green-400',
  PENDING:  'bg-yellow-500/15 border-yellow-500/30 text-yellow-400',
  REJECTED: 'bg-red-500/15 border-red-500/30 text-red-400',
};

const STATUS_LABELS: Record<string, string> = {
  ACTIVE:   'Active',
  APPROVED: 'Approved',
  PENDING:  'Pending',
  REJECTED: 'Rejected',
};

function BasicProfileView() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users', 'me'],
    queryFn: userService.getMe,
    staleTime: 1000 * 60 * 5,
  });

  const dashboardRoute =
    user?.role === 'COMPANY' ? ROUTES.COMPANY_DASHBOARD : ROUTES.COACH_DASHBOARD;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" />
          <p className="text-gray-400 mt-4">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-white mb-2">Failed to load profile</h2>
          <Link to={dashboardRoute}>
            <Button variant="outline" className="mt-4">Back to Dashboard</Button>
          </Link>
        </div>
      </div>
    );
  }

  const badgeClass = STATUS_BADGE[data.status] ?? 'bg-gray-700/30 border-gray-600 text-gray-400';
  const statusLabel = STATUS_LABELS[data.status] ?? data.status;
  const roleLabel = ROLE_LABELS[data.role] ?? data.role;
  const initials = data.nombre.charAt(0).toUpperCase();

  return (
    <div className="max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-white mb-2">My Profile</h1>
        <p className="text-gray-400">Your account details</p>
      </div>

      <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-700 p-8">
        {/* Avatar + nombre */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500/30 to-red-500/30 border-2 border-orange-500/30 flex items-center justify-center shrink-0">
            <span className="text-3xl font-black text-orange-400">{initials}</span>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">{data.nombre}</h2>
            <p className="text-gray-400 text-sm mt-0.5">{data.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-widest">{roleLabel}</span>
              <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-semibold border ${badgeClass}`}>
                {statusLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Datos */}
        <div className="grid gap-4">
          <InfoRow label="Email" value={data.email} />
          {data.nombre_empresa && <InfoRow label="Company name" value={data.nombre_empresa} />}
          {data.telefono && <InfoRow label="Phone" value={data.telefono} />}
          <InfoRow label="Role" value={roleLabel} />
          <InfoRow label="Status" value={statusLabel} />
        </div>
      </div>

      <div className="mt-6">
        <Link to={dashboardRoute}>
          <Button variant="outline" fullWidth>Back to Dashboard</Button>
        </Link>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center py-3 border-b border-gray-700/50 last:border-0">
      <span className="text-sm text-gray-400">{label}</span>
      <span className="text-sm text-white font-medium">{value}</span>
    </div>
  );
}

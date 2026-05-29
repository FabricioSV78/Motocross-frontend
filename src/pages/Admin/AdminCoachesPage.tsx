import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getProviders, verifyProvider } from '@/services/adminService';
import type { PendingProviderItem } from '@/services/adminService';
import { LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/router/routes';
import { env } from '@/config/env';

// Raíz del servidor backend (sin /api/v1) para construir URLs de archivos estáticos
const BACKEND_ORIGIN = env.API_URL.replace(/\/api\/v1.*$/, '');

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const FILTER_LABELS: Record<FilterStatus, string> = {
  ALL: 'All',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function AdminCoachesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('PENDING');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Obtiene todos los proveedores con el status elegido y filtra solo coaches
  const { data: allProviders = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'coaches', filter],
    queryFn: () => getProviders(filter === 'ALL' ? undefined : filter),
    staleTime: 30_000,
    select: (data) => data.filter((p) => p.type === 'COACH'),
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'APPROVED' | 'REJECTED' }) =>
      verifyProvider(id, { providerType: 'COACH', status: action }),
    onSuccess: (data) => {
      const label = data.status === 'APPROVED' ? 'approved' : 'rejected';
      setSuccessMessage(`Coach ${label} successfully (id: ${data.providerId})`);
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'coaches'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to update coach';
      setErrorMessage(detail);
      setSuccessMessage(null);
    },
  });

  const handleAction = (coach: PendingProviderItem, action: 'APPROVED' | 'REJECTED') => {
    if (actionMutation.isPending) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    actionMutation.mutate({ id: coach.id, action });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Coach Management</h1>
          <p className="text-gray-400">Approve or reject coaches registered on the platform</p>
        </div>
        <Link to={ROUTES.ADMIN_COMPANIES}>
          <Button variant="outline" size="sm">🏢 View Companies</Button>
        </Link>
      </div>

      {/* Filtros */}
      <div className="flex gap-2 mb-6">
        {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as FilterStatus[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
              filter === f
                ? 'bg-orange-500 border-orange-500 text-white'
                : 'bg-gray-800 border-gray-700 text-gray-300 hover:border-orange-500/50 hover:text-orange-400'
            }`}
          >
            {FILTER_LABELS[f]}
          </button>
        ))}
      </div>

      {/* Feedback */}
      {successMessage && (
        <div className="mb-4 p-4 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-sm">
          ✅ {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-4 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
          ❌ {errorMessage}
        </div>
      )}

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-20">
          <LoadingSpinner size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-6 rounded-xl bg-red-500/10 border border-red-500/30 text-center text-red-400">
          <p className="font-semibold mb-1">Failed to load coaches</p>
          <p className="text-sm text-red-400/80">
            {((error as { response?: { data?: { detail?: string } } })?.response?.data?.detail) ??
              'Please try again'}
          </p>
        </div>
      )}

      {/* Empty */}
      {!isLoading && !error && allProviders.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">{filter === 'PENDING' ? '🎉' : '🎓'}</div>
          <p className="text-lg font-medium">
            No {filter !== 'ALL' ? FILTER_LABELS[filter].toLowerCase() : ''} coaches
          </p>
          {filter === 'PENDING' && (
            <p className="text-sm mt-1">All requests have been reviewed</p>
          )}
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !error && allProviders.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/40">
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Coach</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Certificate</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {allProviders.map((coach) => (
                <CoachRow
                  key={coach.id}
                  coach={coach}
                  onAction={handleAction}
                  isLoading={
                    actionMutation.isPending && actionMutation.variables?.id === coach.id
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Contador */}
      {!isLoading && allProviders.length > 0 && (
        <p className="mt-4 text-sm text-gray-500 text-right">
          {allProviders.length} coach{allProviders.length !== 1 ? 'es' : ''} found
          {allProviders.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row sub-component
// ---------------------------------------------------------------------------
interface CoachRowProps {
  coach: PendingProviderItem;
  onAction: (coach: PendingProviderItem, action: 'APPROVED' | 'REJECTED') => void;
  isLoading: boolean;
}

function CoachRow({ coach, onAction, isLoading }: CoachRowProps) {
  const badgeClass = STATUS_BADGE[coach.status] ?? 'bg-gray-700 text-gray-300 border-gray-600';
  const statusLabel = STATUS_LABELS[coach.status] ?? coach.status;
  const isDecided = coach.status === 'APPROVED' || coach.status === 'REJECTED';

  return (
    <tr className="hover:bg-gray-700/20 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🎓</span>
          <div>
            <p className="text-white font-semibold">{coach.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">ID: {coach.id}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-300 text-sm">{coach.email}</td>
      <td className="px-6 py-4">
        {coach.certificate_url ? (
          <a
            href={BACKEND_ORIGIN + coach.certificate_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/30 hover:bg-blue-500/20 transition-colors"
          >
            📄 View certificate
          </a>
        ) : (
          <span className="text-xs text-gray-600 italic">No certificate</span>
        )}
      </td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
          {statusLabel}
        </span>
      </td>
      <td className="px-6 py-4">
        {isDecided ? (
          <span className="text-sm text-gray-600 italic">
            {coach.status === 'APPROVED' ? 'Approved' : 'Rejected'}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAction(coach, 'APPROVED')}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : '✓ Approve'}
            </button>
            <button
              onClick={() => onAction(coach, 'REJECTED')}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : '✗ Reject'}
            </button>
          </div>
        )}
      </td>
    </tr>
  );
}

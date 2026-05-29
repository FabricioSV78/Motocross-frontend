import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  getProviders,
  verifyProvider,
} from '@/services/adminService';
import type { PendingProviderItem } from '@/services/adminService';
import { LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/router/routes';

// ---------------------------------------------------------------------------
// Badge helpers
// ---------------------------------------------------------------------------

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
};

const TYPE_BADGE: Record<string, string> = {
  COACH: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
  COMPANY: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
};

const TYPE_ICON: Record<string, string> = {
  COACH: '🎓',
  COMPANY: '🏢',
};

// ---------------------------------------------------------------------------
// Page component
// ---------------------------------------------------------------------------

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const FILTER_LABELS: Record<FilterStatus, string> = {
  ALL: 'All',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function AdminProvidersPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('PENDING');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: providers = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'providers', filter],
    queryFn: () => getProviders(filter === 'ALL' ? undefined : filter),
    staleTime: 30_000,
  });

  const verifyMutation = useMutation({
    mutationFn: ({
      id,
      providerType,
      status,
    }: {
      id: number;
      providerType: 'COACH' | 'COMPANY';
      status: 'APPROVED' | 'REJECTED';
    }) => verifyProvider(id, { providerType, status }),
    onSuccess: (data) => {
      const actionLabel = data.status === 'APPROVED' ? 'approved' : 'rejected';
      setSuccessMessage(
        `${data.providerType === 'COACH' ? 'Coach' : 'Company'} ${actionLabel} successfully (id: ${data.providerId})`
      );
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'providers'] });
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to update provider';
      setErrorMessage(detail);
      setSuccessMessage(null);
    },
  });

  const handleAction = (
    provider: PendingProviderItem,
    action: 'APPROVED' | 'REJECTED'
  ) => {
    if (verifyMutation.isPending) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    verifyMutation.mutate({
      id: provider.id,
      providerType: provider.type,
      status: action,
    });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Provider Management</h1>
          <p className="text-gray-400">
            Approve or reject coaches and companies before they operate on the platform
          </p>
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
          <p className="font-semibold mb-1">Failed to load providers</p>
          <p className="text-sm text-red-400/80">
            {((error as { response?: { data?: { detail?: string } } })?.response?.data?.detail) ??
              'Please try again'}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && providers.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">{filter === 'PENDING' ? '🎉' : '📋'}</div>
          <p className="text-lg font-medium">
            {filter === 'PENDING'
              ? 'No pending providers to verify'
              : `No ${FILTER_LABELS[filter].toLowerCase()} providers`}
          </p>
          {filter === 'PENDING' && (
            <p className="text-sm mt-1">All requests have been reviewed</p>
          )}
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && providers.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/40">
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Provider
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Email
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Type
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Status
                </th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {providers.map((provider) => (
                <ProviderRow
                  key={`${provider.type}-${provider.id}`}
                  provider={provider}
                  onAction={handleAction}
                  isLoading={
                    verifyMutation.isPending &&
                    verifyMutation.variables?.id === provider.id &&
                    verifyMutation.variables?.providerType === provider.type
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Counter */}
      {!isLoading && providers.length > 0 && (
        <p className="mt-4 text-sm text-gray-500 text-right">
          {providers.length} provider{providers.length !== 1 ? 's' : ''}{' '}
          {filter !== 'ALL' ? FILTER_LABELS[filter].toLowerCase() : ''} found
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Row sub-component
// ---------------------------------------------------------------------------

interface ProviderRowProps {
  provider: PendingProviderItem;
  onAction: (provider: PendingProviderItem, action: 'APPROVED' | 'REJECTED') => void;
  isLoading: boolean;
}

function ProviderRow({ provider, onAction, isLoading }: ProviderRowProps) {
  const statusBadge = STATUS_BADGE[provider.status] ?? 'bg-gray-700 text-gray-300 border-gray-600';
  const typeBadge = TYPE_BADGE[provider.type] ?? 'bg-gray-700 text-gray-300 border-gray-600';
  const icon = TYPE_ICON[provider.type] ?? '❓';

  return (
    <tr className="hover:bg-gray-700/20 transition-colors">
      {/* Name */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-3">
          <span className="text-2xl">{icon}</span>
          <div>
            <p className="text-white font-semibold">{provider.name}</p>
            <p className="text-xs text-gray-500 mt-0.5">ID: {provider.id}</p>
          </div>
        </div>
      </td>

      {/* Email */}
      <td className="px-6 py-4 text-gray-300 text-sm">{provider.email}</td>

      {/* Type */}
      <td className="px-6 py-4">
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${typeBadge}`}
        >
          {provider.type === 'COACH' ? 'Coach' : 'Company'}
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${statusBadge}`}>
          {provider.status === 'PENDING'
            ? 'Pending'
            : provider.status === 'APPROVED'
            ? 'Approved'
            : 'Rejected'}
        </span>
      </td>

      {/* Actions */}
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            onClick={() => onAction(provider, 'APPROVED')}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : '✓ Approve'}
          </button>
          <button
            onClick={() => onAction(provider, 'REJECTED')}
            disabled={isLoading}
            className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500/10 text-red-400 border border-red-500/30 hover:bg-red-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? '...' : '✗ Reject'}
          </button>
        </div>
      </td>
    </tr>
  );
}

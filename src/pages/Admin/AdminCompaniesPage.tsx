import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCompanies, verifyProvider } from '@/services/adminService';
import type { CompanyItem } from '@/services/adminService';
import { LoadingSpinner } from '@/components/common';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/router/routes';

const STATUS_BADGE: Record<string, string> = {
  PENDING: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  APPROVED: 'bg-green-500/20 text-green-400 border-green-500/30',
  REJECTED: 'bg-red-500/20 text-red-400 border-red-500/30',
  ACTIVE: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
  ACTIVE: 'Active',
};

type FilterStatus = 'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED';

const FILTER_LABELS: Record<FilterStatus, string> = {
  ALL: 'All',
  PENDING: 'Pending',
  APPROVED: 'Approved',
  REJECTED: 'Rejected',
};

export function AdminCompaniesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<FilterStatus>('PENDING');
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: companies = [], isLoading, error } = useQuery({
    queryKey: ['admin', 'companies', filter],
    queryFn: () => getCompanies(filter === 'ALL' ? undefined : filter),
    staleTime: 30_000,
  });

  const actionMutation = useMutation({
    mutationFn: ({ id, action }: { id: number; action: 'APPROVED' | 'REJECTED' }) =>
      verifyProvider(id, { providerType: 'COMPANY', status: action }),
    onSuccess: (data) => {
      const label = data.status === 'APPROVED' ? 'approved' : 'rejected';
      setSuccessMessage(`Company ${label} successfully (id: ${data.providerId})`);
      setErrorMessage(null);
      queryClient.invalidateQueries({ queryKey: ['admin', 'companies'] });
      setTimeout(() => setSuccessMessage(null), 5000);
    },
    onError: (err: unknown) => {
      const detail =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
        'Failed to update the company';
      setErrorMessage(detail);
      setSuccessMessage(null);
    },
  });

  const handleAction = (company: CompanyItem, action: 'APPROVED' | 'REJECTED') => {
    if (actionMutation.isPending) return;
    setSuccessMessage(null);
    setErrorMessage(null);
    actionMutation.mutate({ id: company.id, action });
  };

  return (
    <div className="max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-white mb-1">Company Management</h1>
          <p className="text-gray-400">Approve or reject companies registered on the platform</p>
        </div>
        <Link to={ROUTES.ADMIN_COACHES}>
          <Button variant="outline" size="sm">🎓 View Coaches</Button>
        </Link>
      </div>

      {/* Filters */}
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

      {/* Feedback messages */}
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
          <p className="font-semibold mb-1">Failed to load companies</p>
          <p className="text-sm text-red-400/80">
            {((error as { response?: { data?: { detail?: string } } })?.response?.data?.detail) ?? 'Please try again'}
          </p>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && companies.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          <div className="text-5xl mb-4">🏢</div>
          <p className="text-lg font-medium">
            No companies {filter !== 'ALL' ? FILTER_LABELS[filter].toLowerCase() : ''}
          </p>
        </div>
      )}

      {/* Tabla */}
      {!isLoading && !error && companies.length > 0 && (
        <div className="bg-gray-800/50 rounded-2xl border border-gray-700 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700 bg-gray-900/40">
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Company</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Email</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Phone</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Status</th>
                <th className="text-left px-6 py-4 text-xs font-semibold uppercase tracking-widest text-gray-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700/50">
              {companies.map((company) => (
                <CompanyRow
                  key={company.id}
                  company={company}
                  onAction={handleAction}
                  isLoading={actionMutation.isPending && actionMutation.variables?.id === company.id}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Count */}
      {!isLoading && companies.length > 0 && (
        <p className="mt-4 text-sm text-gray-500 text-right">
          {companies.length} compan{companies.length !== 1 ? 'ies' : 'y'} found
        </p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sub-componente fila
// ---------------------------------------------------------------------------
interface CompanyRowProps {
  company: CompanyItem;
  onAction: (company: CompanyItem, action: 'APPROVED' | 'REJECTED') => void;
  isLoading: boolean;
}

function CompanyRow({ company, onAction, isLoading }: CompanyRowProps) {
  const displayName = company.nombre_empresa ?? company.nombre;
  const badgeClass = STATUS_BADGE[company.status] ?? 'bg-gray-700 text-gray-300 border-gray-600';
  const statusLabel = STATUS_LABELS[company.status] ?? company.status;
  const isDecided = company.status === 'APPROVED' || company.status === 'REJECTED';

  return (
    <tr className="hover:bg-gray-700/20 transition-colors">
      <td className="px-6 py-4">
        <div>
          <p className="text-white font-semibold">{displayName}</p>
          <p className="text-xs text-gray-500 mt-0.5">ID: {company.id}</p>
        </div>
      </td>
      <td className="px-6 py-4 text-gray-300 text-sm">{company.email}</td>
      <td className="px-6 py-4 text-gray-400 text-sm">{company.telefono ?? '—'}</td>
      <td className="px-6 py-4">
        <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold border ${badgeClass}`}>
          {statusLabel}
        </span>
      </td>
      <td className="px-6 py-4">
        {isDecided ? (
          <span className="text-sm text-gray-600 italic">
            {company.status === 'APPROVED' ? 'Approved' : 'Rejected'}
          </span>
        ) : (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onAction(company, 'APPROVED')}
              disabled={isLoading}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-green-500/10 text-green-400 border border-green-500/30 hover:bg-green-500/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '...' : '✓ Approve'}
            </button>
            <button
              onClick={() => onAction(company, 'REJECTED')}
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

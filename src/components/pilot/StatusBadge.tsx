const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
  PENDING_PAYMENT: {
    bg: 'bg-amber-500/15 border-amber-500/40',
    text: 'text-amber-300',
    label: 'Pending payment',
  },
  CONFIRMED: {
    bg: 'bg-emerald-500/15 border-emerald-500/40',
    text: 'text-emerald-300',
    label: 'Confirmed',
  },
  CANCELLED: {
    bg: 'bg-red-500/15 border-red-500/40',
    text: 'text-red-300',
    label: 'Cancelled',
  },
  COMPLETED: {
    bg: 'bg-blue-500/15 border-blue-500/40',
    text: 'text-blue-300',
    label: 'Completed',
  },
};

interface StatusBadgeProps {
  status: string;
  size?: 'sm' | 'md';
}

export function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? {
    bg: 'bg-gray-500/15 border-gray-500/40',
    text: 'text-gray-300',
    label: status.replace(/_/g, ' ').toLowerCase(),
  };

  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full border ${sizeClass} ${config.bg} ${config.text}`}
    >
      {config.label}
    </span>
  );
}

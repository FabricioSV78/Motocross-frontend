const STATUS_CONFIG: Record<string, { bg: string; text: string; label: string }> = {
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
  PAST: {
    bg: 'bg-slate-500/15 border-slate-500/40',
    text: 'text-slate-300',
    label: 'Past',
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

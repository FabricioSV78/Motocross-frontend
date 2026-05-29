interface RoleSelectCardProps {
  title: string;
  description: string;
  actionLabel: string;
  accent: 'orange' | 'blue' | 'green';
  onClick: () => void;
}

const ACCENT: Record<RoleSelectCardProps['accent'], { border: string; badge: string; dot: string }> = {
  orange: {
    border: 'hover:border-orange-500/40',
    badge: 'text-orange-400 bg-orange-500/10 border-orange-500/30',
    dot: 'bg-orange-500',
  },
  blue: {
    border: 'hover:border-blue-500/40',
    badge: 'text-blue-400 bg-blue-500/10 border-blue-500/30',
    dot: 'bg-blue-500',
  },
  green: {
    border: 'hover:border-emerald-500/40',
    badge: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
    dot: 'bg-emerald-500',
  },
};

export function RoleSelectCard({
  title,
  description,
  actionLabel,
  accent,
  onClick,
}: RoleSelectCardProps) {
  const styles = ACCENT[accent];

  return (
    <button
      type="button"
      onClick={onClick}
      className={`group w-full text-left rounded-xl border border-gray-700/80 bg-gray-800/30 p-6 transition-all duration-200 ${styles.border} hover:bg-gray-800/50`}
    >
      <span className={`inline-block w-2 h-2 rounded-full mb-4 ${styles.dot}`} />
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-gray-400 text-sm leading-relaxed mb-4">{description}</p>
      <span
        className={`inline-block text-xs font-semibold px-3 py-1.5 rounded-lg border ${styles.badge}`}
      >
        {actionLabel} →
      </span>
    </button>
  );
}

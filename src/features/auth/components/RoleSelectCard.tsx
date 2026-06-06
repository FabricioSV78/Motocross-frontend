interface RoleSelectCardProps {
  title: string;
  description: string;
  actionLabel: string;
  accent: 'orange' | 'blue' | 'green';
  onClick: () => void;
}

const ACCENT: Record<RoleSelectCardProps['accent'], { border: string; badge: string; dot: string }> = {
  orange: {
    border: 'hover:border-orange-400 dark:hover:border-orange-500/50',
    badge:
      'border-orange-200 bg-orange-50 text-orange-700 dark:border-orange-500/30 dark:bg-orange-500/10 dark:text-orange-300',
    dot: 'bg-orange-500',
  },
  blue: {
    border: 'hover:border-sky-400 dark:hover:border-sky-500/50',
    badge:
      'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-300',
    dot: 'bg-sky-500',
  },
  green: {
    border: 'hover:border-emerald-400 dark:hover:border-emerald-500/50',
    badge:
      'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-300',
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
      className={`group w-full rounded-2xl border border-slate-200/90 bg-white/85 p-4 text-left shadow-xl shadow-slate-200/60 transition-all duration-200 hover:-translate-y-0.5 hover:bg-white dark:border-slate-700/80 dark:bg-slate-900/50 dark:shadow-black/20 dark:hover:bg-slate-900/80 sm:p-5 ${styles.border}`}
    >
      <span className={`mb-3 inline-block h-2 w-2 rounded-full ${styles.dot}`} />
      <h3 className="mb-2 text-lg font-bold text-slate-950 dark:text-white">{title}</h3>
      <p className="mb-3 text-sm leading-6 text-slate-600 dark:text-slate-400">{description}</p>
      <span className={`inline-block rounded-lg border px-3 py-1.5 text-xs font-bold ${styles.badge}`}>
        {actionLabel} -&gt;
      </span>
    </button>
  );
}

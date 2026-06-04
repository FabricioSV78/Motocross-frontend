import { useThemeMode } from 'flowbite-react/hooks/use-theme-mode';
import { clsx } from 'clsx';
import { FlowbiteIcon } from '@/components/ui/FlowbiteIcon';

interface ThemeToggleProps {
  compact?: boolean;
  className?: string;
}

export function ThemeToggle({ compact = false, className }: ThemeToggleProps) {
  const { computedMode, mode, setMode } = useThemeMode();
  const isDark = computedMode === 'dark';
  const nextMode = isDark ? 'light' : 'dark';

  return (
    <button
      type="button"
      onClick={() => setMode(nextMode)}
      className={clsx(
        'inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm font-semibold transition-all duration-200',
        'border-slate-200 bg-white/85 text-slate-700 shadow-sm hover:border-orange-300 hover:text-orange-600',
        'dark:border-slate-700 dark:bg-slate-900/85 dark:text-slate-200 dark:hover:border-orange-500/60 dark:hover:text-orange-300',
        'focus:outline-none focus:ring-2 focus:ring-orange-500/40',
        compact && 'h-10 w-10 justify-center px-0',
        className
      )}
      aria-label={`Switch to ${nextMode} mode`}
      title={`Switch to ${nextMode} mode`}
    >
      <span
        aria-hidden="true"
        className={clsx(
          'flex h-5 w-5 items-center justify-center rounded-full transition-colors',
          isDark ? 'bg-slate-800 text-orange-300' : 'bg-orange-100 text-orange-600'
        )}
      >
        <FlowbiteIcon name={isDark ? 'sun' : 'moon'} className="h-3.5 w-3.5" />
      </span>
      {!compact && (
        <span>
          {isDark ? 'Light mode' : 'Dark mode'}
          {mode === 'auto' && <span className="ml-1 text-xs opacity-70">(auto)</span>}
        </span>
      )}
    </button>
  );
}

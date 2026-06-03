import { useThemeMode } from 'flowbite-react/hooks/use-theme-mode';
import { clsx } from 'clsx';

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
        {isDark ? (
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1A.75.75 0 0 1 10 2ZM10 15.5a.75.75 0 0 1 .75.75v1a.75.75 0 0 1-1.5 0v-1a.75.75 0 0 1 .75-.75ZM18 10a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 18 10ZM4.5 10a.75.75 0 0 1-.75.75h-1a.75.75 0 0 1 0-1.5h1A.75.75 0 0 1 4.5 10ZM15.657 4.343a.75.75 0 0 1 0 1.06l-.707.708a.75.75 0 0 1-1.061-1.06l.707-.708a.75.75 0 0 1 1.06 0ZM6.111 13.889a.75.75 0 0 1 0 1.06l-.707.708a.75.75 0 0 1-1.061-1.06l.707-.708a.75.75 0 0 1 1.061 0ZM15.657 15.657a.75.75 0 0 1-1.06 0l-.708-.707a.75.75 0 0 1 1.06-1.061l.708.707a.75.75 0 0 1 0 1.06ZM6.111 6.111a.75.75 0 0 1-1.06 0l-.708-.707a.75.75 0 0 1 1.06-1.061l.708.707a.75.75 0 0 1 0 1.061Z" />
            <path d="M10 6.25a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5Z" />
          </svg>
        ) : (
          <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
            <path d="M17.293 13.293A8 8 0 0 1 6.707 2.707 8.001 8.001 0 1 0 17.293 13.293Z" />
          </svg>
        )}
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

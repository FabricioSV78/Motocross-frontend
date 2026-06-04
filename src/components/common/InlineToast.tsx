import { useEffect } from 'react';

interface InlineToastProps {
  message: string;
  type?: 'success' | 'error' | 'info';
  onClose?: () => void;
  title?: string;
  visible: boolean;
}

export function InlineToast({
  message,
  type = 'info',
  onClose,
  title,
  visible,
}: InlineToastProps) {
  useEffect(() => {
    if (!visible) return;
    const timeout = setTimeout(() => onClose && onClose(), 3600);
    return () => clearTimeout(timeout);
  }, [visible, onClose]);

  if (!visible) return null;

  const styles =
    type === 'success'
      ? {
          badge: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-200',
          surface:
            'border-emerald-200 bg-white text-slate-900 shadow-emerald-100/70 dark:border-emerald-500/30 dark:bg-slate-950 dark:text-white dark:shadow-black/30',
          label: 'Success',
        }
      : type === 'error'
        ? {
            badge: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-200',
            surface:
              'border-red-200 bg-white text-slate-900 shadow-red-100/70 dark:border-red-500/30 dark:bg-slate-950 dark:text-white dark:shadow-black/30',
            label: 'Error',
          }
        : {
            badge: 'bg-sky-100 text-sky-700 dark:bg-sky-500/15 dark:text-sky-200',
            surface:
              'border-sky-200 bg-white text-slate-900 shadow-sky-100/70 dark:border-sky-500/30 dark:bg-slate-950 dark:text-white dark:shadow-black/30',
            label: 'Info',
          };

  return (
    <div
      className={`fixed right-4 top-4 z-50 w-[min(92vw,420px)] rounded-2xl border px-4 py-3 shadow-2xl backdrop-blur-sm transition ${styles.surface} sm:right-6 sm:top-6`}
      role="status"
      aria-live="polite"
    >
      <div className="flex items-start gap-3">
        <div
          className={`mt-0.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide ${styles.badge}`}
        >
          {styles.label}
        </div>
        <div className="min-w-0 flex-1">
          {title ? (
            <p className="text-sm font-bold text-slate-950 dark:text-white">{title}</p>
          ) : null}
          <p
            className={`text-sm leading-5 ${
              title
                ? 'mt-1 text-slate-600 dark:text-slate-300'
                : 'font-semibold text-slate-950 dark:text-white'
            }`}
          >
            {message}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="rounded-full p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        >
          x
        </button>
      </div>
    </div>
  );
}

export default InlineToast;

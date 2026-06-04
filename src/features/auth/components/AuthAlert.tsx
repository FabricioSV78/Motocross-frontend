interface AuthAlertProps {
  variant: 'error' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
}

const STYLES = {
  error:
    'border-red-200 bg-red-50 text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-200',
  success:
    'border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200',
  info:
    'border-sky-200 bg-sky-50 text-sky-700 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
};

export function AuthAlert({ variant, title, children }: AuthAlertProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${STYLES[variant]}`} role="alert">
      {title && <p className="mb-1 font-bold">{title}</p>}
      <div className="text-[13px] leading-relaxed opacity-95">{children}</div>
    </div>
  );
}

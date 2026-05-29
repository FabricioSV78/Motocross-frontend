interface AuthAlertProps {
  variant: 'error' | 'success' | 'info';
  title?: string;
  children: React.ReactNode;
}

const STYLES = {
  error: 'bg-red-500/10 border-red-500/30 text-red-300',
  success: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300',
  info: 'bg-blue-500/10 border-blue-500/30 text-blue-200',
};

export function AuthAlert({ variant, title, children }: AuthAlertProps) {
  return (
    <div className={`rounded-xl border px-4 py-3 text-sm ${STYLES[variant]}`} role="alert">
      {title && <p className="font-semibold mb-1">{title}</p>}
      <div className="text-[13px] leading-relaxed opacity-95">{children}</div>
    </div>
  );
}

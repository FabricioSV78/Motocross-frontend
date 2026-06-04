import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  eyebrow?: string;
}

/** Encabezado consistente para pantallas autenticadas. */
export function PageHeader({ title, subtitle, action, eyebrow }: PageHeaderProps) {
  return (
    <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="max-w-3xl">
        {eyebrow && (
          <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-300">
            {eyebrow}
          </p>
        )}
        <h1 className="text-3xl font-black tracking-tight text-slate-950 sm:text-4xl dark:text-white">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 text-sm leading-6 text-slate-600 dark:text-slate-400">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

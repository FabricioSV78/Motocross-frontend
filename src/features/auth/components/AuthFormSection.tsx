import type { ReactNode } from 'react';
import { clsx } from 'clsx';

interface AuthFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function AuthFormSection({ title, description, children, className }: AuthFormSectionProps) {
  return (
    <fieldset className={clsx('min-w-0 space-y-3.5', className)}>
      <legend className="mb-3 w-full border-b border-slate-200 pb-2 dark:border-slate-700">
        <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          <span className="h-1.5 w-1.5 rounded-full bg-orange-500" aria-hidden />
          <span>{title}</span>
        </span>
        {description && (
          <p className="mt-1 text-xs normal-case tracking-normal text-slate-500 dark:text-slate-400">
            {description}
          </p>
        )}
      </legend>
      {children}
    </fieldset>
  );
}

import type { ReactNode } from 'react';

interface AuthFormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function AuthFormSection({ title, description, children }: AuthFormSectionProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="w-full">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-500 dark:text-slate-400">
          {title}
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

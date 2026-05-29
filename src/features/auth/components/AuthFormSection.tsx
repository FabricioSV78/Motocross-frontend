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
        <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          {title}
        </span>
        {description && <p className="text-xs text-gray-500 mt-1 normal-case tracking-normal">{description}</p>}
      </legend>
      {children}
    </fieldset>
  );
}

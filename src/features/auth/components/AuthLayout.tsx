import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { ROUTES } from '@/router/routes';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  maxWidth?: 'md' | 'lg' | '2xl';
  backLink?: { to: string; label: string };
  footer?: ReactNode;
}

const MAX_WIDTH: Record<NonNullable<AuthLayoutProps['maxWidth']>, string> = {
  md: 'max-w-md',
  lg: 'max-w-3xl',
  '2xl': 'max-w-4xl',
};

export function AuthLayout({
  title,
  subtitle,
  children,
  maxWidth = 'md',
  backLink,
  footer,
}: AuthLayoutProps) {
  return (
    <div className="flex min-h-svh items-center justify-center overflow-x-hidden bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_34%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_50%,#eef2f7_100%)] px-3 py-4 text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#111827_52%,#020617_100%)] dark:text-slate-100 sm:px-4 lg:py-5">
      <div className="fixed right-3 top-3 z-20 sm:right-4 sm:top-4">
        <ThemeToggle compact />
      </div>

      <div className={`w-full min-w-0 ${MAX_WIDTH[maxWidth]}`}>
        <div className="mb-4 flex flex-col items-center text-center lg:mb-5">
          <Link to={ROUTES.HOME} className="group inline-flex justify-center">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-center text-2xl font-black text-transparent transition-opacity group-hover:opacity-90 sm:text-3xl">
              MotoCross
            </span>
          </Link>
          <h1 className="mt-3 mb-1.5 max-w-full text-balance text-xl font-bold text-slate-950 dark:text-white sm:text-2xl">
            {title}
          </h1>
          <p className="mx-auto max-w-lg text-pretty text-xs leading-5 text-slate-600 dark:text-slate-400 sm:text-sm">{subtitle}</p>
        </div>

        {backLink && (
          <Link
            to={backLink.to}
            className="mb-3 inline-flex items-center text-sm font-semibold text-slate-500 transition-colors hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
          >
            {backLink.label}
          </Link>
        )}

        {children}

        {footer === undefined ? (
          <p className="mt-4 text-center text-sm text-slate-500">
            <Link to={ROUTES.HOME} className="transition-colors hover:text-slate-800 dark:hover:text-slate-300">
              Back to home
            </Link>
          </p>
        ) : (
          footer
        )}
      </div>
    </div>
  );
}

export function AuthCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`w-full rounded-2xl border border-slate-200/90 bg-white/85 p-5 shadow-xl shadow-slate-200/70 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/50 dark:shadow-black/20 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

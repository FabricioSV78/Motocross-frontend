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
  lg: 'max-w-lg',
  '2xl': 'max-w-2xl',
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
    <div className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.16),transparent_34%),linear-gradient(180deg,#fff7ed_0%,#f8fafc_50%,#eef2f7_100%)] px-4 py-10 text-slate-950 transition-colors duration-300 dark:bg-[radial-gradient(circle_at_top,rgba(249,115,22,0.18),transparent_34%),linear-gradient(180deg,#020617_0%,#111827_52%,#020617_100%)] dark:text-slate-100">
      <div className="fixed right-4 top-4 z-20">
        <ThemeToggle compact />
      </div>

      <div className={`w-full ${MAX_WIDTH[maxWidth]}`}>
        <div className="mb-8 text-center">
          <Link to={ROUTES.HOME} className="inline-block group">
            <span className="bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-2xl font-bold text-transparent transition-opacity group-hover:opacity-90">
              MotoCross
            </span>
          </Link>
          <h1 className="mt-6 mb-2 text-2xl font-bold text-slate-950 dark:text-white sm:text-3xl">
            {title}
          </h1>
          <p className="mx-auto max-w-sm text-sm text-slate-600 dark:text-slate-400">{subtitle}</p>
        </div>

        {backLink && (
          <Link
            to={backLink.to}
            className="mb-4 inline-flex items-center text-sm text-slate-500 transition-colors hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400"
          >
            {backLink.label}
          </Link>
        )}

        {children}

        {footer === undefined ? (
          <p className="mt-8 text-center text-sm text-slate-500">
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
      className={`rounded-2xl border border-slate-200/90 bg-white/85 p-6 shadow-xl shadow-slate-200/70 backdrop-blur-sm dark:border-slate-700/80 dark:bg-slate-900/50 dark:shadow-black/20 sm:p-8 ${className}`}
    >
      {children}
    </div>
  );
}

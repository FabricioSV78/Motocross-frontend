import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-b from-gray-950 via-gray-900 to-gray-950 flex items-center justify-center px-4 py-10">
      <div className={`w-full ${MAX_WIDTH[maxWidth]}`}>
        <div className="text-center mb-8">
          <Link to={ROUTES.HOME} className="inline-block group">
            <span className="text-2xl font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent group-hover:opacity-90 transition-opacity">
              MotoCross
            </span>
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold text-white mt-6 mb-2">{title}</h1>
          <p className="text-gray-400 text-sm max-w-sm mx-auto">{subtitle}</p>
        </div>

        {backLink && (
          <Link
            to={backLink.to}
            className="inline-flex items-center text-sm text-gray-400 hover:text-orange-400 mb-4 transition-colors"
          >
            {backLink.label}
          </Link>
        )}

        {children}

        {footer ?? (
          <p className="text-center text-gray-500 text-sm mt-8">
            <Link to={ROUTES.HOME} className="hover:text-gray-300 transition-colors">
              ← Back to home
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export function AuthCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`bg-gray-800/40 backdrop-blur-sm rounded-2xl border border-gray-700/80 p-6 sm:p-8 shadow-xl ${className}`}
    >
      {children}
    </div>
  );
}

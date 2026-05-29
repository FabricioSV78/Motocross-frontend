import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export function EmptyState({
  icon = '📋',
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  children,
}: EmptyStateProps) {
  const action =
    actionLabel && actionTo ? (
      <Link to={actionTo}>
        <Button variant="primary">{actionLabel}</Button>
      </Link>
    ) : actionLabel && onAction ? (
      <Button variant="primary" onClick={onAction}>
        {actionLabel}
      </Button>
    ) : null;

  return (
    <div className="bg-gray-800/40 border border-gray-700/80 rounded-2xl p-10 sm:p-14 text-center">
      <div className="text-5xl mb-4" aria-hidden>
        {icon}
      </div>
      <h2 className="text-xl font-bold text-white mb-2">{title}</h2>
      <p className="text-gray-400 text-sm max-w-md mx-auto mb-6">{description}</p>
      {action}
      {children}
    </div>
  );
}

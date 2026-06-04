import type { ReactNode } from 'react';
import { Badge, Card } from 'flowbite-react';
import { clsx } from 'clsx';
import { FlowbiteIcon, type FlowbiteIconName } from './FlowbiteIcon';

export function SurfaceCard({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={clsx(
        'overflow-hidden border border-slate-200/80 bg-white/88 shadow-xl shadow-slate-200/60 backdrop-blur',
        'dark:border-slate-800 dark:bg-slate-900/78 dark:shadow-black/25',
        className
      )}
    >
      {children}
    </Card>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-600 dark:text-orange-300">
      {children}
    </p>
  );
}

export function MetricCard({
  label,
  value,
  detail,
  icon,
  tone = 'orange',
}: {
  label: string;
  value: string;
  detail: string;
  icon: FlowbiteIconName;
  tone?: 'orange' | 'emerald' | 'sky' | 'slate';
}) {
  const tones = {
    orange: 'from-orange-500/18 to-red-500/10 text-orange-600 ring-orange-500/20 dark:text-orange-200',
    emerald: 'from-emerald-500/18 to-teal-500/10 text-emerald-600 ring-emerald-500/20 dark:text-emerald-200',
    sky: 'from-sky-500/18 to-cyan-500/10 text-sky-600 ring-sky-500/20 dark:text-sky-200',
    slate: 'from-slate-500/12 to-slate-500/5 text-slate-600 ring-slate-500/20 dark:text-slate-200',
  } satisfies Record<string, string>;

  return (
    <SurfaceCard className="transition duration-200 hover:-translate-y-0.5 hover:shadow-2xl">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-2 text-3xl font-black tracking-tight text-slate-950 dark:text-white">{value}</p>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{detail}</p>
        </div>
        <div className={clsx('rounded-2xl bg-gradient-to-br p-3 ring-1', tones[tone])}>
          <FlowbiteIcon name={icon} className="h-6 w-6" />
        </div>
      </div>
    </SurfaceCard>
  );
}

export function StatusPill({
  children,
  color = 'warning',
}: {
  children: ReactNode;
  color?: 'warning' | 'success' | 'failure' | 'info' | 'gray';
}) {
  return (
    <Badge color={color} className="w-fit rounded-full px-3 py-1 text-xs font-bold">
      {children}
    </Badge>
  );
}

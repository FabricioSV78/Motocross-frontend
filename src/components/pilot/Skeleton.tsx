export function SkeletonLine({ className = '' }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-gray-700/50 ${className}`} />;
}

export function ReservationCardSkeleton() {
  return (
    <div className="bg-gray-800/40 border border-gray-700/80 rounded-xl p-6 space-y-4">
      <SkeletonLine className="h-6 w-1/3" />
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <SkeletonLine className="h-12" />
        <SkeletonLine className="h-12" />
        <SkeletonLine className="h-12" />
      </div>
      <SkeletonLine className="h-10 w-32 ml-auto" />
    </div>
  );
}

export function DashboardCardSkeleton() {
  return (
    <div className="rounded-2xl border border-gray-700/80 bg-gray-800/30 p-6 space-y-4">
      <SkeletonLine className="h-10 w-10 rounded-full" />
      <SkeletonLine className="h-5 w-2/3" />
      <SkeletonLine className="h-4 w-full" />
      <SkeletonLine className="h-4 w-1/2" />
    </div>
  );
}

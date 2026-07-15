function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-ctl bg-hairline ${className}`} aria-hidden="true" />
}

/* Mirrors the StatCard geometry so the swap-in doesn't jump. */
export function StatCardSkeleton() {
  return (
    <div className="min-w-0 rounded-xl border border-hairline bg-surface p-4 shadow-sm md:p-5">
      <SkeletonBlock className="h-9 w-9" />
      <SkeletonBlock className="mt-4 h-7 w-20" />
      <SkeletonBlock className="mt-2 h-4 w-24" />
    </div>
  )
}

export function ChartSkeleton({ className = 'h-56' }) {
  return <SkeletonBlock className={`w-full ${className}`} />
}

export default SkeletonBlock

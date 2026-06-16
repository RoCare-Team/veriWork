function SkeletonBlock({ className = '' }) {
  return <div className={`animate-pulse rounded-2xl bg-slate-200/70 ${className}`} aria-hidden="true" />
}

export function StatCardSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-100 border-l-4 border-l-slate-200 bg-white p-5 shadow-sm">
      <SkeletonBlock className="h-10 w-10 rounded-xl" />
      <SkeletonBlock className="mt-4 h-8 w-20" />
      <SkeletonBlock className="mt-2 h-4 w-28" />
    </div>
  )
}

export function ChartSkeleton({ className = 'h-56' }) {
  return <SkeletonBlock className={`w-full ${className}`} />
}

export default SkeletonBlock

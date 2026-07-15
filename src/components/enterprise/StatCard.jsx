/* accent names blue|green|orange|red are load-bearing — other pages pass them. */
const accents = {
  blue: 'bg-brand-50 text-brand-600',
  green: 'bg-success-bg text-success',
  orange: 'bg-warning-bg text-warning',
  red: 'bg-danger-bg text-danger',
}

function StatCard({ icon, label, value, accent = 'blue', trend }) {
  const iconTile = accents[accent] || accents.blue

  return (
    // min-w-0: grid children default to min-width:auto, which is what let long
    // values push these cards past the viewport edge on mobile.
    <div className="group min-w-0 rounded-xl border border-hairline bg-surface p-4 shadow-sm transition duration-150 ease-swift hover:-translate-y-px hover:shadow-md motion-reduce:hover:translate-y-0 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-ctl ${iconTile}`}>{icon}</div>
        {trend && (
          <span className="shrink-0 rounded-full bg-canvas px-2 py-0.5 text-[11px] font-semibold text-ink-muted ring-1 ring-hairline ring-inset">
            {trend}
          </span>
        )}
      </div>
      {/* tabular-nums so the metric doesn't jitter as it ticks */}
      <p className="tabular m-0 mt-4 truncate text-2xl font-bold tracking-tight text-ink-strong md:text-[28px]">
        {value}
      </p>
      <p className="m-0 mt-1 truncate text-[13px] font-medium text-ink-muted">{label}</p>
    </div>
  )
}

export default StatCard

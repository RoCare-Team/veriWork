import { formatChartMonth } from '../../utils/formatters'

const CHART_COLORS = ['#1e3a8a', '#2748a6', '#2748a6', '#5b7fd4', '#7a9ee0', '#9ab8eb']

export function WorkforceGrowthChart({ data = [] }) {
  if (!data.length) {
    return <p className="py-12 text-center text-sm text-slate-500">No workforce growth data</p>
  }

  const w = 400
  const h = 180
  const padX = 32
  const padY = 24
  const max = Math.max(...data.map((d) => d.count || 0), 1)
  const step = data.length > 1 ? (w - padX * 2) / (data.length - 1) : 0

  const points = data.map((d, i) => {
    const x = padX + i * step
    const y = h - padY - ((d.count || 0) / max) * (h - padY * 2)
    return { x, y, label: formatChartMonth(d.month) }
  })

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${padX},${h - padY} ${linePoints} ${points[points.length - 1].x},${h - padY}`

  return (
    <div className="w-full overflow-x-auto">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto min-w-[320px] w-full" aria-hidden="true">
        <defs>
          <linearGradient id="growth-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.2" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#growth-fill)" />
        <polyline points={linePoints} fill="none" stroke="#1e3a8a" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p) => (
          <circle key={p.label} cx={p.x} cy={p.y} r="4" fill="#1e3a8a" />
        ))}
      </svg>
      <div className="mt-2 flex justify-between gap-1 px-2 text-[10px] font-medium text-slate-400 sm:text-[11px]">
        {points.map((p) => (
          <span key={p.label} className="truncate text-center" style={{ maxWidth: `${100 / points.length}%` }}>
            {p.label}
          </span>
        ))}
      </div>
    </div>
  )
}

export function DepartmentDonutChart({ data = [] }) {
  if (!data.length) {
    return <p className="py-12 text-center text-sm text-slate-500">No department data</p>
  }

  const total = data.reduce((sum, d) => sum + (d.count || 0), 0) || 1
  const size = 160
  const cx = size / 2
  const cy = size / 2
  const r = 56
  const stroke = 22
  const circumference = 2 * Math.PI * r
  let offset = 0

  const segments = data.map((d, i) => {
    const pct = (d.count || 0) / total
    const dash = pct * circumference
    const segment = {
      ...d,
      pct,
      dash,
      offset,
      color: CHART_COLORS[i % CHART_COLORS.length],
    }
    offset += dash
    return segment
  })

  return (
    <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="shrink-0" aria-hidden="true">
        <g transform={`rotate(-90 ${cx} ${cy})`}>
          {segments.map((seg) => (
            <circle
              key={seg.department || seg.label}
              cx={cx}
              cy={cy}
              r={r}
              fill="none"
              stroke={seg.color}
              strokeWidth={stroke}
              strokeDasharray={`${seg.dash} ${circumference - seg.dash}`}
              strokeDashoffset={-seg.offset}
              strokeLinecap="butt"
            />
          ))}
        </g>
        <text x={cx} y={cy - 4} textAnchor="middle" className="fill-slate-900 text-xl font-extrabold" fontSize="20">
          {total}
        </text>
        <text x={cx} y={cy + 14} textAnchor="middle" className="fill-slate-400 text-[10px] font-semibold" fontSize="10">
          Total
        </text>
      </svg>
      <ul className="m-0 w-full max-w-xs list-none space-y-2 p-0">
        {segments.map((seg) => (
          <li key={seg.department || seg.label} className="flex items-center justify-between gap-2 text-sm">
            <span className="flex min-w-0 items-center gap-2">
              <span className="h-3 w-3 shrink-0 rounded-full" style={{ backgroundColor: seg.color }} />
              <span className="truncate font-medium text-slate-700">{seg.department || seg.label}</span>
            </span>
            <span className="shrink-0 font-semibold text-slate-500">
              {seg.count} ({Math.round(seg.pct * 100)}%)
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export function TrustScoreBarChart({ data = [] }) {
  if (!data.length) {
    return <p className="py-12 text-center text-sm text-slate-500">No trust score distribution</p>
  }

  const max = Math.max(...data.map((d) => d.count || 0), 1)

  return (
    <div className="flex h-48 items-end justify-between gap-2 sm:gap-3">
      {data.map((d) => {
        const height = `${((d.count || 0) / max) * 100}%`
        return (
          <div key={d.range || d.label} className="flex min-w-0 flex-1 flex-col items-center gap-2">
            <span className="text-[10px] font-bold text-slate-500 sm:text-xs">{d.count}</span>
            <div className="flex w-full flex-1 items-end">
              <div
                className="w-full rounded-t-lg bg-gradient-to-t from-[#1e3a8a] to-[#2748a6] transition-all"
                style={{ height, minHeight: d.count ? '4px' : '0' }}
                title={`${d.range || d.label}: ${d.count}`}
              />
            </div>
            <span className="w-full truncate text-center text-[9px] font-medium text-slate-400 sm:text-[10px]">
              {d.range || d.label}
            </span>
          </div>
        )
      })}
    </div>
  )
}

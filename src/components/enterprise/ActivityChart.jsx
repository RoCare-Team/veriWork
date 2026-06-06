const DATA = [40, 55, 45, 70, 60, 80, 65]
const LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function ActivityChart() {
  const w = 320
  const h = 120
  const pad = 16
  const max = 100
  const step = (w - pad * 2) / (DATA.length - 1)

  const points = DATA.map((v, i) => {
    const x = pad + i * step
    const y = h - pad - (v / max) * (h - pad * 2)
    return `${x},${y}`
  }).join(' ')

  const areaPoints = `${pad},${h - pad} ${points} ${pad + (DATA.length - 1) * step},${h - pad}`

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" aria-hidden="true">
        <defs>
          <linearGradient id="chart-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1a3a8f" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#1a3a8f" stopOpacity="0" />
          </linearGradient>
        </defs>
        <polygon points={areaPoints} fill="url(#chart-fill)" />
        <polyline
          points={points}
          fill="none"
          stroke="#1a3a8f"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {DATA.map((v, i) => {
          const x = pad + i * step
          const y = h - pad - (v / max) * (h - pad * 2)
          return <circle key={i} cx={x} cy={y} r="4" fill="#1a3a8f" />
        })}
      </svg>
      <div className="mt-2 flex justify-between px-2 text-[11px] font-medium text-slate-400">
        {LABELS.map((l, i) => (
          <span key={i}>{l}</span>
        ))}
      </div>
    </div>
  )
}

export default ActivityChart

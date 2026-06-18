function niceAxisMax(maxValue) {
  const peak = Math.max(maxValue, 1)
  if (peak <= 5) return 5
  if (peak <= 10) return 10
  if (peak <= 20) return Math.ceil(peak / 5) * 5
  return Math.ceil(peak / 10) * 10
}

function buildYTicks(axisMax, divisions = 5) {
  const step = axisMax / divisions
  const ticks = []
  for (let i = divisions; i >= 0; i -= 1) {
    ticks.push(Math.round(step * i))
  }
  return [...new Set(ticks)]
}

function EmployeeOnboardingTrendChart({ labels = [], series = [], height = 280 }) {
  const activeSeries = series.filter((s) => Array.isArray(s.values) && s.values.length)
  const pointCount = labels.length || activeSeries[0]?.values?.length || 0

  const hasData = activeSeries.some((s) => s.values.some((v) => Number(v) > 0))

  if (!pointCount || !hasData) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white"
        style={{ minHeight: height }}
      >
        <div className="px-6 text-center">
          <p className="m-0 text-sm font-semibold text-slate-600">No employee activity yet</p>
          <p className="m-0 mt-1 text-xs text-slate-400">Invite or approve employees to see daily trends</p>
        </div>
      </div>
    )
  }

  const w = 520
  const h = height
  const padL = 40
  const padR = 16
  const padT = 24
  const padB = 8
  const chartW = w - padL - padR
  const chartH = h - padT - padB

  const dataMax = Math.max(
    ...activeSeries.flatMap((s) => s.values.map((v) => Number(v) || 0)),
    1,
  )
  const axisMax = niceAxisMax(dataMax)
  const xStep = pointCount > 1 ? chartW / (pointCount - 1) : 0
  const yTicks = buildYTicks(axisMax)

  const plotted = activeSeries.map((s) => {
    const values = s.values.map((v) => Number(v) || 0)
    const points = values.map((v, i) => {
      const x = pointCount > 1 ? padL + i * xStep : padL + chartW / 2
      const y = padT + chartH - (v / axisMax) * chartH
      return { x, y, v }
    })
    return { ...s, values, points, linePoints: points.map((p) => `${p.x},${p.y}`).join(' ') }
  })

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Employee onboarding trend chart">
        {yTicks.map((tick) => {
          const y = padT + chartH - (tick / axisMax) * chartH
          return (
            <g key={tick}>
              <line x1={padL} y1={y} x2={w - padR} y2={y} stroke="#e2e8f0" strokeWidth="1" />
              <text x={padL - 8} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="10" fontWeight="600">
                {tick}
              </text>
            </g>
          )
        })}

        {plotted.map((s) => (
          <g key={s.id}>
            {s.values.length > 1 && (
              <polyline
                points={s.linePoints}
                fill="none"
                stroke={s.color}
                strokeWidth="3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}
            {s.points.map((p, i) => (
              <g key={`${s.id}-${i}`}>
                {p.v > 0 && (
                  <text
                    x={p.x}
                    y={p.y - 10}
                    textAnchor="middle"
                    fill="#0f172a"
                    fontSize="10"
                    fontWeight="800"
                  >
                    {p.v}
                  </text>
                )}
                <circle cx={p.x} cy={p.y} r="5" fill={s.color} stroke="#fff" strokeWidth="2" />
              </g>
            ))}
          </g>
        ))}
      </svg>

      <div className="mt-1 flex justify-between gap-1 border-t border-slate-100 pt-2">
        {labels.map((l, i) => (
          <span
            key={`${l}-${i}`}
            className="flex-1 truncate text-center text-[11px] font-bold text-slate-500"
            title={l}
          >
            {l}
          </span>
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-4">
        {plotted.map((s) => (
          <div key={s.id} className="flex items-center gap-2">
            <span className="h-1 w-6 rounded-full" style={{ backgroundColor: s.color }} />
            <span className="text-xs font-semibold text-slate-600">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmployeeOnboardingTrendChart

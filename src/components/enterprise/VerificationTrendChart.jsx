const DEFAULT_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function niceAxisMax(maxValue) {
  const peak = Math.max(maxValue, 1)
  if (peak <= 10) return 10
  if (peak <= 50) return Math.ceil(peak / 10) * 10
  if (peak <= 100) return Math.ceil(peak / 20) * 20
  if (peak <= 500) return Math.ceil(peak / 100) * 100
  if (peak <= 1000) return Math.ceil(peak / 100) * 100
  return Math.ceil(peak / 200) * 200
}

function buildYTicks(maxValue, divisions = 5) {
  const axisMax = niceAxisMax(maxValue)
  const step = axisMax / divisions
  const ticks = []
  for (let i = divisions; i >= 0; i -= 1) {
    ticks.push(Math.round(step * i))
  }
  return [...new Set(ticks)]
}

function VerificationTrendChart({ data = [], labels = [], height = 240 }) {
  const values = data.length ? data.map((v) => Number(v) || 0) : []
  const axisLabels =
    labels.length === values.length ? labels : values.map((_, i) => DEFAULT_LABELS[i] || String(i + 1))

  if (!values.length) {
    return (
      <div
        className="flex items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-gradient-to-b from-slate-50 to-white"
        style={{ minHeight: height }}
      >
        <div className="px-6 text-center">
          <p className="m-0 text-sm font-semibold text-slate-600">No trend data yet</p>
          <p className="m-0 mt-1 text-xs text-slate-400">Link employees to see workforce metrics</p>
        </div>
      </div>
    )
  }

  const w = 520
  const h = height
  const padL = 44
  const padR = 20
  const padT = 28
  const padB = 32
  const chartW = w - padL - padR
  const chartH = h - padT - padB
  const dataMax = Math.max(...values)
  const axisMax = niceAxisMax(dataMax)
  const step = values.length > 1 ? chartW / (values.length - 1) : 0

  const yTicks = buildYTicks(dataMax)

  const points = values.map((v, i) => {
    const x = values.length > 1 ? padL + i * step : padL + chartW / 2
    const y = padT + chartH - (v / axisMax) * chartH
    return { x, y, v }
  })

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `${padL},${padT + chartH} ${linePoints} ${points[points.length - 1].x},${padT + chartH}`

  return (
    <div className="w-full overflow-hidden">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full" role="img" aria-label="Trend line chart">
        <defs>
          <linearGradient id="dash-trend-fill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#005fd6" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#005fd6" stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((tick) => {
          const y = padT + chartH - (tick / axisMax) * chartH
          return (
            <g key={tick}>
              <line
                x1={padL}
                y1={y}
                x2={w - padR}
                y2={y}
                stroke="#e2e8f0"
                strokeWidth="1"
              />
              <text
                x={padL - 10}
                y={y + 4}
                textAnchor="end"
                fill="#94a3b8"
                fontSize="10"
                fontWeight="600"
              >
                {tick}
              </text>
            </g>
          )
        })}

        <polygon points={areaPoints} fill="url(#dash-trend-fill)" />
        {values.length > 1 && (
          <polyline
            points={linePoints}
            fill="none"
            stroke="#005fd6"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {points.map((p, i) => (
          <g key={`${axisLabels[i]}-${i}`}>
            <text
              x={p.x}
              y={p.y - 12}
              textAnchor="middle"
              fill="#0f172a"
              fontSize="12"
              fontWeight="800"
            >
              {p.v}
            </text>
            <circle cx={p.x} cy={p.y} r="7" fill="#005fd6" fillOpacity="0.12" />
            <circle cx={p.x} cy={p.y} r="5" fill="#005fd6" stroke="#fff" strokeWidth="2.5" />
          </g>
        ))}
      </svg>

      <div className="mt-2 flex justify-between gap-1 border-t border-slate-100 pt-2">
        {axisLabels.map((l, i) => (
          <span
            key={`${l}-${i}`}
            className="flex-1 truncate text-center text-[11px] font-bold text-slate-500"
            title={l}
          >
            {l}
          </span>
        ))}
      </div>
    </div>
  )
}

export default VerificationTrendChart

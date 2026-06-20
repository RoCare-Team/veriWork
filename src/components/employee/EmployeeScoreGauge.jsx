import { useEffect, useId, useState } from 'react'
import { SCORE_MAX, SCORE_MIN } from '../../utils/employeeScoreUtils'

/** CIBIL-style semicircle: left (300) → right (1000), opening upward */
const ARC_START = 180
const ARC_SPAN = 180
const ANIMATION_MS = 2000

const SCORE_SEGMENTS = [
  { min: 300, max: 450, color: '#dc2626', label: 'Poor' },
  { min: 450, max: 600, color: '#ea580c', label: 'Low' },
  { min: 600, max: 700, color: '#ca8a04', label: 'Fair' },
  { min: 700, max: 800, color: '#2563eb', label: 'Good' },
  { min: 800, max: 1000, color: '#16a34a', label: 'Excellent' },
]

const SEGMENT_GAP = 2.5
const CX = 100
const CY = 92
const R = 68

function clampScore(score) {
  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(score)))
}

function scoreToPercent(score) {
  return ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100
}

function polar(cx, cy, r, angleDeg) {
  const rad = (angleDeg * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function arcPath(cx, cy, r, startDeg, endDeg) {
  const start = polar(cx, cy, r, startDeg)
  const end = polar(cx, cy, r, endDeg)
  const large = endDeg - startDeg > 180 ? 1 : 0
  return `M ${start.x} ${start.y} A ${r} ${r} 0 ${large} 1 ${end.x} ${end.y}`
}

function scoreToAngle(score) {
  return ARC_START + (scoreToPercent(score) / 100) * ARC_SPAN
}

function segmentAngles(min, max) {
  const startPct = scoreToPercent(min)
  const endPct = scoreToPercent(max)
  return {
    start: ARC_START + (startPct / 100) * ARC_SPAN + SEGMENT_GAP,
    end: ARC_START + (endPct / 100) * ARC_SPAN - SEGMENT_GAP,
  }
}

function activeSegmentColor(value) {
  const seg = SCORE_SEGMENTS.find((s) => value >= s.min && value <= s.max)
  return seg?.color || '#64748b'
}

function easeOutCubic(t) {
  return 1 - (1 - t) ** 3
}

function useAnimatedScore(targetScore, animate = true) {
  const [displayScore, setDisplayScore] = useState(SCORE_MIN)
  const [finished, setFinished] = useState(!animate)

  useEffect(() => {
    const target = clampScore(targetScore)
    if (!animate) {
      setDisplayScore(target)
      setFinished(true)
      return undefined
    }

    setDisplayScore(SCORE_MIN)
    setFinished(false)

    const startAt = performance.now()
    let raf = 0

    const tick = (now) => {
      const t = Math.min(1, (now - startAt) / ANIMATION_MS)
      const eased = easeOutCubic(t)
      setDisplayScore(Math.round(SCORE_MIN + (target - SCORE_MIN) * eased))

      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else {
        setDisplayScore(target)
        setFinished(true)
      }
    }

    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [targetScore, animate])

  return { displayScore, finished }
}

function EmployeeScoreGauge({ score, rating, size = 'lg', showRange = true, animate = true }) {
  const filterId = useId()
  const { displayScore, finished } = useAnimatedScore(score, animate)

  const sizes = {
    sm: { svg: 'h-[88px] w-[170px]', text: 'text-3xl', sub: 'text-[10px]', gap: 'mt-1' },
    md: { svg: 'h-[110px] w-[220px]', text: 'text-4xl', sub: 'text-xs', gap: 'mt-1.5' },
    lg: { svg: 'h-[130px] w-[280px]', text: 'text-5xl', sub: 'text-sm', gap: 'mt-2' },
  }
  const s = sizes[size] || sizes.lg

  const needleAngle = scoreToAngle(displayScore)
  const needleLen = R - 10
  const needleTip = polar(CX, CY, needleLen, needleAngle)
  const needleBaseL = polar(CX, CY, 7, needleAngle + 90)
  const needleBaseR = polar(CX, CY, 7, needleAngle - 90)
  const markerColor = activeSegmentColor(displayScore)
  const liveRating = rating || null

  return (
    <div className="flex w-full flex-col items-center">
      {/* Gauge only — needle stays inside SVG, above score */}
      <div className={`${s.svg} shrink-0`}>
        <svg className="h-full w-full overflow-visible" viewBox="0 0 200 98" aria-hidden="true">
          <defs>
            <filter id={filterId} x="-30%" y="-30%" width="160%" height="160%">
              <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodOpacity="0.3" />
            </filter>
          </defs>

          <path
            d={arcPath(CX, CY, R, ARC_START, ARC_START + ARC_SPAN)}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth="16"
            strokeLinecap="round"
          />

          {SCORE_SEGMENTS.map((seg) => {
            const { start, end } = segmentAngles(seg.min, seg.max)
            if (end <= start) return null
            return (
              <path
                key={`${seg.min}-${seg.max}`}
                d={arcPath(CX, CY, R, start, end)}
                fill="none"
                stroke={seg.color}
                strokeWidth="13"
                strokeLinecap="round"
              />
            )
          })}

          <polygon
            points={`${needleTip.x},${needleTip.y} ${needleBaseL.x},${needleBaseL.y} ${needleBaseR.x},${needleBaseR.y}`}
            fill="#0f172a"
            filter={`url(#${filterId})`}
          />
          <circle cx={CX} cy={CY} r="7" fill="#0f172a" />
          <circle cx={CX} cy={CY} r="3.5" fill="#fff" />
          <circle
            cx={needleTip.x}
            cy={needleTip.y}
            r="4"
            fill="#fff"
            stroke={markerColor}
            strokeWidth="2.5"
          />
        </svg>
      </div>

      {/* Score below gauge — never overlaps needle (CIBIL layout) */}
      <div className={`${s.gap} flex flex-col items-center text-center`}>
        <span
          className={`leading-none font-extrabold tabular-nums tracking-tight ${s.text} ${liveRating?.color || 'text-slate-900'}`}
        >
          {displayScore}
        </span>
        <span className={`mt-1 font-semibold uppercase tracking-wider text-slate-400 ${s.sub}`}>
          VeriScore
        </span>
      </div>

      {showRange && (
        <div className="mt-3 flex w-full max-w-[280px] justify-between gap-1 px-0.5">
          {SCORE_SEGMENTS.map((seg) => (
            <div key={seg.min} className="flex flex-1 flex-col items-center gap-1">
              <span
                className="h-2 w-full max-w-[46px] rounded-full shadow-sm"
                style={{ backgroundColor: seg.color }}
              />
              <span className="text-[9px] font-bold leading-none" style={{ color: seg.color }}>
                {seg.label}
              </span>
            </div>
          ))}
        </div>
      )}

      {showRange && (
        <div className="mt-1 flex w-full max-w-[280px] justify-between px-1 text-[10px] font-semibold text-slate-500">
          <span>{SCORE_MIN}</span>
          <span className="text-slate-400">Poor → Excellent</span>
          <span>{SCORE_MAX}</span>
        </div>
      )}

      {liveRating && (
        <div
          className={`mt-3 text-center transition-all duration-500 ${
            finished ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'
          }`}
        >
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${liveRating.bg} ${liveRating.border} ${liveRating.color}`}
          >
            {liveRating.label}
            {liveRating.tier !== '—' && (
              <span className="rounded bg-white/60 px-1.5 py-0.5 text-xs">{liveRating.tier}</span>
            )}
          </span>
        </div>
      )}
    </div>
  )
}

export default EmployeeScoreGauge

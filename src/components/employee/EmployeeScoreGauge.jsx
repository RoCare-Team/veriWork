import { SCORE_MAX, SCORE_MIN } from '../../utils/employeeScoreUtils'

function EmployeeScoreGauge({ score, rating, size = 'lg', showRange = true }) {
  const pct = ((score - SCORE_MIN) / (SCORE_MAX - SCORE_MIN)) * 100
  const sizes = {
    sm: { wrap: 'h-[100px] w-[100px]', text: 'text-2xl', sub: 'text-[10px]' },
    md: { wrap: 'h-[140px] w-[140px]', text: 'text-3xl', sub: 'text-xs' },
    lg: { wrap: 'h-[180px] w-[180px]', text: 'text-4xl', sub: 'text-sm' },
  }
  const s = sizes[size] || sizes.lg
  const radius = 70
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="flex flex-col items-center">
      <div className={`relative ${s.wrap}`}>
        <svg className="h-full w-full -rotate-90" viewBox="0 0 160 160" aria-hidden="true">
          <circle cx="80" cy="80" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            cx="80"
            cy="80"
            r={radius}
            fill="none"
            stroke="currentColor"
            className={rating?.color || 'text-[#1a3a8f]'}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`font-extrabold tracking-tight ${s.text} ${rating?.color || 'text-slate-900'}`}>
            {score}
          </span>
          <span className={`font-semibold uppercase tracking-wider text-slate-400 ${s.sub}`}>
            VeriScore
          </span>
        </div>
      </div>

      {rating && (
        <div className="mt-4 text-center">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-sm font-bold ${rating.bg} ${rating.border} ${rating.color}`}
          >
            {rating.label}
            {rating.tier !== '—' && (
              <span className="rounded bg-white/60 px-1.5 py-0.5 text-xs">{rating.tier}</span>
            )}
          </span>
        </div>
      )}

      {showRange && (
        <div className="mt-3 flex w-full max-w-[200px] justify-between text-[10px] font-medium text-slate-400">
          <span>{SCORE_MIN}</span>
          <span>Poor → Excellent</span>
          <span>{SCORE_MAX}</span>
        </div>
      )}
    </div>
  )
}

export default EmployeeScoreGauge

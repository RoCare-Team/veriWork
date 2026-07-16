import { getScoreRating } from '../../utils/employeeScoreUtils'

function JoinRequestCard({ initials, name, role, employeeScore, score, trust }) {
  const veriScore = employeeScore ?? score ?? trust ?? 0
  const rating = getScoreRating(veriScore)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-sm font-bold text-[#005fd6]">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-slate-900">{name}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{role}</p>
      </div>
      <div className={`flex shrink-0 flex-col items-end rounded-xl border px-2.5 py-1.5 ${rating.bg} ${rating.border}`}>
        <span className={`text-sm font-extrabold ${rating.color}`}>{veriScore}</span>
        <span className="text-[9px] font-bold uppercase text-slate-400">PagerLook Score</span>
      </div>
    </div>
  )
}

export default JoinRequestCard

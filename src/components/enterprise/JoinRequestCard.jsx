function JoinRequestCard({ initials, name, role, score }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 text-sm font-bold text-[#1a3a8f]">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-slate-900">{name}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{role}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
        <span>✓</span>
        {score}%
      </div>
    </div>
  )
}

export default JoinRequestCard

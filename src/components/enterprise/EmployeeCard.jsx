function EmployeeCard({ initials, name, role, department, trustScore, verified }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[#1a3a8f]">
          {initials}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-base font-bold text-slate-900">{name}</h3>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {role} • {department}
          </p>
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Trust Score
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <svg width="16" height="16" viewBox="0 0 20 20" fill="none" className="text-slate-500" aria-hidden="true">
                <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3Z" stroke="currentColor" strokeWidth="1.5" />
              </svg>
              <span className="text-sm font-bold text-slate-800">{trustScore}%</span>
            </div>
          </div>
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verification
            </p>
            <div className="mt-1">
              {verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1a3a8f]">
                  ✓ Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1a3a8f] hover:text-[#1a3a8f]"
      >
        View Profile
      </button>
    </article>
  )
}

export default EmployeeCard

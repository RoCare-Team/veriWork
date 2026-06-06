function CandidateRequestCard({
  name,
  role,
  department,
  trust,
  joiningDate,
  salaryBand,
  documents,
  avatar,
  onApprove,
  onReject,
}) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-blue-100 to-blue-50 text-sm font-bold text-[#1a3a8f]">
          {avatar}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-base font-bold text-slate-900">{name}</h3>
          <p className="mt-0.5 text-sm text-slate-500">
            {role} • {department}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1 rounded-full bg-green-50 px-2.5 py-1 text-xs font-bold text-green-700">
          <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3Z" stroke="currentColor" strokeWidth="1.5" />
          </svg>
          {trust}% Trust
        </div>
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="m-0 text-xs text-slate-400">Joining Date</p>
            <p className="mt-0.5 font-semibold text-slate-800">{joiningDate}</p>
          </div>
          <div>
            <p className="m-0 text-xs text-slate-400">Salary Band</p>
            <p className="mt-0.5 font-semibold text-slate-800">{salaryBand}</p>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <p className="m-0 text-xs font-semibold text-slate-500">Verification Documents</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {documents.map((doc) => (
            <span
              key={doc}
              className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-medium text-[#1a3a8f]"
            >
              <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M6 2h6l4 4v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" />
              </svg>
              {doc}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onReject}
          className="rounded-xl border border-slate-200 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Reject
        </button>
        <button
          type="button"
          onClick={onApprove}
          className="rounded-xl bg-[#1a3a8f] py-3 text-sm font-semibold text-white transition hover:bg-[#152b6e]"
        >
          Approve
        </button>
      </div>
    </article>
  )
}

export default CandidateRequestCard

function ActivityRequestCard({ item, onApprove, onDeny, showActions = true }) {
  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-500">
          {item.company?.slice(0, 2) || item.title?.slice(0, 2)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <p className="m-0 text-sm font-bold text-slate-900 md:text-base">
              {item.company || item.title}
            </p>
            <span className="shrink-0 text-xs text-slate-400">{item.time}</span>
          </div>
          <p className="m-0 mt-2 text-sm leading-relaxed text-slate-600">
            {item.message}
          </p>
        </div>
      </div>

      {showActions && onApprove && onDeny && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onDeny(item.id)}
            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Deny
          </button>
          <button
            type="button"
            onClick={() => onApprove(item.id)}
            className="h-11 rounded-xl bg-[#005fd6] text-sm font-semibold text-white transition hover:bg-[#004bab]"
          >
            Approve
          </button>
        </div>
      )}
    </article>
  )
}

export default ActivityRequestCard

function Pagination({ pagination, onPageChange }) {
  if (!pagination || pagination.totalPages <= 1) return null

  const { page = 1, totalPages = 1, total = 0 } = pagination
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1)
  const visiblePages = pages.filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1,
  )

  return (
    <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
      <p className="m-0 text-sm text-slate-500">
        Page {page} of {totalPages}
        {total > 0 && <span className="hidden sm:inline"> · {total} total</span>}
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Prev
        </button>
        {visiblePages.map((p, i) => {
          const prev = visiblePages[i - 1]
          const showEllipsis = prev && p - prev > 1
          return (
            <span key={p} className="flex items-center gap-1">
              {showEllipsis && <span className="px-1 text-slate-400">…</span>}
              <button
                type="button"
                onClick={() => onPageChange(p)}
                className={`min-w-[36px] rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  p === page
                    ? 'bg-[#1a3a8f] text-white shadow-sm'
                    : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {p}
              </button>
            </span>
          )
        })}
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  )
}

export default Pagination

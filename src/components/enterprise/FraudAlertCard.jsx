function FraudAlertCard({ title, description }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 rounded-2xl border border-red-100 bg-red-50/60 p-4 text-left transition hover:bg-red-50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100 text-red-600">
        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path
            d="M10 3L18 17H2L10 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d="M10 8v4M10 14h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold text-red-700">{title}</p>
        <p className="mt-0.5 text-xs leading-relaxed text-red-600/80">{description}</p>
      </div>
      <span className="shrink-0 text-slate-400">›</span>
    </button>
  )
}

export default FraudAlertCard

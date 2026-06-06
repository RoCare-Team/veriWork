function ReviewRow({ label, value, fallback = '—' }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900 sm:text-right">
        {value || fallback}
      </span>
    </div>
  )
}

export default ReviewRow

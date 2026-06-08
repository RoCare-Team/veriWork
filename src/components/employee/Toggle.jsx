function Toggle({ checked, onChange, label, id, icon, className = '' }) {
  return (
    <div
      className={`flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-white px-4 py-3.5 ${className}`.trim()}
    >
      <div className="flex min-w-0 items-center gap-3">
        {icon}
        <span className="text-sm font-medium text-slate-600">{label}</span>
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`relative h-7 w-12 shrink-0 rounded-full transition ${checked ? 'bg-[#1a3a8f]' : 'bg-slate-200'}`}
      >
        <span
          className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${checked ? 'left-[22px]' : 'left-0.5'}`}
        />
      </button>
    </div>
  )
}

export default Toggle

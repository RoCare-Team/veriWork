function SegmentTabs({ tabs, active, onChange }) {
  return (
    <div className="flex rounded-2xl border border-slate-100 bg-white p-1 shadow-sm">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => onChange(tab.id)}
          className={`flex-1 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
            active === tab.id
              ? 'bg-slate-100 text-slate-900 shadow-sm'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  )
}

export default SegmentTabs

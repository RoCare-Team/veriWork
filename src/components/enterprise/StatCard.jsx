function StatCard({ icon, label, value, accent = 'blue', trend }) {
  const styles = {
    blue: {
      border: 'border-l-[#1a3a8f]',
      icon: 'bg-blue-50 text-[#1a3a8f]',
    },
    green: {
      border: 'border-l-green-500',
      icon: 'bg-green-50 text-green-600',
    },
    orange: {
      border: 'border-l-orange-400',
      icon: 'bg-orange-50 text-orange-500',
    },
    red: {
      border: 'border-l-red-500',
      icon: 'bg-red-50 text-red-500',
    },
  }

  const s = styles[accent] || styles.blue

  return (
    <div
      className={`group rounded-2xl border border-slate-100 border-l-4 bg-white p-5 shadow-sm transition hover:shadow-md ${s.border}`}
    >
      <div className="flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${s.icon}`}>
          {icon}
        </div>
        {trend && (
          <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-bold text-slate-500">
            {trend}
          </span>
        )}
      </div>
      <p className="mt-4 text-2xl font-extrabold tracking-tight text-slate-900 md:text-3xl">
        {value}
      </p>
      <p className="mt-1 text-xs font-medium text-slate-500 md:text-sm">{label}</p>
    </div>
  )
}

export default StatCard

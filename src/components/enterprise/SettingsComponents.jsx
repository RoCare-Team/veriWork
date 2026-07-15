function SecurityMenuIcon({ type }) {
  if (type === 'lock') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    )
  }
  if (type === 'star') {
    return (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2l2.5 5.5L18 8.5l-4 4 1 5.5L10 15.5 5 18l1-5.5-4-4 5.5-1L10 2Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      </svg>
    )
  }
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function TeamMemberRow({ initials, name, role, badge, badgeColor, avatarBg }) {
  const badgeStyles = {
    blue: 'bg-blue-50 text-[#005fd6]',
    green: 'bg-green-50 text-green-700',
  }

  return (
    <div className="flex items-center gap-3 border-b border-slate-100 py-4 last:border-0 last:pb-0 first:pt-0">
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${avatarBg}`}
      >
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-bold text-slate-900">{name}</p>
        <p className="mt-0.5 text-xs text-slate-500">{role}</p>
      </div>
      <span
        className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${badgeStyles[badgeColor]}`}
      >
        {badge}
      </span>
    </div>
  )
}

function SettingsMenuRow({ title, description, icon }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-3 border-b border-slate-100 py-4 text-left transition last:border-0 hover:bg-slate-50/50"
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
        <SecurityMenuIcon type={icon} />
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 text-sm font-semibold text-slate-900">{title}</p>
        <p className="mt-0.5 text-xs text-slate-500">{description}</p>
      </div>
      <span className="shrink-0 text-slate-300">›</span>
    </button>
  )
}

export { TeamMemberRow, SettingsMenuRow }

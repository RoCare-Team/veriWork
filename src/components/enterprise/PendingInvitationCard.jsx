import { formatRelativeInviteDate, getInitials } from '../../utils/formatters'

function PendingInvitationCard({ initials, name, email, department, invitedAt }) {
  const displayName = name && name !== email ? name : email
  const subtitle = department
    ? `${formatRelativeInviteDate(invitedAt)} · ${department}`
    : formatRelativeInviteDate(invitedAt)

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-amber-100 bg-amber-50/30 p-4 shadow-sm transition hover:border-amber-200 hover:shadow-md">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-amber-100 text-sm font-bold text-amber-700">
        {initials}
      </div>
      <div className="min-w-0 flex-1">
        <p className="m-0 truncate text-sm font-bold text-slate-900">{displayName}</p>
        <p className="mt-0.5 truncate text-xs text-slate-500">{subtitle}</p>
      </div>
      <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-amber-700">
        Pending
      </span>
    </div>
  )
}

export default PendingInvitationCard

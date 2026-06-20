import { useQuery } from '@tanstack/react-query'
import { formatRelativeInviteDate, getInitials } from '../../utils/formatters'
import { enterpriseKeys, fetchPendingInvitations } from '../../api/enterprise'
import Loader from '../common/Loader'

function PendingInvitationRow({ invitation }) {
  const email = invitation.employeeEmail || invitation.email || '—'
  const name = invitation.employeeName || email
  const department = invitation.department || '—'
  const initials = getInitials(name !== email ? name : email.split('@')[0])

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-bold text-slate-900">{email}</p>
          <p className="m-0 mt-0.5 truncate text-xs text-slate-500">
            {formatRelativeInviteDate(invitation.invitedAt || invitation.createdAt)} · {department}
          </p>
        </div>
      </div>
      <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-600">
        Pending
      </span>
    </div>
  )
}

function PendingInvitationsTab() {
  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.invitationsPending,
    queryFn: fetchPendingInvitations,
    retry: false,
  })

  const invitations = data?.invitations || data || []
  const apiUnavailable =
    error &&
    (error.status === 404 ||
      /route not found/i.test(error.message || '') ||
      /not found/i.test(error.message || ''))

  if (isLoading) return <Loader variant="inline" label="Loading invitations..." />

  if (apiUnavailable) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="m-0 text-sm font-semibold text-slate-600">No pending invitations</p>
      </div>
    )
  }

  if (error) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
    )
  }

  if (!invitations.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="m-0 text-sm font-semibold text-slate-600">No pending invitations</p>
        <p className="m-0 mt-1 text-xs text-slate-400">Invited employees will appear here until they accept.</p>
      </div>
    )
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
      <div className="divide-y divide-slate-100">
        {invitations.map((inv) => (
          <PendingInvitationRow
            key={inv.invitationId || inv.id || inv.employeeEmail}
            invitation={inv}
          />
        ))}
      </div>
    </div>
  )
}

export default PendingInvitationsTab

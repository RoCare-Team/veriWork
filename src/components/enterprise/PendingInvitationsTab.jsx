import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { formatRelativeInviteDate, getInitials } from '../../utils/formatters'
import { enterpriseKeys, fetchPendingInvitations } from '../../api/enterprise'
import Loader from '../common/Loader'

function CopyLinkButton({ link }) {
  const [copied, setCopied] = useState(false)
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      /* clipboard blocked — nothing to fall back to since we hide the URL */
    }
  }
  return (
    <button
      type="button"
      onClick={copy}
      className={`inline-flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${
        copied
          ? 'bg-emerald-50 text-emerald-700'
          : 'border border-[#005fd6]/30 bg-[#005fd6]/5 text-[#005fd6] hover:bg-[#005fd6]/10'
      }`}
    >
      <svg width="13" height="13" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        {copied ? (
          <path d="M4 10.5 8 14l8-8.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        ) : (
          <>
            <rect x="7" y="7" width="9" height="9" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M4 13V5a2 2 0 0 1 2-2h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
          </>
        )}
      </svg>
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

function PendingInvitationRow({ invitation }) {
  const email = invitation.employeeEmail || invitation.email || ''
  const mobile = invitation.employeeMobile || ''
  const name = invitation.employeeName || email || mobile || 'Invited employee'
  const department = invitation.department || '—'
  const contact = [email, mobile].filter(Boolean).join(' · ')
  const initials = getInitials(name)
  const link = invitation.registrationLink

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100 text-xs font-semibold text-amber-700">
          {initials}
        </div>
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-bold text-slate-900">{name}</p>
          <p className="m-0 mt-0.5 truncate text-xs text-slate-500">
            {contact ? `${contact} · ` : ''}
            {formatRelativeInviteDate(invitation.invitedAt || invitation.createdAt)} · {department}
          </p>
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <span className="rounded-md bg-amber-100 px-2.5 py-1 text-[11px] font-medium text-amber-700">
          {invitation.dashboardStatus || 'Pending'}
        </span>
        {link && <CopyLinkButton link={link} />}
      </div>
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

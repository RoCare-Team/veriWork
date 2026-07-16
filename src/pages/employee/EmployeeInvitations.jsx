import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Loader from '../../components/common/Loader'
import {
  employeeKeys,
  fetchInvitations,
  acceptInvitation,
  rejectInvitation,
} from '../../api/employee'
import { getInvitationStatusStyle } from '../../utils/enterpriseTeamUtils'
import { formatDate } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'

function StatusBadge({ status }) {
  const style = getInvitationStatusStyle(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

function BuildingIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8 7h2M8 11h2M8 15h2M14 7h2M14 11h2M14 15h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function InvitationCard({ invitation, onAccept, onReject, isPending }) {
  const id = invitation.invitationId || invitation._id || invitation.id
  const canAct = invitation.status === 'pending'
  const company = invitation.companyName || 'A company'
  const meta = [invitation.companyIndustry, invitation.companyCity].filter(Boolean).join(' · ')

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex items-start gap-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#005fd6] to-[#3b7ff0] text-white shadow-sm">
          <BuildingIcon />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="m-0 truncate text-base font-extrabold text-slate-900">{company}</h3>
            <StatusBadge status={invitation.status} />
          </div>
          {meta && <p className="m-0 mt-0.5 truncate text-xs text-slate-500">{meta}</p>}
        </div>
      </div>

      {/* Reason / context */}
      <div className="p-5">
        <div className="rounded-xl border border-blue-100 bg-blue-50/50 px-4 py-3">
          <p className="m-0 text-sm text-slate-700">
            <strong className="text-slate-900">{company}</strong> wants to add you to their workforce
            {invitation.designation ? (
              <>
                {' '}as <strong className="text-slate-900">{invitation.designation}</strong>
              </>
            ) : null}
            {invitation.department ? (
              <>
                {' '}in <strong className="text-slate-900">{invitation.department}</strong>
              </>
            ) : null}
            .
          </p>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {invitation.designation && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {invitation.designation}
            </span>
          )}
          {invitation.department && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {invitation.department}
            </span>
          )}
          {invitation.invitedAt && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              Invited {formatDate(invitation.invitedAt)}
            </span>
          )}
        </div>

        {canAct ? (
          <div className="mt-5 grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => onReject(id)}
              disabled={isPending}
              className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={() => onAccept(id)}
              disabled={isPending}
              className="h-11 rounded-xl bg-[#005fd6] text-sm font-semibold text-white transition hover:bg-[#004bab] disabled:opacity-50"
            >
              Accept & Join
            </button>
          </div>
        ) : (
          <p className="m-0 mt-5 text-xs text-slate-400">
            {invitation.status === 'accepted'
              ? `You joined ${company}${invitation.respondedAt ? ` on ${formatDate(invitation.respondedAt)}` : ''}.`
              : invitation.status === 'rejected'
                ? 'You declined this invitation.'
                : 'This invitation is no longer active.'}
          </p>
        )}
      </div>
    </article>
  )
}

function EmployeeInvitations() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.invitations,
    queryFn: fetchInvitations,
  })

  const invitations = data?.invitations || data || []
  const pending = invitations.filter((i) => i.status === 'pending')
  const past = invitations.filter((i) => i.status !== 'pending')

  const acceptMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (result, id) => {
      const inv = invitations.find((item) => (item.invitationId || item._id || item.id) === id)
      const companyName = result?.companyName || inv?.companyName || 'the company'
      toast(`You joined ${companyName}`, 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.invitations })
      navigate('/employee/dashboard')
    },
    onError: (err) => toast(err.message || 'Failed to accept invitation', 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: rejectInvitation,
    onSuccess: () => {
      toast('Invitation declined', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.invitations })
    },
    onError: (err) => toast(err.message || 'Failed to decline invitation', 'error'),
  })

  const actionPending = acceptMutation.isPending || rejectMutation.isPending

  if (isLoading) return <Loader variant="fullPage" label="Loading invitations..." />

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Invitations" subtitle="Companies inviting you to join their workforce" />
      {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

      {invitations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="m-0 text-sm font-semibold text-slate-600">No invitations yet</p>
          <p className="mt-1 text-xs text-slate-400">When a company invites you, it will appear here.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
          {pending.length > 0 && (
            <section>
              <h2 className="m-0 mb-3 text-sm font-bold text-slate-900">
                Pending{pending.length > 1 ? ` (${pending.length})` : ''}
              </h2>
              <div className="flex flex-col gap-3">
                {pending.map((inv) => (
                  <InvitationCard
                    key={inv.invitationId || inv._id || inv.id}
                    invitation={inv}
                    onAccept={(id) => acceptMutation.mutate(id)}
                    onReject={(id) => rejectMutation.mutate(id)}
                    isPending={actionPending}
                  />
                ))}
              </div>
            </section>
          )}

          {past.length > 0 && (
            <section>
              <h2 className="m-0 mb-3 text-sm font-bold text-slate-500">Earlier</h2>
              <div className="flex flex-col gap-3">
                {past.map((inv) => (
                  <InvitationCard
                    key={inv.invitationId || inv._id || inv.id}
                    invitation={inv}
                    onAccept={(id) => acceptMutation.mutate(id)}
                    onReject={(id) => rejectMutation.mutate(id)}
                    isPending={actionPending}
                  />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </EmployeeLayout>
  )
}

export default EmployeeInvitations

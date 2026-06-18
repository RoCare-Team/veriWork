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
import { useToast } from '../../context/ToastContext'

function StatusBadge({ status }) {
  const style = getInvitationStatusStyle(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

function InvitationCard({ invitation, onAccept, onReject, isPending }) {
  const id = invitation.invitationId || invitation._id || invitation.id
  const canAct = invitation.status === 'pending'

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-bold text-slate-900">{invitation.companyName}</h3>
          <p className="m-0 mt-1 text-sm text-slate-600">{invitation.department}</p>
          <p className="m-0 mt-0.5 text-sm text-slate-500">{invitation.designation}</p>
        </div>
        <StatusBadge status={invitation.status} />
      </div>

      {canAct && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onReject(id)}
            disabled={isPending}
            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => onAccept(id)}
            disabled={isPending}
            className="h-11 rounded-xl bg-[#1a3a8f] text-sm font-semibold text-white transition hover:bg-[#152b6e] disabled:opacity-50"
          >
            Accept
          </button>
        </div>
      )}
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

  const acceptMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: (data, id) => {
      const inv = invitations.find(
        (item) => (item.invitationId || item._id || item.id) === id,
      )
      const companyName = data?.companyName || inv?.companyName || 'the company'
      toast(`You joined ${companyName}`, 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.invitations })
      navigate('/employee/dashboard')
    },
    onError: (err) => toast(err.message || 'Failed to accept invitation', 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: rejectInvitation,
    onSuccess: () => {
      toast('Invitation rejected', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.invitations })
    },
    onError: (err) => toast(err.message || 'Failed to reject invitation', 'error'),
  })

  const actionPending = acceptMutation.isPending || rejectMutation.isPending

  if (isLoading) return <Loader variant="fullPage" label="Loading invitations..." />

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Invitations" subtitle="Company invitations to join their workforce" />
      {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

      {invitations.length > 0 ? (
        <div className="flex flex-col gap-3">
          {invitations.map((inv) => (
            <InvitationCard
              key={inv.invitationId || inv._id || inv.id}
              invitation={inv}
              onAccept={(id) => acceptMutation.mutate(id)}
              onReject={(id) => rejectMutation.mutate(id)}
              isPending={actionPending}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="m-0 text-sm font-semibold text-slate-600">No invitations</p>
          <p className="mt-1 text-xs text-slate-400">When a company invites you, it will appear here.</p>
        </div>
      )}
    </EmployeeLayout>
  )
}

export default EmployeeInvitations

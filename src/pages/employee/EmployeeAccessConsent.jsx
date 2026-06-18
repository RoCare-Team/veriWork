import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Loader from '../../components/common/Loader'
import {
  employeeKeys,
  fetchEmployeeAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from '../../api/employee'
import { formatAccessDate } from '../../utils/formatters'
import { formatRequestType, getAccessRequestStatusStyle } from '../../utils/enterpriseTeamUtils'
import { useToast } from '../../context/ToastContext'

function StatusBadge({ status }) {
  const style = getAccessRequestStatusStyle(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

function AccessRequestCard({ request, onApprove, onReject, isPending }) {
  const id = request._id || request.id
  const canAct = request.status === 'pending'
  const typeLabel = request.requestTypeLabel || formatRequestType(request.requestType)
  const isFullProfile = request.requestType === 'full_profile_access'

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-bold text-slate-900">{request.companyName}</h3>
          <p className={`m-0 mt-1 text-sm ${isFullProfile ? 'font-semibold text-[#1a3a8f]' : 'text-slate-600'}`}>
            {typeLabel}
          </p>
          {isFullProfile && (
            <p className="m-0 mt-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              This company will see your complete profile, documents, and verification data.
            </p>
          )}
          {request.message && (
            <p className="m-0 mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">{request.message}</p>
          )}
          <p className="m-0 mt-2 text-xs text-slate-400">
            Requested {formatAccessDate(request.requestedAt || request.createdAt)}
          </p>
        </div>
        <StatusBadge status={request.status} />
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
            onClick={() => onApprove(id)}
            disabled={isPending}
            className="h-11 rounded-xl bg-[#1a3a8f] text-sm font-semibold text-white transition hover:bg-[#152b6e] disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      )}
    </article>
  )
}

function EmployeeAccessConsent() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.accessRequests,
    queryFn: fetchEmployeeAccessRequests,
  })

  const requests = data?.requests || data || []

  const approveMutation = useMutation({
    mutationFn: approveAccessRequest,
    onSuccess: () => {
      toast('Access request approved', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.accessRequests })
    },
    onError: (err) => toast(err.message || 'Failed to approve request', 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: rejectAccessRequest,
    onSuccess: () => {
      toast('Access request rejected', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.accessRequests })
    },
    onError: (err) => toast(err.message || 'Failed to reject request', 'error'),
  })

  const actionPending = approveMutation.isPending || rejectMutation.isPending

  if (isLoading) return <Loader variant="fullPage" label="Loading access requests..." />

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Access Consent" subtitle="Review and respond to company access requests" />
      {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

      {requests.length > 0 ? (
        <div className="flex flex-col gap-3">
          {requests.map((req) => (
            <AccessRequestCard
              key={req._id || req.id}
              request={req}
              onApprove={(id) => approveMutation.mutate(id)}
              onReject={(id) => rejectMutation.mutate(id)}
              isPending={actionPending}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
          <p className="m-0 text-sm font-semibold text-slate-600">No access requests</p>
          <p className="mt-1 text-xs text-slate-400">Companies will request access to your data here.</p>
        </div>
      )}
    </EmployeeLayout>
  )
}

export default EmployeeAccessConsent

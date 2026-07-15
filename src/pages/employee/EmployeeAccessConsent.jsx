import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Loader from '../../components/common/Loader'
import {
  employeeKeys,
  fetchEmployeeAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
  fetchVerificationRequests,
  approveVerificationConsent,
  rejectVerificationConsent,
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
  const isApproved = request.status === 'approved'
  const typeLabel = request.requestTypeLabel || formatRequestType(request.requestType)
  const isFullProfile = request.requestType === 'full_profile_access'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-bold text-slate-900">{request.companyName}</h3>
          <p className={`m-0 mt-1 text-sm ${isFullProfile ? 'font-semibold text-[#005fd6]' : 'text-slate-600'}`}>
            {typeLabel}
          </p>
          {isFullProfile && (
            <p className="m-0 mt-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700">
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
            onClick={() => onReject({ id, wasApproved: false })}
            disabled={isPending}
            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => onApprove(id)}
            disabled={isPending}
            className="h-11 rounded-xl bg-[#005fd6] text-sm font-semibold text-white transition hover:bg-[#004bab] disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      )}

      {isApproved && (
        <div className="mt-4">
          <button
            type="button"
            onClick={() => onReject({ id, wasApproved: true })}
            disabled={isPending}
            className="h-11 w-full rounded-xl border border-red-200 bg-white text-sm font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
          >
            Remove access
          </button>
        </div>
      )}
    </article>
  )
}

function VerificationConsentCard({ request, onApprove, onReject, isPending }) {
  const id = request.id || request._id
  const canAct = request.rawStatus === 'pending_employee_consent' || request.status === 'pending_employee_consent'

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Verification consent</p>
          <h3 className="m-0 mt-1 text-base font-bold text-slate-900">{request.previousCompanyName}</h3>
          <p className="m-0 mt-1 text-sm text-slate-600">
            {request.requestingCompanyName || 'Your current company'} wants to verify your employment at{' '}
            <strong>{request.previousCompanyName}</strong>
            {request.jobTitle ? ` (${request.jobTitle})` : ''} with their HR on PagerLook.
          </p>
          <p className="m-0 mt-2 rounded-xl bg-slate-50 px-3 py-2 text-sm text-slate-700">
            If you approve, {request.previousCompanyName} will receive a verification request in their dashboard.
          </p>
          <p className="m-0 mt-2 text-xs text-slate-400">
            Requested {formatAccessDate(request.requestedAt)}
          </p>
        </div>
        <span className="shrink-0 rounded-md bg-slate-100 px-2.5 py-1 text-[10px] font-semibold text-slate-600">
          Awaiting consent
        </span>
      </div>

      {canAct && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => onReject(id)}
            disabled={isPending}
            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Decline
          </button>
          <button
            type="button"
            onClick={() => onApprove(id)}
            disabled={isPending}
            className="h-11 rounded-xl bg-[#005fd6] text-sm font-semibold text-white transition hover:bg-[#004bab] disabled:opacity-50"
          >
            Approve & send to HR
          </button>
        </div>
      )}
    </article>
  )
}

function EmployeeAccessConsent() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const accessQuery = useQuery({
    queryKey: employeeKeys.accessRequests,
    queryFn: fetchEmployeeAccessRequests,
  })

  const verificationQuery = useQuery({
    queryKey: [...employeeKeys.verification, 'requests'],
    queryFn: fetchVerificationRequests,
  })

  const accessRequests = accessQuery.data?.requests || accessQuery.data || []
  const allVerificationRequests = verificationQuery.data?.requests || verificationQuery.data?.data?.requests || []
  const consentRequests = allVerificationRequests.filter(
    (r) => r.rawStatus === 'pending_employee_consent' || r.status === 'pending_employee_consent',
  )

  const approveAccessMutation = useMutation({
    mutationFn: approveAccessRequest,
    onSuccess: () => {
      toast('Access request approved', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.accessRequests })
    },
    onError: (err) => toast(err.message || 'Failed to approve request', 'error'),
  })

  const rejectAccessMutation = useMutation({
    mutationFn: ({ id }) => rejectAccessRequest(id),
    onSuccess: (_data, variables) => {
      toast(variables?.wasApproved ? 'Access removed' : 'Access request rejected', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.accessRequests })
    },
    onError: (err) => toast(err.message || 'Failed to update request', 'error'),
  })

  const approveConsentMutation = useMutation({
    mutationFn: approveVerificationConsent,
    onSuccess: (res) => {
      const msg = res?.data?.message || res?.message || 'Consent granted — previous company HR will review'
      toast(msg, 'success')
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.verification, 'requests'] })
      queryClient.invalidateQueries({ queryKey: employeeKeys.activity() })
    },
    onError: (err) => toast(err.message || 'Failed to approve', 'error'),
  })

  const rejectConsentMutation = useMutation({
    mutationFn: (id) => rejectVerificationConsent(id, {}),
    onSuccess: () => {
      toast('Verification consent declined', 'success')
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.verification, 'requests'] })
    },
    onError: (err) => toast(err.message || 'Failed to decline', 'error'),
  })

  const accessPending = approveAccessMutation.isPending || rejectAccessMutation.isPending
  const consentPending = approveConsentMutation.isPending || rejectConsentMutation.isPending
  const isLoading = accessQuery.isLoading || verificationQuery.isLoading
  const error = accessQuery.error || verificationQuery.error

  if (isLoading) return <Loader variant="fullPage" label="Loading requests..." />

  const hasAny = consentRequests.length > 0 || accessRequests.length > 0

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Access & Consent"
        subtitle="Review profile access and verification consent requests from companies"
      />
      {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

      {consentRequests.length > 0 && (
        <section className="mb-8">
          <h2 className="m-0 text-sm font-bold text-slate-900">Verification with previous employer</h2>
          <p className="m-0 mt-1 text-xs text-slate-500">
            Your current company wants to verify a past job — approve to send the request to that company&apos;s HR.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            {consentRequests.map((req) => (
              <VerificationConsentCard
                key={req.id || req._id}
                request={req}
                onApprove={(id) => approveConsentMutation.mutate(id)}
                onReject={(id) => rejectConsentMutation.mutate(id)}
                isPending={consentPending}
              />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="m-0 text-sm font-bold text-slate-900">Profile access requests</h2>
        <p className="m-0 mt-1 text-xs text-slate-500">Companies requesting access to your profile and documents.</p>

        {accessRequests.length > 0 ? (
          <div className="mt-4 flex flex-col gap-3">
            {accessRequests.map((req) => (
              <AccessRequestCard
                key={req._id || req.id}
                request={req}
                onApprove={(id) => approveAccessMutation.mutate(id)}
                onReject={(payload) => rejectAccessMutation.mutate(payload)}
                isPending={accessPending}
              />
            ))}
          </div>
        ) : (
          <div className="mt-4 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
            <p className="m-0 text-sm font-semibold text-slate-600">No profile access requests</p>
          </div>
        )}
      </section>

      {!hasAny && (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="m-0 text-sm font-semibold text-slate-600">No pending requests</p>
          <p className="mt-1 text-xs text-slate-400">Access and verification consent requests will appear here.</p>
        </div>
      )}
    </EmployeeLayout>
  )
}

export default EmployeeAccessConsent

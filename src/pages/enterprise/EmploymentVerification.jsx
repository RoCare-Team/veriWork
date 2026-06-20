import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import Loader from '../../components/common/Loader'
import EmailVerificationCompleteModal from '../../components/enterprise/EmailVerificationCompleteModal'
import HrResponseReviewModal from '../../components/enterprise/HrResponseReviewModal'
import IncomingVerificationApproveModal from '../../components/enterprise/IncomingVerificationApproveModal'
import { formatAccessDate } from '../../utils/formatters'
import {
  getVerificationChannelStyle,
  getVerificationStatusStyle,
} from '../../utils/enterpriseTeamUtils'
import {
  enterpriseKeys,
  fetchVerificationOutgoing,
  fetchVerificationIncoming,
  approveVerificationRequest,
  rejectVerificationRequest,
} from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

function ChannelBadge({ channel }) {
  const style = getVerificationChannelStyle(channel)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

function StatusBadge({ status }) {
  const style = getVerificationStatusStyle(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

function RequestCard({ request, onApprove, onReject, onCompleteEmail, onReviewHr, actionPending }) {
  const id = request._id || request.id
  const rawStatus = request.rawStatus || request.status
  const isPending = rawStatus === 'pending'
  const isEmailInProcess = request.verificationChannel === 'email' && ['in_process', 'in_review'].includes(rawStatus)
  const isHrResponded = rawStatus === 'hr_responded'

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 className="m-0 font-bold text-slate-900">{request.employeeName || 'Employee'}</h3>
          <p className="m-0 mt-1 text-sm text-slate-600">
            {request.jobTitle || request.title} · {request.companyName || request.company || request.previousCompanyName}
          </p>
          {request.verificationTag && (
            <p className="m-0 mt-2 text-xs font-semibold text-green-700">{request.verificationTag.label}</p>
          )}
          <p className="m-0 mt-2 text-xs text-slate-400">
            {formatAccessDate(request.createdAt || request.requestedAt)}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <ChannelBadge channel={request.verificationChannel} />
          <StatusBadge status={rawStatus} />
        </div>
      </div>

      {(isPending || isEmailInProcess || isHrResponded) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {isPending && onApprove && onReject && (
            <>
              <button
                type="button"
                onClick={() => onReject(id)}
                disabled={actionPending}
                className="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() => onApprove(id)}
                disabled={actionPending}
                className="rounded-xl bg-[#1a3a8f] px-4 py-2 text-sm font-semibold text-white hover:bg-[#152b6e] disabled:opacity-50"
              >
                Approve
              </button>
            </>
          )}
          {isEmailInProcess && onCompleteEmail && (
            <button
              type="button"
              onClick={() => onCompleteEmail(request)}
              disabled={actionPending}
              className="rounded-xl border border-[#1a3a8f] px-4 py-2 text-sm font-semibold text-[#1a3a8f] hover:bg-blue-50 disabled:opacity-50"
            >
              Complete / Document Verify
            </button>
          )}
          {isHrResponded && onReviewHr && (
            <button
              type="button"
              onClick={() => onReviewHr(request)}
              disabled={actionPending}
              className="rounded-xl bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700 disabled:opacity-50"
            >
              Review HR Response
            </button>
          )}
        </div>
      )}
    </article>
  )
}

function RequestList({ requests, emptyMessage, onApprove, onReject, onCompleteEmail, onReviewHr, actionPending }) {
  if (!requests.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
        <p className="m-0 text-sm text-slate-500">{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {requests.map((req) => (
        <RequestCard
          key={req._id || req.id}
          request={req}
          onApprove={onApprove}
          onReject={onReject}
          onCompleteEmail={onCompleteEmail}
          onReviewHr={onReviewHr}
          actionPending={actionPending}
        />
      ))}
    </div>
  )
}

function EmploymentVerification() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [emailRequest, setEmailRequest] = useState(null)
  const [hrReviewRequest, setHrReviewRequest] = useState(null)
  const [incomingApprove, setIncomingApprove] = useState(null)

  const outgoingQuery = useQuery({
    queryKey: enterpriseKeys.verificationOutgoing,
    queryFn: fetchVerificationOutgoing,
  })

  const incomingQuery = useQuery({
    queryKey: enterpriseKeys.verificationIncoming,
    queryFn: fetchVerificationIncoming,
  })

  const outgoing = outgoingQuery.data?.requests || outgoingQuery.data || []
  const incoming = incomingQuery.data?.requests || incomingQuery.data || []

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.verificationOutgoing })
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.verificationIncoming })
  }

  const approveMutation = useMutation({
    mutationFn: approveVerificationRequest,
    onSuccess: () => {
      toast('Verification approved', 'success')
      invalidate()
    },
    onError: (err) => toast(err.message || 'Failed to approve', 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: rejectVerificationRequest,
    onSuccess: () => {
      toast('Verification rejected', 'success')
      invalidate()
    },
    onError: (err) => toast(err.message || 'Failed to reject', 'error'),
  })

  const actionPending = approveMutation.isPending || rejectMutation.isPending
  const isLoading = outgoingQuery.isLoading || incomingQuery.isLoading

  if (isLoading) return <Loader variant="fullPage" label="Loading verification requests..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Employment Verification"
          subtitle="Manage outgoing and incoming employment verification requests"
        />

        {(outgoingQuery.error || incomingQuery.error) && (
          <p className="mb-4 text-sm text-red-600">
            {outgoingQuery.error?.message || incomingQuery.error?.message}
          </p>
        )}

        <section className="mb-10">
          <h2 className="m-0 mb-4 text-base font-bold text-slate-900">Outgoing Requests</h2>
          <p className="m-0 mb-4 text-sm text-slate-500">Verification requests your company has sent.</p>
          <RequestList
            requests={outgoing}
            emptyMessage="No outgoing verification requests"
            onCompleteEmail={setEmailRequest}
            onReviewHr={setHrReviewRequest}
            actionPending={actionPending}
          />
        </section>

        <section>
          <h2 className="m-0 mb-4 text-base font-bold text-slate-900">Incoming Requests</h2>
          <p className="m-0 mb-4 text-sm text-slate-500">
            Previous employer verification requests via the platform channel.
          </p>
          <RequestList
            requests={incoming}
            emptyMessage="No incoming verification requests"
            onApprove={(id) => {
              const req = incoming.find((r) => (r._id || r.id) === id)
              if (req) setIncomingApprove(req)
            }}
            onReject={(id) => rejectMutation.mutate(id)}
            onCompleteEmail={setEmailRequest}
            onReviewHr={setHrReviewRequest}
            actionPending={actionPending}
          />
        </section>
      </div>

      {emailRequest && (
        <EmailVerificationCompleteModal
          request={emailRequest}
          onClose={() => setEmailRequest(null)}
          onSuccess={invalidate}
        />
      )}

      {hrReviewRequest && (
        <HrResponseReviewModal
          request={hrReviewRequest}
          onClose={() => setHrReviewRequest(null)}
          onSuccess={invalidate}
        />
      )}

      {incomingApprove && (
        <IncomingVerificationApproveModal
          request={incomingApprove}
          onClose={() => setIncomingApprove(null)}
          onSuccess={invalidate}
        />
      )}
    </EnterpriseLayout>
  )
}

export default EmploymentVerification

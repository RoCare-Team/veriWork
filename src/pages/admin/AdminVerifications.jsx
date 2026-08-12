import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import HrContactsEditor from '../../components/common/HrContactsEditor'
import {
  adminKeys,
  fetchAdminVerificationRequests,
  resendAdminVerificationRequest,
} from '../../api/admin'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatters'
import { cleanContacts } from '../../utils/hrContacts'

const TABS = [
  { value: 'open', label: 'Open' },
  { value: 'hr_responded', label: 'HR responded' },
  { value: 'verified', label: 'Verified' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
  { value: 'all', label: 'All' },
]

const STATUS_STYLES = {
  verified: 'bg-green-50 text-green-700',
  approved: 'bg-green-50 text-green-700',
  hr_responded: 'bg-blue-50 text-blue-700',
  rejected: 'bg-red-50 text-red-700',
  expired: 'bg-slate-100 text-slate-600',
}

const EMAIL_STATUS_LABELS = {
  sent: 'Email sent',
  mock: 'Mock (SMTP not configured)',
  failed: 'Email failed',
  not_sent: 'Not sent',
  not_applicable: '',
}

function StatusPill({ request }) {
  const raw = request.rawStatus || request.status
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_STYLES[raw] || 'bg-amber-50 text-amber-700'}`}
    >
      {request.statusLabel || raw}
    </span>
  )
}

/**
 * Resend panel for one request. Opens with the addresses already on the record
 * so support can correct a dead mailbox or add the ones HR actually reads,
 * rather than firing the same failing email again.
 */
function ResendPanel({ request, onClose }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const isEmail = request.verificationChannel === 'email'
  const [contacts, setContacts] = useState(
    request.hrContacts?.length ? request.hrContacts : [''],
  )

  const mutation = useMutation({
    mutationFn: () =>
      resendAdminVerificationRequest(request.id, {
        hrContacts: isEmail ? cleanContacts(contacts) : undefined,
      }),
    onSuccess: (res) => {
      const result = res?.data || res
      toast(result?.message || 'Verification request re-sent', 'success')
      queryClient.invalidateQueries({ queryKey: ['admin', 'verification-requests'] })
      onClose()
    },
    onError: (err) => toast(err.message || 'Could not re-send the request', 'error'),
  })

  return (
    <div className="mt-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
      {isEmail ? (
        <>
          <HrContactsEditor
            contacts={contacts}
            onChange={setContacts}
            size="sm"
            label="HR contacts"
            hint="Everyone listed here gets the same secure verification link."
            disabled={mutation.isPending}
          />
          <p className="m-0 mt-3 text-xs text-slate-500">
            Sent from{' '}
            {request.requestedBy?.type === 'company'
              ? `${request.requestedBy.companyName || 'the requesting company'}'s mailbox`
              : "the employee's own mailbox"}
            , the same as the original request.
          </p>
        </>
      ) : (
        <p className="m-0 text-xs text-slate-600">
          This request sits on {request.targetCompanyName || request.previousCompanyName}&apos;s
          PagerLook dashboard. Re-sending nudges them there — there is no email to correct.
        </p>
      )}

      <div className="mt-3 flex gap-2">
        <Button
          type="button"
          size="sm"
          fullWidth={false}
          disabled={mutation.isPending}
          onClick={() => mutation.mutate()}
        >
          {mutation.isPending ? 'Sending...' : isEmail ? 'Resend request' : 'Send reminder'}
        </Button>
        <Button
          type="button"
          size="sm"
          variant="secondary"
          fullWidth={false}
          disabled={mutation.isPending}
          onClick={onClose}
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

function AdminVerifications() {
  const [status, setStatus] = useState('open')
  const [search, setSearch] = useState('')
  const [openResendId, setOpenResendId] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: adminKeys.verificationRequests(status, search),
    queryFn: () => fetchAdminVerificationRequests({ status, q: search }),
  })

  const payload = data?.data || data
  const requests = payload?.requests || []
  const summary = payload?.summary

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <h2 className="m-0 text-2xl font-extrabold text-slate-900">Employment verifications</h2>
        <p className="m-0 mt-1 text-sm text-slate-500">
          Every verification request on the platform — who sent it, where it went, and whether
          anyone replied. Re-send the ones that stalled.
        </p>

        {summary && (
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-5">
            {[
              { label: 'Total', value: summary.total },
              { label: 'Open', value: summary.open },
              { label: 'Verified', value: summary.verified },
              { label: 'Rejected', value: summary.rejected },
              { label: 'Expired', value: summary.expired },
            ].map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
                  {stat.label}
                </p>
                <p className="m-0 mt-1 text-xl font-extrabold text-slate-900">{stat.value}</p>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  status === tab.value
                    ? 'bg-[#1e3a8a] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search employee, company, HR email..."
            className="h-10 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#1e3a8a] sm:w-72"
          />
        </div>

        {isLoading ? (
          <Loader className="mt-10" label="Loading verification requests..." />
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error.message}</p>
        ) : requests.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            No {status === 'all' ? '' : status.replace('_', ' ')} verification requests.
          </p>
        ) : (
          <div className="mt-5 space-y-3">
            {requests.map((request) => (
              <div
                key={request.id}
                className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="m-0 text-sm font-bold text-slate-900">
                      {request.employeeName}
                      {request.employeeVeriworkId && (
                        <span className="ml-2 font-mono text-xs font-medium text-slate-400">
                          {request.employeeVeriworkId}
                        </span>
                      )}
                    </p>
                    <p className="m-0 mt-0.5 text-xs text-slate-500">
                      {[request.jobTitle, request.companyName || request.previousCompanyName]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <StatusPill request={request} />
                    <span className="text-xs text-slate-400">
                      {request.requestedAt ? formatDate(request.requestedAt) : ''}
                    </span>
                  </div>
                </div>

                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
                  {/* The whole point of this screen: who actually pressed send. */}
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Requested by
                    </dt>
                    <dd className="m-0 mt-1 text-slate-800">
                      {request.requestedBy?.label || '—'}
                      <span className="ml-1 rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-bold uppercase text-slate-500">
                        {request.requestedBy?.type === 'company' ? 'Company' : 'Employee'}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Channel
                    </dt>
                    <dd className="m-0 mt-1 text-slate-800">
                      {request.verificationChannel === 'platform'
                        ? `PagerLook dashboard (${request.targetCompanyName || request.previousCompanyName})`
                        : 'HR email'}
                      {request.verificationChannel === 'email' &&
                        EMAIL_STATUS_LABELS[request.emailStatus] && (
                          <span className="ml-2 text-xs text-slate-500">
                            — {EMAIL_STATUS_LABELS[request.emailStatus]}
                          </span>
                        )}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                      Re-sends
                    </dt>
                    <dd className="m-0 mt-1 text-slate-800">
                      {request.remindersSent || 0}
                      {request.lastRemindedAt ? ` — last ${formatDate(request.lastRemindedAt)}` : ''}
                    </dd>
                  </div>
                </dl>

                {request.verificationChannel === 'email' && (
                  <div className="mt-3">
                    <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
                      HR contacts
                    </p>
                    <p className="m-0 mt-1 text-sm text-slate-700">
                      {request.hrContacts?.length ? request.hrContacts.join(', ') : 'None on record'}
                    </p>
                  </div>
                )}

                <div className="mt-4">
                  {request.canResend ? (
                    openResendId === request.id ? (
                      <ResendPanel request={request} onClose={() => setOpenResendId(null)} />
                    ) : (
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        fullWidth={false}
                        onClick={() => setOpenResendId(request.id)}
                      >
                        Resend request
                      </Button>
                    )
                  ) : (
                    <p className="m-0 text-xs text-slate-500">
                      {request.resendBlockedReason || 'This request can no longer be re-sent.'}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminVerifications

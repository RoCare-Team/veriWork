import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { adminKeys, fetchAadhaarRequest, reviewAadhaarRequest } from '../../api/admin'
import { formatDate } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

function DetailRow({ label, value, flag }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 sm:max-w-[60%] sm:text-right">
        {value || '—'}
        {flag && <span className="ml-2 text-xs font-bold text-amber-600">{flag}</span>}
      </span>
    </div>
  )
}

/** Card image with a click-to-open link, since the printed text is small. */
function CardImage({ label, url }) {
  const src = mediaUrl(url)
  if (!src) {
    return (
      <div className="flex aspect-[8/5] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
        {label} not uploaded
      </div>
    )
  }

  return (
    <figure className="m-0">
      <a href={src} target="_blank" rel="noreferrer">
        <img
          src={src}
          alt={label}
          className="w-full rounded-2xl border border-slate-100 bg-slate-50 object-contain"
        />
      </a>
      <figcaption className="mt-2 text-center text-xs font-semibold text-slate-500">
        {label} · open full size
      </figcaption>
    </figure>
  )
}

function AdminAadhaarReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [formError, setFormError] = useState('')

  const { data: request, isLoading, error } = useQuery({
    queryKey: adminKeys.aadhaarRequest(id),
    queryFn: () => fetchAadhaarRequest(id),
    enabled: Boolean(id),
  })

  const mutation = useMutation({
    mutationFn: (status) => reviewAadhaarRequest(id, { status, reason, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: adminKeys.aadhaarRequest(id) })
      queryClient.invalidateQueries({ queryKey: ['admin', 'aadhaar-requests'] })
      queryClient.invalidateQueries({ queryKey: ['admin', 'dashboard'] })
      navigate('/admin/aadhaar-requests')
    },
    onError: (err) => setFormError(err.message || 'Could not save the decision'),
  })

  if (isLoading) return <Loader variant="fullPage" label="Loading submission..." />

  if (error || !request) {
    return (
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <p className="text-sm text-red-600">{error?.message || 'Submission not found'}</p>
          <Link to="/admin/aadhaar-requests" className="mt-4 inline-block text-sm font-semibold text-[#1e3a8a]">
            Back to Aadhaar queue
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const employee = request.employee
  const decided = request.status !== 'pending'

  const handleReject = () => {
    if (!reason.trim()) {
      setFormError('Add a reason so the employee knows what to fix')
      return
    }
    setFormError('')
    mutation.mutate('rejected')
  }

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <Link to="/admin/aadhaar-requests" className="text-sm font-semibold text-[#1e3a8a] no-underline hover:underline">
          ← Back to Aadhaar queue
        </Link>

        <div className="mt-5 flex flex-col gap-4 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="m-0 text-2xl font-extrabold text-slate-900">{employee?.name || 'Unknown employee'}</h2>
            <p className="m-0 mt-1 text-sm text-slate-500">
              {employee?.email || '—'} · {employee?.phone || '—'}
            </p>
            <p className="m-0 mt-1 font-mono text-xs text-slate-400">{employee?.veriworkId}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`rounded-full px-3 py-1 text-sm font-bold capitalize ${
                request.status === 'approved'
                  ? 'bg-green-50 text-green-700'
                  : request.status === 'rejected'
                    ? 'bg-red-50 text-red-700'
                    : 'bg-amber-50 text-amber-700'
              }`}
            >
              {request.status}
            </span>
            {request.submissionCount > 1 && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm font-semibold text-slate-600">
                Attempt {request.submissionCount}
              </span>
            )}
            {employee && (
              <Link
                to={`/admin/employees/${employee.id}`}
                className="text-sm font-semibold text-[#1e3a8a] no-underline hover:underline"
              >
                Full profile →
              </Link>
            )}
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="m-0 text-lg font-bold text-slate-900">Card images</h3>
            <p className="m-0 mt-1 text-sm text-slate-500">
              Confirm the number and name below appear exactly like this on the card.
            </p>
            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <CardImage label="Front" url={request.frontImageUrl} />
              <CardImage label="Back" url={request.backImageUrl} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="m-0 text-lg font-bold text-slate-900">Declared details</h3>
            <div className="mt-4">
              <DetailRow label="Aadhaar number" value={<span className="font-mono">{request.aadhaarNumber}</span>} />
              <DetailRow
                label="Name on card"
                value={request.nameOnAadhaar}
                flag={employee && !employee.profileNameMatches ? 'differs from profile' : ''}
              />
              <DetailRow
                label="Date of birth"
                value={request.dobOnAadhaar}
                flag={
                  employee && request.dobOnAadhaar && !employee.profileDobMatches
                    ? 'differs from profile'
                    : ''
                }
              />
              <DetailRow label="Gender" value={request.genderOnAadhaar} />
              <DetailRow label="Address" value={request.addressOnAadhaar} />
              <DetailRow label="Consent given" value={request.consentAccepted ? 'Yes' : 'No'} />
              <DetailRow label="Submitted" value={formatDate(request.submittedAt)} />
              <DetailRow label="Profile name" value={employee?.name} />
              <DetailRow label="Profile date of birth" value={employee?.dateOfBirth} />
            </div>

            <h3 className="m-0 mt-6 text-lg font-bold text-slate-900">Face match</h3>
            <div className="mt-2">
              <DetailRow
                label="Result"
                value={
                  request.faceMatch.verifiedAt
                    ? `Matched at ${request.faceMatch.similarity}% (needed ${request.faceMatch.threshold}%)`
                    : 'Not run yet'
                }
              />
              <DetailRow label="Provider" value={request.faceMatch.provider} />
              <DetailRow
                label="Liveness"
                value={request.faceMatch.verifiedAt ? (request.faceMatch.livenessPassed ? 'Passed' : 'Failed') : ''}
              />
              <DetailRow label="Attempts" value={String(request.faceMatch.attempts)} />
            </div>
            {request.faceMatch.selfieUrl && (
              <img
                src={mediaUrl(request.faceMatch.selfieUrl)}
                alt="Verified selfie"
                className="mt-4 h-32 w-32 rounded-2xl border border-slate-100 object-cover"
              />
            )}
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
            <h3 className="m-0 text-lg font-bold text-slate-900">Decision</h3>

            {decided ? (
              <div className="mt-4 space-y-2 text-sm text-slate-700">
                <p className="m-0">
                  {request.status === 'approved' ? 'Approved' : 'Rejected'} on{' '}
                  {formatDate(request.reviewedAt)}
                  {request.reviewedBy?.email ? ` by ${request.reviewedBy.email}` : ''}.
                </p>
                {request.rejectionReason && (
                  <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
                    {request.rejectionReason}
                  </p>
                )}
                {request.reviewNotes && (
                  <p className="m-0 text-slate-500">Internal note: {request.reviewNotes}</p>
                )}
              </div>
            ) : (
              <>
                {formError && (
                  <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {formError}
                  </p>
                )}

                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                    Rejection reason
                    <textarea
                      rows={3}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Shown to the employee — e.g. back image is blurry, number does not match the card"
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-[#1e3a8a]"
                    />
                  </label>
                  <label className="flex flex-col gap-2 text-sm font-semibold text-slate-700">
                    Internal note (optional)
                    <textarea
                      rows={3}
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Only visible to admins"
                      className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-[#1e3a8a]"
                    />
                  </label>
                </div>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Button
                    type="button"
                    fullWidth={false}
                    disabled={mutation.isPending}
                    onClick={() => {
                      setFormError('')
                      mutation.mutate('approved')
                    }}
                    className="sm:min-w-[200px]"
                  >
                    {mutation.isPending ? 'Saving...' : 'Approve Aadhaar'}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    fullWidth={false}
                    disabled={mutation.isPending}
                    onClick={handleReject}
                    className="sm:min-w-[200px]"
                  >
                    Reject
                  </Button>
                </div>
                <p className="m-0 mt-3 text-xs text-slate-400">
                  Approving marks the employee Aadhaar-verified and unlocks the face match against
                  the photo on this card.
                </p>
              </>
            )}
          </section>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminAadhaarReview

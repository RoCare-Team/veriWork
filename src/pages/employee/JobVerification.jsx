import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import {
  employeeKeys,
  fetchJobVerification,
  createJobVerificationRequest,
  uploadJobDocumentWithType,
} from '../../api/employee'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatters'

const DOC_TYPES = [
  { id: 'offer_letter', label: 'Offer Letter' },
  { id: 'salary_slip', label: 'Salary Slip' },
  { id: 'experience_letter', label: 'Experience Letter' },
  { id: 'relieving_letter', label: 'Relieving Letter' },
]

const LEVEL_LABELS = {
  document_verified: 'Document Verified',
  hr_verified: 'HR Verified',
  employer_verified: 'Employer Verified',
}

const CHANNEL_LABELS = {
  platform: 'Previous company is on PagerLook — request sent to their HR dashboard',
  email: 'Verification email sent to HR / Manager',
}

function VerificationRequestStatus({ request }) {
  const channel = request.verificationChannel
  const status = request.status

  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="font-semibold text-slate-800">{request.statusLabel || status}</span>
        <span className="text-xs text-slate-500">
          {request.requestedAt ? formatDate(request.requestedAt) : ''}
        </span>
      </div>
      {channel && (
        <p className="m-0 mt-1 text-xs text-slate-600">{CHANNEL_LABELS[channel] || channel}</p>
      )}
      {request.verificationNotes && (
        <p className="m-0 mt-2 text-xs text-slate-500">{request.verificationNotes}</p>
      )}
    </div>
  )
}

function VerifiedRecordPanel({ record, job }) {
  const verifiedBy =
    record?.verifiedBy === 'employer_platform'
      ? `${job.company} HR (Platform)`
      : record?.verifiedBy === 'hr_email'
        ? `${job.company} HR (Email)`
        : record?.verifiedBy === 'document_fallback'
          ? 'Document review (no HR response)'
          : '—'

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <h3 className="m-0 text-sm font-bold text-slate-900">Verification record</h3>
      <p className="m-0 mt-1 text-xs text-slate-500">
        This record stays on your profile — future employers can reuse it.
      </p>
      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-xs text-slate-400">Company</dt>
          <dd className="m-0 font-semibold text-slate-900">{record?.company || job.company}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Status</dt>
          <dd className="m-0 font-semibold text-slate-900">
            {record?.verificationTag?.label || LEVEL_LABELS[record?.verificationLevel] || 'Verified'}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Verified by</dt>
          <dd className="m-0 text-slate-700">{verifiedBy}</dd>
        </div>
        <div>
          <dt className="text-xs text-slate-400">Verified on</dt>
          <dd className="m-0 text-slate-700">
            {record?.verifiedAt ? formatDate(record.verifiedAt) : '—'}
          </dd>
        </div>
        {record?.confidenceScore != null && (
          <div>
            <dt className="text-xs text-slate-400">Confidence score</dt>
            <dd className="m-0 text-slate-700">{record.confidenceScore}%</dd>
          </div>
        )}
      </dl>
    </section>
  )
}

function JobVerification() {
  const { jobId } = useParams()
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [hrEmail, setHrEmail] = useState('')
  const [managerEmail, setManagerEmail] = useState('')
  const [uploadType, setUploadType] = useState('offer_letter')

  const { data, isLoading, error } = useQuery({
    queryKey: [...employeeKeys.jobs, jobId, 'verification'],
    queryFn: () => fetchJobVerification(jobId),
    enabled: Boolean(jobId),
  })

  const payload = data?.data || data
  const job = payload?.job
  const documents = payload?.documents || []
  const verificationRequests = payload?.verificationRequests || []
  const openRequest = verificationRequests.find(
    (r) => ['pending', 'in_review', 'in_process', 'hr_responded'].includes(r.status),
  )

  useEffect(() => {
    if (job?.hrEmail) setHrEmail(job.hrEmail)
    if (job?.managerEmail) setManagerEmail(job.managerEmail)
  }, [job?.hrEmail, job?.managerEmail])

  const uploadMutation = useMutation({
    mutationFn: ({ file, documentType }) => uploadJobDocumentWithType(jobId, file, documentType),
    onSuccess: () => {
      toast('Document uploaded', 'success')
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.jobs, jobId, 'verification'] })
      queryClient.invalidateQueries({ queryKey: employeeKeys.jobs })
    },
    onError: (err) => toast(err.message || 'Upload failed', 'error'),
  })

  const verifyMutation = useMutation({
    mutationFn: () =>
      createJobVerificationRequest(jobId, {
        hrEmail: hrEmail.trim() || undefined,
        managerEmail: managerEmail.trim() || undefined,
      }),
    onSuccess: (res) => {
      const result = res?.data || res
      toast(result?.message || result?.request?.message || 'Verification request sent', 'success')
      queryClient.invalidateQueries({ queryKey: [...employeeKeys.jobs, jobId, 'verification'] })
      queryClient.invalidateQueries({ queryKey: employeeKeys.jobs })
      queryClient.invalidateQueries({ queryKey: employeeKeys.score })
    },
    onError: (err) => toast(err.message || 'Could not start verification', 'error'),
  })

  if (isLoading) return <Loader variant="fullPage" label="Loading..." />

  if (error || !job) {
    return (
      <EmployeeLayout>
        <p className="p-6 text-sm text-red-600">{error?.message || 'Job not found'}</p>
      </EmployeeLayout>
    )
  }

  const tag = job.verificationTag
  const canRequest = payload?.canRequestVerification && !payload?.isVerified
  const isVerified = payload?.isVerified || payload?.alreadyVerified

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Verify Employment"
        subtitle={job.company}
        action={
          <Link to="/employee/job-history" className="text-sm font-semibold text-[#1a3a8f] no-underline">
            ← Back
          </Link>
        }
      />

      <div className="space-y-6">
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="m-0 text-base font-bold text-slate-900">{job.title}</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">{job.company}</p>
          <p className="m-0 mt-3 inline-flex rounded-md bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
            {tag?.label || (isVerified ? 'Verified' : 'Not Verified')}
          </p>
        </section>

        {isVerified && (
          <>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-700">
              This employment is verified. Future companies can view this record without repeating verification.
            </div>
            {payload?.permanentRecord && (
              <VerifiedRecordPanel record={payload.permanentRecord} job={job} />
            )}
          </>
        )}

        {openRequest && !isVerified && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="m-0 text-sm font-bold text-slate-900">Verification in progress</h3>
            <p className="m-0 mt-1 text-xs text-slate-500">
              Your request is being processed. If HR does not respond within 14 days, verification may complete via document review.
            </p>
            <div className="mt-4 space-y-2">
              <VerificationRequestStatus request={openRequest} />
            </div>
          </section>
        )}

        {!isVerified && !openRequest && (
          <>
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="m-0 text-sm font-bold text-slate-900">Step 1 — Upload documents</h3>
              <p className="m-0 mt-1 text-xs text-slate-500">
                Offer letter, salary slips, experience letter, or relieving letter.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                {DOC_TYPES.map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setUploadType(t.id)}
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      uploadType === t.id ? 'bg-[#1a3a8f] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <span className="text-sm font-semibold text-[#1a3a8f]">Choose file to upload</span>
                <input
                  type="file"
                  className="hidden"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) uploadMutation.mutate({ file, documentType: uploadType })
                    e.target.value = ''
                  }}
                />
              </label>

              {documents.length > 0 && (
                <ul className="mt-4 space-y-2 text-sm text-slate-700">
                  {documents.map((doc) => (
                    <li key={doc.id || doc._id} className="flex justify-between rounded-lg bg-slate-50 px-3 py-2">
                      <span>{doc.originalName}</span>
                      <span className="text-xs text-slate-400">{doc.documentType || 'document'}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="m-0 text-sm font-bold text-slate-900">Step 2 — HR / Manager contact</h3>
              <p className="m-0 mt-1 text-xs text-slate-500">
                Required if the previous company is not registered on PagerLook (Case B). If registered, request goes to their HR dashboard (Case A).
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-semibold text-slate-700">HR email</span>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    placeholder="hr@company.com"
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-slate-700">Manager email</span>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    placeholder="manager@company.com"
                  />
                </label>
              </div>
            </section>

            <Button
              type="button"
              className="w-full"
              disabled={!canRequest || verifyMutation.isPending || documents.length === 0}
              onClick={() => verifyMutation.mutate()}
            >
              {verifyMutation.isPending ? 'Sending...' : 'Verify Employment'}
            </Button>

            {!canRequest && documents.length > 0 && (
              <p className="text-center text-xs text-slate-500">
                A verification request is already in progress for this job.
              </p>
            )}
            {documents.length === 0 && (
              <p className="text-center text-xs text-slate-500">
                Upload at least one document before requesting verification.
              </p>
            )}
          </>
        )}

        {verificationRequests.length > 0 && !openRequest && !isVerified && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="m-0 text-sm font-bold text-slate-900">Previous requests</h3>
            <div className="mt-3 space-y-2">
              {verificationRequests.map((req) => (
                <VerificationRequestStatus key={req.id} request={req} />
              ))}
            </div>
          </section>
        )}
      </div>
    </EmployeeLayout>
  )
}

export default JobVerification

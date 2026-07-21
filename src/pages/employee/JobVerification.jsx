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
import { mediaUrl } from '../../lib/mediaUrl'

const RATING_LABELS = {
  excellent: 'Excellent',
  good: 'Good',
  average: 'Average',
  below_average: 'Below Average',
  poor: 'Poor',
}

const RECOMMENDATION_LABELS = {
  strongly_recommend: 'Strongly recommend',
  recommend: 'Recommend',
  neutral: 'Neutral',
  not_recommend: 'Do not recommend',
}

const AI_VERDICT = {
  verified: { label: 'Verified', cls: 'bg-emerald-50 text-emerald-700 border-emerald-100' },
  unverified: { label: 'Unverified', cls: 'bg-red-50 text-red-600 border-red-100' },
  inconclusive: { label: 'Inconclusive', cls: 'bg-amber-50 text-amber-700 border-amber-100' },
}

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

function DetailRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">{label}</dt>
      <dd className="m-0 mt-1 text-slate-800">{value}</dd>
    </div>
  )
}

// AI-analysed verdict of the HR response — decides Verified / Unverified for this experience.
function AiAnalysisPanel({ analysis }) {
  if (!analysis || (!analysis.verdict && !analysis.summary)) return null
  const verdict = AI_VERDICT[analysis.verdict] || AI_VERDICT.inconclusive
  const flags = analysis.flags || analysis.redFlags || []

  return (
    <section className={`rounded-2xl border bg-white p-5 shadow-sm ${verdict.cls}`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-sm font-bold text-slate-900">AI Analysis</h3>
          <p className="m-0 mt-1 text-xs text-slate-500">
            Automated review of the HR response for this experience.
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-white/70 px-3 py-1 text-[10px] font-bold uppercase tracking-wider">
          {verdict.label}
        </span>
      </div>
      {analysis.confidence != null && (
        <p className="m-0 mt-3 text-xs font-semibold text-slate-600">
          Confidence: {analysis.confidence}%
        </p>
      )}
      {analysis.summary && <p className="m-0 mt-2 text-sm text-slate-700">{analysis.summary}</p>}
      {flags.length > 0 && (
        <ul className="m-0 mt-3 list-disc space-y-1 pl-5 text-xs text-slate-600">
          {flags.map((flag, i) => (
            <li key={i}>{typeof flag === 'string' ? flag : flag.message || flag.label}</li>
          ))}
        </ul>
      )}
    </section>
  )
}

// HR feedback attached to this experience — read-only / locked once submitted.
function HrResponsePanel({ details }) {
  if (!details || Object.keys(details).length === 0) return null
  const verifierLine = [details.verifierName, details.verifierDesignation].filter(Boolean).join(' · ')

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-sm font-bold text-slate-900">HR Response</h3>
          <p className="m-0 mt-1 text-xs text-slate-500">
            Submitted by your previous employer — locked and attached to this experience.
          </p>
        </div>
        <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-slate-100 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <svg width="11" height="11" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <rect x="4.5" y="9" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.6" />
            <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.6" />
          </svg>
          Locked
        </span>
      </div>

      <dl className="mt-4 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
        <div>
          <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Worked here</dt>
          <dd className="m-0 mt-1 font-semibold text-slate-800">
            {details.workedHere === true ? 'Yes' : details.workedHere === false ? 'No' : '—'}
          </dd>
        </div>
        <DetailRow label="Designation" value={details.designation} />
        {(details.joiningDate || details.exitDate) && (
          <DetailRow
            label="Duration"
            value={[details.joiningDate, details.exitDate].filter(Boolean).join(' — ')}
          />
        )}
        <DetailRow label="Department" value={details.department} />
        <DetailRow label="Reporting manager" value={details.reportingManager} />
        {details.rehireEligible != null && (
          <DetailRow label="Rehire eligible" value={details.rehireEligible ? 'Yes' : 'No'} />
        )}
        <DetailRow label="Performance rating" value={RATING_LABELS[details.performanceRating]} />
        <DetailRow label="Recommendation" value={RECOMMENDATION_LABELS[details.recommendation]} />
        <DetailRow label="Behavior / Conduct" value={details.behaviorRemarks} />
        {details.disciplinaryIssues != null && (
          <DetailRow
            label="Disciplinary issues"
            value={
              details.disciplinaryIssues
                ? `Yes${details.disciplinaryDetails ? ` — ${details.disciplinaryDetails}` : ''}`
                : 'None reported'
            }
          />
        )}
        {(details.feedback || details.hrRemarks || details.verificationNotes) && (
          <DetailRow
            label="HR remarks"
            value={details.hrRemarks || details.feedback || details.verificationNotes}
          />
        )}
        {details.supportingDocumentUrl && (
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">
              Supporting document
            </dt>
            <dd className="m-0 mt-1">
              <a
                href={mediaUrl(details.supportingDocumentUrl)}
                target="_blank"
                rel="noreferrer"
                className="text-sm font-semibold text-[#1e3a8a] no-underline hover:underline"
              >
                {details.supportingDocumentName || 'View document'}
              </a>
            </dd>
          </div>
        )}
        <DetailRow label="Verified by" value={verifierLine || null} />
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
  // A completed request (verified/hr_responded/rejected) carries the HR's actual
  // submitted feedback — surface it even after the role is fully verified.
  const respondedRequest = verificationRequests.find(
    (r) =>
      ['verified', 'approved', 'hr_responded', 'rejected'].includes(r.status) &&
      r.employmentDetails &&
      r.employmentDetails.workedHere != null,
  )
  const record = payload?.permanentRecord
  const hrResponse =
    record?.hrResponse ||
    openRequest?.employmentDetails ||
    openRequest?.hrResponse ||
    respondedRequest?.employmentDetails
  const aiAnalysis = record?.aiAnalysis || openRequest?.aiAnalysis || payload?.aiAnalysis

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
          <Link to="/employee/job-history" className="text-sm font-semibold text-[#1e3a8a] no-underline">
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

        <AiAnalysisPanel analysis={aiAnalysis} />
        <HrResponsePanel details={hrResponse} />

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
                      uploadType === t.id ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>

              <label className="mt-4 flex cursor-pointer flex-col items-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center">
                <span className="text-sm font-semibold text-[#1e3a8a]">Choose file to upload</span>
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
              <h3 className="m-0 text-sm font-bold text-slate-900">Step 2 — HR contacts</h3>
              <p className="m-0 mt-1 text-xs text-slate-500">
                Required if the previous company is not registered on PagerLook (Case B). If registered, request goes to their HR dashboard (Case A).
              </p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <label className="block text-sm">
                  <span className="font-semibold text-slate-700">HR contact 1</span>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    value={hrEmail}
                    onChange={(e) => setHrEmail(e.target.value)}
                    placeholder="hr1@company.com"
                  />
                </label>
                {/* Backed by the managerEmail column — the second of the two
                    recipient slots sendVerificationEmails mails. Label only. */}
                <label className="block text-sm">
                  <span className="font-semibold text-slate-700">HR contact 2</span>
                  <input
                    type="email"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    value={managerEmail}
                    onChange={(e) => setManagerEmail(e.target.value)}
                    placeholder="hr2@company.com"
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

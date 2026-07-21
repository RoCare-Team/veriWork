import { formatDate } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

const VERIFICATION_LADDER = [
  { id: 'profile', label: 'Profile', tier: 1 },
  { id: 'identity', label: 'Identity', tier: 2 },
  { id: 'document_verified', label: 'Documents', tier: 3 },
  { id: 'hr_verified', label: 'HR Verified', tier: 4 },
  { id: 'employer_verified', label: 'Employer', tier: 5 },
]

const LEVEL_TIER = {
  none: 0,
  document_verified: 3,
  hr_verified: 4,
  employer_verified: 5,
}

const BADGE_STYLES = {
  employer_verified: 'border-indigo-200 bg-indigo-50 text-indigo-800',
  hr_verified: 'border-blue-200 bg-blue-50 text-blue-800',
  document_verified: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  none: 'border-slate-200 bg-slate-50 text-slate-600',
  in_process: 'border-amber-200 bg-amber-50 text-amber-800',
}

const DOC_TYPE_LABELS = {
  offer_letter: 'Offer Letter',
  salary_slip: 'Salary Slip',
  experience_letter: 'Experience Letter',
  relieving_letter: 'Relieving Letter',
  pf_statement: 'PF Statement',
  form_16: 'Form 16',
  other: 'Document',
}

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

function CompanyInitial({ name }) {
  const letter = (name || '?').charAt(0).toUpperCase()
  return (
    <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#2748a6] text-xl font-extrabold text-white shadow-md">
      {letter}
    </div>
  )
}

function VerificationLadder({ currentLevel }) {
  const tier = LEVEL_TIER[currentLevel] || (currentLevel === 'in_process' ? 2 : 0)

  return (
    <div className="flex flex-wrap items-center gap-1">
      {VERIFICATION_LADDER.map((step, index) => {
        const done = tier >= step.tier
        const active = tier === step.tier
        return (
          <div key={step.id} className="flex items-center gap-1">
            <div
              className={`flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                done
                  ? active
                    ? 'bg-[#1e3a8a] text-white shadow-sm'
                    : 'bg-green-100 text-green-800'
                  : 'bg-slate-100 text-slate-400'
              }`}
            >
              <span>{done ? '✓' : step.tier}</span>
              <span className="hidden sm:inline">{step.label}</span>
            </div>
            {index < VERIFICATION_LADDER.length - 1 && (
              <span className={`hidden text-xs sm:inline ${done ? 'text-green-500' : 'text-slate-300'}`}>→</span>
            )}
          </div>
        )
      })}
    </div>
  )
}

function InfoCell({ label, value }) {
  if (value == null || value === '') return null
  return (
    <div className="rounded-xl bg-slate-50/80 px-3 py-2.5">
      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="m-0 mt-0.5 text-sm font-semibold text-slate-900">{value}</p>
    </div>
  )
}

function FeedbackRow({ label, value }) {
  if (value === null || value === undefined || value === '') return null
  return (
    <div className="rounded-xl bg-white/70 px-3 py-2">
      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</p>
      <p className="m-0 mt-0.5 text-sm font-medium text-slate-800">{value}</p>
    </div>
  )
}

// Structured HR response the previous employer submitted for this role.
function HrFeedbackPanel({ job }) {
  const details = job.latestVerificationRequest?.employmentDetails || {}
  const remarks = details.hrRemarks || details.feedback || job.verificationFeedback || details.verificationNotes || job.verificationNotes
  const verifierLine = [details.verifierName, details.verifierDesignation].filter(Boolean).join(' · ')
  const verifierContact = [details.verifierEmail, details.verifierPhone].filter(Boolean).join(' · ')

  const hasStructured = Boolean(
    details.performanceRating ||
      details.recommendation ||
      details.behaviorRemarks ||
      details.reportingManager ||
      details.disciplinaryIssues != null ||
      verifierLine ||
      details.supportingDocumentUrl,
  )

  if (!remarks && !hasStructured) return null

  const docHref = details.supportingDocumentUrl ? mediaUrl(details.supportingDocumentUrl) : null

  return (
    <div className="border-t border-slate-100 bg-blue-50/30 px-5 py-4">
      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employer / HR feedback</p>

      {hasStructured && (
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          <FeedbackRow label="Performance rating" value={RATING_LABELS[details.performanceRating]} />
          <FeedbackRow label="Recommendation" value={RECOMMENDATION_LABELS[details.recommendation]} />
          <FeedbackRow
            label="Rehire eligible"
            value={details.rehireEligible === true ? 'Yes' : details.rehireEligible === false ? 'No' : null}
          />
          <FeedbackRow label="Reporting manager" value={details.reportingManager} />
          <FeedbackRow
            label="Disciplinary issues"
            value={
              details.disciplinaryIssues === true
                ? `Yes${details.disciplinaryDetails ? ` — ${details.disciplinaryDetails}` : ''}`
                : details.disciplinaryIssues === false
                  ? 'None reported'
                  : null
            }
          />
          <FeedbackRow label="Behavior / Conduct" value={details.behaviorRemarks} />
        </div>
      )}

      {remarks && <p className="m-0 mt-3 text-sm leading-relaxed text-slate-700">{remarks}</p>}

      {(verifierLine || verifierContact || docHref) && (
        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-200/60 pt-3 text-xs text-slate-500">
          {verifierLine && (
            <span>
              Verified by <strong className="text-slate-700">{verifierLine}</strong>
            </span>
          )}
          {verifierContact && <span>{verifierContact}</span>}
          {docHref && (
            <a
              href={docHref}
              target="_blank"
              rel="noreferrer"
              className="font-semibold text-[#1e3a8a] no-underline hover:underline"
            >
              {details.supportingDocumentName || 'View supporting document'}
            </a>
          )}
        </div>
      )}
    </div>
  )
}

function CompanyEmploymentCard({ job, canVerify, onVerify, defaultExpanded = false }) {
  const level = job.verificationLevel || 'none'
  const isVerified = job.isReusable || job.status === 'verified' || LEVEL_TIER[level] >= 3
  const badgeStyle = BADGE_STYLES[level] || (job.status === 'in_process' ? BADGE_STYLES.in_process : BADGE_STYLES.none)
  const tagLabel = job.verificationTag?.label || job.verificationMeta?.label || 'Not Verified'

  const start = job.joiningDate || job.startDate
  const end = job.exitDate || job.endDate
  const dateRange = start
    ? `${formatDate(start)} – ${end ? formatDate(end) : job.isPresent ? 'Present' : '—'}`
    : job.duration || '—'

  const pathLabel = job.previousCompanyOnPlatform
    ? job.matchedPlatformCompany?.name
      ? `Case A — ${job.matchedPlatformCompany.name} on PagerLook`
      : 'Case A — Platform (company on PagerLook)'
    : 'Case B — Email HR verification'

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:shadow-md">
      {/* Header */}
      <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex gap-4">
            <CompanyInitial name={job.company} />
            <div>
              <h3 className="m-0 text-lg font-extrabold text-slate-900">{job.company}</h3>
              <p className="m-0 mt-0.5 text-sm font-medium text-slate-600">{job.title}</p>
              <p className="m-0 mt-1 text-xs text-slate-500">{dateRange}</p>
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold uppercase ${badgeStyle}`}>
              {isVerified && <span aria-hidden>✓</span>}
              {tagLabel}
            </span>
            {job.isReusable && (
              <span className="inline-flex items-center gap-1 rounded-full bg-[#1e3a8a]/10 px-2.5 py-1 text-[10px] font-bold uppercase text-[#1e3a8a]">
                ♻ Reusable record
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Verification ladder */}
      <div className="border-b border-slate-100 px-5 py-4">
        <p className="m-0 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust hierarchy</p>
        <VerificationLadder currentLevel={level} />
      </div>

      {/* Details grid */}
      <div className="grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <InfoCell label="Employment type" value={job.employmentType} />
        <InfoCell label="Department" value={job.department} />
        <InfoCell label="Employee ID" value={job.employeeCode} />
        <InfoCell label="Work location" value={job.workLocation} />
        <InfoCell label="Duration" value={job.duration} />
        <InfoCell label="Salary band" value={job.salaryBand} />
        <InfoCell label="UAN (PF)" value={job.uanNumber} />
        <InfoCell label="PF Member ID" value={job.pfNumber} />
        <InfoCell label="ESI Number" value={job.esiNumber} />
        <InfoCell label="Company PAN" value={job.companyPan} />
        <InfoCell label="CIN" value={job.companyCin} />
        <InfoCell label="GSTIN" value={job.companyGst} />
        <InfoCell label="Manager" value={job.managerName} />
        <InfoCell
          label="Verified on"
          value={job.verifiedAt ? formatDate(job.verifiedAt) : null}
        />
        <InfoCell label="Verification path" value={job.verificationChannel ? pathLabel : null} />
        <InfoCell
          label="Confidence"
          value={job.confidenceScore != null ? `${job.confidenceScore}%` : null}
        />
        <InfoCell
          label="Rehire eligible"
          value={
            job.rehireEligible === true ? 'Yes' : job.rehireEligible === false ? 'No' : null
          }
        />
        <InfoCell label="Resolved via" value={job.resolvedVia?.replace(/_/g, ' ')} />
      </div>

      {/* HR contacts */}
      {(job.hrEmail || job.managerEmail) && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="m-0 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">HR contacts</p>
          <div className="flex flex-wrap gap-3 text-sm">
            {job.hrEmail && (
              <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-slate-700">
                HR: <strong>{job.hrEmail}</strong>
              </span>
            )}
            {job.managerEmail && (
              <span className="rounded-lg bg-slate-50 px-3 py-1.5 text-slate-700">
                Manager: <strong>{job.managerEmail}</strong>
              </span>
            )}
          </div>
        </div>
      )}

      {/* HR feedback — structured response submitted by the previous employer's HR */}
      <HrFeedbackPanel job={job} />

      {/* Latest verification request */}
      {job.latestVerificationRequest && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="m-0 mb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">Latest verification request</p>
          <div className="flex flex-wrap gap-2 text-xs">
            <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold capitalize text-slate-700">
              {job.latestVerificationRequest.verificationChannel} channel
            </span>
            <span className="rounded-md bg-slate-100 px-2 py-1 font-semibold capitalize text-slate-700">
              {job.latestVerificationRequest.status?.replace(/_/g, ' ')}
            </span>
            {job.latestVerificationRequest.requestedAt && (
              <span className="text-slate-500">
                Requested {formatDate(job.latestVerificationRequest.requestedAt)}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Documents per company */}
      {job.documents?.length > 0 && (
        <div className="border-t border-slate-100 px-5 py-4">
          <p className="m-0 mb-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Employment documents ({job.documents.length})
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {job.documents.map((doc) => {
              const href = mediaUrl(doc.url) || doc.url
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50/50 px-3 py-2.5"
                >
                  <div className="min-w-0">
                    <p className="m-0 truncate text-xs font-semibold text-slate-900">
                      {DOC_TYPE_LABELS[doc.documentType] || doc.originalName}
                    </p>
                    <p className="m-0 truncate text-[10px] text-slate-500">{doc.originalName}</p>
                  </div>
                  {href ? (
                    <a
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 rounded-lg bg-white px-2.5 py-1 text-[10px] font-bold text-[#1e3a8a] no-underline shadow-sm hover:bg-blue-50"
                    >
                      View
                    </a>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Footer action */}
      {canVerify && (
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 bg-slate-50/50 px-5 py-4">
          <p className="m-0 text-xs text-slate-500">
            {isVerified
              ? 'This record is verified and reusable for future employers.'
              : job.previousCompanyOnPlatform
                ? `Verify via PagerLook — employee consent, then ${job.matchedPlatformCompany?.name || job.company} HR reviews.`
                : 'Not on PagerLook — send verification email to HR, or search registered company in modal.'}
          </p>
          {!isVerified ? (
            <button
              type="button"
              onClick={() => onVerify?.(job)}
              className="shrink-0 rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white hover:bg-[#172554]"
            >
              Start Verification
            </button>
          ) : (
            <span className="shrink-0 text-sm font-bold text-green-600">✓ Verified</span>
          )}
        </div>
      )}
    </article>
  )
}

export default CompanyEmploymentCard

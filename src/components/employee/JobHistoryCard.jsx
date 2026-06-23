import { Link } from 'react-router-dom'
import { formatDate } from '../../utils/formatters'
import {
  companyAccentColor,
  companyInitials,
  formatJobPeriod,
  getJobVerificationBadge,
  isJobVerified,
} from '../../utils/jobHistoryUtils'

function CalendarIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

function JobHistoryCard({ job }) {
  const badge = getJobVerificationBadge(job)
  const period = formatJobPeriod(job)
  const verified = isJobVerified(job)
  const showVerify = !verified && job.id && job.status !== 'in_process'
  const accent = companyAccentColor(job.company)

  return (
    <article
      className={`group relative overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md ${
        verified ? 'border-green-100' : 'border-slate-200'
      }`}
    >
      <div className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${verified ? 'from-green-400 to-emerald-500' : 'from-slate-200 to-slate-300'}`} />

      <div className="p-5">
        <div className="flex items-start gap-4">
          <div
            className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br text-sm font-bold text-white shadow-sm ${accent}`}
          >
            {companyInitials(job.company)}
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="m-0 text-base font-bold leading-snug text-slate-900">{job.title}</h3>
            <p className="m-0 mt-0.5 text-sm font-medium text-slate-500">{job.company}</p>
            <div className="mt-2 inline-flex items-center gap-1.5 text-xs text-slate-500">
              <CalendarIcon />
              <span>{period}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
            {job.type || job.employmentType || 'Full-time'}
          </span>
          {job.isPresent && (
            <span className="rounded-lg bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700">
              Current role
            </span>
          )}
          {job.salaryBand && (
            <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
              {job.salaryBand}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${badge.bg} ${badge.border} ${badge.text}`}
          >
            <span className={`h-1.5 w-1.5 rounded-full ${badge.dot}`} />
            {badge.label}
          </span>

          {showVerify ? (
            <Link
              to={`/employee/jobs/${job.id}/verify`}
              className="inline-flex items-center gap-1 rounded-lg bg-[#1a3a8f] px-3 py-1.5 text-xs font-semibold text-white no-underline transition hover:bg-[#152b6e]"
            >
              Verify employment
            </Link>
          ) : verified && job.verifiedAt ? (
            <span className="text-[10px] font-medium text-slate-400">
              Verified {formatDate(job.verifiedAt)}
            </span>
          ) : job.status === 'in_process' ? (
            <Link
              to={`/employee/jobs/${job.id}/verify`}
              className="text-xs font-semibold text-[#1a3a8f] no-underline hover:underline"
            >
              View status →
            </Link>
          ) : null}
        </div>
      </div>
    </article>
  )
}

export default JobHistoryCard

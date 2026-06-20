import { Link } from 'react-router-dom'
import { BuildingIcon } from '../common/Icons'
import { formatDate } from '../../utils/formatters'

const STATUS_STYLES = {
  verified: { dot: 'bg-green-500', text: 'text-green-700' },
  in_process: { dot: 'bg-slate-400', text: 'text-slate-600' },
  not_verified: { dot: 'bg-slate-300', text: 'text-slate-500' },
}

const LEVEL_STYLES = {
  employer_verified: 'text-green-700',
  hr_verified: 'text-slate-700',
  document_verified: 'text-slate-600',
}

function JobHistoryCard({ job }) {
  const status = STATUS_STYLES[job.status] || STATUS_STYLES.not_verified
  const tagLabel = job.verificationTag?.label || job.statusLabel || 'Not Verified'
  const levelClass = LEVEL_STYLES[job.verificationLevel] || status.text
  const showVerify = job.status !== 'verified' && job.id

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:p-5 lg:h-full">
      <div className="flex gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-[#1a3a8f]">
          <BuildingIcon className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="m-0 text-sm font-bold text-slate-900">{job.title}</h3>
          <p className="m-0 mt-0.5 text-xs text-slate-500">{job.company}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div>
          <p className="m-0 text-[11px] text-slate-400">Duration</p>
          <p className="m-0 mt-0.5 text-xs font-semibold text-slate-800">{job.duration || '—'}</p>
        </div>
        <div>
          <p className="m-0 text-[11px] text-slate-400">Type</p>
          <p className="m-0 mt-0.5 text-xs font-semibold text-slate-800">{job.type || job.employmentType || '—'}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 shrink-0 rounded-full ${status.dot}`} />
            <span className={`truncate text-xs font-semibold ${levelClass}`}>{tagLabel}</span>
          </div>
          {job.verifiedAt && (
            <p className="m-0 mt-0.5 pl-4 text-[10px] text-slate-400">
              Verified {formatDate(job.verifiedAt)}
            </p>
          )}
        </div>
        {showVerify && (
          <Link
            to={`/employee/jobs/${job.id}/verify`}
            className="shrink-0 text-xs font-bold text-[#1a3a8f] no-underline hover:underline"
          >
            Verify →
          </Link>
        )}
      </div>
    </article>
  )
}

export default JobHistoryCard

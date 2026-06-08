import { BuildingIcon } from '../common/Icons'

const STATUS_STYLES = {
  verified: { dot: 'bg-green-500', text: 'text-green-600', label: 'Verified' },
  in_process: { dot: 'bg-amber-400', text: 'text-amber-600', label: 'In Process' },
  not_verified: { dot: 'bg-slate-300', text: 'text-slate-500', label: 'Not Verified' },
}

function JobHistoryCard({ job }) {
  const status = STATUS_STYLES[job.status] || STATUS_STYLES.not_verified

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5 lg:h-full">
      <div className="flex gap-3.5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1a3a8f]">
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
          <p className="m-0 mt-0.5 text-xs font-semibold text-slate-800">{job.duration}</p>
        </div>
        <div>
          <p className="m-0 text-[11px] text-slate-400">Type</p>
          <p className="m-0 mt-0.5 text-xs font-semibold text-slate-800">{job.type}</p>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 border-t border-slate-100 pt-3">
        <span className={`h-2 w-2 rounded-full ${status.dot}`} />
        <span className={`text-xs font-semibold ${status.text}`}>{status.label}</span>
      </div>
    </article>
  )
}

export default JobHistoryCard

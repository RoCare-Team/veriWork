import { getScoreRating } from '../../utils/employeeScoreUtils'
import { getInitials } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

function EmployeeCard({
  initials,
  name,
  role,
  department,
  employeeScore,
  trustScore,
  verified,
  photoUrl,
  stageLabel,
  onViewProfile,
}) {
  const score = employeeScore ?? trustScore ?? 0
  const rating = getScoreRating(score)
  const displayInitials = typeof initials === 'string' && initials.length <= 3
    ? initials
    : getInitials(name || initials)

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-slate-200 hover:shadow-md">
      <div className="flex items-start gap-3">
        {photoUrl ? (
          <img
            src={mediaUrl(photoUrl)}
            alt=""
            className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
          />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[#1a3a8f]">
            {displayInitials}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-base font-bold text-slate-900">{name}</h3>
          <p className="mt-0.5 truncate text-sm text-slate-500">
            {role} · {department}
          </p>
          {stageLabel && (
            <span className="mt-1.5 inline-block rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-600">
              {stageLabel}
            </span>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              VeriScore
            </p>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`text-lg font-extrabold ${rating.color}`}>{score}</span>
              <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rating.bg} ${rating.color}`}>
                {rating.label}
              </span>
            </div>
          </div>
          <div>
            <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Verification
            </p>
            <div className="mt-1">
              {verified ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-bold text-[#1a3a8f]">
                  ✓ Verified
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-bold text-orange-600">
                  Pending
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={onViewProfile}
        className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1a3a8f] hover:text-[#1a3a8f]"
      >
        View Profile
      </button>
    </article>
  )
}

export default EmployeeCard

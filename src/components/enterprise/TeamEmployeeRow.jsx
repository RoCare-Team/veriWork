import { useNavigate } from 'react-router-dom'
import {
  getEmployeeName,
  getEmployeeRole,
  getEmployeeProfilePath,
  getEmployeeVerifyPath,
  getOnboardingStageStyle,
  resolveEmployeeAccessButton,
  resolveEmployeeId,
} from '../../utils/enterpriseTeamUtils'
import { getInitials, formatDate } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

/* One shared button shape so the three actions never drift apart. */
const BTN = 'rounded-ctl px-3 py-2 text-xs font-semibold transition disabled:opacity-50'
const BTN_PRIMARY = `${BTN} bg-brand-600 text-white hover:bg-brand-700`
const BTN_TINTED = `${BTN} bg-brand-600/10 text-brand-600 hover:bg-brand-600/15`
const BTN_NEUTRAL = `${BTN} bg-slate-100 text-slate-600 hover:bg-slate-200`

function TeamEmployeeRow({ employee, onRequestAccess, onRemoveAccess, onAssign }) {
  const navigate = useNavigate()
  const profilePath = getEmployeeProfilePath(employee)
  const verifyPath = getEmployeeVerifyPath(resolveEmployeeId(employee))
  const name = getEmployeeName(employee)
  const role = getEmployeeRole(employee)
  const department = employee.department && employee.department !== 'Unassigned' ? employee.department : null
  const photoSrc = mediaUrl(employee.photoUrl || employee.profilePhoto || employee.avatar)
  const accessButton = resolveEmployeeAccessButton(employee)
  const stage = employee.onboardingStage || 'incoming'
  const stageStyle = getOnboardingStageStyle(stage)

  const score = employee.trustScore
  const scoreColor =
    score == null ? 'text-slate-500' : score >= 750 ? 'text-emerald-600' : score >= 500 ? 'text-brand-600' : 'text-amber-600'

  const renderAccessButton = () => {
    if (accessButton === 'remove_access') {
      return (
        <button type="button" onClick={() => onRemoveAccess?.(employee)} className={BTN_NEUTRAL}>
          Remove access
        </button>
      )
    }
    if (accessButton === 'pending') {
      return (
        <button type="button" disabled className={`${BTN_NEUTRAL} cursor-not-allowed`}>
          Access pending
        </button>
      )
    }
    return (
      <button type="button" onClick={() => onRequestAccess?.(employee)} className={BTN_TINTED}>
        Request access
      </button>
    )
  }

  // The one action that moves this person forward, if any.
  const renderStageAction = () => {
    if (stage === 'verified') {
      return (
        <button type="button" onClick={() => onAssign?.(employee)} className={`${BTN_PRIMARY} w-full`}>
          Assign department
        </button>
      )
    }
    if (stage === 'pending_verification' && verifyPath) {
      return (
        <button type="button" onClick={() => navigate(verifyPath)} className={`${BTN_PRIMARY} w-full`}>
          Verify employment
        </button>
      )
    }
    return null
  }

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-slate-300 hover:shadow-md">
      {/* Identity */}
      <div className="flex items-start gap-3">
        {photoSrc ? (
          <img src={photoSrc} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
            {getInitials(name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="m-0 truncate text-base font-bold text-slate-900">{name}</p>
          <p className="m-0 mt-0.5 truncate text-sm text-slate-500">
            {[role, department].filter(Boolean).join(' · ') || '—'}
          </p>
        </div>
      </div>

      <div className="mt-3">
        <span
          className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${stageStyle.bg} ${stageStyle.color}`}
        >
          {stageStyle.label}
        </span>
      </div>

      {/* Meta */}
      <div className="mt-4 flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
        <div>
          <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Trust score</p>
          <p className={`m-0 text-xl font-extrabold ${scoreColor}`}>{score ?? '—'}</p>
        </div>
        {employee.joinedAt && (
          <div className="text-right">
            <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Joined</p>
            <p className="m-0 text-xs font-medium text-slate-600">{formatDate(employee.joinedAt)}</p>
          </div>
        )}
      </div>

      {/* mt-auto: not every card has a stage action, so pin the buttons to the
          bottom and keep a row of cards visually aligned. */}
      <div className="mt-auto flex flex-col gap-2 pt-4">
        {renderStageAction()}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => profilePath && navigate(profilePath)}
            disabled={!profilePath}
            className={BTN_TINTED}
          >
            View profile
          </button>
          {renderAccessButton()}
        </div>
      </div>
    </article>
  )
}

export default TeamEmployeeRow

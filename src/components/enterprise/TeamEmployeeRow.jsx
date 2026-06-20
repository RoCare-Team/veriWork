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

  const renderAccessButton = () => {
    if (accessButton === 'remove_access') {
      return (
        <button
          type="button"
          onClick={() => onRemoveAccess?.(employee)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
        >
          Remove access
        </button>
      )
    }
    if (accessButton === 'pending') {
      return (
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-medium text-slate-400"
        >
          Access pending
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={() => onRequestAccess?.(employee)}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
      >
        Request access
      </button>
    )
  }

  const renderStageAction = () => {
    if (stage === 'verified') {
      return (
        <button
          type="button"
          onClick={() => onAssign?.(employee)}
          className="rounded-lg bg-[#1a3a8f] px-3 py-2 text-sm font-medium text-white transition hover:bg-[#152b6e]"
        >
          Assign department
        </button>
      )
    }
    if (stage === 'pending_verification' && verifyPath) {
      return (
        <button
          type="button"
          onClick={() => navigate(verifyPath)}
          className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          Verify employment
        </button>
      )
    }
    return null
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300 hover:shadow-md md:p-5">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-center gap-4">
          {photoSrc ? (
            <img
              src={photoSrc}
              alt=""
              className="h-12 w-12 shrink-0 rounded-full object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-slate-100 to-slate-200 text-sm font-semibold text-slate-600">
              {getInitials(name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <p className="m-0 truncate text-base font-semibold text-slate-900">{name}</p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${stageStyle.bg} ${stageStyle.color}`}
              >
                {stageStyle.label}
              </span>
            </div>
            <p className="m-0 mt-0.5 truncate text-sm text-slate-500">
              {[role, department].filter(Boolean).join(' · ') || '—'}
            </p>
            {employee.joinedAt && (
              <p className="m-0 mt-1 text-xs text-slate-400">Joined {formatDate(employee.joinedAt)}</p>
            )}
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:justify-end">
          {employee.trustScore != null && (
            <div className="rounded-lg bg-slate-50 px-3 py-2 text-center">
              <p className="m-0 text-[10px] font-medium uppercase tracking-wide text-slate-400">Trust score</p>
              <p className="m-0 text-base font-bold text-[#1a3a8f]">{employee.trustScore}</p>
            </div>
          )}
          <div className="flex flex-wrap gap-2">
            {renderStageAction()}
            <button
              type="button"
              onClick={() => profilePath && navigate(profilePath)}
              disabled={!profilePath}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:border-[#1a3a8f] hover:text-[#1a3a8f] disabled:cursor-not-allowed disabled:opacity-50"
            >
              View profile
            </button>
            {renderAccessButton()}
          </div>
        </div>
      </div>
    </article>
  )
}

export default TeamEmployeeRow

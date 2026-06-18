import { useNavigate } from 'react-router-dom'
import {
  getEmployeeName,
  getEmployeeRole,
  getEmployeeProfilePath,
  resolveEmployeeAccessButton,
} from '../../utils/enterpriseTeamUtils'
import { getInitials } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

const AVATAR_COLORS = [
  'bg-[#1a3a8f] text-white',
  'bg-blue-100 text-[#1a3a8f]',
  'bg-indigo-100 text-indigo-700',
  'bg-sky-100 text-sky-700',
]

function avatarColor(seed = '') {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) hash = seed.charCodeAt(i) + ((hash << 5) - hash)
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}

function TeamEmployeeRow({ employee, onRequestAccess, onRemoveAccess }) {
  const navigate = useNavigate()
  const profilePath = getEmployeeProfilePath(employee)
  const name = getEmployeeName(employee)
  const role = getEmployeeRole(employee)
  const photoSrc = mediaUrl(employee.photoUrl || employee.profilePhoto || employee.avatar)
  const accessButton = resolveEmployeeAccessButton(employee)
  const initials = getInitials(name)
  const colorClass = avatarColor(name)

  const renderSecondaryButton = () => {
    if (accessButton === 'remove_access') {
      return (
        <button
          type="button"
          onClick={() => onRemoveAccess?.(employee)}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          Remove
        </button>
      )
    }
    if (accessButton === 'pending') {
      return (
        <button
          type="button"
          disabled
          className="cursor-not-allowed rounded-lg border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400"
        >
          Pending
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={() => onRequestAccess?.(employee)}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
      >
        Request Access
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 md:px-5">
      <div className="flex min-w-0 items-center gap-3">
        {photoSrc ? (
          <img src={photoSrc} alt="" className="h-10 w-10 shrink-0 rounded-full object-cover" />
        ) : (
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${colorClass}`}>
            {initials}
          </div>
        )}
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-bold text-slate-900">{name}</p>
          <p className="m-0 truncate text-xs text-slate-500">{role}</p>
        </div>
      </div>

      <div className="flex shrink-0 gap-2 sm:ml-auto">
        <button
          type="button"
          onClick={() => profilePath && navigate(profilePath)}
          disabled={!profilePath}
          className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          View profile
        </button>
        {renderSecondaryButton()}
      </div>
    </div>
  )
}

export default TeamEmployeeRow

import { useNavigate } from 'react-router-dom'
import EmploymentStatusBadge from './EmploymentStatusBadge'
import {
  getEmployeeName,
  getEmployeeRole,
  getEmployeeProfilePath,
  resolveEmployeeAccessButton,
} from '../../utils/enterpriseTeamUtils'
import { getInitials } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

function AccessGrantedBadges({ access }) {
  if (!access) return null
  const fullAccess =
    access.fullProfileAccess === true ||
    access.full_profile_access === true ||
    access.hasAllAccess === true
  const items = []
  if (fullAccess || access.profileAccess) items.push({ key: 'profile', label: 'Profile', dot: 'bg-green-500' })
  if (fullAccess || access.backgroundCheck) items.push({ key: 'docs', label: 'Docs', dot: 'bg-blue-500' })
  if (fullAccess || access.verificationData) items.push({ key: 'verify', label: 'Verify', dot: 'bg-purple-500' })
  if (!items.length) return null

  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item.key}
          className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600"
        >
          <span className={`h-1.5 w-1.5 rounded-full ${item.dot}`} aria-hidden="true" />
          {item.label}
        </span>
      ))}
    </div>
  )
}

function TeamEmployeeCard({ employee, department, onRequestAccess, onRemoveAccess }) {
  const navigate = useNavigate()
  const profilePath = getEmployeeProfilePath(employee)
  const name = getEmployeeName(employee)
  const role = getEmployeeRole(employee)
  const photoSrc = mediaUrl(employee.photoUrl || employee.profilePhoto || employee.avatar)
  const accessButton = resolveEmployeeAccessButton(employee)
  const subtitle = department
    ? `${role} · ${department}`
    : employee.department
      ? `${role} · ${employee.department}`
      : role

  const handleCardClick = () => {
    if (profilePath) navigate(profilePath)
  }

  const stop = (e) => e.stopPropagation()

  const renderAccessButton = () => {
    if (accessButton === 'remove_access') {
      return (
        <button
          type="button"
          onClick={(e) => {
            stop(e)
            onRemoveAccess?.(employee)
          }}
          className="rounded-xl border border-red-300 px-4 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
        >
          Remove Access
        </button>
      )
    }
    if (accessButton === 'pending') {
      return (
        <button
          type="button"
          disabled
          onClick={stop}
          className="cursor-not-allowed rounded-xl border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-400"
        >
          Access Pending
        </button>
      )
    }
    return (
      <button
        type="button"
        onClick={(e) => {
          stop(e)
          onRequestAccess?.(employee)
        }}
        className="rounded-xl border border-[#1a3a8f] px-4 py-2 text-sm font-semibold text-[#1a3a8f] transition hover:bg-blue-50"
      >
        Request Access
      </button>
    )
  }

  return (
    <article
      role={profilePath ? 'button' : undefined}
      tabIndex={profilePath ? 0 : undefined}
      onClick={profilePath ? handleCardClick : undefined}
      onKeyDown={
        profilePath
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                handleCardClick()
              }
            }
          : undefined
      }
      className={`rounded-xl border border-gray-100 bg-white p-5 shadow-sm transition ${
        profilePath ? 'cursor-pointer hover:border-blue-200 hover:shadow-md' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 gap-3">
          {photoSrc ? (
            <img src={photoSrc} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[#1a3a8f]">
              {getInitials(name)}
            </div>
          )}
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h4 className="m-0 truncate text-base font-bold text-slate-900">{name}</h4>
            </div>
            <p className="m-0 mt-0.5 truncate text-sm text-slate-600">{subtitle}</p>
            <AccessGrantedBadges access={employee.access} />
          </div>
        </div>
        <EmploymentStatusBadge status={employee.employmentStatus || 'active'} />
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-gray-100 pt-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="shrink-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">Trust Score</p>
          <p className="m-0 mt-1 text-2xl font-bold text-amber-600">{employee.trustScore ?? '—'}</p>
        </div>
        <div className="flex flex-wrap gap-2 sm:justify-end" onClick={stop} onKeyDown={stop} role="presentation">
          <button
            type="button"
            onClick={(e) => {
              stop(e)
              if (profilePath) navigate(profilePath)
            }}
            disabled={!profilePath}
            className="rounded-xl bg-[#1a3a8f] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#152b6e] disabled:cursor-not-allowed disabled:opacity-50"
          >
            View Profile
          </button>
          {renderAccessButton()}
        </div>
      </div>
    </article>
  )
}

export default TeamEmployeeCard

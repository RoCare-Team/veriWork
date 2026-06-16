import TrustScoreDisplay from './TrustScoreDisplay'
import EmploymentStatusBadge from './EmploymentStatusBadge'
import { getInitials } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

function TeamEmployeeCard({ employee, onViewProfile }) {
  const avatar = employee.photoUrl ? mediaUrl(employee.photoUrl) : null
  const score = employee.trustScore ?? employee.employeeScore

  return (
    <article className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md">
      <div className="flex items-start gap-3">
        {avatar ? (
          <img src={avatar} alt="" className="h-12 w-12 shrink-0 rounded-full border border-slate-100 object-cover" />
        ) : (
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-[#1a3a8f]">
            {getInitials(employee.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="m-0 truncate text-base font-bold text-slate-900">{employee.name}</h3>
          <p className="mt-0.5 truncate text-sm text-slate-500">{employee.role}</p>
          {employee.employmentStatus && (
            <div className="mt-2">
              <EmploymentStatusBadge status={employee.employmentStatus} />
            </div>
          )}
        </div>
      </div>

      <div className="mt-4 border-t border-slate-100 pt-4">
        <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Trust Score</p>
        <div className="mt-1">
          <TrustScoreDisplay score={score} />
        </div>
      </div>

      <button
        type="button"
        onClick={() => onViewProfile(employee)}
        className="mt-4 w-full rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-[#1a3a8f] hover:text-[#1a3a8f]"
      >
        View Profile
      </button>
    </article>
  )
}

export default TeamEmployeeCard

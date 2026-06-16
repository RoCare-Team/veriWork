import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import EmploymentStatusBadge from './EmploymentStatusBadge'
import TrustScoreDisplay from './TrustScoreDisplay'
import Loader from '../common/Loader'
import { COMPANY_ROUTES } from '../../constants/companyRoutes'
import { enterpriseKeys, fetchTeamDepartment } from '../../api/enterprise'
import {
  extractDepartmentEmployees,
  getEmployeeName,
  getEmployeeRole,
  resolveEmployeeId,
} from '../../utils/enterpriseTeamUtils'

function DepartmentEmployeeSection({
  department,
  prefetchedEmployees,
  onViewProfile,
  onRequestAccess,
}) {
  const shouldFetch = !prefetchedEmployees?.length && Boolean(department)

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.teamDepartment(department),
    queryFn: () => fetchTeamDepartment(department),
    enabled: shouldFetch,
  })

  const employees = prefetchedEmployees?.length
    ? prefetchedEmployees
    : extractDepartmentEmployees(data)

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6">
        <Loader variant="inline" label={`Loading ${department}...`} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error.message}
      </div>
    )
  }

  if (!employees.length) return null

  return (
    <section className="rounded-2xl border border-slate-100 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
        <div>
          <h3 className="m-0 text-base font-bold text-slate-900">{department}</h3>
          <p className="m-0 mt-0.5 text-xs text-slate-500">{employees.length} linked employee{employees.length !== 1 ? 's' : ''}</p>
        </div>
        <Link
          to={COMPANY_ROUTES.TEAM_DEPARTMENT(department)}
          className="text-sm font-semibold text-[#1a3a8f] no-underline hover:underline"
        >
          View department →
        </Link>
      </div>

      <div className="divide-y divide-slate-50">
        {employees.map((emp) => {
          const id = resolveEmployeeId(emp)
          return (
            <article key={id || getEmployeeName(emp)} className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="m-0 font-bold text-slate-900">{getEmployeeName(emp)}</h4>
                  <EmploymentStatusBadge status={emp.employmentStatus} />
                </div>
                <p className="m-0 mt-1 text-sm text-slate-600">{getEmployeeRole(emp)}</p>
                <div className="mt-2">
                  <TrustScoreDisplay score={emp.trustScore} compact />
                </div>
              </div>
              <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={() => id && onViewProfile(id)}
                  disabled={!id}
                  className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={() => id && onRequestAccess({ id, name: getEmployeeName(emp) })}
                  disabled={!id}
                  className="rounded-xl bg-[#1a3a8f] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#152b6e] disabled:opacity-50"
                >
                  Request Access
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default DepartmentEmployeeSection

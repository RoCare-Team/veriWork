import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import EmploymentStatusBadge from '../../components/enterprise/EmploymentStatusBadge'
import TrustScoreDisplay from '../../components/enterprise/TrustScoreDisplay'
import EmployeeProfileDrawer from '../../components/enterprise/EmployeeProfileDrawer'
import SendAccessRequestModal from '../../components/enterprise/SendAccessRequestModal'
import Loader from '../../components/common/Loader'
import { COMPANY_ROUTES } from '../../constants/companyRoutes'
import { enterpriseKeys, fetchTeamDepartment } from '../../api/enterprise'
import {
  extractDepartmentEmployees,
  getEmployeeName,
  getEmployeeRole,
  resolveEmployeeId,
} from '../../utils/enterpriseTeamUtils'

function DepartmentDetails() {
  const { department: departmentParam } = useParams()
  const department = decodeURIComponent(departmentParam || '')
  const [profileEmployeeId, setProfileEmployeeId] = useState(null)
  const [accessRequestEmployee, setAccessRequestEmployee] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.teamDepartment(department),
    queryFn: () => fetchTeamDepartment(department),
    enabled: Boolean(department),
  })

  const employees = extractDepartmentEmployees(data)

  if (isLoading) return <Loader variant="fullPage" label="Loading department..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <Link to={COMPANY_ROUTES.TEAM} className="mb-4 inline-block text-sm font-semibold text-[#1a3a8f] no-underline hover:underline">
          ← Back to Team
        </Link>

        <PageHeader
          title={department}
          subtitle={`${employees.length} employee${employees.length !== 1 ? 's' : ''}`}
        />

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
        )}

        {employees.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 font-bold text-slate-600">Name</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Role</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Trust Score</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Status</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const id = resolveEmployeeId(emp)
                    return (
                      <tr key={id || getEmployeeName(emp)} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                        <td className="px-5 py-4 font-semibold text-slate-900">{getEmployeeName(emp)}</td>
                        <td className="px-5 py-4 text-slate-600">{getEmployeeRole(emp)}</td>
                        <td className="px-5 py-4"><TrustScoreDisplay score={emp.trustScore} compact /></td>
                        <td className="px-5 py-4"><EmploymentStatusBadge status={emp.employmentStatus} /></td>
                        <td className="px-5 py-4">
                          <div className="flex gap-3">
                            <button
                              type="button"
                              onClick={() => id && setProfileEmployeeId(id)}
                              disabled={!id}
                              className="text-sm font-semibold text-[#1a3a8f] hover:underline disabled:opacity-50"
                            >
                              View Profile
                            </button>
                            <button
                              type="button"
                              onClick={() => id && setAccessRequestEmployee({ id, name: getEmployeeName(emp) })}
                              disabled={!id}
                              className="text-sm font-semibold text-slate-600 hover:underline disabled:opacity-50"
                            >
                              Request Access
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {employees.map((emp) => {
                const id = resolveEmployeeId(emp)
                return (
                  <article key={id || getEmployeeName(emp)} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h3 className="m-0 font-bold text-slate-900">{getEmployeeName(emp)}</h3>
                        <p className="m-0 mt-1 text-sm text-slate-600">{getEmployeeRole(emp)}</p>
                      </div>
                      <EmploymentStatusBadge status={emp.employmentStatus} />
                    </div>
                    <div className="mt-3 border-t border-slate-100 pt-3">
                      <TrustScoreDisplay score={emp.trustScore} />
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => id && setProfileEmployeeId(id)}
                        disabled={!id}
                        className="rounded-xl border border-slate-200 py-2.5 text-sm font-semibold text-[#1a3a8f] disabled:opacity-50"
                      >
                        View Profile
                      </button>
                      <button
                        type="button"
                        onClick={() => id && setAccessRequestEmployee({ id, name: getEmployeeName(emp) })}
                        disabled={!id}
                        className="rounded-xl bg-[#1a3a8f] py-2.5 text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Request Access
                      </button>
                    </div>
                  </article>
                )
              })}
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="m-0 text-sm font-semibold text-slate-600">No employees linked yet. Invite your first employee.</p>
          </div>
        )}
      </div>

      {profileEmployeeId && (
        <EmployeeProfileDrawer
          employeeId={profileEmployeeId}
          onClose={() => setProfileEmployeeId(null)}
        />
      )}

      {accessRequestEmployee && (
        <SendAccessRequestModal
          employeeId={accessRequestEmployee.id}
          employeeName={accessRequestEmployee.name}
          onClose={() => setAccessRequestEmployee(null)}
        />
      )}
    </EnterpriseLayout>
  )
}

export default DepartmentDetails

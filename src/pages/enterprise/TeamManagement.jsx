import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import InviteEmployeeModal from '../../components/enterprise/InviteEmployeeModal'
import DepartmentEmployeeSection from '../../components/enterprise/DepartmentEmployeeSection'
import EmployeeProfileDrawer from '../../components/enterprise/EmployeeProfileDrawer'
import SendAccessRequestModal from '../../components/enterprise/SendAccessRequestModal'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { COMPANY_ROUTES } from '../../constants/companyRoutes'
import { enterpriseKeys, fetchTeam } from '../../api/enterprise'
import { extractTeamDepartments } from '../../utils/enterpriseTeamUtils'

function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function TeamManagement() {
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [profileEmployeeId, setProfileEmployeeId] = useState(null)
  const [accessRequestEmployee, setAccessRequestEmployee] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.team,
    queryFn: fetchTeam,
  })

  const departments = extractTeamDepartments(data)
  const linkedDepartments = departments.filter((d) => (d.employeeCount ?? 0) > 0 || (d.employees?.length ?? 0) > 0)
  const totalLinked = linkedDepartments.reduce((sum, d) => sum + (d.employeeCount ?? d.employees?.length ?? 0), 0)

  const handleInviteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.team })
    queryClient.invalidateQueries({ queryKey: ['company', 'team'] })
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading team..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Team Management"
          subtitle="Departments and workforce overview"
          action={
            <button
              type="button"
              onClick={() => setShowInvite(true)}
              className="flex items-center gap-2 rounded-xl bg-[#1a3a8f] px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#152b6e]"
            >
              <PlusIcon />
              <span className="hidden sm:inline">Invite Employee</span>
            </button>
          }
        />

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
        )}

        {departments.length > 0 ? (
          <>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {departments.map((dept) => (
                <Link
                  key={dept.name}
                  to={COMPANY_ROUTES.TEAM_DEPARTMENT(dept.name)}
                  className="group rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:border-[#1a3a8f]/30 hover:shadow-md no-underline"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="m-0 text-lg font-extrabold text-slate-900 group-hover:text-[#1a3a8f]">
                      {dept.name}
                    </h3>
                    <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600">
                      {dept.employeeCount ?? 0}
                    </span>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3 border-t border-slate-100 pt-4">
                    <div>
                      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employees</p>
                      <p className="m-0 mt-1 text-xl font-extrabold text-slate-900">{dept.employeeCount ?? 0}</p>
                    </div>
                    <div>
                      <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Avg Trust Score</p>
                      <p className="m-0 mt-1 text-xl font-extrabold text-[#1a3a8f]">{dept.averageTrustScore ?? '—'}</p>
                    </div>
                  </div>
                  {(dept.employeeCount ?? 0) > 0 && (
                    <p className="m-0 mt-4 text-xs font-semibold text-[#1a3a8f]">View employees below ↓</p>
                  )}
                </Link>
              ))}
            </div>

            {totalLinked > 0 && (
              <div className="mt-8 space-y-5">
                <div>
                  <h2 className="m-0 text-lg font-extrabold text-slate-900">Linked Employees</h2>
                  <p className="m-0 mt-1 text-sm text-slate-500">
                    View profile or request access to documents and verification data.
                  </p>
                </div>
                {linkedDepartments.map((dept) => (
                  <DepartmentEmployeeSection
                    key={dept.name}
                    department={dept.name}
                    prefetchedEmployees={dept.employees}
                    onViewProfile={setProfileEmployeeId}
                    onRequestAccess={setAccessRequestEmployee}
                  />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="m-0 text-sm font-semibold text-slate-600">No employees linked yet. Invite your first employee.</p>
            <div className="mt-6">
              <Button type="button" onClick={() => setShowInvite(true)} fullWidth={false}>
                Invite Employee
              </Button>
            </div>
          </div>
        )}
      </div>

      {showInvite && (
        <InviteEmployeeModal onClose={() => setShowInvite(false)} onSuccess={handleInviteSuccess} />
      )}

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

export default TeamManagement

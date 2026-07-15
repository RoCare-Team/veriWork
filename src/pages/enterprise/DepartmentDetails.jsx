import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import TeamEmployeeCard from '../../components/enterprise/TeamEmployeeCard'
import SendAccessRequestModal from '../../components/enterprise/SendAccessRequestModal'
import RemoveAccessConfirmModal from '../../components/enterprise/RemoveAccessConfirmModal'
import Loader from '../../components/common/Loader'
import { COMPANY_ROUTES } from '../../constants/companyRoutes'
import { enterpriseKeys, fetchTeamDepartment } from '../../api/enterprise'
import { extractDepartmentEmployees, resolveEmployeeId, getEmployeeName } from '../../utils/enterpriseTeamUtils'

function DepartmentDetails() {
  const { department: departmentParam } = useParams()
  const department = decodeURIComponent(departmentParam || '')
  const queryClient = useQueryClient()
  const [accessRequestEmployee, setAccessRequestEmployee] = useState(null)
  const [removeAccessEmployee, setRemoveAccessEmployee] = useState(null)

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.teamDepartment(department),
    queryFn: () => fetchTeamDepartment(department),
    enabled: Boolean(department),
  })

  const employees = extractDepartmentEmployees(data)

  const refreshTeam = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.team })
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.teamDepartment(department) })
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading department..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <Link to={COMPANY_ROUTES.TEAM} className="mb-4 inline-block text-sm font-semibold text-[#005fd6] no-underline hover:underline">
          ← Back to Team
        </Link>

        <PageHeader
          title={department}
          subtitle={`${employees.length} linked employee${employees.length !== 1 ? 's' : ''}`}
        />

        {error && (
          <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
        )}

        {employees.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            {employees.map((emp) => (
              <TeamEmployeeCard
                key={emp.employeeId || emp.id || emp._id || getEmployeeName(emp)}
                employee={emp}
                department={department}
                onRequestAccess={setAccessRequestEmployee}
                onRemoveAccess={setRemoveAccessEmployee}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="m-0 text-sm font-semibold text-slate-600">No employees linked yet. Invite your first employee.</p>
          </div>
        )}
      </div>

      {accessRequestEmployee && (
        <SendAccessRequestModal
          employeeId={resolveEmployeeId(accessRequestEmployee)}
          employeeName={getEmployeeName(accessRequestEmployee)}
          defaultRequestType="full_profile_access"
          onClose={() => setAccessRequestEmployee(null)}
          onSuccess={refreshTeam}
        />
      )}

      {removeAccessEmployee && (
        <RemoveAccessConfirmModal
          employee={removeAccessEmployee}
          onClose={() => setRemoveAccessEmployee(null)}
          onSuccess={refreshTeam}
        />
      )}
    </EnterpriseLayout>
  )
}

export default DepartmentDetails

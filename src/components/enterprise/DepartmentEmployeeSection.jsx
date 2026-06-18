import { useQuery } from '@tanstack/react-query'
import TeamEmployeeRow from './TeamEmployeeRow'
import Loader from '../common/Loader'
import { enterpriseKeys, fetchTeamDepartment } from '../../api/enterprise'
import { extractDepartmentEmployees } from '../../utils/enterpriseTeamUtils'

function DepartmentEmployeeSection({
  department,
  prefetchedEmployees,
  onRequestAccess,
  onRemoveAccess,
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
      <div className="rounded-xl border border-slate-100 bg-white p-6">
        <Loader variant="inline" label={`Loading ${department}...`} />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error.message}
      </div>
    )
  }

  if (!employees.length) return null

  return (
    <section>
      <p className="m-0 mb-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
        {department}
      </p>
      <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
        <div className="divide-y divide-slate-100">
          {employees.map((emp) => (
            <TeamEmployeeRow
              key={emp.employeeId || emp.id || emp._id || `${department}-${emp.name}`}
              employee={emp}
              onRequestAccess={onRequestAccess}
              onRemoveAccess={onRemoveAccess}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default DepartmentEmployeeSection

import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import EmployeeCard from '../../components/enterprise/EmployeeCard'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { enterpriseKeys, fetchTeam } from '../../api/enterprise'
import {
  extractTeamEmployees,
  getEmployeeProfilePath,
  getOnboardingStageStyle,
  resolveEmployeeId,
} from '../../utils/enterpriseTeamUtils'

const STAGE_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'active', label: 'Active' },
  { id: 'verified', label: 'Ready to assign' },
  { id: 'pending_verification', label: 'Pending verification' },
  { id: 'incoming', label: 'New' },
]

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Workforce() {
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [stageFilter, setStageFilter] = useState('all')

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.team,
    queryFn: fetchTeam,
  })

  const employees = extractTeamEmployees(data)
  const queues = data?.workforceQueues || {}

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return employees.filter((emp) => {
      const matchesStage =
        stageFilter === 'all' || (emp.onboardingStage || 'incoming') === stageFilter
      if (!matchesStage) return false
      if (!q) return true
      const name = (emp.employeeName || emp.name || '').toLowerCase()
      const role = (emp.role || emp.designation || '').toLowerCase()
      const dept = (emp.department || '').toLowerCase()
      return name.includes(q) || role.includes(q) || dept.includes(q)
    })
  }, [employees, query, stageFilter])

  const stageCounts = useMemo(() => {
    const counts = { all: employees.length, active: 0, verified: 0, pending_verification: 0, incoming: 0 }
    for (const emp of employees) {
      const stage = emp.onboardingStage || 'incoming'
      if (counts[stage] !== undefined) counts[stage] += 1
    }
    return counts
  }, [employees])

  if (isLoading) return <Loader variant="fullPage" label="Loading workforce..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 pb-24 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Workforce"
          subtitle={
            employees.length
              ? `${employees.length} linked employee${employees.length !== 1 ? 's' : ''} in your organization`
              : 'Employees appear here after they accept your invite and join'
          }
        />

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        {(queues.incoming?.length > 0 || queues.verified?.length > 0) && (
          <div className="mb-5 flex flex-wrap gap-2">
            {queues.incoming?.length > 0 && (
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
                {queues.incoming.length} onboarding
              </span>
            )}
            {queues.verified?.length > 0 && (
              <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-[#005fd6]">
                {queues.verified.length} ready to assign
              </span>
            )}
            {queues.active?.length > 0 && (
              <span className="rounded-full bg-green-50 px-3 py-1 text-xs font-medium text-green-700">
                {queues.active.length} active
              </span>
            )}
          </div>
        )}

        <div className="relative mb-4">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search name, role, or department..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#005fd6] focus:ring-4 focus:ring-blue-50"
          />
        </div>

        <div className="mb-6 flex flex-wrap gap-2">
          {STAGE_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              onClick={() => setStageFilter(filter.id)}
              className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition ${
                stageFilter === filter.id
                  ? 'bg-[#005fd6] text-white'
                  : 'bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50'
              }`}
            >
              {filter.label}
              {stageCounts[filter.id] > 0 && (
                <span className="ml-1 opacity-75">({stageCounts[filter.id]})</span>
              )}
            </button>
          ))}
        </div>

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((emp) => {
              const id = resolveEmployeeId(emp)
              const stage = emp.onboardingStage || 'incoming'
              const stageStyle = getOnboardingStageStyle(stage)
              return (
                <EmployeeCard
                  key={id}
                  employeeId={id}
                  photoUrl={emp.photoUrl}
                  initials={emp.employeeName || emp.name}
                  name={emp.employeeName || emp.name || 'Employee'}
                  role={emp.role || emp.designation || '—'}
                  department={emp.department || 'Unassigned'}
                  employeeScore={emp.trustScore}
                  verified={stage === 'active' || emp.isVerified}
                  stageLabel={stageStyle.label}
                  onViewProfile={() => {
                    const path = getEmployeeProfilePath(emp)
                    if (path) navigate(path)
                  }}
                />
              )
            })}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="m-0 text-sm font-medium text-slate-600">
              {employees.length ? 'No employees match your filters' : 'No workforce data yet'}
            </p>
            <p className="m-0 mt-1 text-xs text-slate-400">
              {employees.length
                ? 'Try a different search or stage filter.'
                : 'Invite employees from Team Management — they will appear here once they join.'}
            </p>
            {!employees.length && (
              <Link
                to="/company/team"
                className="mt-4 inline-block text-sm font-semibold text-[#005fd6] no-underline hover:underline"
              >
                Go to Team Management →
              </Link>
            )}
          </div>
        )}
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-md xl:hidden">
        <Link to="/enterprise/qr-onboarding">
          <Button type="button">+ Generate Joining QR</Button>
        </Link>
      </div>
    </EnterpriseLayout>
  )
}

export default Workforce

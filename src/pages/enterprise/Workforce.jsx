import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import EmployeeCard from '../../components/enterprise/EmployeeCard'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { enterpriseKeys, fetchWorkforce } from '../../api/enterprise'
import { getInitials } from '../../utils/formatters'

function FilterIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5h14M5 10h10M8 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function Workforce() {
  const [query, setQuery] = useState('')
  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.workforce,
    queryFn: fetchWorkforce,
  })

  const employees = data?.employees || []

  const filtered = useMemo(
    () =>
      employees.filter(
        (e) =>
          e.name?.toLowerCase().includes(query.toLowerCase()) ||
          e.role?.toLowerCase().includes(query.toLowerCase()) ||
          e.department?.toLowerCase().includes(query.toLowerCase()),
      ),
    [employees, query],
  )

  const avgScore = useMemo(() => {
    if (!employees.length) return 0
    const sum = employees.reduce((acc, e) => acc + (e.employeeScore || 0), 0)
    return Math.round(sum / employees.length)
  }, [employees])

  if (isLoading) return <Loader variant="fullPage" label="Loading workforce..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 pb-24 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Workforce"
          subtitle={`Manage ${employees.length} employees`}
          action={
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
              aria-label="Filter"
            >
              <FilterIcon />
            </button>
          }
        />

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        <div className="relative mb-5">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search name, role, or ID..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none transition focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-50"
          />
        </div>

        <div className="mb-6 grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <p className="m-0 text-xl font-extrabold text-slate-900 md:text-2xl">{employees.length}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">Active</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <p className="m-0 text-xl font-extrabold text-slate-900 md:text-2xl">
              {employees.filter((e) => e.status === 'approved').length}
            </p>
            <p className="mt-1 text-xs font-medium text-slate-500">Approved</p>
          </div>
          <div className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm">
            <p className="m-0 text-xl font-extrabold text-slate-900 md:text-2xl">{avgScore}</p>
            <p className="mt-1 text-xs font-medium text-slate-500">Avg VeriScore</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((emp) => (
            <EmployeeCard
              key={emp.id || emp.userId}
              initials={getInitials(emp.name)}
              name={emp.name}
              role={emp.role}
              department={emp.department}
              employeeScore={emp.employeeScore}
              verified={emp.status === 'approved'}
            />
          ))}
        </div>
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

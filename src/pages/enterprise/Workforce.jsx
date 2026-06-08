import { useState } from 'react'
import { Link } from 'react-router-dom'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import EmployeeCard from '../../components/enterprise/EmployeeCard'
import Button from '../../components/common/Button'
import { EMPLOYEES } from '../../utils/enterpriseData'

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

const KPI = [
  { label: 'Active', value: '1,102' },
  { label: 'In Notice', value: '42' },
  { label: 'Avg VeriScore', value: '782' },
]

function Workforce() {
  const [query, setQuery] = useState('')

  const filtered = EMPLOYEES.filter(
    (e) =>
      e.name.toLowerCase().includes(query.toLowerCase()) ||
      e.role.toLowerCase().includes(query.toLowerCase()) ||
      e.department.toLowerCase().includes(query.toLowerCase()),
  )

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 pb-24 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Workforce"
          subtitle="Manage 1,284 employees"
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
          {KPI.map((item) => (
            <div
              key={item.label}
              className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm"
            >
              <p className="m-0 text-xl font-extrabold text-slate-900 md:text-2xl">
                {item.value}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((emp) => (
            <EmployeeCard key={emp.id} {...emp} />
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

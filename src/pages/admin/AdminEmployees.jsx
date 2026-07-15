import { useMemo, useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import { adminKeys, fetchAdminEmployees } from '../../api/admin'
import { formatDate } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'complete', label: 'Profile Complete' },
  { key: 'incomplete', label: 'Incomplete' },
  { key: 'verified', label: 'Verified' },
]

function StatusBadge({ complete, verified }) {
  if (verified) {
    return <span className="rounded-full bg-green-50 px-2.5 py-1 text-xs font-semibold text-green-700">Verified</span>
  }
  if (complete) {
    return <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700">Profile Complete</span>
  }
  return <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">Incomplete</span>
}

function EmployeeAvatar({ employee }) {
  const photo = mediaUrl(employee.photoUrl)
  if (photo) {
    return (
      <img
        src={photo}
        alt=""
        className="h-10 w-10 rounded-full object-cover ring-2 ring-white"
      />
    )
  }

  return (
    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#005fd6]/10 text-sm font-bold text-[#005fd6] ring-2 ring-white">
      {employee.initials}
    </span>
  )
}

function AdminEmployees() {
  const [searchParams] = useSearchParams()
  const initialStatus = searchParams.get('status') || 'all'
  const [status, setStatus] = useState(initialStatus)
  const [search, setSearch] = useState('')
  const [query, setQuery] = useState('')

  useEffect(() => {
    const nextStatus = searchParams.get('status') || 'all'
    setStatus(nextStatus)
  }, [searchParams])

  const { data: list = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: adminKeys.employees(status, query),
    queryFn: () => fetchAdminEmployees({ status, q: query }),
    refetchOnWindowFocus: true,
  })

  const summary = useMemo(() => ({
    total: list.length,
    verified: list.filter((item) => item.isVerified).length,
    complete: list.filter((item) => item.profileSetupComplete).length,
  }), [list])

  const handleSearch = (e) => {
    e.preventDefault()
    setQuery(search.trim())
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading employees..." />

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="m-0 text-2xl font-extrabold text-slate-900">Employees</h2>
            <p className="m-0 mt-1 text-sm text-slate-500">
              All registered employees on the PagerLook platform
            </p>
          </div>

          <form onSubmit={handleSearch} className="flex w-full max-w-md gap-2">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, email, phone, ID..."
              className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-[#005fd6] focus:ring-4 focus:ring-blue-100"
            />
            <button
              type="submit"
              className="rounded-2xl bg-[#005fd6] px-4 py-2.5 text-sm font-semibold text-white"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
            <p className="m-0 text-2xl font-extrabold text-slate-900">{summary.total}</p>
            <p className="m-0 mt-1 text-sm text-slate-500">Showing in current view</p>
          </div>
          <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
            <p className="m-0 text-2xl font-extrabold text-blue-900">{summary.complete}</p>
            <p className="m-0 mt-1 text-sm text-blue-700">Profile complete</p>
          </div>
          <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <p className="m-0 text-2xl font-extrabold text-green-900">{summary.verified}</p>
            <p className="m-0 mt-1 text-sm text-green-700">Fully verified</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <div className="flex rounded-2xl bg-slate-200/60 p-1">
            {STATUS_TABS.map((tab) => (
              <button
                key={tab.key}
                type="button"
                onClick={() => setStatus(tab.key)}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  status === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-50"
          >
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </button>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="m-0 font-semibold">Could not load employees</p>
            <p className="m-0 mt-1">{error.message}</p>
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-bold">Employee</th>
                  <th className="px-5 py-4 font-bold">Contact</th>
                  <th className="px-5 py-4 font-bold">Role / Company</th>
                  <th className="px-5 py-4 font-bold">PagerLook ID</th>
                  <th className="px-5 py-4 font-bold">Score</th>
                  <th className="px-5 py-4 font-bold">Status</th>
                  <th className="px-5 py-4 font-bold">Joined</th>
                  <th className="px-5 py-4 font-bold">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-5 py-12 text-center text-slate-500">
                      No employees found for this filter.
                    </td>
                  </tr>
                ) : (
                  list.map((employee) => (
                    <tr key={employee.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <EmployeeAvatar employee={employee} />
                          <div>
                            <p className="m-0 font-semibold text-slate-900">{employee.name}</p>
                            <p className="m-0 text-xs text-slate-500">{employee.currentCity}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="m-0 text-slate-700">{employee.email}</p>
                        <p className="m-0 text-xs text-slate-500">{employee.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="m-0 font-medium text-slate-800">{employee.role}</p>
                        <p className="m-0 text-xs text-slate-500">{employee.linkedCompanyLabel}</p>
                      </td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-700">{employee.veriworkId}</td>
                      <td className="px-5 py-4 font-semibold text-[#005fd6]">{employee.employeeScore}</td>
                      <td className="px-5 py-4">
                        <StatusBadge complete={employee.profileSetupComplete} verified={employee.isVerified} />
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatDate(employee.createdAt)}</td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/employees/${employee.id}`}
                          className="text-sm font-semibold text-[#005fd6] no-underline hover:underline"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminEmployees

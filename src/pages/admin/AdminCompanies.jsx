import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import { adminKeys, fetchAdminCompanies } from '../../api/admin'
import { formatDate } from '../../utils/formatters'

const STATUS_STYLES = {
  draft: 'bg-slate-100 text-slate-600',
  submitted: 'bg-amber-50 text-amber-700',
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

const TABS = [
  { key: 'submitted', label: 'Pending', path: '/admin/companies' },
  { key: 'approved', label: 'Approved', path: '/admin/companies/approved' },
  { key: 'rejected', label: 'Rejected', path: '/admin/companies/rejected' },
  { key: 'all', label: 'All', path: '/admin/companies/all' },
]

const TAB_CONFIG = {
  submitted: { title: 'Pending Review', subtitle: 'Companies awaiting admin approval', empty: 'No companies pending review' },
  approved: { title: 'Approved Companies', subtitle: 'Companies with dashboard access', empty: 'No approved companies yet' },
  rejected: { title: 'Rejected Applications', subtitle: 'Companies that were not approved', empty: 'No rejected applications' },
  all: { title: 'All Companies', subtitle: 'Every registered enterprise application', empty: 'No companies found' },
}

function AdminCompanies({ status = 'submitted' }) {
  const tabKey = status || 'all'
  const config = TAB_CONFIG[tabKey] || TAB_CONFIG.all
  const apiStatus = tabKey === 'all' ? undefined : tabKey

  const { data: list = [], isLoading, error, refetch, isFetching } = useQuery({
    queryKey: adminKeys.companies(apiStatus),
    queryFn: () => fetchAdminCompanies(apiStatus),
    refetchOnWindowFocus: true,
  })

  if (isLoading) return <Loader variant="fullPage" label="Loading companies..." />

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="m-0 text-2xl font-extrabold text-slate-900">{config.title}</h2>
            <p className="m-0 mt-1 text-sm text-slate-500">{config.subtitle}</p>
          </div>
          <div className="flex rounded-2xl bg-slate-200/60 p-1">
            {TABS.map((tab) => (
              <Link
                key={tab.key}
                to={tab.path}
                className={`rounded-xl px-4 py-2 text-sm font-semibold no-underline transition ${
                  tabKey === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.label}
              </Link>
            ))}
            <button
              type="button"
              onClick={() => refetch()}
              disabled={isFetching}
              className="ml-1 rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-white/60 hover:text-slate-700 disabled:opacity-50"
              title="Refresh list"
            >
              {isFetching ? '…' : '↻'}
            </button>
          </div>
        </div>

        {error && (
          <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
            <p className="m-0 font-semibold">Could not load companies</p>
            <p className="m-0 mt-1">{error.message}</p>
            <button type="button" onClick={() => refetch()} className="mt-2 text-xs font-bold text-red-800 underline">
              Retry
            </button>
          </div>
        )}

        {!error && list.length === 0 && tabKey === 'submitted' && (
          <div className="mb-4 rounded-2xl border border-amber-100 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            No pending companies. Enterprise must complete onboarding and click <strong>Submit for Review</strong>.
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] border-collapse text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50/80">
                  <th className="px-5 py-4 font-bold text-slate-600">Company Name</th>
                  <th className="px-5 py-4 font-bold text-slate-600">Industry</th>
                  <th className="px-5 py-4 font-bold text-slate-600">Contact</th>
                  <th className="px-5 py-4 font-bold text-slate-600">Admin Email</th>
                  <th className="px-5 py-4 font-bold text-slate-600">Status</th>
                  <th className="px-5 py-4 font-bold text-slate-600">Submitted</th>
                  <th className="px-5 py-4 font-bold text-slate-600">Action</th>
                </tr>
              </thead>
              <tbody>
                {list.length > 0 ? (
                  list.map((item) => (
                    <tr key={item.id} className="border-b border-slate-50 transition hover:bg-slate-50/50">
                      <td className="px-5 py-4">
                        <p className="m-0 font-semibold text-slate-900">{item.name}</p>
                        <p className="m-0 mt-0.5 text-xs text-slate-500">{item.workEmail}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{item.industry}</td>
                      <td className="px-5 py-4">
                        <p className="m-0 text-slate-700">{item.contact}</p>
                        <p className="m-0 mt-0.5 text-xs text-slate-500">{item.phone}</p>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{item.adminEmail}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                            STATUS_STYLES[item.status] || STATUS_STYLES.draft
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-700">{formatDate(item.submittedAt)}</td>
                      <td className="px-5 py-4">
                        <Link
                          to={`/admin/companies/${item.id}`}
                          className="inline-flex rounded-xl bg-[#005fd6] px-4 py-2 text-xs font-semibold text-white no-underline transition hover:bg-[#004bab]"
                        >
                          View
                        </Link>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className="px-5 py-16 text-center text-slate-500">
                      {config.empty}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminCompanies

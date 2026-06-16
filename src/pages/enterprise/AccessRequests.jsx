import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import StatCard from '../../components/enterprise/StatCard'
import Pagination from '../../components/enterprise/Pagination'
import Loader from '../../components/common/Loader'
import { enterpriseKeys, fetchAccessRequests } from '../../api/enterprise'
import { formatAccessDate } from '../../utils/formatters'
import { formatRequestType, getAccessRequestStatusStyle } from '../../utils/enterpriseTeamUtils'

const STATUS_TABS = [
  { id: 'all', label: 'All' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

function SendIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 10h14M11 4l6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function CheckCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6v4l3 2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function XCircleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 8l4 4M12 8l-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function StatusBadge({ status }) {
  const style = getAccessRequestStatusStyle(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

function AccessRequests() {
  const [searchParams, setSearchParams] = useSearchParams()
  const status = searchParams.get('status') || 'all'
  const page = Number(searchParams.get('page') || '1')

  const filters = { status, page, limit: 20 }

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.accessRequests(filters),
    queryFn: () => fetchAccessRequests(filters),
  })

  const summary = data?.summary || {}
  const requests = data?.requests || []
  const pagination = data?.pagination

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value || value === 'all') next.delete(key)
      else next.set(key, String(value))
    })
    if (updates.status !== undefined) next.set('page', '1')
    setSearchParams(next)
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading access requests..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader title="Access Requests" subtitle="Track profile and verification access requests" />

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        {/* Summary Cards */}
        <div className="mb-6 grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
          <StatCard
            icon={<SendIcon />}
            label="Total Requests Sent"
            value={String(summary.total ?? 0)}
            accent="blue"
          />
          <StatCard
            icon={<CheckCircleIcon />}
            label="Accepted"
            value={String(summary.accepted ?? summary.approved ?? 0)}
            accent="green"
          />
          <StatCard
            icon={<ClockIcon />}
            label="Pending"
            value={String(summary.pending ?? 0)}
            accent="orange"
          />
          <StatCard
            icon={<XCircleIcon />}
            label="Rejected"
            value={String(summary.rejected ?? 0)}
            accent="red"
          />
        </div>

        {/* Filter Tabs */}
        <div className="mb-6 flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => updateParams({ status: tab.id === 'all' ? '' : tab.id })}
              className={`flex-1 min-w-[80px] rounded-xl py-2.5 text-sm font-semibold transition ${
                status === tab.id || (tab.id === 'all' && !searchParams.get('status'))
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Desktop Table */}
        {requests.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 font-bold text-slate-600">Employee Name</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Request Type</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Date Requested</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {requests.map((req) => (
                    <tr key={req._id || req.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-semibold text-slate-900">
                        {req.employeeName || req.name}
                      </td>
                      <td className="px-5 py-4 text-slate-600">{formatRequestType(req.requestType)}</td>
                      <td className="px-5 py-4 text-slate-600">
                        {formatAccessDate(req.requestedAt || req.dateRequested || req.createdAt)}
                      </td>
                      <td className="px-5 py-4">
                        <StatusBadge status={req.status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="flex flex-col gap-3 md:hidden">
              {requests.map((req) => (
                <article
                  key={req._id || req.id}
                  className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h3 className="m-0 font-bold text-slate-900">{req.employeeName || req.name}</h3>
                      <p className="mt-0.5 text-sm text-slate-500">{formatRequestType(req.requestType)}</p>
                    </div>
                    <StatusBadge status={req.status} />
                  </div>
                  <p className="mt-3 text-xs text-slate-400">
                    {formatAccessDate(req.requestedAt || req.dateRequested || req.createdAt)}
                  </p>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <Pagination pagination={pagination} onPageChange={(p) => updateParams({ page: String(p) })} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="m-0 text-sm font-semibold text-slate-600">No access requests yet</p>
            <p className="mt-1 text-xs text-slate-400">
              Send a request from Team Management to get started.
            </p>
          </div>
        )}
      </div>
    </EnterpriseLayout>
  )
}

export default AccessRequests

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import { adminKeys, fetchAadhaarRequests } from '../../api/admin'
import { formatDate } from '../../utils/formatters'

const TABS = [
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'all', label: 'All' },
]

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700',
  approved: 'bg-green-50 text-green-700',
  rejected: 'bg-red-50 text-red-700',
}

function StatusPill({ status }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-xs font-bold capitalize ${STATUS_STYLES[status] || 'bg-slate-100 text-slate-600'}`}
    >
      {status}
    </span>
  )
}

function AdminAadhaarRequests() {
  const [status, setStatus] = useState('pending')
  const [search, setSearch] = useState('')

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: adminKeys.aadhaarRequests(status, search),
    queryFn: () => fetchAadhaarRequests({ status, q: search }),
  })

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <h2 className="m-0 text-2xl font-extrabold text-slate-900">Aadhaar verification</h2>
        <p className="m-0 mt-1 text-sm text-slate-500">
          Check the typed details against the uploaded card, then approve or reject.
        </p>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  status === tab.value
                    ? 'bg-[#1e3a8a] text-white'
                    : 'bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, PagerLook ID..."
            className="h-10 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#1e3a8a] sm:w-72"
          />
        </div>

        {isLoading ? (
          <Loader className="mt-10" label="Loading submissions..." />
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error.message}</p>
        ) : requests.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            No {status === 'all' ? '' : status} Aadhaar submissions.
          </p>
        ) : (
          <div className="mt-5 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/70">
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Employee</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Name on card</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Aadhaar</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Submitted</th>
                    <th className="px-5 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">Status</th>
                    <th className="px-5 py-3" />
                  </tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/60">
                      <td className="px-5 py-4">
                        <p className="m-0 text-sm font-semibold text-slate-900">
                          {request.employee?.name || 'Unknown'}
                        </p>
                        <p className="m-0 text-xs text-slate-500">{request.employee?.email || request.employee?.phone}</p>
                      </td>
                      <td className="px-5 py-4">
                        <p className="m-0 text-sm text-slate-800">{request.nameOnAadhaar || '—'}</p>
                        {request.employee && !request.employee.profileNameMatches && (
                          <p className="m-0 text-xs font-semibold text-amber-600">
                            Differs from profile name
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 font-mono text-sm text-slate-700">{request.aadhaarMasked}</td>
                      <td className="px-5 py-4 text-sm text-slate-600">{formatDate(request.submittedAt)}</td>
                      <td className="px-5 py-4"><StatusPill status={request.status} /></td>
                      <td className="px-5 py-4 text-right">
                        <Link
                          to={`/admin/aadhaar-requests/${request.id}`}
                          className="text-sm font-semibold text-[#1e3a8a] no-underline hover:underline"
                        >
                          Review →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminAadhaarRequests

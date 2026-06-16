import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import Pagination from '../../components/enterprise/Pagination'
import Loader from '../../components/common/Loader'
import { enterpriseKeys, fetchAuditLogs } from '../../api/enterprise'
import { formatAccessDate } from '../../utils/formatters'

function AuditLogs() {
  const [searchParams, setSearchParams] = useSearchParams()
  const action = searchParams.get('action') || ''
  const page = Number(searchParams.get('page') || '1')

  const filters = { action, page, limit: 20 }

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.auditLogs(filters),
    queryFn: () => fetchAuditLogs(filters),
  })

  const logs = data?.logs || data?.items || []
  const pagination = data?.pagination

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([key, value]) => {
      if (!value) next.delete(key)
      else next.set(key, String(value))
    })
    setSearchParams(next)
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading audit logs..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader title="Audit Logs" subtitle="Company activity history" />

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        <div className="mb-6">
          <input
            type="text"
            value={action}
            onChange={(e) => updateParams({ action: e.target.value, page: '1' })}
            placeholder="Filter by action..."
            className="h-11 w-full max-w-sm rounded-xl border border-slate-200 px-4 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100"
          />
        </div>

        {logs.length > 0 ? (
          <>
            <div className="hidden overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm md:block">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/80">
                    <th className="px-5 py-3.5 font-bold text-slate-600">Action</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Employee ID</th>
                    <th className="px-5 py-3.5 font-bold text-slate-600">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log._id || log.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="px-5 py-4 font-medium text-slate-900">{log.action}</td>
                      <td className="px-5 py-4 font-mono text-xs text-slate-500">{log.employeeId || '—'}</td>
                      <td className="px-5 py-4 text-slate-600">{formatAccessDate(log.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 md:hidden">
              {logs.map((log) => (
                <article key={log._id || log.id} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                  <p className="m-0 font-semibold text-slate-900">{log.action}</p>
                  <p className="m-0 mt-1 font-mono text-xs text-slate-500">{log.employeeId || '—'}</p>
                  <p className="m-0 mt-2 text-xs text-slate-400">{formatAccessDate(log.createdAt)}</p>
                </article>
              ))}
            </div>

            <div className="mt-8">
              <Pagination pagination={pagination} onPageChange={(p) => updateParams({ page: String(p) })} />
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="m-0 text-sm font-semibold text-slate-600">No audit logs found</p>
          </div>
        )}
      </div>
    </EnterpriseLayout>
  )
}

export default AuditLogs

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import CandidateRequestCard from '../../components/enterprise/CandidateRequestCard'
import Loader from '../../components/common/Loader'
import { enterpriseKeys, fetchJoinRequests, updateJoinRequest } from '../../api/enterprise'
import { getInitials } from '../../utils/formatters'

function JoinRequests() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('new')
  const [query, setQuery] = useState('')

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: enterpriseKeys.joinRequests,
    queryFn: fetchJoinRequests,
  })

  const actionMutation = useMutation({
    mutationFn: ({ id, status }) => updateJoinRequest(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: enterpriseKeys.joinRequests }),
  })

  const pending = useMemo(() => requests.filter((r) => r.status === 'pending'), [requests])
  const history = useMemo(
    () => requests.filter((r) => r.status === 'approved' || r.status === 'rejected'),
    [requests],
  )

  const filtered = useMemo(() => {
    const list = activeTab === 'history' ? history : pending
    return list.filter((r) => r.name?.toLowerCase().includes(query.toLowerCase()))
  }, [activeTab, history, pending, query])

  const tabs = [
    { id: 'new', label: 'New', count: pending.length },
    { id: 'history', label: 'History', count: history.length },
  ]

  if (isLoading) return <Loader variant="fullPage" label="Loading join requests..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Join Requests"
          subtitle={`${pending.length} pending verification`}
          badge={
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
              Live
            </span>
          }
        />

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        <div className="mb-5 flex rounded-2xl bg-slate-100 p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.count > 0 && <span className="ml-1 text-slate-400">({tab.count})</span>}
            </button>
          ))}
        </div>

        <div className="mb-6 flex gap-3">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
                <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="search"
              placeholder="Search candidates..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-50"
            />
          </div>
        </div>

        {activeTab === 'new' ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.length > 0 ? (
              filtered.map((req) => (
                <CandidateRequestCard
                  key={req._id}
                  name={req.name}
                  role={req.role}
                  department={req.department}
                  employeeScore={req.employeeScore}
                  joiningDate={req.joiningDate}
                  salaryBand={req.salaryBand}
                  documents={req.documents || []}
                  avatar={req.avatar || getInitials(req.name)}
                  onApprove={() => actionMutation.mutate({ id: req._id, status: 'approved' })}
                  onReject={() => actionMutation.mutate({ id: req._id, status: 'rejected' })}
                />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="m-0 text-sm font-semibold text-slate-600">No pending join requests</p>
                <p className="mt-1 text-xs text-slate-400">All candidates have been reviewed.</p>
              </div>
            )}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.map((req) => (
              <CandidateRequestCard
                key={req._id}
                name={req.name}
                role={req.role}
                department={req.department}
                employeeScore={req.employeeScore}
                joiningDate={req.joiningDate}
                salaryBand={req.salaryBand}
                documents={req.documents || []}
                avatar={req.avatar || getInitials(req.name)}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="m-0 text-sm text-slate-500">No history yet.</p>
          </div>
        )}
      </div>
    </EnterpriseLayout>
  )
}

export default JoinRequests

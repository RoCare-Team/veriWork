import { useState } from 'react'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import CandidateRequestCard from '../../components/enterprise/CandidateRequestCard'
import { JOIN_REQUESTS } from '../../utils/enterpriseData'

const TABS = [
  { id: 'new', label: 'New', count: 4 },
  { id: 'review', label: 'In Review', count: 0 },
  { id: 'history', label: 'History', count: 0 },
]

function JoinRequests() {
  const [activeTab, setActiveTab] = useState('new')
  const [query, setQuery] = useState('')
  const [requests, setRequests] = useState(JOIN_REQUESTS)

  const filtered = requests.filter((r) =>
    r.name.toLowerCase().includes(query.toLowerCase()),
  )

  const handleApprove = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  const handleReject = (id) => {
    setRequests((prev) => prev.filter((r) => r.id !== id))
  }

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="Join Requests"
          subtitle={`${requests.length} pending verification`}
          badge={
            <span className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-green-700">
              Live
            </span>
          }
        />

        <div className="mb-5 flex rounded-2xl bg-slate-100 p-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.label}
              {tab.id === 'new' && requests.length > 0 && (
                <span className="ml-1 text-slate-400">({requests.length})</span>
              )}
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
          <button
            type="button"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            aria-label="Filter"
          >
            <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3 5h14M5 10h10M8 15h4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {activeTab === 'new' ? (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {filtered.length > 0 ? (
              filtered.map((req) => (
                <CandidateRequestCard
                  key={req.id}
                  {...req}
                  onApprove={() => handleApprove(req.id)}
                  onReject={() => handleReject(req.id)}
                />
              ))
            ) : (
              <div className="col-span-full rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
                <p className="m-0 text-sm font-semibold text-slate-600">
                  No pending join requests
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  All candidates have been reviewed.
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
            <p className="m-0 text-sm text-slate-500">
              {activeTab === 'review' ? 'No requests in review.' : 'No history yet.'}
            </p>
          </div>
        )}
      </div>
    </EnterpriseLayout>
  )
}

export default JoinRequests

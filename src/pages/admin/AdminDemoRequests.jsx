import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import { adminKeys, fetchDemoRequests, updateDemoRequest } from '../../api/admin'
import { formatDate } from '../../utils/formatters'

/*
 * Demo requests filed from the landing page. Each row is a lead someone has to
 * call, so the list is worked left to right: who asked, what they want, and the
 * one control that moves it along.
 */

const TABS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'closed', label: 'Closed' },
  { value: 'all', label: 'All' },
]

const STATUSES = ['new', 'contacted', 'scheduled', 'closed']

const STATUS_STYLES = {
  new: 'bg-amber-50 text-amber-700',
  contacted: 'bg-blue-50 text-blue-700',
  scheduled: 'bg-violet-50 text-violet-700',
  closed: 'bg-slate-100 text-slate-600',
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

function NotesEditor({ request, onSave, saving }) {
  const [notes, setNotes] = useState(request.notes || '')
  const dirty = notes !== (request.notes || '')

  return (
    <div className="mt-3 flex flex-col gap-2 sm:flex-row">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Call notes — who you spoke to, what was agreed…"
        rows={2}
        maxLength={2000}
        className="min-h-11 w-full resize-y rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]"
      />
      <button
        type="button"
        disabled={!dirty || saving}
        onClick={() => onSave(notes)}
        className="h-11 shrink-0 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 sm:self-start"
      >
        {saving ? 'Saving…' : 'Save note'}
      </button>
    </div>
  )
}

function AdminDemoRequests() {
  const [status, setStatus] = useState('new')
  const [search, setSearch] = useState('')
  const [expanded, setExpanded] = useState(null)
  const queryClient = useQueryClient()

  const { data: requests = [], isLoading, error } = useQuery({
    queryKey: adminKeys.demoRequests(status, search),
    queryFn: () => fetchDemoRequests({ status, q: search }),
  })

  const mutation = useMutation({
    mutationFn: ({ id, body }) => updateDemoRequest(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin', 'demo-requests'] }),
  })

  const savingId = mutation.isPending ? mutation.variables?.id : null

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <h2 className="m-0 text-2xl font-extrabold text-slate-900">Demo requests</h2>
        <p className="m-0 mt-1 text-sm text-slate-500">
          Leads from the website&apos;s &quot;Book a demo&quot; form. Call them, then move the lead
          along.
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
            placeholder="Search name, email, phone, company..."
            className="h-10 w-full rounded-2xl border border-slate-200 px-4 text-sm outline-none focus:border-[#1e3a8a] sm:w-72"
          />
        </div>

        {isLoading ? (
          <Loader className="mt-10" label="Loading demo requests..." />
        ) : error ? (
          <p className="mt-6 text-sm text-red-600">{error.message}</p>
        ) : requests.length === 0 ? (
          <p className="mt-10 text-center text-sm text-slate-500">
            No {status === 'all' ? '' : status} demo requests yet.
          </p>
        ) : (
          <div className="mt-5 flex flex-col gap-3">
            {requests.map((request) => {
              const isOpen = expanded === request.id
              return (
                <article
                  key={request.id}
                  className="rounded-3xl border border-slate-100 bg-white p-4 shadow-sm md:p-5"
                >
                  <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="m-0 text-sm font-bold text-slate-900">{request.name}</p>
                        <StatusPill status={request.status} />
                      </div>
                      <p className="m-0 mt-1 text-sm text-slate-600">
                        {request.company || 'No company given'}
                        {request.teamSize && ` · ${request.teamSize} people`}
                      </p>
                      <p className="m-0 mt-1 text-sm text-slate-500">
                        <a href={`tel:${request.phone}`} className="font-semibold text-[#1e3a8a] no-underline hover:underline">
                          {request.phone}
                        </a>
                        {' · '}
                        <a href={`mailto:${request.email}`} className="text-slate-500 no-underline hover:underline">
                          {request.email}
                        </a>
                      </p>
                      <p className="m-0 mt-1 text-xs text-slate-400">
                        Received {formatDate(request.createdAt)}
                        {request.handledBy && ` · last updated by ${request.handledBy.email}`}
                      </p>
                    </div>

                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:items-center">
                      <select
                        value={request.status}
                        disabled={savingId === request.id}
                        onChange={(e) =>
                          mutation.mutate({ id: request.id, body: { status: e.target.value } })
                        }
                        className="h-11 rounded-xl border border-slate-200 px-3 text-sm font-semibold text-slate-700 outline-none focus:border-[#1e3a8a] disabled:opacity-50"
                      >
                        {STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s.charAt(0).toUpperCase() + s.slice(1)}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setExpanded(isOpen ? null : request.id)}
                        className="h-11 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
                      >
                        {isOpen ? 'Hide' : 'Details'}
                      </button>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-4 border-t border-slate-100 pt-4">
                      <p className="m-0 text-xs font-bold uppercase tracking-wide text-slate-400">
                        What they asked for
                      </p>
                      <p className="m-0 mt-1 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
                        {request.message || '— nothing written —'}
                      </p>

                      <p className="m-0 mt-4 text-xs font-bold uppercase tracking-wide text-slate-400">
                        Internal notes
                      </p>
                      <NotesEditor
                        request={request}
                        saving={savingId === request.id}
                        onSave={(notes) => mutation.mutate({ id: request.id, body: { notes } })}
                      />
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        )}

        {mutation.isError && (
          <p className="mt-4 text-sm text-red-600">{mutation.error.message}</p>
        )}
      </div>
    </AdminLayout>
  )
}

export default AdminDemoRequests

import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import EnterpriseApprovalCard from '../../components/admin/EnterpriseApprovalCard'
import Loader from '../../components/common/Loader'
import { adminKeys, fetchEnterpriseRegistrations, reviewEnterpriseRegistration } from '../../api/admin'
import { useToast } from '../../context/ToastContext'

const TABS = [
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Approved' },
  { id: 'rejected', label: 'Rejected' },
]

function DetailModal({ item, onClose }) {
  if (!item) return null
  const rows = [
    ['Company', item.companyLegalName || item.companyName],
    ['Admin Email', item.email],
    ['Work Email', item.workEmail],
    ['Industry', item.industry],
    ['Size', item.companySize],
    ['Contact', item.contactName],
    ['Phone', item.phone],
    ['BRN', item.brn],
    ['GSTIN', item.taxId],
    ['Address', [item.locality, item.city, item.state, item.pincode, item.country].filter(Boolean).join(', ')],
  ]

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl">
        <div className="mb-5 flex items-start justify-between gap-3">
          <h3 className="m-0 text-lg font-bold text-slate-900">Registration Details</h3>
          <button type="button" onClick={onClose} className="rounded-xl px-2 py-1 text-slate-400 hover:bg-slate-100">
            ✕
          </button>
        </div>
        <dl className="space-y-3">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-2xl bg-slate-50 px-4 py-3">
              <dt className="m-0 text-xs text-slate-400">{label}</dt>
              <dd className="m-0 mt-0.5 text-sm font-semibold text-slate-800">{value || '—'}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  )
}

function EnterpriseApprovals() {
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [tab, setTab] = useState('pending')
  const [selected, setSelected] = useState(null)

  const { data = [], isLoading, error } = useQuery({
    queryKey: adminKeys.registrations(tab),
    queryFn: () => fetchEnterpriseRegistrations(tab),
  })

  const list = Array.isArray(data) ? data : data?.registrations || data?.items || []

  const reviewMutation = useMutation({
    mutationFn: ({ id, status }) => reviewEnterpriseRegistration(id, status),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast(status === 'approved' ? 'Enterprise approved — dashboard unlocked' : 'Registration rejected', status === 'approved' ? 'success' : 'info')
    },
    onError: (err) => toast(err.message || 'Action failed', 'error'),
  })

  const handleApprove = (item) => {
    const id = item._id || item.id || item.companyId
    reviewMutation.mutate({ id, status: 'approved' })
  }

  const handleReject = (item) => {
    const id = item._id || item.id || item.companyId
    if (!window.confirm(`Reject registration for ${item.companyLegalName || item.companyName}?`)) return
    reviewMutation.mutate({ id, status: 'rejected' })
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading registrations..." />

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6">
          <h2 className="m-0 text-2xl font-extrabold text-slate-900">Enterprise Approvals</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Approve companies to grant dashboard access after registration
          </p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        <div className="mb-6 flex rounded-2xl bg-slate-200/60 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`flex-1 rounded-xl py-2.5 text-sm font-semibold transition ${
                tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          {list.length > 0 ? (
            list.map((item) => (
              <EnterpriseApprovalCard
                key={item._id || item.id}
                item={item}
                busy={reviewMutation.isPending}
                onApprove={handleApprove}
                onReject={handleReject}
                onView={setSelected}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <p className="m-0 text-sm font-semibold text-slate-600">No {tab} registrations</p>
            </div>
          )}
        </div>
      </div>

      <DetailModal item={selected} onClose={() => setSelected(null)} />
    </AdminLayout>
  )
}

export default EnterpriseApprovals

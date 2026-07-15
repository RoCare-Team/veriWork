import { getInitials } from '../../utils/formatters'

const STATUS_STYLES = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}

function EnterpriseApprovalCard({ item, onApprove, onReject, onView, busy }) {
  const name = item.companyLegalName || item.companyName || item.name || 'Company'
  const status = item.approvalStatus || item.status || 'pending'

  return (
    <article className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm transition hover:shadow-md md:p-6">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-sm font-bold text-slate-700">
          {getInitials(name)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <h3 className="m-0 text-base font-bold text-slate-900">{name}</h3>
              <p className="m-0 mt-0.5 text-sm text-slate-500">{item.workEmail || item.email}</p>
            </div>
            <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${STATUS_STYLES[status] || STATUS_STYLES.pending}`}>
              {status}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
            <div>
              <p className="m-0 text-xs text-slate-400">Industry</p>
              <p className="m-0 font-semibold text-slate-800">{item.industry || '—'}</p>
            </div>
            <div>
              <p className="m-0 text-xs text-slate-400">Contact</p>
              <p className="m-0 font-semibold text-slate-800">{item.contactName || '—'}</p>
            </div>
            <div>
              <p className="m-0 text-xs text-slate-400">City</p>
              <p className="m-0 font-semibold text-slate-800">{item.city || '—'}</p>
            </div>
            <div>
              <p className="m-0 text-xs text-slate-400">Submitted</p>
              <p className="m-0 font-semibold text-slate-800">
                {item.submittedAt || item.createdAt
                  ? new Date(item.submittedAt || item.createdAt).toLocaleDateString()
                  : '—'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {status === 'pending' && (
        <div className="mt-5 flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => onView?.(item)}
            className="rounded-2xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            View Details
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onReject(item)}
            className="rounded-2xl border border-red-200 px-4 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 disabled:opacity-50"
          >
            Reject
          </button>
          <button
            type="button"
            disabled={busy}
            onClick={() => onApprove(item)}
            className="rounded-2xl bg-[#005fd6] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#004bab] disabled:opacity-50"
          >
            Approve
          </button>
        </div>
      )}
    </article>
  )
}

export default EnterpriseApprovalCard

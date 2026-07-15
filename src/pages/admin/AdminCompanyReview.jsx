import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import ReviewRow from '../../components/common/ReviewRow'
import { adminKeys, fetchAdminCompany, reviewAdminCompany } from '../../api/admin'
import { useToast } from '../../context/ToastContext'
import { mediaUrl } from '../../lib/mediaUrl'
import {
  getCompanyTypeLabel,
  getDocumentsForCompanyType,
} from '../../utils/enterpriseCompanyTypes'
import { getRegistrationLabel } from '../../utils/enterpriseValidators'
import { formatDate } from '../../utils/formatters'

const DOC_LABELS = {
  incorporation: 'Certificate of Incorporation',
  registration: 'Business Registration / MOA',
  tax: 'GST / Tax Certificate',
  taxCertificate: 'GST / Tax Certificate',
  addressProof: 'Proof of Business Address',
  signatoryId: 'Authorized Signatory ID',
  bankLetter: 'Bank Letter / Cancelled Cheque',
}

function RejectModal({ open, onClose, onConfirm, busy }) {
  const [reason, setReason] = useState('')

  if (!open) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!reason.trim()) return
    onConfirm(reason.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="m-0 text-lg font-bold text-slate-900">Reject Application</h3>
        <p className="m-0 mt-2 text-sm text-slate-500">Provide a reason so the company can resubmit.</p>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="e.g. GST certificate is unclear, please re-upload..."
          rows={4}
          required
          className="mt-4 w-full resize-none rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#005fd6] focus:ring-4 focus:ring-blue-100"
        />
        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" fullWidth={false} onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" fullWidth={false} disabled={busy || !reason.trim()}>
            {busy ? 'Rejecting...' : 'Confirm Reject'}
          </Button>
        </div>
      </form>
    </div>
  )
}

function DocumentLink({ label, url }) {
  if (!url) return null
  const href = mediaUrl(url)
  const fileName = typeof url === 'string' ? url.split('/').pop() : label
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-4 py-3">
      <div className="min-w-0">
        <p className="m-0 text-sm font-semibold text-slate-800">{label}</p>
        <p className="m-0 mt-0.5 truncate text-xs text-slate-500">{fileName}</p>
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="shrink-0 rounded-xl border border-[#005fd6]/20 px-3 py-1.5 text-xs font-semibold text-[#005fd6] no-underline hover:bg-blue-50"
      >
        View
      </a>
    </div>
  )
}

function AdminCompanyReview() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [rejectOpen, setRejectOpen] = useState(false)

  const { data: app, isLoading, error } = useQuery({
    queryKey: adminKeys.company(id),
    queryFn: () => fetchAdminCompany(id),
  })

  const reviewMutation = useMutation({
    mutationFn: ({ status, reason }) => reviewAdminCompany(id, status, reason),
    onSuccess: (_, { status }) => {
      queryClient.invalidateQueries({ queryKey: ['admin'] })
      toast(
        status === 'approved' ? 'Company approved — dashboard unlocked' : 'Application rejected',
        status === 'approved' ? 'success' : 'info',
      )
      navigate(status === 'approved' ? '/admin/companies/approved' : '/admin/companies/rejected')
    },
    onError: (err) => toast(err.message || 'Action failed', 'error'),
  })

  if (isLoading) return <Loader variant="fullPage" label="Loading company details..." />

  if (error || !app) {
    return (
      <AdminLayout>
        <div className="px-8 py-12 text-center">
          <p className="text-red-600">{error?.message || 'Company not found'}</p>
          <Link to="/admin/companies" className="mt-4 inline-block text-sm font-semibold text-[#005fd6]">
            Back to list
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const { company, admin, onboarding, status, documents, rejectionReason } = app
  const companyType = company.companyType || 'private_limited'
  const docDefs = getDocumentsForCompanyType(companyType)
  const canReview = status === 'submitted' || status === 'pending'

  const address = [company.locality, company.city, company.state, company.pincode, company.country]
    .filter(Boolean)
    .join(', ')

  const uploadedDocs = Object.entries(documents).filter(([, url]) => Boolean(url))

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <Link to="/admin/companies" className="text-sm font-semibold text-[#005fd6] no-underline hover:underline">
              ← Back to companies
            </Link>
            <h2 className="m-0 mt-2 text-2xl font-extrabold text-slate-900">
              {company.name || company.companyLegalName}
            </h2>
            <p className="m-0 mt-1 text-sm text-slate-500">
              Submitted {formatDate(onboarding.submittedAt || app.submittedAt)}
            </p>
          </div>
          <span
            className={`self-start rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wide ${
              status === 'approved'
                ? 'border-green-200 bg-green-50 text-green-700'
                : status === 'rejected'
                  ? 'border-red-200 bg-red-50 text-red-700'
                  : 'border-amber-200 bg-amber-50 text-amber-700'
            }`}
          >
            {status}
          </span>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
            <h3 className="m-0 text-base font-bold text-slate-900">Company Information</h3>
            <div className="mt-4">
              <ReviewRow label="Company Type" value={getCompanyTypeLabel(companyType)} />
              <ReviewRow label="Legal Name" value={company.name || company.companyLegalName} />
              <ReviewRow label="Industry" value={company.industry} />
              <ReviewRow label="Company Size" value={company.companySize} />
              <ReviewRow label="Work Email" value={company.workEmail} />
              <ReviewRow label="Contact Person" value={company.contactName} />
              <ReviewRow label="Phone" value={company.phone} />
              <ReviewRow label="Address" value={address} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
            <h3 className="m-0 text-base font-bold text-slate-900">Registration & Admin</h3>
            <div className="mt-4">
              <ReviewRow label="Admin Email" value={admin.email} />
              <ReviewRow label={getRegistrationLabel(companyType)} value={company.brn} />
              <ReviewRow label="GSTIN / Tax ID" value={company.taxId} />
              <ReviewRow label="Onboarding Status" value={onboarding.status || status} />
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <h3 className="m-0 text-base font-bold text-slate-900">Uploaded Documents</h3>
          <div className="mt-4 flex flex-col gap-3">
            {docDefs.map((doc) => {
              const url =
                documents[doc.id] ||
                documents[doc.id === 'taxCertificate' ? 'tax' : doc.id]
              return <DocumentLink key={doc.id} label={doc.title} url={url} />
            })}
            {uploadedDocs
              .filter(([key]) => !docDefs.some((d) => d.id === key || (key === 'tax' && d.id === 'taxCertificate')))
              .map(([key, url]) => (
                <DocumentLink key={key} label={DOC_LABELS[key] || key} url={url} />
              ))}
            {uploadedDocs.length === 0 && (
              <p className="m-0 text-sm text-slate-500">No documents uploaded</p>
            )}
          </div>
        </section>

        {rejectionReason && (
          <section className="mt-6 rounded-3xl border border-red-100 bg-red-50/50 p-5 md:p-7">
            <h3 className="m-0 text-base font-bold text-red-800">Rejection Reason</h3>
            <p className="m-0 mt-2 text-sm text-red-700">{rejectionReason}</p>
          </section>
        )}

        {canReview && (
          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button
              type="button"
              variant="ghost"
              fullWidth={false}
              disabled={reviewMutation.isPending}
              onClick={() => setRejectOpen(true)}
              className="!text-red-600 hover:!bg-red-50"
            >
              Reject
            </Button>
            <Button
              type="button"
              fullWidth={false}
              disabled={reviewMutation.isPending}
              onClick={() => reviewMutation.mutate({ status: 'approved' })}
            >
              {reviewMutation.isPending ? 'Processing...' : 'Approve Company'}
            </Button>
          </div>
        )}
      </div>

      <RejectModal
        open={rejectOpen}
        onClose={() => setRejectOpen(false)}
        busy={reviewMutation.isPending}
        onConfirm={(reason) => {
          reviewMutation.mutate({ status: 'rejected', reason })
          setRejectOpen(false)
        }}
      />
    </AdminLayout>
  )
}

export default AdminCompanyReview

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import Button from '../../components/common/Button'
import MessageThread from '../../components/common/MessageThread'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import {
  enterpriseKeys,
  fetchApplicationStatus,
  fetchApplicationMessages,
  postApplicationMessage,
  resubmitApplication,
  uploadOnboardingDocument,
} from '../../api/enterprise'
import { getEnterpriseDocType } from '../../lib/uploadDocument'

function unwrap(res) {
  return res?.data || res || {}
}

const DOC_LABELS = {
  incorporation: 'Certificate of Incorporation',
  registration: 'Registration Document',
  tax: 'GST Registration Certificate',
  taxCertificate: 'GST Registration Certificate',
  addressProof: 'Proof of Business Address',
  signatoryId: 'Authorized Signatory ID',
  bankLetter: 'Company Bank Letter / Cancelled Cheque',
}

function docLabel(key) {
  return DOC_LABELS[key] || key
}

/** A document the admin sent back, with an inline re-upload. */
function RejectedDocumentCard({ doc, onUploaded }) {
  const { toast } = useToast()
  const [uploading, setUploading] = useState(false)

  const handleFile = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadOnboardingDocument(getEnterpriseDocType(doc.documentKey), file)
      toast(`${docLabel(doc.documentKey)} re-uploaded`, 'success')
      onUploaded?.()
    } catch (err) {
      toast(err.message || 'Upload failed', 'error')
    } finally {
      setUploading(false)
      e.target.value = ''
    }
  }

  return (
    <div className="rounded-2xl border border-red-200 bg-red-50/50 p-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="m-0 text-sm font-bold text-slate-900">{docLabel(doc.documentKey)}</p>
          <p className="m-0 mt-1 text-xs text-red-700">{doc.reason}</p>
        </div>
        <span className="shrink-0 rounded-full bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-red-700">
          Rejected
        </span>
      </div>
      <label className="mt-3 flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-red-300 bg-white px-4 py-3 text-xs font-semibold text-brand-600 hover:bg-red-50">
        {uploading ? 'Uploading…' : 'Re-upload this document'}
        <input
          type="file"
          className="hidden"
          accept=".pdf,.jpg,.jpeg,.png,.webp"
          onChange={handleFile}
          disabled={uploading}
        />
      </label>
    </div>
  )
}

function PendingApproval() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { company, logout } = useAuth()

  const statusQuery = useQuery({
    queryKey: enterpriseKeys.applicationStatus,
    queryFn: fetchApplicationStatus,
    retry: false,
  })
  const messagesQuery = useQuery({
    queryKey: enterpriseKeys.applicationMessages,
    queryFn: fetchApplicationMessages,
    retry: false,
  })

  const application = unwrap(statusQuery.data)
  const messages = unwrap(messagesQuery.data).messages || []
  const rejected = application.rejectedDocuments || []
  const needsChanges = application.status === 'changes_requested'

  const refreshStatus = () =>
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.applicationStatus })

  const sendMutation = useMutation({
    mutationFn: (body) => postApplicationMessage(body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: enterpriseKeys.applicationMessages }),
    onError: (err) => toast(err.message || 'Could not send message', 'error'),
  })

  const resubmitMutation = useMutation({
    mutationFn: resubmitApplication,
    onSuccess: () => {
      toast('Application resubmitted for review', 'success')
      refreshStatus()
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.applicationMessages })
    },
    onError: (err) => toast(err.message || 'Could not resubmit', 'error'),
  })

  const handleSignOut = async () => {
    await logout()
    navigate('/enterprise/login')
  }

  const name = company?.companyLegalName || company?.name || 'Your company'

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      title={needsChanges ? 'Changes Requested' : 'Application Under Review'}
      subtitle={
        needsChanges
          ? 'Our compliance team needs a document corrected before they can approve you.'
          : 'Your enterprise registration has been submitted to our compliance team.'
      }
      backTo="/enterprise/login"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-between">
          <Button variant="ghost" type="button" fullWidth={false} onClick={handleSignOut}>
            Sign Out
          </Button>
          {needsChanges ? (
            <Button
              type="button"
              fullWidth={false}
              disabled={rejected.length > 0 || resubmitMutation.isPending}
              onClick={() => resubmitMutation.mutate()}
            >
              {resubmitMutation.isPending ? 'Resubmitting…' : 'Resubmit for review'}
            </Button>
          ) : (
            <Button type="button" fullWidth={false} disabled>
              Awaiting Admin Approval
            </Button>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-5">
        {/* Status */}
        <div
          className={`flex flex-col items-center rounded-3xl border p-8 text-center shadow-sm md:p-10 ${
            needsChanges
              ? 'border-red-100 bg-gradient-to-br from-red-50 to-white'
              : 'border-amber-100 bg-gradient-to-br from-amber-50 to-white'
          }`}
        >
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-full text-3xl ${
              needsChanges ? 'bg-red-100' : 'bg-amber-100'
            }`}
          >
            {needsChanges ? '!' : '⏳'}
          </div>
          <h2 className="m-0 mt-6 text-xl font-extrabold text-slate-900 md:text-2xl">{name}</h2>
          <p className="m-0 mt-3 max-w-md text-sm leading-relaxed text-slate-600 md:text-base">
            {needsChanges
              ? 'Everything else looks good. Re-upload the document(s) below and resubmit — you do not need to start over.'
              : 'Your application is under review. Our team will review your documents within 24–48 business hours. You will receive an email once your employer dashboard is unlocked.'}
          </p>

          <ul className="mt-8 w-full max-w-md space-y-3 text-left text-sm text-slate-600">
            <li className="flex gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <span className="text-green-600">✓</span> Registration submitted
            </li>
            <li className="flex gap-2 rounded-2xl bg-white px-4 py-3 shadow-sm">
              <span className={needsChanges ? 'text-red-500' : 'text-amber-500'}>●</span>
              {needsChanges ? 'Changes requested — action needed' : 'Admin compliance review (24–48 hrs)'}
            </li>
            <li className="flex gap-2 rounded-2xl bg-slate-50 px-4 py-3 text-slate-400">
              <span>○</span> Dashboard access unlocked
            </li>
          </ul>
        </div>

        {/* Rejected documents */}
        {rejected.length > 0 && (
          <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm md:p-6">
            <h3 className="m-0 text-base font-bold text-slate-900">
              Documents to fix ({rejected.length})
            </h3>
            <p className="m-0 mt-1 text-xs text-slate-500">
              Re-upload each one — the rest of your application stays as it is.
            </p>
            <div className="mt-4 flex flex-col gap-3">
              {rejected.map((doc) => (
                <RejectedDocumentCard key={doc.documentKey} doc={doc} onUploaded={refreshStatus} />
              ))}
            </div>
          </section>
        )}

        {needsChanges && rejected.length === 0 && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-5 py-4 text-sm text-emerald-800">
            All requested documents have been re-uploaded. Hit <strong>Resubmit for review</strong>{' '}
            below to send it back to our team.
          </div>
        )}

        {/* Ask about status */}
        <MessageThread
          messages={messages}
          viewerRole="company"
          isLoading={messagesQuery.isLoading}
          isSending={sendMutation.isPending}
          onSend={(text, clear) => sendMutation.mutate(text, { onSuccess: clear })}
          title="Questions about your application?"
          subtitle="Message our compliance team here — replies show up on this page."
          placeholder="e.g. When will my application be approved?"
        />

        <p className="m-0 text-center text-xs text-slate-400">
          Or email{' '}
          <a href="mailto:support@pagerlook.com" className="font-semibold text-brand-600 hover:underline">
            support@pagerlook.com
          </a>
          {' · '}
          <Link to="/" className="font-semibold text-brand-600 hover:underline">
            Back to home
          </Link>
        </p>
      </div>
    </OnboardingLayout>
  )
}

export default PendingApproval

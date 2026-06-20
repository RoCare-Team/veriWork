import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import { submitPublicProfileAccessRequest } from '../../api/public'

function PublicFullAccessModal({ slug, employeeName, onClose, onSuccess }) {
  const [form, setForm] = useState({
    requesterName: '',
    requesterEmail: '',
    reason: '',
  })
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => submitPublicProfileAccessRequest(slug, form),
    onSuccess: () => {
      onSuccess?.()
      onClose()
    },
    onError: (err) => {
      if (err?.status === 409) {
        setError('You already have a pending request for this profile.')
        return
      }
      setError(err.message || 'Failed to send request')
    },
  })

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }))
    setError('')
  }

  const canSubmit =
    form.requesterName.trim().length >= 2 &&
    form.requesterEmail.trim().includes('@') &&
    form.reason.trim().length >= 10

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Get Full Profile Access</h3>
        <p className="mt-1 text-sm text-slate-500">
          Request complete access to {employeeName}&apos;s verified profile, contact details, and documents.
        </p>

        <div className="mt-5 space-y-4">
          <div>
            <label htmlFor="requesterName" className="text-sm font-semibold text-slate-700">
              Your name
            </label>
            <input
              id="requesterName"
              type="text"
              value={form.requesterName}
              onChange={handleChange('requesterName')}
              placeholder="Alex Rivera"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-50"
            />
          </div>
          <div>
            <label htmlFor="requesterEmail" className="text-sm font-semibold text-slate-700">
              Work email
            </label>
            <input
              id="requesterEmail"
              type="email"
              value={form.requesterEmail}
              onChange={handleChange('requesterEmail')}
              placeholder="hr@company.com"
              className="mt-1.5 h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-50"
            />
          </div>
          <div>
            <label htmlFor="accessReason" className="text-sm font-semibold text-slate-700">
              Why do you need profile access?
            </label>
            <textarea
              id="accessReason"
              rows={4}
              value={form.reason}
              onChange={handleChange('reason')}
              placeholder="e.g. We are hiring for a Senior Developer role and need to verify employment history before interview."
              className="mt-1.5 w-full resize-none rounded-xl border border-slate-200 px-3.5 py-3 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-50"
            />
            <p className="m-0 mt-1 text-xs text-slate-400">Minimum 10 characters. {employeeName} will review and approve.</p>
          </div>
        </div>

        {error && (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
        )}

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" onClick={onClose} fullWidth={false} className="flex-1">
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={!canSubmit || mutation.isPending}
            fullWidth={false}
            className="flex-1"
          >
            {mutation.isPending ? 'Sending...' : 'Send request'}
          </Button>
        </div>
      </div>
    </div>
  )
}

export default PublicFullAccessModal

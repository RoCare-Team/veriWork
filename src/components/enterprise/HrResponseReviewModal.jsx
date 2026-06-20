import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Loader from '../common/Loader'
import { reviewHrResponse, confirmDocumentVerification } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

function HrResponseReviewModal({ request, onClose, onSuccess }) {
  const { toast } = useToast()
  const [notes, setNotes] = useState('')
  const details = request.employmentDetails || {}

  const approveMutation = useMutation({
    mutationFn: () =>
      reviewHrResponse(request._id || request.id, {
        approved: true,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => {
      toast('HR verification approved — status: HR Verified', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Failed to approve HR response', 'error'),
  })

  const rejectMutation = useMutation({
    mutationFn: () =>
      reviewHrResponse(request._id || request.id, {
        approved: false,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      }),
    onSuccess: () => {
      toast('HR response rejected', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Failed to reject', 'error'),
  })

  const documentMutation = useMutation({
    mutationFn: () => confirmDocumentVerification(request._id || request.id, { notes: notes.trim() }),
    onSuccess: () => {
      toast('Verified using submitted documents', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Document verification failed', 'error'),
  })

  const pending = approveMutation.isPending || rejectMutation.isPending || documentMutation.isPending

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Review HR Response</h3>
        <p className="mt-1 text-sm text-slate-500">
          Previous employer HR submitted feedback for {request.employeeName || 'this employee'} at{' '}
          {request.companyName || request.previousCompanyName}.
        </p>

        <dl className="mt-5 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Worked here</dt>
            <dd className="m-0 mt-1 font-semibold text-slate-800">
              {details.workedHere === true ? 'Yes' : details.workedHere === false ? 'No' : '—'}
            </dd>
          </div>
          {details.designation && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Designation</dt>
              <dd className="m-0 mt-1 text-slate-800">{details.designation}</dd>
            </div>
          )}
          {(details.joiningDate || details.exitDate) && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Duration</dt>
              <dd className="m-0 mt-1 text-slate-800">
                {[details.joiningDate, details.exitDate].filter(Boolean).join(' — ')}
              </dd>
            </div>
          )}
          {details.rehireEligible != null && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">Rehire eligible</dt>
              <dd className="m-0 mt-1 text-slate-800">{details.rehireEligible ? 'Yes' : 'No'}</dd>
            </div>
          )}
          {(details.feedback || details.verificationNotes) && (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-slate-400">HR feedback</dt>
              <dd className="m-0 mt-1 text-slate-800">{details.feedback || details.verificationNotes}</dd>
            </div>
          )}
        </dl>

        <div className="mt-4 flex flex-col gap-2">
          <label htmlFor="hr-review-notes" className="text-sm font-semibold text-slate-800">
            Your notes <span className="font-normal text-slate-400">(optional)</span>
          </label>
          <textarea
            id="hr-review-notes"
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            disabled={pending}
            className="w-full resize-y rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100"
          />
        </div>

        <div className="mt-6 flex flex-col gap-2">
          <Button type="button" onClick={() => approveMutation.mutate()} disabled={pending}>
            Approve → HR Verified
          </Button>
          <Button type="button" variant="secondary" onClick={() => rejectMutation.mutate()} disabled={pending}>
            Reject HR Response
          </Button>
          <button
            type="button"
            onClick={() => documentMutation.mutate()}
            disabled={pending}
            className="rounded-xl border border-dashed border-slate-300 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Verify using documents instead
          </button>
          <Button type="button" variant="ghost" onClick={onClose} disabled={pending}>
            Cancel
          </Button>
        </div>

        {pending && <Loader variant="overlay" label="Saving..." />}
      </div>
    </div>
  )
}

export default HrResponseReviewModal

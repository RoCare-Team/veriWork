import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Loader from '../common/Loader'
import { completeEmailVerification, confirmDocumentVerification } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

function EmailVerificationCompleteModal({ request, onClose, onSuccess }) {
  const { toast } = useToast()
  const [verified, setVerified] = useState(true)
  const [useDocuments, setUseDocuments] = useState(false)
  const [notes, setNotes] = useState('')

  const mutation = useMutation({
    mutationFn: () => {
      if (useDocuments) {
        return confirmDocumentVerification(request._id || request.id, {
          ...(notes.trim() ? { notes: notes.trim() } : {}),
        })
      }
      return completeEmailVerification(request._id || request.id, {
        verified,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      })
    },
    onSuccess: () => {
      toast('Verification updated', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Failed to update verification', 'error'),
  })

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Complete Email Verification</h3>
        <p className="mt-1 text-sm text-slate-500">
          Record the outcome for {request.employeeName || 'this employee'}&apos;s employment verification.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <label className="flex items-center gap-2 text-sm font-semibold text-slate-800">
            <input
              type="checkbox"
              checked={useDocuments}
              onChange={(e) => setUseDocuments(e.target.checked)}
            />
            Verify using uploaded documents (no HR response)
          </label>

          {!useDocuments && (
            <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setVerified(true)}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                verified ? 'border-green-500 bg-green-50 text-green-700' : 'border-slate-200 text-slate-600'
              }`}
            >
              Verified
            </button>
            <button
              type="button"
              onClick={() => setVerified(false)}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                !verified ? 'border-red-500 bg-red-50 text-red-700' : 'border-slate-200 text-slate-600'
              }`}
            >
              Not Verified
            </button>
          </div>
          )}

          <div className="flex flex-col gap-2">
            <label htmlFor="verification-notes" className="text-sm font-semibold text-slate-800">
              Notes <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="verification-notes"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={mutation.isPending}
              className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#005fd6] focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Submit
          </Button>
        </div>

        {mutation.isPending && <Loader variant="overlay" label="Saving..." />}
      </div>
    </div>
  )
}

export default EmailVerificationCompleteModal

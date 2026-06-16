import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Loader from '../common/Loader'
import { createAccessRequest } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

const REQUEST_TYPES = [
  { value: 'profile_access', label: 'Profile Access' },
  { value: 'background_check', label: 'Background Check' },
  { value: 'verification_data', label: 'Verification Data' },
]

function SendAccessRequestModal({ employeeId, employeeUserId, employeeName, onClose }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [requestType, setRequestType] = useState('profile_access')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createAccessRequest({
        employeeId: employeeUserId || employeeId,
        requestType,
        ...(message.trim() ? { message: message.trim() } : {}),
      }),
    onSuccess: () => {
      toast('Access request sent successfully', 'success')
      onClose()
      navigate('/company/access-requests')
    },
    onError: (err) => toast(err.message || 'Failed to send request', 'error'),
  })

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Send Access Request</h3>
        <p className="mt-1 text-sm text-slate-500">
          Request access to {employeeName}&apos;s profile data.
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="request-type" className="text-sm font-semibold text-slate-800">
              Request Type
            </label>
            <select
              id="request-type"
              value={requestType}
              onChange={(e) => setRequestType(e.target.value)}
              disabled={mutation.isPending}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100"
            >
              {REQUEST_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="request-message" className="text-sm font-semibold text-slate-800">
              Message <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="request-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={mutation.isPending}
              placeholder="Add a note for the employee..."
              className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Send Request
          </Button>
        </div>

        {mutation.isPending && <Loader variant="overlay" label="Sending request..." />}
      </div>
    </div>
  )
}

export default SendAccessRequestModal

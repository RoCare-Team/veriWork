import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import Button from '../common/Button'
import Loader from '../common/Loader'
import { createAccessRequest, enterpriseKeys, fetchAccessRequestTypes } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

const FALLBACK_TYPES = [
  { value: 'profile_access', label: 'Profile Access', description: 'View basic profile and employment history' },
  { value: 'background_check', label: 'Background Check', description: 'Access vault documents for background verification' },
  { value: 'verification_data', label: 'Verification Data', description: 'View trust score breakdown and verification status' },
  {
    value: 'full_profile_access',
    label: 'Get Full Profile Access',
    description: 'Complete access to profile, documents, and verification data',
  },
]

function SendAccessRequestModal({
  employeeId,
  employeeUserId,
  employeeName,
  defaultRequestType = 'full_profile_access',
  onClose,
  onSuccess,
}) {
  const { toast } = useToast()
  const [requestType, setRequestType] = useState(defaultRequestType)
  const [message, setMessage] = useState('')

  const typesQuery = useQuery({
    queryKey: enterpriseKeys.accessRequestTypes,
    queryFn: fetchAccessRequestTypes,
  })

  const typeOptions = Array.isArray(typesQuery.data) && typesQuery.data.length
    ? typesQuery.data
    : FALLBACK_TYPES

  useEffect(() => {
    if (!typeOptions.some((t) => t.value === requestType)) {
      const preferred = typeOptions.find((t) => t.value === defaultRequestType) || typeOptions[0]
      if (preferred) setRequestType(preferred.value)
    }
  }, [typeOptions, defaultRequestType, requestType])

  const selectedType = typeOptions.find((t) => t.value === requestType)

  const mutation = useMutation({
    mutationFn: () =>
      createAccessRequest({
        employeeId: employeeUserId || employeeId,
        requestType,
        ...(message.trim() ? { message: message.trim() } : {}),
      }),
    onSuccess: () => {
      toast('Access request sent. Waiting for employee consent.', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => {
      if (err?.status === 409) {
        toast('Pending request already exists', 'error')
        onSuccess?.()
        onClose()
        return
      }
      toast(err.message || 'Failed to send request', 'error')
    },
  })

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Request Access</h3>
        <p className="mt-1 text-sm text-slate-500">
          Request access to {employeeName}&apos;s data.
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
              disabled={mutation.isPending || typesQuery.isLoading}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100"
            >
              {typeOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                  {opt.value === 'full_profile_access' ? ' ★ All access' : ''}
                </option>
              ))}
            </select>
            {requestType === 'full_profile_access' && (
              <p className="m-0 flex items-center gap-2 text-xs font-semibold text-[#1e3a8a]">
                <span className="rounded-full bg-[#1e3a8a]/10 px-2 py-0.5 text-[10px] font-bold uppercase">Recommended</span>
                Unlocks profile, documents, and verification in one request.
              </p>
            )}
            {selectedType?.description && requestType !== 'full_profile_access' && (
              <p className="m-0 text-xs text-slate-500">{selectedType.description}</p>
            )}
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
              className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100"
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

        {(mutation.isPending || typesQuery.isLoading) && (
          <Loader variant="overlay" label={mutation.isPending ? 'Sending request...' : 'Loading options...'} />
        )}
      </div>
    </div>
  )
}

export default SendAccessRequestModal

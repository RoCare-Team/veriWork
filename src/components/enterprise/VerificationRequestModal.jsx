import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import Loader from '../common/Loader'
import { createVerificationRequest, enterpriseKeys } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

function VerificationRequestModal({ employeeId, jobExperienceId, jobTitle, companyName, onClose, onSuccess }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [hrEmail, setHrEmail] = useState('')
  const [hrName, setHrName] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createVerificationRequest({
        employeeId,
        jobExperienceId,
        ...(hrEmail.trim() ? { hrEmail: hrEmail.trim() } : {}),
        ...(hrName.trim() ? { hrName: hrName.trim() } : {}),
      }),
    onSuccess: () => {
      toast('Verification request submitted', 'success')
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.verificationOutgoing })
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Failed to submit request', 'error'),
  })

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Start Employment Verification</h3>
        <p className="mt-1 text-sm text-slate-500">
          Verify <strong>{jobTitle}</strong> at {companyName}
        </p>

        <div className="mt-5 flex flex-col gap-4">
          <Input
            id="hr-name"
            label="HR Contact Name"
            value={hrName}
            onChange={(e) => setHrName(e.target.value)}
            disabled={mutation.isPending}
            placeholder="Optional"
          />
          <Input
            id="hr-email"
            label="HR Contact Email"
            type="email"
            value={hrEmail}
            onChange={(e) => setHrEmail(e.target.value)}
            disabled={mutation.isPending}
            placeholder="Optional — enables email channel"
          />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Submit Request
          </Button>
        </div>

        {mutation.isPending && <Loader variant="overlay" label="Submitting..." />}
      </div>
    </div>
  )
}

export default VerificationRequestModal

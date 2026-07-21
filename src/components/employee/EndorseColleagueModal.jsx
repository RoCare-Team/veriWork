import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Loader from '../common/Loader'
import { createEndorsement } from '../../api/employee'
import { useToast } from '../../context/ToastContext'

const RELATIONSHIPS = [
  { value: 'colleague', label: 'Colleague' },
  { value: 'manager', label: 'Manager' },
  { value: 'hr', label: 'HR' },
  { value: 'other', label: 'Other' },
]

function EndorseColleagueModal({ onClose, onSuccess }) {
  const { toast } = useToast()
  const [veriworkId, setVeriworkId] = useState('')
  const [relationship, setRelationship] = useState('colleague')
  const [message, setMessage] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      createEndorsement({
        veriworkId: veriworkId.trim(),
        relationship,
        ...(message.trim() ? { message: message.trim() } : {}),
      }),
    onSuccess: () => {
      toast('Endorsement sent successfully', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Failed to send endorsement', 'error'),
  })

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Endorse a colleague</h3>
        <p className="mt-1 text-sm text-slate-500">Enter their PagerLook ID to endorse them.</p>

        <div className="mt-5 flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="endorse-veriwork-id" className="text-sm font-semibold text-slate-800">
              PagerLook ID
            </label>
            <input
              id="endorse-veriwork-id"
              type="text"
              value={veriworkId}
              onChange={(e) => setVeriworkId(e.target.value)}
              disabled={mutation.isPending}
              placeholder="e.g. VW-ABC123"
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100"
            />
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="endorse-relationship" className="text-sm font-semibold text-slate-800">
              Relationship
            </label>
            <select
              id="endorse-relationship"
              value={relationship}
              onChange={(e) => setRelationship(e.target.value)}
              disabled={mutation.isPending}
              className="h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100"
            >
              {RELATIONSHIPS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="endorse-message" className="text-sm font-semibold text-slate-800">
              Message <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              id="endorse-message"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={mutation.isPending}
              placeholder="Why are you endorsing them?"
              className="w-full resize-y rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100"
            />
          </div>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !veriworkId.trim()}
          >
            Send Endorsement
          </Button>
        </div>

        {mutation.isPending && <Loader variant="overlay" label="Sending..." />}
      </div>
    </div>
  )
}

export default EndorseColleagueModal

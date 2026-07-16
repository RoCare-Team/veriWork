import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { changePassword } from '../../api/auth'
import { useToast } from '../../context/ToastContext'
import Button from '../common/Button'

const inputClass =
  'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-[#005fd6]'

function ChangePasswordSection() {
  const { toast } = useToast()
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () => changePassword(current, next),
    onSuccess: () => {
      toast('Password updated successfully', 'success')
      setCurrent('')
      setNext('')
      setConfirm('')
      setError('')
    },
    onError: (err) => {
      setError(err.message || 'Failed to update password')
    },
  })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (next.length < 8) {
      setError('New password must be at least 8 characters')
      return
    }
    if (next !== confirm) {
      setError('New password and confirmation do not match')
      return
    }
    mutation.mutate()
  }

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <h3 className="m-0 text-base font-bold text-slate-900">Change Password</h3>
      <p className="m-0 mt-1 text-xs text-slate-500">
        Update the password you use to sign in to your employer portal.
      </p>

      <form className="mt-5 space-y-4" onSubmit={submit}>
        <div>
          <label className="text-sm font-semibold text-slate-700">Current password</label>
          <input
            type="password"
            value={current}
            onChange={(e) => setCurrent(e.target.value)}
            autoComplete="current-password"
            className={inputClass}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">New password</label>
            <input
              type="password"
              value={next}
              onChange={(e) => setNext(e.target.value)}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Confirm new password</label>
            <input
              type="password"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        </div>

        {error && <p className="m-0 text-xs font-medium text-red-600">{error}</p>}

        <div className="pt-1">
          <Button
            type="submit"
            disabled={mutation.isPending || !current || !next || !confirm}
            fullWidth={false}
          >
            {mutation.isPending ? 'Updating…' : 'Update password'}
          </Button>
        </div>
      </form>
    </section>
  )
}

export default ChangePasswordSection

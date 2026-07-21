import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import AuthLayout from '../../layouts/AuthLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { resetPassword } from '../../api/auth'

function ResetPassword() {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const token = params.get('token') || ''

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const mutation = useMutation({
    mutationFn: () => resetPassword(token, password),
    onSuccess: () => setDone(true),
    onError: (err) => setError(err.message || 'Could not reset your password'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')
    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }
    if (password !== confirm) {
      setError('Passwords do not match')
      return
    }
    mutation.mutate()
  }

  if (!token) {
    return (
      <AuthLayout>
        <div className="text-center">
          <h1 className="m-0 text-2xl font-extrabold text-[#1e3a8a]">Invalid reset link</h1>
          <p className="mt-2 text-sm text-slate-600">This link is missing its token. Request a new one.</p>
          <Link to="/forgot-password" className="mt-5 inline-block font-bold text-[#1e3a8a] no-underline hover:underline">
            Request a new link
          </Link>
        </div>
      </AuthLayout>
    )
  }

  if (done) {
    return (
      <AuthLayout>
        <div className="flex flex-col gap-6 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
            ✓
          </div>
          <div>
            <h1 className="m-0 text-2xl font-extrabold text-slate-900">Password updated</h1>
            <p className="mt-2 text-sm text-slate-600">
              Your password has been reset. You can now sign in with your new password.
            </p>
          </div>
          <Button type="button" onClick={() => navigate('/enterprise/login')}>
            Go to sign in
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-7">
        <section className="text-center">
          <h1 className="m-0 text-[30px] font-extrabold tracking-tight text-[#1e3a8a] sm:text-[34px]">
            Set a new password
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Choose a strong password you don&apos;t use elsewhere.
          </p>
        </section>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            id="new-password"
            label="New password"
            type="password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="new-password"
            disabled={mutation.isPending}
          />
          <Input
            id="confirm-password"
            label="Confirm password"
            type="password"
            placeholder="Re-enter your password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="new-password"
            disabled={mutation.isPending}
          />
          {error && (
            <p className="m-0 text-[13px] font-medium text-red-600" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" disabled={mutation.isPending || !password || !confirm}>
            {mutation.isPending ? 'Updating...' : 'Reset password'}
          </Button>
        </form>

        <footer className="border-t border-slate-100 pt-6 text-center text-[13px] text-slate-500">
          <Link to="/enterprise/login" className="font-bold text-[#1e3a8a] no-underline hover:underline">
            Back to sign in
          </Link>
        </footer>
      </div>
    </AuthLayout>
  )
}

export default ResetPassword

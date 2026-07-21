import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import BrandLogo from '../../components/common/BrandLogo'
import { acceptCompanyInvite, fetchCompanyInvite } from '../../api/public'

const inputClass =
  'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-[#1e3a8a]'

function AcceptInvite() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const navigate = useNavigate()

  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ['public', 'company-invite', token],
    queryFn: () => fetchCompanyInvite(token),
    enabled: Boolean(token),
    retry: false,
  })

  const invite = data?.data || data

  const mutation = useMutation({
    mutationFn: () => acceptCompanyInvite(token, password),
    onSuccess: () => setDone(true),
    onError: (err) => setError(err.message || 'Could not accept the invite'),
  })

  const submit = (e) => {
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
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <p className="text-sm text-red-600">Invalid invite link.</p>
      </div>
    )
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading invite..." />

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="m-0 text-sm text-red-600">
            {loadError.message || 'This invite is invalid or has expired.'}
          </p>
          <Link to="/enterprise/login" className="mt-4 inline-block text-sm font-semibold text-[#1e3a8a] no-underline">
            Go to sign in
          </Link>
        </div>
      </div>
    )
  }

  if (done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
            ✓
          </div>
          <h1 className="m-0 text-xl font-bold text-slate-900">You're all set</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your account for <strong>{invite?.companyName}</strong> is ready. Sign in with{' '}
            <strong>{invite?.email}</strong>.
          </p>
          <Button type="button" className="mt-6 w-full" onClick={() => navigate('/enterprise/login')}>
            Go to sign in
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="md" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <h1 className="m-0 text-xl font-extrabold text-slate-900">Accept your invite</h1>
          <p className="m-0 mt-2 text-sm text-slate-600">
            <strong>{invite?.companyName}</strong> invited you to their employer portal as{' '}
            <strong>{invite?.roleLabel}</strong>. Set a password to activate your account.
          </p>

          <div className="mt-4 rounded-xl bg-slate-50 px-4 py-3">
            <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Your login email</p>
            <p className="m-0 mt-0.5 text-sm font-semibold text-slate-800">{invite?.email}</p>
          </div>

          <form className="mt-5 space-y-4" onSubmit={submit}>
            <div>
              <label className="text-sm font-semibold text-slate-700">Create password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="new-password"
                placeholder="At least 8 characters"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">Confirm password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                autoComplete="new-password"
                className={inputClass}
              />
            </div>

            {error && <p className="m-0 text-xs font-medium text-red-600">{error}</p>}

            <Button type="submit" className="w-full" disabled={mutation.isPending || !password || !confirm}>
              {mutation.isPending ? 'Creating account…' : 'Activate account'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Already have an account?{' '}
          <Link to="/enterprise/login" className="font-semibold text-[#1e3a8a] no-underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default AcceptInvite

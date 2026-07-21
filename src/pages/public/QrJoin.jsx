import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import BrandLogo from '../../components/common/BrandLogo'
import { fetchQrJoinInfo, submitQrJoinRequest } from '../../api/public'

/**
 * The page a scanned QR lands on. Deliberately the same fields as the employer's
 * "Invite Employee" form — the candidate is just filling it in themselves.
 *
 * On submit: already on PagerLook -> an invitation waits in their portal;
 * new -> we redirect them straight onto their registration link.
 */
function QrJoin() {
  const { code } = useParams()
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    role: '',
    department: '',
  })
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const { data, isLoading, error: loadError } = useQuery({
    queryKey: ['public', 'qr-join', code],
    queryFn: () => fetchQrJoinInfo(code),
    enabled: Boolean(code),
    retry: false,
  })

  const info = data?.data || data

  // The QR can carry a role/department — prefill so the candidate types less.
  useEffect(() => {
    if (!info) return
    setForm((prev) => ({
      ...prev,
      role: prev.role || info.designation || '',
      department: prev.department || info.department || '',
    }))
  }, [info])

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const mutation = useMutation({
    mutationFn: () => submitQrJoinRequest(code, form),
    onSuccess: (res) => {
      const payload = res?.data || res
      // New to PagerLook — hand them straight to profile setup instead of
      // making them go hunting for an email.
      if (payload.joinLink) {
        window.location.href = payload.joinLink
        return
      }
      setResult(payload)
    },
    onError: (err) => setError(err.message || 'Could not send your request'),
  })

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (form.name.trim().length < 2) {
      setError('Please enter your full name')
      return
    }
    if (form.phone.replace(/\D/g, '').length < 10) {
      setError('Please enter a valid 10-digit mobile number')
      return
    }
    mutation.mutate()
  }

  if (!code) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <p className="text-sm text-danger">Invalid QR link.</p>
      </div>
    )
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading..." />

  if (loadError) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="m-0 text-sm text-danger">
            {loadError.message || 'This QR code is invalid or no longer active.'}
          </p>
        </div>
      </div>
    )
  }

  // Only reached by people who already have a PagerLook profile.
  if (result) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-canvas p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
            ✓
          </div>
          <h1 className="m-0 text-xl font-bold text-slate-900">You're invited</h1>
          <p className="mt-2 text-sm text-slate-600">{result.message}</p>
          <Link
            to="/employee/invitations"
            className="mt-6 inline-block rounded-xl bg-brand-600 px-5 py-3 text-sm font-semibold text-white no-underline hover:bg-brand-700"
          >
            Open my invitations
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-canvas px-4 py-10">
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex justify-center">
          <BrandLogo size="md" />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
          <p className="m-0 text-xs font-semibold uppercase tracking-widest text-slate-400">
            {info?.label}
          </p>
          <h1 className="m-0 mt-2 text-xl font-extrabold text-slate-900">Join {info?.companyName}</h1>
          <p className="m-0 mt-2 text-sm text-slate-600">
            Fill in your details to request joining {info?.companyName}. Already on PagerLook? We'll
            match you by your mobile number — otherwise we'll set up your profile next.
          </p>

          {(info?.designation || info?.department) && (
            <div className="mt-4 flex flex-wrap gap-2">
              {info.designation && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {info.designation}
                </span>
              )}
              {info.department && (
                <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600">
                  {info.department}
                </span>
              )}
            </div>
          )}

          <form className="mt-6 flex flex-col gap-4" onSubmit={submit}>
            <Input
              id="qr-name"
              label="Full Name"
              required
              value={form.name}
              onChange={set('name')}
              placeholder="Your full name"
              disabled={mutation.isPending}
            />
            <Input
              id="qr-phone"
              label="Mobile Number"
              type="tel"
              required
              value={form.phone}
              onChange={set('phone')}
              placeholder="10-digit mobile number"
              hint="We use this to find your existing PagerLook profile"
              disabled={mutation.isPending}
            />
            <Input
              id="qr-email"
              label="Email"
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="Optional"
              disabled={mutation.isPending}
            />
            <Input
              id="qr-department"
              label="Department"
              value={form.department}
              onChange={set('department')}
              placeholder="Optional"
              disabled={mutation.isPending}
            />
            <Input
              id="qr-role"
              label="Designation"
              value={form.role}
              onChange={set('role')}
              placeholder="e.g. Software Engineer"
              disabled={mutation.isPending}
            />

            {error && <p className="m-0 text-xs font-medium text-danger">{error}</p>}

            <Button type="submit" className="mt-1 w-full" disabled={mutation.isPending}>
              {mutation.isPending ? 'Submitting…' : 'Continue'}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-slate-400">
          Powered by{' '}
          <Link to="/" className="font-semibold text-brand-600 no-underline">
            PagerLook
          </Link>
        </p>
      </div>
    </div>
  )
}

export default QrJoin

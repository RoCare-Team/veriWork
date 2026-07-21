import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import AuthLayout from '../../layouts/AuthLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import { isValidEmail } from '../../utils/validators'
import { requestPasswordReset } from '../../api/auth'

function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)
  const [sent, setSent] = useState(false)

  const mutation = useMutation({
    mutationFn: () => requestPasswordReset(email.trim()),
    // The API always responds generically, so success just means "we tried".
    onSuccess: () => setSent(true),
    onError: () => setSent(true),
  })

  const hasError = touched && !isValidEmail(email)

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValidEmail(email)) return
    mutation.mutate()
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-7">
        <section className="text-center">
          <h1 className="m-0 text-[30px] font-extrabold tracking-tight text-[#1e3a8a] sm:text-[34px]">
            Reset your password
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Enter your account email and we&apos;ll send you a secure reset link.
          </p>
        </section>

        {sent ? (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-6 text-center">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
              ✓
            </div>
            <p className="m-0 text-sm font-semibold text-slate-800">Check your inbox</p>
            <p className="m-0 mt-1.5 text-sm text-slate-600">
              If an account exists for <strong>{email.trim()}</strong>, a password reset link is on its way.
              The link expires in 60 minutes.
            </p>
          </div>
        ) : (
          <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              id="reset-email"
              label="Account Email"
              type="email"
              placeholder="hr@technova.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={() => setTouched(true)}
              leftIcon={<span className="text-sm font-semibold text-slate-400">@</span>}
              error={hasError}
              autoComplete="email"
              disabled={mutation.isPending}
            />
            {hasError && (
              <p className="m-0 text-[13px] text-red-600" role="alert">
                Enter a valid email address.
              </p>
            )}
            <Button type="submit" disabled={mutation.isPending || !email}>
              {mutation.isPending ? 'Sending link...' : 'Send reset link'}
            </Button>
          </form>
        )}

        <footer className="flex flex-col items-center gap-3 border-t border-slate-100 pt-6 text-center text-[13px] text-slate-500">
          <p className="m-0">
            Remembered it?{' '}
            <Link to="/enterprise/login" className="font-bold text-[#1e3a8a] no-underline hover:underline">
              Back to sign in
            </Link>
          </p>
        </footer>
      </div>
    </AuthLayout>
  )
}

export default ForgotPassword

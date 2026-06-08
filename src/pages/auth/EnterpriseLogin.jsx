import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../../layouts/AuthLayout'
import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import { GoogleIcon, MicrosoftIcon } from '../../components/common/Icons'
import { isValidEmail } from '../../utils/validators'
import { setEnterpriseSession } from '../../store/enterpriseStore'

function EnterpriseLogin() {
  const navigate = useNavigate()
  const [isBooting, setIsBooting] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [email, setEmail] = useState('')
  const [touched, setTouched] = useState(false)

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 700)
    return () => window.clearTimeout(timer)
  }, [])

  const hasError = useMemo(() => {
    if (!touched) return false
    return !isValidEmail(email)
  }, [email, touched])

  const handleSubmit = async (event) => {
    event.preventDefault()
    setTouched(true)
    if (!isValidEmail(email)) return

    setIsSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1000))
    setIsSubmitting(false)
    setEnterpriseSession({ email })
    navigate('/enterprise/dashboard')
  }

  if (isBooting) {
    return <Loader variant="fullPage" label="Preparing your workspace..." />
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-7">
        <header className="hidden justify-center lg:flex">
          <BrandLogo size="md" showTagline />
        </header>

        <section className="text-center">
          <h1 className="m-0 text-[30px] font-extrabold tracking-tight text-[#1a3a8f] sm:text-[34px]">
            Enterprise Login
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Secure access to your workforce trust dashboard
          </p>
        </section>

        <form className="flex flex-col" onSubmit={handleSubmit} noValidate>
          <Input
            id="work-email"
            label="Work Email"
            type="email"
            placeholder="name@company.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
            leftIcon={<span className="text-sm font-semibold text-slate-400">@</span>}
            error={hasError}
            aria-invalid={hasError}
            autoComplete="email"
            disabled={isSubmitting}
          />
          {hasError && (
            <p className="mt-1.5 text-[13px] text-red-600" role="alert">
              Enter a valid company email address.
            </p>
          )}

          <Button type="submit" className="mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Signing you in...' : 'Continue to Dashboard'}
          </Button>
        </form>

        <div className="relative text-center">
          <span className="absolute inset-x-0 top-1/2 border-t border-slate-200" />
          <span className="relative bg-white px-4 text-xs font-semibold tracking-widest text-slate-400">
            OR
          </span>
        </div>

        <section className="flex flex-col gap-3">
          <Button variant="secondary" type="button" disabled={isSubmitting}>
            <GoogleIcon />
            Continue with Google
          </Button>
          <Button variant="secondary" type="button" disabled={isSubmitting}>
            <MicrosoftIcon />
            Continue with Microsoft
          </Button>
        </section>

        <footer className="flex flex-col items-center gap-3 border-t border-slate-100 pt-6 text-center text-[13px] text-slate-500">
          <p className="m-0">
            New company?{' '}
            <Link
              to="/enterprise/register"
              className="font-bold text-[#1a3a8f] no-underline hover:underline"
            >
              Register Now
            </Link>
          </p>
          <p className="m-0">
            Professional?{' '}
            <Link to="/employee" className="font-bold text-[#1a3a8f] no-underline hover:underline">
              Employee Portal
            </Link>
            {' · '}
            <Link to="/" className="font-semibold text-slate-500 no-underline hover:text-[#1a3a8f]">
              Home
            </Link>
          </p>
          <div className="flex flex-wrap justify-center gap-2">
            {['ISO 27001', '256-bit SSL'].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {badge}
              </span>
            ))}
          </div>
          <small className="text-slate-400">v2.4.0 Build 882</small>
        </footer>
      </div>

      {isSubmitting && <Loader variant="overlay" label="Authenticating..." />}
    </AuthLayout>
  )
}

export default EnterpriseLogin

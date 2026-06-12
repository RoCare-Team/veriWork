import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import AuthLayout from '../../layouts/AuthLayout'
import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import { GoogleIcon, MicrosoftIcon } from '../../components/common/Icons'
import { isValidEmail } from '../../utils/validators'
import { loginEnterprise } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { getEnterpriseHomeRoute } from '../../utils/enterpriseApproval'
import { useToast } from '../../context/ToastContext'

function EnterpriseLogin() {
  const navigate = useNavigate()
  const { loginEnterprise: setSession } = useAuth()
  const [isBooting, setIsBooting] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    const timer = window.setTimeout(() => setIsBooting(false), 700)
    return () => window.clearTimeout(timer)
  }, [])

  const hasError = useMemo(() => touched && !isValidEmail(email), [email, touched])

  const loginMutation = useMutation({
    mutationFn: () => loginEnterprise(email.trim(), password),
    onSuccess: (data) => {
      toast('Welcome back!', 'success')
      setSession(data)
      navigate(getEnterpriseHomeRoute(data.company))
    },
    onError: (err) => toast(err.message || 'Login failed', 'error'),
  })

  const handleSubmit = (event) => {
    event.preventDefault()
    setTouched(true)
    if (!isValidEmail(email) || !password) {
      toast('Enter a valid email and password', 'error')
      return
    }
    loginMutation.mutate()
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

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            id="work-email"
            label="Work Email"
            type="email"
            placeholder="hr@technova.com"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            onBlur={() => setTouched(true)}
            leftIcon={<span className="text-sm font-semibold text-slate-400">@</span>}
            error={hasError}
            autoComplete="email"
            disabled={loginMutation.isPending}
          />
          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loginMutation.isPending}
            autoComplete="current-password"
          />
          {hasError && (
            <p className="m-0 text-[13px] text-red-600" role="alert">
              Enter a valid company email address.
            </p>
          )}

          <Button type="submit" disabled={loginMutation.isPending || !password}>
            {loginMutation.isPending ? 'Signing you in...' : 'Continue to Dashboard'}
          </Button>
        </form>

        <p className="m-0 text-center text-xs text-slate-400">
          Test: hr@technova.com / VeriWork@123
        </p>

        <footer className="flex flex-col items-center gap-3 border-t border-slate-100 pt-6 text-center text-[13px] text-slate-500">
          <p className="m-0">
            New company?{' '}
            <Link to="/enterprise/register" className="font-bold text-[#1a3a8f] no-underline hover:underline">
              Register Now
            </Link>
          </p>
          <p className="m-0">
            Professional?{' '}
            <Link to="/employee/login" className="font-bold text-[#1a3a8f] no-underline hover:underline">
              Employee Portal
            </Link>
          </p>
        </footer>
      </div>

      {loginMutation.isPending && <Loader variant="overlay" label="Authenticating..." />}
    </AuthLayout>
  )
}

export default EnterpriseLogin

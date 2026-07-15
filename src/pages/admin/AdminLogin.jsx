import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import AuthLayout from '../../layouts/AuthLayout'
import BrandLogo from '../../components/common/BrandLogo'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import { loginAdmin } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { useToast } from '../../context/ToastContext'
import { isValidEmail } from '../../utils/validators'

function AdminLogin() {
  const navigate = useNavigate()
  const { loginAdmin: setSession } = useAuth()
  const { toast } = useToast()
  const [email, setEmail] = useState('admin@veriwork.com')
  const [password, setPassword] = useState('Admin@VeriWork123')
  const [touched, setTouched] = useState(false)

  const mutation = useMutation({
    mutationFn: () => loginAdmin(email.trim(), password),
    onSuccess: (data) => {
      setSession(data)
      const isDev = data.accessToken === 'dev-admin-mock-token'
      toast(isDev ? 'Dev admin login (offline mode)' : 'Welcome, Admin', 'success')
      navigate(data.homeRoute || '/admin/dashboard')
    },
    onError: (err) => toast(err.message || 'Login failed', 'error'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValidEmail(email) || !password) {
      toast('Enter valid admin credentials', 'error')
      return
    }
    mutation.mutate()
  }

  return (
    <AuthLayout>
      <div className="flex flex-col gap-7">
        <header className="hidden justify-center lg:flex">
          <BrandLogo size="md" showTagline />
        </header>

        <section className="text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2l8 4v6c0 5-4 8-8 9-4-1-8-4-8-9V6l8-4Z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
          </div>
          <h1 className="m-0 text-[30px] font-extrabold tracking-tight text-slate-900 sm:text-[34px]">
            Admin Console
          </h1>
          <p className="mt-2 text-[15px] leading-relaxed text-slate-500">
            Review and approve enterprise registrations
          </p>
        </section>

        <form className="flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            id="admin-email"
            label="Admin Email"
            type="email"
            placeholder="robin@gmail.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={touched && !isValidEmail(email)}
            autoComplete="email"
            disabled={mutation.isPending}
          />
          <Input
            id="admin-password"
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={mutation.isPending}
            autoComplete="current-password"
          />
          <Button type="submit" disabled={mutation.isPending}>
            {mutation.isPending ? 'Signing in...' : 'Sign In to Admin'}
          </Button>
        </form>

        <p className="m-0 text-center text-xs text-slate-400">
          Backend: admin@veriwork.com / Admin@VeriWork123
        </p>

        <p className="m-0 text-center text-xs text-slate-400">
          Enterprise portal?{' '}
          <Link to="/enterprise/login" className="font-semibold text-[#005fd6] hover:underline">
            Employer Login
          </Link>
        </p>
      </div>

      {mutation.isPending && <Loader variant="overlay" label="Authenticating..." />}
    </AuthLayout>
  )
}

export default AdminLogin

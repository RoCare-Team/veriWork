import { Link, useNavigate } from 'react-router-dom'
import EmployeeAuthLayout from '../../layouts/EmployeeAuthLayout'
import EmployeeBrandHeader from '../../components/employee/EmployeeBrandHeader'
import GoogleSignInButton from '../../components/employee/GoogleSignInButton'

function VerifiedCheckIcon({ className = 'h-16 w-16' }) {
  return (
    <svg className={`mx-auto text-slate-900 ${className}`} viewBox="0 0 64 64" fill="none" aria-hidden="true">
      <path d="M18 34l10 10 18-20" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function EmployeeWelcome() {
  const navigate = useNavigate()

  return (
    <EmployeeAuthLayout
      heroTitle="Build Your VeriScore"
      heroSubtitle="India's professional trust score for employees — verified identity and job history employers can rely on."
    >
      <div className="flex flex-col gap-8 md:gap-10">
        <div className="hidden lg:block">
          <EmployeeBrandHeader badge="Professional Trust Platform" />
        </div>

        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <VerifiedCheckIcon className="h-14 w-14 md:h-16 md:w-16 lg:h-20 lg:w-20" />
          <h2 className="m-0 mt-5 text-2xl font-extrabold tracking-tight text-[#1a3a8f] md:text-3xl">
            Get Your Employee Score
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-500 md:text-base">
            Like CIBIL for your career — build a verified profile and score that companies use for hiring and workforce
            management.
          </p>
        </div>

        <div>
          <p className="m-0 mb-3 text-sm font-bold text-slate-800 md:text-base">Get Started</p>
          <GoogleSignInButton />
          <button
            type="button"
            onClick={() => navigate('/employee/otp')}
            className="mt-3 w-full rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-[#1a3a8f] transition hover:bg-slate-50 md:text-base"
          >
            Sign in with Phone OTP
          </button>
        </div>

        <p className="m-0 text-center text-sm text-slate-500 lg:text-left">
          Employer?{' '}
          <Link to="/enterprise/login" className="font-bold text-[#1a3a8f] no-underline hover:underline">
            Enterprise Portal
          </Link>
        </p>
      </div>
    </EmployeeAuthLayout>
  )
}

export default EmployeeWelcome

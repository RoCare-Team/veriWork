import { Link, useNavigate } from 'react-router-dom'
import EmployeeAuthLayout from '../../layouts/EmployeeAuthLayout'

function EmployeeWelcome() {
  const navigate = useNavigate()

  return (
    <EmployeeAuthLayout
      heroTitle="Build Your PagerLook Score"
      heroSubtitle="India's professional trust score for employees — verified identity and job history employers can rely on."
    >
      {/* Single logo only: the hero (desktop) and the mobile brand strip already
          carry it, so the form panel leads straight with the heading. */}
      <div className="flex flex-col gap-8">
        <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
          <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600">
            <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 12.5l4 4 8-9" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <h2 className="m-0 mt-5 text-2xl font-bold tracking-tight text-ink-strong md:text-3xl">
            Get Your Employee Score
          </h2>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-ink-muted md:text-base">
            Like CIBIL for your career — build a verified profile and score that companies use for hiring and workforce
            management.
          </p>
        </div>

        <div>
          <p className="m-0 mb-3 text-sm font-semibold text-ink-strong">Get started</p>
          <button
            type="button"
            onClick={() => navigate('/employee/otp')}
            className="w-full rounded-ctl bg-brand-600 py-3.5 text-sm font-semibold text-white outline-none transition-colors duration-150 ease-swift hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500/40 md:text-base"
          >
            Sign in with Phone OTP
          </button>
        </div>

        <p className="m-0 text-center text-sm text-ink-muted lg:text-left">
          Employer?{' '}
          <Link to="/enterprise/login" className="font-semibold text-brand-600 no-underline hover:underline">
            Enterprise Portal
          </Link>
        </p>
      </div>
    </EmployeeAuthLayout>
  )
}

export default EmployeeWelcome

import { Link } from 'react-router-dom'
import BrandLogo from '../components/common/BrandLogo'
import StepProgress from '../components/common/StepProgress'

function BackIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M12.5 15L7.5 10l5-5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function OnboardingLayout({
  step,
  totalSteps,
  title,
  subtitle,
  steps = [],
  backTo = '/enterprise/login',
  children,
  footer,
}) {
  return (
    <div className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[minmax(320px,380px)_1fr] xl:grid-cols-[minmax(360px,420px)_1fr]">
      {/* Mobile header */}
      <div className="flex items-center justify-between border-b border-slate-100 bg-white px-5 py-4 lg:hidden">
        <Link
          to={backTo}
          className="flex h-10 w-10 items-center justify-center rounded-2xl text-slate-700 transition hover:bg-slate-100"
          aria-label="Go back"
        >
          <BackIcon />
        </Link>
        <span className="rounded-full bg-blue-50 px-3 py-1.5 text-xs font-semibold text-[#1e3a8a]">
          Step {step} of {totalSteps}
        </span>
      </div>

      {/* Desktop sidebar */}
      <aside className="relative m-0 hidden overflow-hidden rounded-none bg-gradient-to-br from-[#172554] via-[#1e3a8a] to-[#2748a6] lg:m-4 lg:flex lg:flex-col lg:justify-between lg:rounded-3xl lg:p-10 xl:m-5 xl:rounded-[2rem] xl:p-12">
        <div
          className="pointer-events-none absolute inset-0 rounded-3xl opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />

        <div className="relative z-10">
          <BrandLogo size="md" theme="light" showTagline />
        </div>

        {steps.length > 0 && (
          <div className="relative z-10 flex-1 py-10">
            <p className="mb-6 text-xs font-bold uppercase tracking-widest text-white/50">
              Onboarding Progress
            </p>
            <StepProgress steps={steps} currentStep={step} variant="vertical" />
          </div>
        )}

        <div className="relative z-10">
          <p className="text-sm leading-relaxed text-white/60">
            Need help? Contact{' '}
            <a href="mailto:support@veriwork.com" className="font-semibold text-white/90 underline">
              support@veriwork.com
            </a>
          </p>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex min-h-screen flex-col lg:min-h-0 lg:py-4 lg:pr-4 xl:py-5 xl:pr-5">
        <header className="hidden rounded-3xl border border-slate-100 bg-white py-6 pl-10 pr-8 shadow-sm lg:block xl:pl-14 xl:pr-12 xl:py-8">
          <div className="mx-auto flex w-full max-w-4xl items-start justify-between gap-4">
            <div>
              <Link
                to={backTo}
                className="mb-4 inline-flex items-center gap-1.5 rounded-xl px-2 py-1 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-[#1e3a8a]"
              >
                <BackIcon />
                Back
              </Link>
              <h1 className="m-0 text-2xl font-extrabold tracking-tight text-slate-900 xl:text-3xl">
                {title}
              </h1>
              {subtitle && (
                <p className="mt-2 max-w-2xl text-sm leading-relaxed text-slate-500 md:text-[15px]">
                  {subtitle}
                </p>
              )}
            </div>
            <span className="shrink-0 rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-[#1e3a8a]">
              Step {step} of {totalSteps}
            </span>
          </div>
        </header>

        {/* Mobile title */}
        <div className="border-b border-slate-100 bg-white px-5 py-5 lg:hidden">
          <h1 className="m-0 text-xl font-extrabold tracking-tight text-slate-900">{title}</h1>
          {subtitle && <p className="mt-1.5 text-sm leading-relaxed text-slate-500">{subtitle}</p>}
        </div>

        <main className="flex-1 overflow-y-auto px-5 py-6 sm:pl-8 sm:pr-6 md:py-8 lg:pl-10 lg:pr-6 xl:pl-14 xl:pr-8">
          <div className="w-full max-w-4xl">{children}</div>
        </main>

        {footer && (
          <footer className="rounded-3xl border border-slate-100 bg-white px-5 py-4 shadow-sm sm:pl-8 sm:pr-6 lg:ml-0 lg:pl-10 lg:pr-6 xl:pl-14 xl:pr-8">
            <div className="w-full max-w-4xl">{footer}</div>
          </footer>
        )}
      </div>
    </div>
  )
}

export default OnboardingLayout

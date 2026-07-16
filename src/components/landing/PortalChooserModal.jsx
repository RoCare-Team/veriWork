import { useEffect } from 'react'
import { Link } from 'react-router-dom'

/*
 * "Get started" splits the two audiences before routing: an employer registers
 * a company, a professional builds their own score. Shown as a modal so the
 * choice is explicit rather than dumping everyone on the enterprise form.
 */

function EmployerIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M8.5 7.5V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v1.5M3.5 12.5h17" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ProfessionalIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="8" r="3.5" stroke="currentColor" strokeWidth="1.6" />
      <path d="M5.5 19.5c0-3.6 2.9-5.5 6.5-5.5s6.5 1.9 6.5 5.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 10h11M11 6l4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const OPTIONS = [
  {
    to: '/enterprise/register',
    icon: <EmployerIcon />,
    title: "I'm an Employer",
    body: 'Register your company, verify your workforce, and hire with confidence.',
    cta: 'Continue as Enterprise',
  },
  {
    to: '/employee',
    icon: <ProfessionalIcon />,
    title: "I'm a Professional",
    body: 'Build your Aadhaar-verified profile and PagerLook score employers trust.',
    cta: 'Continue as Professional',
  },
]

function PortalChooserModal({ open, onClose }) {
  useEffect(() => {
    if (!open) return undefined
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label="Choose how to continue">
      <button type="button" className="absolute inset-0 bg-ink-strong/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />

      <div className="animate-fade-in relative z-10 w-full max-w-xl overflow-hidden rounded-t-3xl border border-hairline bg-surface p-6 shadow-lg sm:rounded-3xl md:p-8">
        <div className="text-center">
          <h2 className="m-0 text-xl font-bold tracking-tight text-ink-strong md:text-2xl">How do you want to get started?</h2>
          <p className="m-0 mt-2 text-sm text-ink-muted">Pick the portal that fits you — you can switch anytime.</p>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {OPTIONS.map((opt) => (
            <Link
              key={opt.to}
              to={opt.to}
              onClick={onClose}
              className="group flex flex-col rounded-2xl border border-hairline bg-surface p-5 no-underline outline-none transition-all duration-150 ease-swift hover:-translate-y-0.5 hover:border-brand-200 hover:shadow-md focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-50 text-brand-600 transition-colors duration-150 ease-swift group-hover:bg-brand-600 group-hover:text-white">
                {opt.icon}
              </span>
              <span className="mt-4 text-base font-semibold text-ink-strong">{opt.title}</span>
              <span className="mt-1 flex-1 text-sm leading-relaxed text-ink-muted">{opt.body}</span>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600">
                {opt.cta}
                <span className="transition-transform duration-150 ease-swift group-hover:translate-x-0.5">
                  <ArrowIcon />
                </span>
              </span>
            </Link>
          ))}
        </div>

        <p className="m-0 mt-5 text-center text-sm text-ink-muted">
          Already have an account?{' '}
          <Link to="/employee/login" onClick={onClose} className="font-semibold text-brand-600 no-underline hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}

export default PortalChooserModal

import { Link } from 'react-router-dom'
import { JOURNEY_STEPS } from '../../utils/employeeJourney'

/**
 * The one progress bar for the whole employee journey.
 *
 * `completed` is authoritative (from the profile) so a step the user finished
 * out of order still shows a tick; `currentStep` only highlights where they are.
 */
function VerificationStepBar({ currentStep, completed = [], className = '' }) {
  const currentIndex = JOURNEY_STEPS.findIndex((s) => s.id === currentStep)

  return (
    <nav
      className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`.trim()}
      aria-label="Verification progress"
    >
      {JOURNEY_STEPS.map((step, index) => {
        const isComplete = completed.includes(step.id) || currentStep === 'complete'
        const isCurrent = step.id === currentStep
        const isUpcoming = !isComplete && !isCurrent && currentIndex < index

        return (
          <div key={step.id} className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition sm:h-9 sm:w-9 sm:text-sm ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-brand-600 text-white ring-4 ring-brand-600/15'
                      : 'bg-slate-100 text-slate-400'
                }`}
              >
                {isComplete ? (
                  <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path
                      d="M6 10l3 3 6-7"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                ) : (
                  index + 1
                )}
              </span>
              <span
                className={`hidden text-[11px] font-semibold sm:block ${
                  isCurrent ? 'text-brand-600' : isUpcoming ? 'text-slate-400' : 'text-green-600'
                }`}
              >
                {step.label}
              </span>
              {/* Say up front which steps can be skipped, and what they're worth. */}
              {!step.required && (
                <span className="hidden text-[9px] font-bold uppercase tracking-wide text-slate-400 sm:block">
                  +{step.points}
                </span>
              )}
            </div>

            {index < JOURNEY_STEPS.length - 1 && (
              <div
                className={`mb-6 h-0.5 w-5 sm:w-8 md:w-12 ${
                  isComplete ? 'bg-green-400' : 'bg-slate-200'
                }`}
              />
            )}
          </div>
        )
      })}
    </nav>
  )
}

export function VerificationBackLink({ to = '/employee/verification', children = 'Back to verification hub' }) {
  return (
    <Link
      to={to}
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a8a] no-underline hover:underline"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M12 5 7 10l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  )
}

export default VerificationStepBar

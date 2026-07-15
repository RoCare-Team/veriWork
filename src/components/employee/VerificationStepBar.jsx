import { Link } from 'react-router-dom'
import { VERIFICATION_STEP_LABELS } from '../../utils/employeeConstants'

const STEPS = ['profile', 'aadhaar', 'biometric']

function VerificationStepBar({ currentStep, className = '' }) {
  const currentIndex = STEPS.indexOf(currentStep)

  return (
    <nav
      className={`flex items-center justify-center gap-1 sm:gap-2 ${className}`.trim()}
      aria-label="Verification progress"
    >
      {STEPS.map((step, index) => {
        const isComplete = currentIndex > index || currentStep === 'complete'
        const isCurrent = step === currentStep
        const isUpcoming = currentIndex < index && currentStep !== 'complete'

        return (
          <div key={step} className="flex items-center gap-1 sm:gap-2">
            <div className="flex flex-col items-center gap-1">
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition sm:h-9 sm:w-9 sm:text-sm ${
                  isComplete
                    ? 'bg-green-500 text-white'
                    : isCurrent
                      ? 'bg-[#005fd6] text-white ring-4 ring-blue-100'
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
                  isCurrent ? 'text-[#005fd6]' : isUpcoming ? 'text-slate-400' : 'text-green-600'
                }`}
              >
                {VERIFICATION_STEP_LABELS[step]}
              </span>
            </div>

            {index < STEPS.length - 1 && (
              <div
                className={`mb-4 h-0.5 w-6 sm:mb-5 sm:w-10 md:w-14 ${
                  currentIndex > index ? 'bg-green-400' : 'bg-slate-200'
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
      className="mb-5 inline-flex items-center gap-1.5 text-sm font-semibold text-[#005fd6] no-underline hover:underline"
    >
      <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M12 5 7 10l5 5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      {children}
    </Link>
  )
}

export default VerificationStepBar

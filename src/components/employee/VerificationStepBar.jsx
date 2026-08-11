import { Link } from 'react-router-dom'
import { JOURNEY_STEPS } from '../../utils/employeeJourney'

function CheckGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M6 10l3 3 6-7"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/** Skipped steps get their own glyph — a jumped-over arrow, not a tick, not a number. */
function SkipGlyph() {
  return (
    <svg width="14" height="14" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M5 6l4 4-4 4M11 6l4 4-4 4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/**
 * The one progress bar for the whole employee journey.
 *
 * Every step reads as exactly one of four states, so the journey is never
 * ambiguous:
 *  - done     — green tick (from `completed`, which is authoritative: a step
 *               finished out of order still shows a tick)
 *  - current  — where the user is right now
 *  - skipped  — explicitly jumped over (from `skipped`). Amber + dashed, so it
 *               is visibly *not* the same as "not reached yet"
 *  - upcoming — grey, with what the step is worth
 *
 * A step that is both skipped and later completed shows as done — completion wins.
 */
function VerificationStepBar({
  currentStep,
  completed = [],
  skipped = [],
  onStepSelect,
  className = '',
}) {
  const stateOf = (step) => {
    if (completed.includes(step.id) || currentStep === 'complete') return 'done'
    if (step.id === currentStep) return 'current'
    if (skipped.includes(step.id)) return 'skipped'
    return 'upcoming'
  }

  const CIRCLE = {
    done: 'border-2 border-green-500 bg-green-500 text-white',
    current: 'border-2 border-brand-600 bg-brand-600 text-white ring-4 ring-brand-600/15',
    skipped: 'border-2 border-dashed border-amber-400 bg-amber-50 text-amber-600',
    upcoming: 'border-2 border-slate-200 bg-slate-100 text-slate-400',
  }

  const LABEL = {
    done: 'text-green-600',
    current: 'text-brand-600',
    skipped: 'text-amber-600',
    upcoming: 'text-slate-400',
  }

  const CONNECTOR = {
    done: 'bg-green-400',
    current: 'bg-slate-200',
    skipped: 'bg-amber-300',
    upcoming: 'bg-slate-200',
  }

  const captionFor = (step, state) => {
    if (state === 'done') return 'Done'
    if (state === 'skipped') return 'Skipped'
    if (state === 'current') return 'In progress'
    return step.required ? 'Required' : `+${step.points} pts`
  }

  return (
    <nav
      className={`flex items-start justify-center gap-1 sm:gap-2 ${className}`.trim()}
      aria-label="Verification progress"
    >
      {JOURNEY_STEPS.map((step, index) => {
        const state = stateOf(step)
        const interactive = typeof onStepSelect === 'function'
        const Marker = interactive ? 'button' : 'div'

        return (
          <div key={step.id} className="flex items-start gap-1 sm:gap-2">
            <Marker
              {...(interactive
                ? {
                    type: 'button',
                    onClick: () => onStepSelect(step.id, index),
                    'aria-current': state === 'current' ? 'step' : undefined,
                    title: `${step.label} — ${captionFor(step, state)}`,
                  }
                : {})}
              className={`flex w-[74px] flex-col items-center gap-1 rounded-xl bg-transparent p-1 text-center outline-none sm:w-[92px] ${
                interactive
                  ? 'cursor-pointer transition hover:bg-slate-50 focus-visible:ring-2 focus-visible:ring-brand-600/30'
                  : ''
              }`}
            >
              <span
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold transition sm:h-9 sm:w-9 sm:text-sm ${CIRCLE[state]}`}
              >
                {state === 'done' ? (
                  <CheckGlyph />
                ) : state === 'skipped' ? (
                  <SkipGlyph />
                ) : (
                  index + 1
                )}
              </span>

              <span className={`hidden text-[11px] font-semibold leading-tight sm:block ${LABEL[state]}`}>
                {step.label}
              </span>

              {/* One caption line per step — always present, so the row never
                  jumps height as a step changes state. */}
              <span
                className={`hidden text-[9px] font-bold uppercase tracking-wide sm:block ${
                  state === 'skipped' ? 'text-amber-500' : 'text-slate-400'
                }`}
              >
                {captionFor(step, state)}
              </span>
            </Marker>

            {index < JOURNEY_STEPS.length - 1 && (
              <div className={`mt-4 h-0.5 w-5 rounded-full sm:mt-[18px] sm:w-8 md:w-12 ${CONNECTOR[state]}`} />
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

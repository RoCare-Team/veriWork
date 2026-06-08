import { Link } from 'react-router-dom'
import { CheckCircleIcon, UserCircleIcon, IdCardIcon, FaceIcon } from '../common/Icons'

const ICONS = {
  profile: UserCircleIcon,
  aadhaar: IdCardIcon,
  biometric: FaceIcon,
}

function VerificationStepCard({ step, onClick }) {
  const Icon = ICONS[step.id] || UserCircleIcon
  const isCompleted = step.status === 'completed'
  const isCurrent = step.status === 'current'
  const isLocked = step.status === 'locked'
  const isPending = step.status === 'pending'
  const isClickable = Boolean(step.to) && (isPending || isCurrent)

  const content = (
    <>
      <div className="flex flex-col items-center gap-1">
        <span
          className={`text-[10px] font-bold uppercase tracking-wider ${
            isCompleted ? 'text-green-600' : isCurrent ? 'text-[#1a3a8f]' : 'text-slate-400'
          }`}
        >
          Step {step.step}
        </span>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${
            isCompleted
              ? 'bg-green-50 text-green-600'
              : isCurrent
                ? 'bg-[#1a3a8f] text-white'
                : isLocked
                  ? 'bg-slate-50 text-slate-300'
                  : 'bg-slate-100 text-slate-500'
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="min-w-0 flex-1 text-left">
        <div className="flex flex-wrap items-center gap-2">
          <p className="m-0 text-sm font-bold text-slate-900">{step.title}</p>
          {isCurrent && (
            <span className="rounded-full bg-[#1a3a8f]/10 px-2 py-0.5 text-[10px] font-bold uppercase text-[#1a3a8f]">
              Current
            </span>
          )}
          {isLocked && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase text-slate-400">
              Locked
            </span>
          )}
          {step.duration && !isCompleted && (
            <span className="text-[10px] font-medium text-slate-400">{step.duration}</span>
          )}
        </div>
        <p className="m-0 mt-0.5 text-xs text-slate-500">{step.subtitle}</p>
        {step.description && (
          <p className="m-0 mt-1.5 text-xs leading-relaxed text-slate-400">{step.description}</p>
        )}
      </div>

      <CheckCircleIcon
        className={`h-5 w-5 shrink-0 ${isCompleted ? 'text-green-500' : 'text-slate-300'}`}
        filled={isCompleted}
      />
    </>
  )

  const className = `flex w-full items-center gap-3.5 rounded-2xl border bg-white p-4 transition md:p-5 ${
    isCompleted
      ? 'border-green-100'
      : isCurrent
        ? 'border-[#1a3a8f]/30 shadow-md shadow-blue-900/5 ring-1 ring-[#1a3a8f]/10'
        : isLocked
          ? 'cursor-not-allowed border-slate-100 opacity-60'
          : isPending && step.to
            ? 'border-slate-200 hover:border-[#1a3a8f]/30 hover:shadow-sm'
            : 'border-slate-100'
  }`

  if (isClickable) {
    return (
      <Link to={step.to} className={`${className} no-underline`} onClick={onClick}>
        {content}
      </Link>
    )
  }

  return (
    <div className={className} aria-disabled={isLocked}>
      {content}
    </div>
  )
}

export default VerificationStepCard

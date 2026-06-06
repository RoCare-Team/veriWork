function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path
        d="M3 7l3 3 5-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function StepProgress({ steps, currentStep, variant = 'horizontal' }) {
  if (variant === 'vertical') {
    return (
      <ol className="m-0 flex list-none flex-col gap-0 p-0">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isDone = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          const isLast = index === steps.length - 1

          return (
            <li key={step} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    isDone || isActive
                      ? 'bg-[#1a3a8f] text-white shadow-md shadow-blue-900/20'
                      : 'border-2 border-white/30 bg-white/10 text-white/50'
                  }`}
                >
                  {isDone ? <CheckIcon /> : stepNumber}
                </div>
                {!isLast && (
                  <div
                    className={`my-1 w-0.5 flex-1 min-h-[32px] ${isDone ? 'bg-white/40' : 'bg-white/15'}`}
                  />
                )}
              </div>
              <div className={`pb-8 ${isLast ? 'pb-0' : ''}`}>
                <p
                  className={`m-0 text-sm font-semibold ${isActive ? 'text-white' : 'text-white/60'}`}
                >
                  {step}
                </p>
                {isActive && (
                  <p className="mt-1 text-xs text-white/50">In progress</p>
                )}
                {isDone && (
                  <p className="mt-1 text-xs text-white/50">Completed</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-5 md:p-6">
      <div className="flex items-center">
        {steps.map((step, index) => {
          const stepNumber = index + 1
          const isDone = stepNumber < currentStep
          const isActive = stepNumber === currentStep
          const isLast = index === steps.length - 1

          return (
            <div key={step} className={`flex items-center ${isLast ? '' : 'flex-1'}`}>
              <div className="flex flex-col items-center gap-2">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition ${
                    isDone || isActive
                      ? 'bg-[#1a3a8f] text-white shadow-md shadow-blue-900/15'
                      : 'border-2 border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  {isDone ? <CheckIcon /> : stepNumber}
                </div>
                <span
                  className={`hidden max-w-[100px] text-center text-[11px] font-semibold leading-tight sm:block md:max-w-none md:text-xs ${
                    isActive ? 'text-[#1a3a8f]' : 'text-slate-500'
                  }`}
                >
                  {step}
                </span>
              </div>
              {!isLast && (
                <div
                  className={`mx-2 h-0.5 flex-1 md:mx-4 ${isDone ? 'bg-[#1a3a8f]/40' : 'bg-slate-200'}`}
                />
              )}
            </div>
          )
        })}
      </div>
      <p className="mt-3 text-center text-xs font-semibold text-[#1a3a8f] sm:hidden">
        {steps[currentStep - 1]}
      </p>
    </div>
  )
}

export default StepProgress

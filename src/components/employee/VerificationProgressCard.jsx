function VerificationProgressCard({ percent = 65, message, currentStep, hint, caption }) {
  const stepHint = {
    profile: 'Step 1 of 3 — Complete your profile',
    aadhaar: 'Step 2 of 3 — Link your Aadhaar',
    biometric: 'Step 3 of 3 — Biometric face match',
    complete: 'All steps complete',
  }
  const radius = 54
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (percent / 100) * circumference

  return (
    <div className="rounded-3xl bg-gradient-to-br from-[#2748a6] via-[#1e3a8a] to-[#172554] px-6 py-8 text-center text-white shadow-xl shadow-blue-900/20 md:px-8 md:py-10">
      <div className="relative mx-auto h-[140px] w-[140px] md:h-[160px] md:w-[160px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 120 120" aria-hidden="true">
          <circle cx="60" cy="60" r={radius} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="8" />
          <circle
            cx="60"
            cy="60"
            r={radius}
            fill="none"
            stroke="#4ade80"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-extrabold md:text-4xl">{percent}%</span>
          <span className="text-xs font-medium text-white/70">Verified</span>
        </div>
      </div>

      <h2 className="m-0 mt-5 text-xl font-extrabold md:text-2xl">
        {message || (percent >= 100 ? 'All verified!' : 'Almost there!')}
      </h2>
      {/* `hint`/`caption` let a caller drive the copy directly (e.g. the identity
          hub, which speaks in checks-done rather than the old 3-step model). */}
      {(hint || (currentStep && currentStep !== 'complete')) && (
        <p className="m-0 mt-3 text-xs font-semibold uppercase tracking-wide text-white/60">
          {hint || stepHint[currentStep]}
        </p>
      )}
      <p className="mx-auto mt-2 max-w-xs text-sm leading-relaxed text-white/75">
        {caption
          ? caption
          : percent >= 100
            ? 'Your Professional ID and Trust Score are now fully unlocked.'
            : currentStep === 'profile'
              ? 'Add your name and role to begin the verification journey.'
              : currentStep === 'aadhaar'
                ? 'Verify Aadhaar via DigiLocker — takes about 2 minutes.'
                : currentStep === 'biometric'
                  ? 'One last selfie to match your face with your ID photo.'
                  : 'Complete all 3 steps to unlock your full Trust Score.'}
      </p>
    </div>
  )
}

export default VerificationProgressCard

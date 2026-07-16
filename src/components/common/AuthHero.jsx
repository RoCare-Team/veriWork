/*
 * Shared auth hero — the left panel on every login/onboarding screen.
 *
 * One component so enterprise and employee auth stay identical. It replaces the
 * old flat azure gradient with the logo's real shield ramp (navy → indigo →
 * azure) and a self-contained SVG "verified professional" scene — no external
 * image, nothing to load. Copy and the stat chips are passed in per portal.
 */

function VerifiedIdIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-sm select-none" aria-hidden="true">
      {/* Ambient glow behind the card */}
      <div className="pointer-events-none absolute -inset-6 rounded-[2.5rem] bg-white/10 blur-2xl" />

      {/* Shield watermark, upper-right */}
      <svg
        className="pointer-events-none absolute -right-4 -top-8 h-28 w-28 text-white/[0.07]"
        viewBox="0 0 100 100"
        fill="currentColor"
      >
        <path d="M50 4l38 14v28c0 22-16 39-38 46C28 85 12 68 12 46V18L50 4Z" />
      </svg>

      {/* The ID card */}
      <div className="animate-fade-in relative rounded-3xl border border-white/15 bg-white/[0.09] p-6 shadow-[0_30px_80px_rgba(5,10,30,0.45)] backdrop-blur-xl">
        {/* Header row: avatar + identity lines + verified badge */}
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-white/90 to-white/60 text-lg font-bold text-brand-700 shadow-inner">
            RS
          </div>
          <div className="min-w-0 flex-1">
            <div className="h-2.5 w-24 rounded-full bg-white/80" />
            <div className="mt-2 h-2 w-16 rounded-full bg-white/35" />
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/20 px-2.5 py-1 text-[11px] font-semibold text-emerald-100 ring-1 ring-emerald-300/30">
            <svg className="h-3 w-3" viewBox="0 0 16 16" fill="none">
              <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Verified
          </span>
        </div>

        {/* PagerLook Score ring */}
        <div className="mt-6 flex items-center gap-5">
          <div className="relative h-24 w-24 shrink-0">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r="42" fill="none" stroke="rgba(255,255,255,0.14)" strokeWidth="9" />
              <circle
                cx="50"
                cy="50"
                r="42"
                fill="none"
                stroke="url(#veriscore)"
                strokeWidth="9"
                strokeLinecap="round"
                strokeDasharray="264"
                strokeDashoffset="58"
              />
              <defs>
                <linearGradient id="veriscore" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0" stopColor="#6ee7b7" />
                  <stop offset="1" stopColor="#38bdf8" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-extrabold leading-none text-white">820</span>
              <span className="mt-0.5 text-[9px] font-semibold uppercase tracking-wider text-white/55">
                PagerLook Score
              </span>
            </div>
          </div>

          {/* Verified attribute rows */}
          <ul className="m-0 flex-1 list-none space-y-2.5 p-0">
            {['Identity', 'Employment', 'Documents'].map((row) => (
              <li key={row} className="flex items-center gap-2.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-emerald-400/20 ring-1 ring-emerald-300/30">
                  <svg className="h-3 w-3 text-emerald-200" viewBox="0 0 16 16" fill="none">
                    <path d="M3.5 8.5l3 3 6-6.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span className="text-sm font-medium text-white/80">{row}</span>
                <span className="ml-auto h-1.5 w-1.5 rounded-full bg-emerald-300" />
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Floating trust chips */}
      <div className="animate-fade-in absolute -left-5 top-1/3 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/15 text-white">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none">
              <path d="M10 2.5l6.25 2.4v4.85c0 3.6-2.65 6.4-6.25 7.25-3.6-.85-6.25-3.65-6.25-7.25V4.9L10 2.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M7.4 9.9l1.85 1.85 3.35-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="text-[11px] font-semibold text-white/85">Aadhaar eKYC</span>
        </div>
      </div>

      <div className="animate-fade-in absolute -right-4 bottom-6 rounded-2xl border border-white/15 bg-white/10 px-3 py-2 shadow-lg backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-400/20 text-emerald-100">
            <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none">
              <circle cx="10" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
              <path d="M4.5 16c0-3 2.5-4.75 5.5-4.75S15.5 13 15.5 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </span>
          <span className="text-[11px] font-semibold text-white/85">Biometric match</span>
        </div>
      </div>
    </div>
  )
}

function AuthHero({ eyebrow, title, subtitle, stats = [] }) {
  return (
    <aside className="relative hidden overflow-hidden bg-gradient-to-br from-brand-950 via-brand-900 to-brand-600 lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-14">
      {/* Faint grid + ambient orbs for depth */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
          backgroundSize: '46px 46px',
        }}
      />
      <div className="pointer-events-none absolute -right-24 -top-20 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-96 w-96 rounded-full bg-brand-500/25 blur-3xl" />

      {/* Brand + copy */}
      <div className="relative z-10">
        <div className="inline-flex items-center rounded-2xl bg-white px-4 py-2.5 shadow-lg shadow-black/20 ring-1 ring-black/5">
          <img src="/pagerLookLogo.png" alt="PagerLook" className="h-11 w-auto object-contain" draggable="false" />
        </div>
        {eyebrow && (
          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.22em] text-white/60">{eyebrow}</p>
        )}
        <h2 className="mt-3 max-w-md text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-[2.6rem]">
          {title}
        </h2>
        <p className="mt-4 max-w-md text-base leading-relaxed text-white/70">{subtitle}</p>
      </div>

      {/* Illustration */}
      <div className="relative z-10 my-8">
        <VerifiedIdIllustration />
      </div>

      {/* Stat chips */}
      {stats.length > 0 && (
        <ul className="relative z-10 m-0 grid list-none grid-cols-3 gap-3 p-0">
          {stats.map((item) => (
            <li key={item.label} className="rounded-2xl border border-white/12 bg-white/[0.07] px-4 py-4 backdrop-blur-sm">
              <strong className="block text-base font-bold text-white">{item.value}</strong>
              <span className="mt-1 block text-[11px] text-white/60">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </aside>
  )
}

export default AuthHero

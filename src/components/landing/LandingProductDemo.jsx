import { useEffect, useRef, useState } from 'react'

/**
 * Self-playing "how PagerLook works" demo — a video-like walkthrough of the
 * whole Professional Trust Platform concept, done in pure CSS/React so it needs
 * no video asset:
 *   1. Verify once   — identity, employment, education, documents
 *   2. Trust Score   — one AI score, reusable everywhere (CIBIL-for-careers)
 *   3. You own it    — consent-based, employee approves every access
 *   4. Hire faster   — employers reuse verified data, no re-verification
 * Auto-advances, pauses on hover, and starts when scrolled into view.
 */

const SCENE_MS = 3800

const STEPS = [
  {
    key: 'verify',
    tag: 'Step 1',
    title: 'Verify once, not every time',
    blurb: 'Identity, employment, education and documents are checked a single time and locked to a tamper-proof professional profile.',
  },
  {
    key: 'score',
    tag: 'Step 2',
    title: 'Get one AI Trust Score',
    blurb: 'Every verified signal rolls into a single reusable score — like CIBIL, but for your career — that travels with you.',
  },
  {
    key: 'consent',
    tag: 'Step 3',
    title: 'You own it — access is consent-based',
    blurb: 'Your verified identity is yours. Employers must request access, and nothing is shared until you approve it.',
  },
  {
    key: 'hire',
    tag: 'Step 4',
    title: 'Employers hire faster',
    blurb: 'Companies reuse your verified data instantly — confident hiring decisions in minutes, with zero repeat verification.',
  },
]

const VERIFY_ITEMS = [
  { label: 'Identity', sub: 'Aadhaar · DigiLocker · Face' },
  { label: 'Employment', sub: 'Past employers confirmed' },
  { label: 'Education', sub: '10th · 12th · Graduation' },
  { label: 'Documents', sub: 'Offer letters · Certificates' },
]

function CheckIcon({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* ── Scene 1: verification chips ticking to ✓ Verified ── */
function VerifyScene() {
  return (
    <div className="pld-enter grid w-full max-w-md grid-cols-1 gap-3">
      {VERIFY_ITEMS.map((item, i) => (
        <div
          key={item.label}
          className="pld-row flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3.5 shadow-sm"
          style={{ animationDelay: `${i * 0.28}s` }}
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1e3a8a]">
            <CheckIcon className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="m-0 text-sm font-bold text-slate-900">{item.label}</p>
            <p className="m-0 text-xs text-slate-500">{item.sub}</p>
          </div>
          <span
            className="pld-badge flex shrink-0 items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
            style={{ animationDelay: `${0.35 + i * 0.28}s` }}
          >
            <CheckIcon /> Verified
          </span>
        </div>
      ))}
    </div>
  )
}

/* ── Scene 2: animated Trust Score gauge ── */
function ScoreScene() {
  const [n, setN] = useState(0)
  const target = 98
  useEffect(() => {
    let raf
    const start = performance.now()
    const dur = 1100
    const tick = (t) => {
      const p = Math.min(1, (t - start) / dur)
      const eased = 1 - Math.pow(1 - p, 3)
      setN(Math.round(eased * target))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [])

  const r = 58
  const circ = 2 * Math.PI * r
  const off = circ - (target / 100) * circ

  return (
    <div className="pld-enter flex w-full max-w-md flex-col items-center">
      <div className="relative h-[172px] w-[172px]">
        <svg className="h-full w-full -rotate-90" viewBox="0 0 140 140" aria-hidden="true">
          <circle cx="70" cy="70" r={r} fill="none" stroke="#e2e8f0" strokeWidth="10" />
          <circle
            className="pld-gauge"
            cx="70"
            cy="70"
            r={r}
            fill="none"
            stroke="url(#pldScore)"
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circ}
            style={{ '--pld-circ': circ, '--pld-off': off }}
          />
          <defs>
            <linearGradient id="pldScore" x1="0" y1="0" x2="140" y2="140" gradientUnits="userSpaceOnUse">
              <stop stopColor="#0086ec" />
              <stop offset="1" stopColor="#1e3a8a" />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-extrabold text-slate-900">{n}</span>
          <span className="text-[11px] font-bold uppercase tracking-wide text-slate-400">Trust Score</span>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {['Identity Verified', 'Employment Verified', 'Education Verified'].map((t, i) => (
          <span
            key={t}
            className="pld-badge flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700"
            style={{ animationDelay: `${0.5 + i * 0.2}s` }}
          >
            <CheckIcon /> {t}
          </span>
        ))}
      </div>
    </div>
  )
}

/* ── Scene 3: consent request → approved ── */
function ConsentScene() {
  return (
    <div className="pld-enter w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1e3a8a] text-sm font-bold text-white">AC</span>
          <div>
            <p className="m-0 text-sm font-bold text-slate-900">Acme Corp</p>
            <p className="m-0 text-xs text-slate-500">wants access to your verified profile</p>
          </div>
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-xs text-slate-600">
          Requesting: Identity · Employment history · Trust Score
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <button type="button" className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-500">
            Deny
          </button>
          <button type="button" className="pld-approve relative h-11 overflow-hidden rounded-xl bg-[#1e3a8a] text-sm font-semibold text-white">
            Approve
          </button>
        </div>

        <div className="pld-shared mt-4 flex items-center justify-center gap-2 rounded-2xl bg-emerald-50 px-4 py-3 text-sm font-semibold text-emerald-700">
          <CheckIcon className="h-4 w-4" /> Shared securely · consent logged
        </div>
      </div>
    </div>
  )
}

/* ── Scene 4: employer hires faster ── */
function HireScene() {
  return (
    <div className="pld-enter w-full max-w-md">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="m-0 text-[11px] font-bold uppercase tracking-widest text-[#1e3a8a]">Employer view</p>
        <div className="mt-3 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#1e3a8a] to-[#2748a6] text-sm font-bold text-white">PS</span>
          <div>
            <p className="m-0 text-base font-extrabold text-slate-900">Priya Sharma</p>
            <p className="m-0 text-xs text-slate-500">Senior Software Engineer</p>
          </div>
          <span className="pld-badge ml-auto flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-bold text-emerald-700">
            <CheckIcon /> Verified
          </span>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {['Identity', 'Employment', 'Education'].map((t, i) => (
            <div
              key={t}
              className="pld-row rounded-xl border border-slate-100 bg-slate-50 px-2 py-2.5 text-center"
              style={{ animationDelay: `${i * 0.15}s` }}
            >
              <CheckIcon className="mx-auto h-4 w-4 text-emerald-600" />
              <p className="m-0 mt-1 text-[11px] font-semibold text-slate-600">{t}</p>
            </div>
          ))}
        </div>

        <div className="pld-shared mt-4 rounded-2xl bg-[#1e3a8a] px-4 py-3 text-center text-sm font-bold text-white">
          Hired in under 2 minutes — no re-verification
        </div>
      </div>
    </div>
  )
}

function Scene({ index }) {
  if (index === 0) return <VerifyScene />
  if (index === 1) return <ScoreScene />
  if (index === 2) return <ConsentScene />
  return <HireScene />
}

function LandingProductDemo() {
  const [active, setActive] = useState(0)
  const [playing, setPlaying] = useState(false)
  const rootRef = useRef(null)

  // Only start playing once the section scrolls into view.
  useEffect(() => {
    const el = rootRef.current
    if (!el) return undefined
    const obs = new IntersectionObserver(
      ([entry]) => setPlaying(entry.isIntersecting),
      { threshold: 0.35 },
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    if (!playing) return undefined
    const id = setTimeout(() => setActive((a) => (a + 1) % STEPS.length), SCENE_MS)
    return () => clearTimeout(id)
  }, [active, playing])

  return (
    <section id="demo" ref={rootRef} className="scroll-mt-24 bg-white py-20 md:py-28">
      <style>{`
        @keyframes pld-fade { from { opacity:0; transform: translateY(10px);} to { opacity:1; transform:none;} }
        @keyframes pld-row { from { opacity:0; transform: translateX(-12px);} to { opacity:1; transform:none;} }
        @keyframes pld-pop { 0% { opacity:0; transform: scale(.6);} 60% { transform: scale(1.12);} 100% { opacity:1; transform: scale(1);} }
        @keyframes pld-gauge { from { stroke-dashoffset: var(--pld-circ);} to { stroke-dashoffset: var(--pld-off);} }
        @keyframes pld-press { 0%,100% { transform: scale(1);} 45% { transform: scale(.94);} }
        @keyframes pld-shared { 0%,55% { opacity:0; transform: translateY(8px);} 100% { opacity:1; transform:none;} }
        @keyframes pld-progress { from { width:0;} to { width:100%;} }
        .pld-enter { animation: pld-fade .5s ease both; }
        .pld-row { animation: pld-row .5s ease both; }
        .pld-badge { animation: pld-pop .45s ease both; }
        .pld-gauge { animation: pld-gauge 1.2s cubic-bezier(.4,0,.2,1) both; }
        .pld-approve { animation: pld-press .6s ease .5s both; }
        .pld-shared { animation: pld-shared 1.4s ease both; }
        .pld-progress-fill { animation: pld-progress ${SCENE_MS}ms linear both; }
        @media (prefers-reduced-motion: reduce) {
          .pld-enter,.pld-row,.pld-badge,.pld-gauge,.pld-approve,.pld-shared,.pld-progress-fill { animation: none !important; }
          .pld-shared { opacity: 1 !important; }
        }
      `}</style>

      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="m-0 text-sm font-bold uppercase tracking-widest text-[#1e3a8a]">See it in action</p>
          <h2 className="m-0 mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            One verified identity. Endless trusted connections.
          </h2>
          <p className="m-0 mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            Watch how a professional gets verified once, owns their trust, and helps employers hire in minutes.
          </p>
        </div>

        <div className="mt-14 grid items-center gap-8 lg:grid-cols-2 lg:gap-14">
          {/* Player stage */}
          <div
            className="order-2 lg:order-1"
            onMouseEnter={() => setPlaying(false)}
            onMouseLeave={() => setPlaying(true)}
          >
            <div className="relative overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-50 to-blue-50/40 p-6 shadow-xl shadow-blue-900/5 md:p-8">
              <div className="mb-5 flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-amber-300" />
                <span className="h-2.5 w-2.5 rounded-full bg-emerald-300" />
                <span className="ml-2 text-[11px] font-bold uppercase tracking-widest text-slate-400">
                  PagerLook · Live demo
                </span>
              </div>

              <div className="flex min-h-[320px] items-center justify-center">
                <Scene key={active} index={active} />
              </div>

              {/* Progress bar */}
              <div className="mt-6 h-1 w-full overflow-hidden rounded-full bg-slate-200">
                <div key={`${active}-${playing}`} className={`h-full rounded-full bg-[#1e3a8a] ${playing ? 'pld-progress-fill' : 'w-full'}`} />
              </div>
            </div>
          </div>

          {/* Step rail */}
          <div className="order-1 flex flex-col gap-3 lg:order-2">
            {STEPS.map((step, i) => {
              const isActive = i === active
              return (
                <button
                  key={step.key}
                  type="button"
                  onClick={() => setActive(i)}
                  className={`group flex gap-4 rounded-2xl border p-4 text-left transition md:p-5 ${
                    isActive
                      ? 'border-[#1e3a8a]/30 bg-blue-50/60 shadow-sm'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-extrabold transition ${
                      isActive ? 'bg-[#1e3a8a] text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {i + 1}
                  </span>
                  <div className="min-w-0">
                    <p className={`m-0 text-[11px] font-bold uppercase tracking-wide ${isActive ? 'text-[#1e3a8a]' : 'text-slate-400'}`}>
                      {step.tag}
                    </p>
                    <h3 className="m-0 mt-0.5 text-base font-extrabold text-slate-900">{step.title}</h3>
                    <p className={`m-0 mt-1 text-sm leading-relaxed text-slate-600 transition-all ${isActive ? 'max-h-24 opacity-100' : 'max-h-0 overflow-hidden opacity-0 md:max-h-24 md:opacity-100'}`}>
                      {step.blurb}
                    </p>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingProductDemo

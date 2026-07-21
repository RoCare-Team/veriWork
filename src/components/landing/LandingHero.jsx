import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ShieldCheckIcon, CheckCircleIcon } from '../common/Icons'

// One connected story: a Professional and an Employer forming a trusted
// relationship, live. Two parties sit side-by-side with a verified-trust bridge
// between them, and a caption narrates the exchange step by step — so the whole
// idea reads at first glance.
const RELATIONSHIP_STEPS = [
  { cap: 'Acme Corp requests to connect with Priya', side: 'employer' },
  { cap: 'Priya approves the request — consent granted', side: 'employee' },
  { cap: 'Verified identity & Trust Score are shared', side: 'employee' },
  { cap: 'Trust established — relationship secured', side: 'both' },
]

function MiniCheck({ className = 'h-3.5 w-3.5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function PartyCard({ initials, name, role, rows, avatarClass, active }) {
  return (
    <div
      className={`rounded-2xl border p-3.5 transition-all duration-300 ${
        active
          ? 'border-[#1e3a8a]/40 bg-[#1e3a8a]/[0.06] shadow-md shadow-blue-900/10'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="mb-3 flex items-center gap-2.5">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-xs font-bold text-white ${avatarClass}`}>
          {initials}
        </span>
        <div className="min-w-0">
          <p className="m-0 truncate text-sm font-bold text-slate-900">{name}</p>
          <p className="m-0 text-[11px] font-medium text-slate-500">{role}</p>
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map((r) => (
          <div key={r.k} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 text-[11px] ring-1 ring-slate-100">
            <span className="text-slate-500">{r.k}</span>
            <span className={`font-bold ${r.tone === 'green' ? 'text-emerald-600' : 'text-[#1e3a8a]'}`}>{r.v}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function TrustConnectionVisual() {
  const [step, setStep] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setStep((s) => (s + 1) % RELATIONSHIP_STEPS.length), 1900)
    return () => clearInterval(id)
  }, [])

  const { side, cap } = RELATIONSHIP_STEPS[step]
  const leftActive = side === 'employee' || side === 'both'
  const rightActive = side === 'employer' || side === 'both'
  const secured = side === 'both'

  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <style>{`
        @keyframes plflow { to { background-position: -200% 0; } }
        .pl-wire { background: linear-gradient(90deg, rgba(30,58,138,.12) 0%, rgba(30,58,138,.55) 50%, rgba(30,58,138,.12) 100%); background-size: 200% 100%; animation: plflow 1.3s linear infinite; }
        .pl-wire-ok { background: linear-gradient(90deg, rgba(16,185,129,.18) 0%, rgba(16,185,129,.65) 50%, rgba(16,185,129,.18) 100%); background-size: 200% 100%; animation: plflow 1.3s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .pl-wire, .pl-wire-ok { animation: none; } }
      `}</style>

      <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-[#1e3a8a]/15 via-transparent to-[#1e3a8a]/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-300/25 backdrop-blur-sm md:p-8">
        {/* Header — kept on the left so the floating badge never overlaps it. */}
        <div className="mb-5 flex items-center gap-2.5">
          <span className="rounded-full bg-[#1e3a8a]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1e3a8a]">
            Employer ↔ Professional
          </span>
          <span className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Live
          </span>
        </div>

        {/* The relationship: two parties + a verified-trust bridge between them */}
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 md:gap-3">
          <PartyCard
            initials="PS"
            name="Priya Sharma"
            role="Professional"
            avatarClass="bg-gradient-to-br from-[#1e3a8a] to-[#172554]"
            active={leftActive}
            rows={[
              { k: 'Identity', v: 'Verified', tone: 'green' },
              { k: 'Trust Score', v: '98' },
            ]}
          />

          {/* Trust bridge */}
          <div className="flex flex-col items-center gap-1.5 px-0.5">
            <div className={`hidden h-1 w-8 rounded-full md:block ${secured ? 'pl-wire-ok' : 'pl-wire'}`} />
            <span
              className={`flex items-center justify-center rounded-2xl border transition-all duration-300 ${
                secured ? 'border-emerald-200 bg-emerald-50 text-emerald-600' : 'border-[#1e3a8a]/20 bg-[#1e3a8a]/5 text-[#1e3a8a]'
              }`}
              style={{ height: '3.25rem', width: '3.25rem' }}
            >
              {secured ? <MiniCheck className="h-6 w-6" /> : <ShieldCheckIcon className="h-6 w-6" />}
            </span>
            <div className={`hidden h-1 w-8 rounded-full md:block ${secured ? 'pl-wire-ok' : 'pl-wire'}`} />
            <p className={`m-0 text-center text-[9px] font-bold uppercase tracking-widest ${secured ? 'text-emerald-600' : 'text-slate-400'}`}>
              {secured ? 'Secured' : 'Trust'}
            </p>
          </div>

          <PartyCard
            initials="AC"
            name="Acme Corp"
            role="Employer"
            avatarClass="bg-[#1e3a8a]"
            active={rightActive}
            rows={[
              { k: 'Team verified', v: '94%' },
              { k: 'Hiring', v: '3x faster', tone: 'green' },
            ]}
          />
        </div>

        {/* Live narration of the relationship forming */}
        <div className="mt-5 flex items-center gap-2.5 rounded-2xl border border-slate-100 bg-slate-50/70 px-4 py-3">
          <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-white transition-colors ${secured ? 'bg-emerald-500' : 'bg-[#1e3a8a]'}`}>
            <MiniCheck className="h-3 w-3" />
          </span>
          <p className="m-0 flex-1 text-[13px] font-semibold text-slate-700">{cap}</p>
        </div>
        <div className="mt-3 flex justify-center gap-1.5">
          {RELATIONSHIP_STEPS.map((s, i) => (
            <span
              key={s.cap}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? 'w-5 bg-[#1e3a8a]' : 'w-1.5 bg-slate-200'}`}
            />
          ))}
        </div>

        <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
          {[
            { label: 'Verify time', value: '< 2 min' },
            { label: 'Reusable', value: '1 profile' },
            { label: 'Fraud blocked', value: '98%' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="m-0 text-sm font-extrabold text-slate-900">{item.value}</p>
              <p className="m-0 mt-0.5 text-[10px] font-medium text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -right-4 -top-4 hidden rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-xl md:block lg:-right-6">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-emerald-500" filled />
          <div>
            <p className="m-0 text-xs font-bold text-slate-800">Consent-based</p>
            <p className="m-0 text-[11px] text-slate-500">You control every share</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-[#1e3a8a]/10 bg-white px-4 py-3 shadow-xl md:block lg:-left-6">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Verify once</p>
        <p className="m-0 text-lg font-extrabold text-[#1e3a8a]">Use everywhere</p>
      </div>
    </div>
  )
}

const TRUST_PILLS = [
  { icon: ShieldCheckIcon, text: 'Verified identities' },
  { text: 'Faster hiring' },
  { text: 'Stronger relationships' },
]

function LandingHero() {
  return (
    <section
      id="home"
      className="relative overflow-hidden pt-24 pb-20 md:pt-32 md:pb-28 lg:pt-36 lg:pb-32"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 10% 20%, rgba(26,58,143,0.1), transparent 42%), radial-gradient(circle at 90% 8%, rgba(234,122,59,0.14), transparent 38%), radial-gradient(circle at 50% 100%, rgba(26,58,143,0.06), transparent 50%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(26,58,143,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(26,58,143,0.035) 1px, transparent 1px)',
          backgroundSize: '72px 72px',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-5 md:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1e3a8a]/15 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1e3a8a] shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#1e3a8a] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#1e3a8a]" />
            </span>
            Company ↔ Professional trust platform
          </span>

          <h1 className="m-0 mt-7 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem] lg:text-5xl">
            Connecting Talent{' '}
            <span className="bg-gradient-to-r from-[#1e3a8a] to-[#172554] bg-clip-text text-transparent">
              Faster
            </span>
            ,<br />
            Building Relationships{' '}
            <span className="bg-gradient-to-r from-[#1e3a8a] to-[#2748a6] bg-clip-text text-transparent">
              Stronger
            </span>
          </h1>

          <p className="m-0 mt-6 text-base leading-relaxed text-slate-600 md:text-lg lg:max-w-lg">
            PagerLook bridges employers and professionals with verified trust — so companies hire
            with confidence and talent joins teams faster, with relationships built to last.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {TRUST_PILLS.map((pill) => (
              <span
                key={pill.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
              >
                {pill.icon && <pill.icon className="h-3.5 w-3.5 text-[#1e3a8a]" />}
                {pill.text}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/enterprise/login"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#1e3a8a] px-7 text-[15px] font-semibold text-white no-underline shadow-lg shadow-blue-900/20 transition hover:bg-[#172554]"
            >
              Start for employers
            </Link>
            <Link
              to="/employee"
              className="inline-flex h-12 items-center justify-center rounded-2xl border border-slate-200 bg-white px-7 text-[15px] font-semibold text-slate-800 no-underline shadow-sm transition hover:border-slate-300 hover:bg-slate-50"
            >
              I&apos;m a professional
            </Link>
          </div>

          <p className="m-0 mt-6 text-sm text-slate-500">
            Trusted by growing teams · No credit card · Setup in minutes
          </p>
        </div>

        <TrustConnectionVisual />
      </div>
    </section>
  )
}

export default LandingHero

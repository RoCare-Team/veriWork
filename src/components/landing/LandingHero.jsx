import { Link } from 'react-router-dom'
import { ShieldCheckIcon, CheckCircleIcon } from '../common/Icons'

function TrustConnectionVisual() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-6 rounded-[32px] bg-gradient-to-br from-[#1a3a8f]/15 via-transparent to-[#ea7a3b]/20 blur-3xl" />

      <div className="relative overflow-hidden rounded-[28px] border border-slate-200/80 bg-white/90 p-6 shadow-2xl shadow-slate-300/25 backdrop-blur-sm md:p-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="rounded-full bg-[#1a3a8f]/8 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-[#1a3a8f]">
            Live connection
          </span>
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
            </span>
            Trusted link active
          </span>
        </div>

        <div className="grid items-center gap-4 md:grid-cols-[1fr_auto_1fr] md:gap-3">
          {/* Company */}
          <div className="rounded-2xl border border-[#1a3a8f]/15 bg-gradient-to-br from-[#1a3a8f]/5 to-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1a3a8f] text-sm font-bold text-white">
                AC
              </div>
              <div>
                <p className="m-0 text-sm font-bold text-slate-900">Acme Corp</p>
                <p className="m-0 text-[11px] font-medium text-slate-500">Employer</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                <span className="text-slate-500">Team verified</span>
                <span className="font-bold text-[#1a3a8f]">94%</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                <span className="text-slate-500">Hiring speed</span>
                <span className="font-bold text-emerald-600">3x faster</span>
              </div>
            </div>
          </div>

          {/* Connection bridge */}
          <div className="relative flex flex-col items-center justify-center py-2 md:py-0">
            <div className="hidden h-px w-full bg-gradient-to-r from-[#1a3a8f]/30 via-[#ea7a3b]/50 to-[#1a3a8f]/30 md:block" />
            <div className="my-3 flex h-14 w-14 items-center justify-center rounded-2xl border border-[#ea7a3b]/25 bg-gradient-to-br from-[#ea7a3b]/10 to-[#1a3a8f]/10 shadow-lg shadow-orange-200/30">
              <ShieldCheckIcon className="h-7 w-7 text-[#1a3a8f]" />
            </div>
            <div className="hidden h-px w-full bg-gradient-to-r from-[#1a3a8f]/30 via-[#ea7a3b]/50 to-[#1a3a8f]/30 md:block" />
            <p className="m-0 mt-2 text-center text-[10px] font-bold uppercase tracking-widest text-slate-400 md:mt-3">
              Verified trust
            </p>
          </div>

          {/* Professional */}
          <div className="rounded-2xl border border-[#ea7a3b]/20 bg-gradient-to-br from-[#ea7a3b]/5 to-white p-4">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-[#ea7a3b] to-[#d9682f] text-sm font-bold text-white">
                PS
              </div>
              <div>
                <p className="m-0 text-sm font-bold text-slate-900">Priya Sharma</p>
                <p className="m-0 text-[11px] font-medium text-slate-500">Professional</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                <span className="text-slate-500">Trust score</span>
                <span className="font-bold text-[#ea7a3b]">98</span>
              </div>
              <div className="flex items-center justify-between rounded-xl bg-white px-3 py-2 text-xs">
                <span className="text-slate-500">Identity</span>
                <span className="font-bold text-emerald-600">Verified</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-3 gap-2 border-t border-slate-100 pt-5">
          {[
            { label: 'Avg. connect', value: '< 2 min' },
            { label: 'Mutual trust', value: '100%' },
            { label: 'Fraud blocked', value: '98%' },
          ].map((item) => (
            <div key={item.label} className="text-center">
              <p className="m-0 text-sm font-extrabold text-slate-900">{item.value}</p>
              <p className="m-0 mt-0.5 text-[10px] font-medium text-slate-500">{item.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute -right-2 -top-3 hidden rounded-2xl border border-emerald-100 bg-white px-4 py-3 shadow-xl md:block lg:-right-6">
        <div className="flex items-center gap-2">
          <CheckCircleIcon className="h-5 w-5 text-emerald-500" filled />
          <div>
            <p className="m-0 text-xs font-bold text-slate-800">Relationship secured</p>
            <p className="m-0 text-[11px] text-slate-500">Consent-based sharing</p>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-5 -left-3 hidden rounded-2xl border border-[#1a3a8f]/10 bg-white px-4 py-3 shadow-xl md:block lg:-left-6">
        <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">Connection time</p>
        <p className="m-0 text-lg font-extrabold text-[#1a3a8f]">Under 2 minutes</p>
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
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1a3a8f]/15 bg-white/80 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1a3a8f] shadow-sm backdrop-blur-sm">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#ea7a3b] opacity-60" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#ea7a3b]" />
            </span>
            Company ↔ Professional trust platform
          </span>

          <h1 className="m-0 mt-7 text-[2rem] font-extrabold leading-[1.1] tracking-tight text-slate-900 sm:text-4xl md:text-[2.75rem] lg:text-5xl">
            Connecting Talent{' '}
            <span className="bg-gradient-to-r from-[#ea7a3b] to-[#d9682f] bg-clip-text text-transparent">
              Faster
            </span>
            ,<br />
            Building Relationships{' '}
            <span className="bg-gradient-to-r from-[#1a3a8f] to-[#2747b2] bg-clip-text text-transparent">
              Stronger
            </span>
          </h1>

          <p className="m-0 mt-6 text-base leading-relaxed text-slate-600 md:text-lg lg:max-w-lg">
            VeriWork bridges employers and professionals with verified trust — so companies hire
            with confidence and talent joins teams faster, with relationships built to last.
          </p>

          <div className="mt-7 flex flex-wrap gap-2.5">
            {TRUST_PILLS.map((pill) => (
              <span
                key={pill.text}
                className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-white/90 px-3.5 py-1.5 text-xs font-semibold text-slate-700 shadow-sm"
              >
                {pill.icon && <pill.icon className="h-3.5 w-3.5 text-[#1a3a8f]" />}
                {pill.text}
              </span>
            ))}
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
            <Link
              to="/enterprise/register"
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#1a3a8f] px-7 text-[15px] font-semibold text-white no-underline shadow-lg shadow-blue-900/20 transition hover:bg-[#152b6e]"
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

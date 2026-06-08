import { Link } from 'react-router-dom'
import { ShieldCheckIcon } from '../common/Icons'

function DashboardPreview() {
  return (
    <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
      <div className="absolute -inset-4 rounded-[28px] bg-gradient-to-br from-[#1a3a8f]/20 to-[#ea7a3b]/15 blur-2xl" />
      <div className="relative overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-2xl shadow-slate-300/30">
        <div className="flex items-center gap-2 border-b border-slate-100 bg-slate-50 px-4 py-3">
          <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" />
          <span className="ml-3 text-xs font-medium text-slate-400">app.veriwork.com</span>
        </div>

        <div className="grid gap-0 md:grid-cols-5">
          <div className="hidden bg-gradient-to-b from-[#152b6e] to-[#1a3a8f] p-4 md:col-span-2 md:block">
            <div className="mb-6 h-2 w-20 rounded bg-white/30" />
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className={`mb-2 rounded-lg px-3 py-2 ${i === 1 ? 'bg-white/15' : 'bg-white/5'}`}
              >
                <div className="h-2 w-24 rounded bg-white/25" />
              </div>
            ))}
          </div>

          <div className="p-5 md:col-span-3 md:p-6">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <div className="h-2.5 w-28 rounded bg-slate-200" />
                <div className="mt-2 h-2 w-40 rounded bg-slate-100" />
              </div>
              <div className="rounded-full bg-emerald-100 px-3 py-1 text-[10px] font-bold text-emerald-700">
                Verified
              </div>
            </div>

            <div className="mb-4 grid grid-cols-2 gap-3">
              {[
                { label: 'Trust Score', value: '98', color: 'text-[#1a3a8f]' },
                { label: 'Verified Jobs', value: '12', color: 'text-[#ea7a3b]' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                  <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                    {stat.label}
                  </p>
                  <p className={`m-0 mt-1 text-xl font-extrabold ${stat.color}`}>{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="flex items-center gap-3 rounded-xl border border-slate-100 p-3"
                >
                  <div className="h-9 w-9 shrink-0 rounded-full bg-gradient-to-br from-[#2747b2] to-[#1a3a8f]" />
                  <div className="min-w-0 flex-1">
                    <div className="h-2 w-24 rounded bg-slate-200" />
                    <div className="mt-1.5 h-2 w-32 rounded bg-slate-100" />
                  </div>
                  <div className="h-5 w-14 rounded-full bg-emerald-50" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="absolute -bottom-4 -left-4 hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-xl md:block">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
            <ShieldCheckIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="m-0 text-xs font-bold text-slate-800">Identity verified</p>
            <p className="m-0 text-[11px] text-slate-500">Aadhaar + Biometric</p>
          </div>
        </div>
      </div>
    </div>
  )
}

function LandingHero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 md:pt-32 md:pb-24 lg:pt-36 lg:pb-28">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            'radial-gradient(circle at 15% 30%, rgba(26,58,143,0.09), transparent 45%), radial-gradient(circle at 85% 10%, rgba(234,122,59,0.12), transparent 40%)',
        }}
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.4]"
        style={{
          backgroundImage:
            'linear-gradient(rgba(26,58,143,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(26,58,143,0.04) 1px, transparent 1px)',
          backgroundSize: '64px 64px',
        }}
      />

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 md:px-8 lg:grid-cols-2 lg:gap-16 lg:px-10">
        <div className="max-w-xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-[#1a3a8f]/15 bg-[#1a3a8f]/5 px-4 py-1.5 text-xs font-bold uppercase tracking-widest text-[#1a3a8f]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#ea7a3b]" />
            Workforce trust platform
          </span>

          <h1 className="m-0 mt-6 text-4xl font-extrabold leading-[1.08] tracking-tight text-slate-900 md:text-5xl lg:text-[56px]">
            Verify identities.{' '}
            <span className="bg-gradient-to-r from-[#1a3a8f] to-[#2747b2] bg-clip-text text-transparent">
              Build trust.
            </span>
          </h1>

          <p className="m-0 mt-5 text-base leading-relaxed text-slate-600 md:text-lg lg:max-w-lg">
            VeriWork connects employers and professionals through cryptographically verified
            identities, job history, and consent-based data sharing — all in one secure platform.
          </p>

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

          <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-slate-500">
            <span className="flex items-center gap-2">
              <ShieldCheckIcon className="h-4 w-4 text-[#1a3a8f]" />
              ISO 27001 certified
            </span>
            <span>No credit card required</span>
            <span>Setup in minutes</span>
          </div>
        </div>

        <DashboardPreview />
      </div>
    </section>
  )
}

export default LandingHero

import BrandLogo from '../components/common/BrandLogo'

const HERO_STATS = [
  { value: 'ISO 27001', label: 'Certified security' },
  { value: '256-bit', label: 'SSL encryption' },
  { value: '24/7', label: 'Trust monitoring' },
]

function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Mobile brand strip */}
      <div className="flex items-center justify-center bg-gradient-to-r from-[#004bab] to-[#005fd6] px-6 py-5 lg:hidden">
        <BrandLogo size="md" theme="light" showTagline />
      </div>

      {/* Desktop hero */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#004bab] via-[#005fd6] to-[#0073fe] lg:flex lg:flex-col lg:justify-center lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute -right-16 top-16 h-80 w-80 rounded-full bg-[#ea7a3b]/15 blur-3xl" />
        <div className="pointer-events-none absolute -left-16 bottom-16 h-72 w-72 rounded-full bg-white/10 blur-3xl" />

        <div className="relative z-10 flex flex-col gap-10">
          <BrandLogo size="lg" theme="light" />

          <div className="max-w-xl rounded-[32px] border border-white/10 bg-white/[0.08] p-8 shadow-[0_30px_80px_rgba(0,0,0,0.12)] backdrop-blur-md">
            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-white/70">
              Enterprise employer portal
            </p>
            <h2 className="mt-4 text-4xl font-extrabold leading-tight text-white xl:text-[3rem]">
              Secure hiring, smarter verification.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-white/75">
              Access a unified dashboard for company onboarding, candidate checks, and compliance monitoring.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white">
                <strong className="block text-xl font-bold">99.9%</strong>
                <span className="text-sm text-white/70">Secure platform uptime</span>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-white">
                <strong className="block text-xl font-bold">Real-time</strong>
                <span className="text-sm text-white/70">Verification and reporting</span>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {HERO_STATS.map((item) => (
              <div
                key={item.value}
                className="rounded-3xl border border-white/10 bg-white/10 px-5 py-5 text-white"
              >
                <strong className="block text-xl font-bold">{item.value}</strong>
                <span className="mt-2 block text-sm text-white/70">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-12 lg:py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </section>
    </main>
  )
}

export default AuthLayout

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
      <div className="flex items-center justify-center bg-gradient-to-r from-[#152b6e] to-[#1a3a8f] px-6 py-5 lg:hidden">
        <BrandLogo size="md" theme="light" showTagline />
      </div>

      {/* Desktop hero */}
      <aside className="relative hidden overflow-hidden bg-gradient-to-br from-[#152b6e] via-[#1a3a8f] to-[#2747b2] lg:flex lg:flex-col lg:justify-between lg:p-12 xl:p-16">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.05]"
          style={{
            backgroundImage:
              'linear-gradient(rgba(255,255,255,.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.6) 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
        />
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-[#ea7a3b]/15 blur-3xl" />

        <div className="relative z-10">
          <BrandLogo size="lg" theme="light" />
        </div>

        <div className="relative z-10 flex flex-1 flex-col justify-center py-10">
          <div className="mx-auto w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.07] p-6 backdrop-blur-md">
            <div className="mb-5 flex items-center gap-3">
              <div className="h-3 w-3 rounded-full bg-[#ea7a3b]" />
              <div className="h-2.5 flex-1 rounded-full bg-white/25" />
            </div>
            <div className="mb-4 h-2 w-32 rounded-full bg-white/35" />
            <div className="mb-6 h-2 w-48 rounded-full bg-white/20" />
            <div className="mb-4 flex gap-2">
              <div className="h-9 flex-1 rounded-xl bg-[#ea7a3b]/90" />
              <div className="h-9 flex-1 rounded-xl bg-white/15" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/5 p-4"
                >
                  <div className="mb-2.5 h-2 w-14 rounded bg-white/30" />
                  <div className="h-2 w-24 rounded bg-white/15" />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative z-10 space-y-8">
          <div>
            <h2 className="m-0 text-3xl font-extrabold leading-tight tracking-tight text-white xl:text-[40px]">
              Workforce trust, verified.
            </h2>
            <p className="mt-3 max-w-md text-base leading-relaxed text-white/75">
              Monitor employee credentials, verification requests, and compliance
              from one secure employer dashboard.
            </p>
          </div>

          <ul className="m-0 grid list-none grid-cols-3 gap-3 p-0">
            {HERO_STATS.map((item) => (
              <li
                key={item.value}
                className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
              >
                <strong className="block text-sm font-bold text-white">
                  {item.value}
                </strong>
                <span className="mt-1 block text-[11px] text-white/65">
                  {item.label}
                </span>
              </li>
            ))}
          </ul>
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

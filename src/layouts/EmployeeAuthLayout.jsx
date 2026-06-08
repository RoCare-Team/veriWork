import EmployeeBrandHeader from '../components/employee/EmployeeBrandHeader'
import { ShieldCheckIcon } from '../components/common/Icons'

const TRUST_POINTS = [
  { value: '300–900', label: 'VeriScore Range' },
  { value: 'AES-256', label: 'Encryption' },
  { value: 'UIDAI', label: 'Aadhaar Ready' },
]

function EmployeeAuthLayout({ children, heroTitle, heroSubtitle }) {
  return (
    <main className="min-h-screen bg-slate-50 lg:grid lg:grid-cols-2">
      {/* Mobile / tablet brand strip */}
      <div className="flex items-center justify-center bg-gradient-to-r from-[#152b6e] to-[#1a3a8f] px-6 py-5 md:py-6 lg:hidden">
        <EmployeeBrandHeader badge="Professional Trust Platform" />
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
        <div className="pointer-events-none absolute -right-20 top-20 h-72 w-72 rounded-full bg-green-400/10 blur-3xl" />

        <div className="relative z-10 text-white">
          <div className="mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm">
            <ShieldCheckIcon className="h-7 w-7" />
          </div>
          <p className="m-0 text-sm font-semibold text-white/70">VeriWork Employee</p>
          <h2 className="m-0 mt-2 text-3xl font-extrabold leading-tight tracking-tight xl:text-4xl">
            {heroTitle || 'Verified Identity'}
          </h2>
          <p className="mt-4 max-w-md text-base leading-relaxed text-white/75">
            {heroSubtitle ||
              'Build a secure, encrypted professional profile that employers can trust instantly.'}
          </p>
        </div>

        <ul className="relative z-10 m-0 grid list-none grid-cols-3 gap-3 p-0">
          {TRUST_POINTS.map((item) => (
            <li
              key={item.label}
              className="rounded-2xl border border-white/12 bg-white/10 px-4 py-4 backdrop-blur-sm"
            >
              <strong className="block text-sm font-bold text-white">{item.value}</strong>
              <span className="mt-1 block text-[11px] text-white/65">{item.label}</span>
            </li>
          ))}
        </ul>
      </aside>

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 md:px-10 md:py-12 lg:min-h-screen lg:px-12 lg:py-12 xl:px-16">
        <div className="w-full max-w-[420px] md:max-w-[460px] lg:max-w-[480px]">{children}</div>
      </section>
    </main>
  )
}

export default EmployeeAuthLayout

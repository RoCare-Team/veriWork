import BrandLogo from '../components/common/BrandLogo'
import AuthHero from '../components/common/AuthHero'

const HERO_STATS = [
  { value: 'ISO 27001', label: 'Certified security' },
  { value: '256-bit', label: 'SSL encryption' },
  { value: '24/7', label: 'Trust monitoring' },
]

function AuthLayout({ children }) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Mobile brand strip */}
      <div className="flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-600 px-6 py-5 lg:hidden">
        <BrandLogo size="md" theme="light" showTagline />
      </div>

      {/* Desktop hero */}
      <AuthHero
        eyebrow="Enterprise employer portal"
        title="Secure hiring, smarter verification."
        subtitle="A unified dashboard for company onboarding, candidate checks, and compliance monitoring."
        stats={HERO_STATS}
      />

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center px-5 py-10 sm:px-8 lg:min-h-screen lg:px-12 lg:py-12">
        <div className="w-full max-w-[420px]">{children}</div>
      </section>
    </main>
  )
}

export default AuthLayout

import EmployeeBrandHeader from '../components/employee/EmployeeBrandHeader'
import AuthHero from '../components/common/AuthHero'

const TRUST_POINTS = [
  { value: '300–900', label: 'PagerLook Score Range' },
  { value: 'AES-256', label: 'Encryption' },
  { value: 'UIDAI', label: 'Aadhaar Ready' },
]

function EmployeeAuthLayout({ children, heroTitle, heroSubtitle }) {
  return (
    <main className="min-h-screen bg-white lg:grid lg:grid-cols-2">
      {/* Mobile / tablet brand strip */}
      <div className="flex items-center justify-center bg-gradient-to-br from-brand-950 via-brand-900 to-brand-600 px-6 py-5 md:py-6 lg:hidden">
        <EmployeeBrandHeader badge="Professional Trust Platform" />
      </div>

      {/* Desktop hero */}
      <AuthHero
        eyebrow="Employee portal"
        title={heroTitle || 'Your verified professional identity.'}
        subtitle={
          heroSubtitle ||
          'Build a secure, encrypted professional profile that employers can trust instantly.'
        }
        stats={TRUST_POINTS}
      />

      {/* Form panel */}
      <section className="flex flex-1 items-center justify-center px-5 py-8 sm:px-8 md:px-10 md:py-12 lg:min-h-screen lg:px-12 lg:py-12 xl:px-16">
        <div className="w-full max-w-[420px] md:max-w-[460px] lg:max-w-[480px]">{children}</div>
      </section>
    </main>
  )
}

export default EmployeeAuthLayout

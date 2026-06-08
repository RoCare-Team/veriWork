import LandingNavbar from '../components/landing/LandingNavbar'
import LandingHero from '../components/landing/LandingHero'
import LandingStats from '../components/landing/LandingStats'
import LandingFeatures from '../components/landing/LandingFeatures'
import LandingHowItWorks from '../components/landing/LandingHowItWorks'
import LandingPortals from '../components/landing/LandingPortals'
import LandingSecurity from '../components/landing/LandingSecurity'
import LandingTestimonials from '../components/landing/LandingTestimonials'
import LandingCta from '../components/landing/LandingCta'
import LandingFooter from '../components/landing/LandingFooter'

function Home() {
  return (
    <div className="min-h-screen bg-white">
      <LandingNavbar />
      <main>
        <LandingHero />
        <LandingStats />
        <LandingFeatures />
        <LandingHowItWorks />
        <LandingPortals />
        <LandingSecurity />
        <LandingTestimonials />
        <LandingCta />
      </main>
      <LandingFooter />
    </div>
  )
}

export default Home

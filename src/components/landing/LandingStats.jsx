import { LANDING_STATS } from '../../utils/landingData'

function LandingStats() {
  return (
    <section className="border-y border-slate-200 bg-slate-50/80">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-6 px-5 py-12 md:grid-cols-4 md:px-8 md:py-14 lg:px-10">
        {LANDING_STATS.map((stat) => (
          <div key={stat.label} className="text-center md:text-left">
            <p className="m-0 text-3xl font-extrabold tracking-tight text-[#005fd6] md:text-4xl">
              {stat.value}
            </p>
            <p className="m-0 mt-1 text-sm font-medium text-slate-500">{stat.label}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

export default LandingStats

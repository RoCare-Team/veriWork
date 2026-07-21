import { LANDING_FEATURES } from '../../utils/landingData'
import LandingFeatureIcon from './LandingFeatureIcon'

function SectionHeading({ eyebrow, title, subtitle }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      {eyebrow && (
        <p className="m-0 text-sm font-bold uppercase tracking-widest text-[#1e3a8a]">{eyebrow}</p>
      )}
      <h2 className="m-0 mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
        {title}
      </h2>
      {subtitle && (
        <p className="m-0 mt-4 text-base leading-relaxed text-slate-600 md:text-lg">{subtitle}</p>
      )}
    </div>
  )
}

function LandingFeatures() {
  return (
    <section id="features" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <SectionHeading
          eyebrow="Platform"
          title="Everything you need to verify workforce trust"
          subtitle="From identity checks to document vaults — built for HR teams and professionals who need speed without compromising security."
        />

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {LANDING_FEATURES.map((feature) => (
            <article
              key={feature.id}
              className="group rounded-3xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-0.5 hover:border-[#1e3a8a]/20 hover:shadow-lg md:p-7"
            >
              <div
                className={`inline-flex h-12 w-12 items-center justify-center rounded-2xl ${feature.accent}`}
              >
                <LandingFeatureIcon name={feature.icon} />
              </div>
              <h3 className="m-0 mt-5 text-lg font-extrabold text-slate-900">{feature.title}</h3>
              <p className="m-0 mt-2 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                {feature.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingFeatures

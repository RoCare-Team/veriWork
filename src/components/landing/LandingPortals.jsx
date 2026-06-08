import { Link } from 'react-router-dom'
import { LANDING_PORTALS } from '../../utils/landingData'

function CheckIcon() {
  return (
    <svg className="h-4 w-4 shrink-0 text-emerald-500" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7 10l2 2 4-4"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function LandingPortals() {
  return (
    <section id="portals" className="scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="m-0 text-sm font-bold uppercase tracking-widest text-[#ea7a3b]">Get started</p>
          <h2 className="m-0 mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Choose your portal
          </h2>
          <p className="m-0 mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            Whether you&apos;re hiring or building your career, VeriWork has a dedicated experience
            for you.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-8">
          {LANDING_PORTALS.map((portal) => (
            <article
              key={portal.to}
              className="relative flex flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-lg shadow-slate-200/50"
            >
              <div className={`bg-gradient-to-br ${portal.gradient} px-6 py-8 md:px-8 md:py-10`}>
                <span className="inline-flex rounded-full bg-white/15 px-3 py-1 text-xs font-bold text-white backdrop-blur-sm">
                  {portal.badge}
                </span>
                <h3 className="m-0 mt-4 text-2xl font-extrabold text-white md:text-3xl">
                  {portal.title}
                </h3>
                <p className="m-0 mt-2 max-w-md text-sm leading-relaxed text-white/80 md:text-base">
                  {portal.description}
                </p>
              </div>

              <div className="flex flex-1 flex-col p-6 md:p-8">
                <ul className="m-0 flex flex-1 flex-col gap-3 p-0 list-none">
                  {portal.highlights.map((item) => (
                    <li key={item} className="flex items-center gap-2.5 text-sm font-medium text-slate-700">
                      <CheckIcon />
                      {item}
                    </li>
                  ))}
                </ul>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to={portal.to}
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl bg-[#1a3a8f] text-sm font-semibold text-white no-underline transition hover:bg-[#152b6e]"
                  >
                    {portal.cta}
                  </Link>
                  <Link
                    to={portal.secondaryTo}
                    className="inline-flex h-12 flex-1 items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 no-underline transition hover:bg-slate-50"
                  >
                    {portal.secondaryCta}
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingPortals

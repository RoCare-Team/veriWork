import { LANDING_STEPS } from '../../utils/landingData'

function StepBadge({ audience }) {
  const styles = {
    both: 'bg-slate-100 text-slate-600',
    employee: 'bg-blue-50 text-[#1a3a8f]',
    enterprise: 'bg-orange-50 text-[#ea7a3b]',
  }
  const labels = {
    both: 'Everyone',
    employee: 'Employee',
    enterprise: 'Employer',
  }

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide ${styles[audience]}`}
    >
      {labels[audience]}
    </span>
  )
}

function LandingHowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-24 bg-slate-50 py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="m-0 text-sm font-bold uppercase tracking-widest text-[#ea7a3b]">
            How it works
          </p>
          <h2 className="m-0 mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            From signup to verified in four steps
          </h2>
          <p className="m-0 mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
            A seamless flow for both sides of the hiring equation — employers and professionals.
          </p>
        </div>

        <div className="relative mt-14">
          <div className="absolute left-8 top-0 hidden h-full w-px bg-gradient-to-b from-[#1a3a8f]/30 via-[#ea7a3b]/30 to-transparent md:left-1/2 md:block md:-translate-x-px" />

          <div className="flex flex-col gap-8 md:gap-12">
            {LANDING_STEPS.map((item, index) => {
              const isEven = index % 2 === 0
              return (
                <div
                  key={item.step}
                  className={`relative flex flex-col md:flex-row md:items-center ${
                    isEven ? 'md:flex-row' : 'md:flex-row-reverse'
                  }`}
                >
                  <div className={`md:w-1/2 ${isEven ? 'md:pr-12 md:text-right' : 'md:pl-12'}`}>
                    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-7">
                      <div
                        className={`mb-3 flex items-center gap-3 ${isEven ? 'md:justify-end' : ''}`}
                      >
                        <span className="text-2xl font-extrabold text-[#1a3a8f]/20">{item.step}</span>
                        <StepBadge audience={item.for} />
                      </div>
                      <h3 className="m-0 text-xl font-extrabold text-slate-900">{item.title}</h3>
                      <p className="m-0 mt-2 text-sm leading-relaxed text-slate-600 md:text-[15px]">
                        {item.description}
                      </p>
                    </article>
                  </div>

                  <div className="absolute left-8 hidden h-4 w-4 -translate-x-1/2 rounded-full border-4 border-white bg-[#1a3a8f] shadow md:left-1/2 md:block" />

                  <div className="hidden md:block md:w-1/2" />
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingHowItWorks

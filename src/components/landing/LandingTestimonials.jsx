import { LANDING_TESTIMONIALS } from '../../utils/landingData'

function LandingTestimonials() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <p className="m-0 text-sm font-bold uppercase tracking-widest text-[#ea7a3b]">
            Testimonials
          </p>
          <h2 className="m-0 mt-3 text-3xl font-extrabold tracking-tight text-slate-900 md:text-4xl">
            Trusted by teams and professionals
          </h2>
        </div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-2 lg:gap-8">
          {LANDING_TESTIMONIALS.map((item) => (
            <blockquote
              key={item.name}
              className="m-0 rounded-3xl border border-slate-200 bg-white p-7 shadow-sm md:p-8"
            >
              <p className="m-0 text-base leading-relaxed text-slate-700 md:text-lg">
                &ldquo;{item.quote}&rdquo;
              </p>
              <footer className="mt-6 flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#2747b2] to-[#1a3a8f] text-sm font-bold text-white">
                  {item.initials}
                </div>
                <div>
                  <cite className="not-italic font-bold text-slate-900">{item.name}</cite>
                  <p className="m-0 text-sm text-slate-500">{item.role}</p>
                </div>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  )
}

export default LandingTestimonials

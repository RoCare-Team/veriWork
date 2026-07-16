import { Link } from 'react-router-dom'

function LandingCta() {
  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="relative overflow-hidden rounded-[32px] bg-gradient-to-br from-[#004bab] via-[#005fd6] to-[#0073fe] px-6 py-12 text-center md:px-12 md:py-16">
          <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-[#005fd6]/20 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />

          <div className="relative">
            <h2 className="m-0 text-3xl font-extrabold tracking-tight text-white md:text-4xl">
              Ready to build workforce trust?
            </h2>
            <p className="m-0 mx-auto mt-4 max-w-xl text-base leading-relaxed text-white/75 md:text-lg">
              Join hundreds of companies and millions of professionals on India&apos;s most trusted
              verification platform.
            </p>
            <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row sm:items-center">
              <Link
                to="/enterprise/register"
                className="inline-flex h-12 items-center justify-center rounded-2xl bg-white px-8 text-[15px] font-semibold text-[#005fd6] no-underline transition hover:bg-slate-100"
              >
                Register your company
              </Link>
              <Link
                to="/employee"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/30 bg-white/10 px-8 text-[15px] font-semibold text-white no-underline backdrop-blur-sm transition hover:bg-white/20"
              >
                Create professional profile
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingCta

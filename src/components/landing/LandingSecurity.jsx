import { ShieldCheckIcon } from '../common/Icons'
import { LANDING_SECURITY } from '../../utils/landingData'

function LandingSecurity() {
  return (
    <section id="security" className="scroll-mt-24 bg-gradient-to-br from-[#004bab] via-[#005fd6] to-[#0073fe] py-20 text-white md:py-28">
      <div className="mx-auto max-w-7xl px-5 md:px-8 lg:px-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="m-0 text-sm font-bold uppercase tracking-widest text-[#005fd6]">
              Security & compliance
            </p>
            <h2 className="m-0 mt-3 text-3xl font-extrabold tracking-tight md:text-4xl">
              Enterprise-grade security, built in
            </h2>
            <p className="m-0 mt-4 text-base leading-relaxed text-white/75 md:text-lg">
              Every verification, document, and data request is encrypted, audited, and
              consent-gated. Your workforce data stays protected at every step.
            </p>

            <div className="mt-8 flex items-start gap-4 rounded-2xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/15">
                <ShieldCheckIcon className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="m-0 font-bold">Bank-grade encryption</p>
                <p className="m-0 mt-1 text-sm leading-relaxed text-white/70">
                  Aadhaar data is encrypted end-to-end. Biometric captures are processed locally
                  and never stored in raw form.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {LANDING_SECURITY.map((item) => (
              <div
                key={item.label}
                className="rounded-2xl border border-white/12 bg-white/10 p-5 backdrop-blur-sm md:p-6"
              >
                <p className="m-0 text-lg font-extrabold">{item.label}</p>
                <p className="m-0 mt-1 text-sm text-white/65">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

export default LandingSecurity

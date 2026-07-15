import { Link } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo'
import { LANDING_FOOTER_LINKS } from '../../utils/landingData'

function FooterColumn({ title, links }) {
  return (
    <div>
      <p className="m-0 text-sm font-bold text-slate-900">{title}</p>
      <ul className="m-0 mt-4 flex flex-col gap-3 p-0 list-none">
        {links.map((link) => (
          <li key={link.label}>
            {link.to ? (
              <Link
                to={link.to}
                className="text-sm text-slate-500 no-underline transition hover:text-[#005fd6]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-sm text-slate-500 no-underline transition hover:text-[#005fd6]"
              >
                {link.label}
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div className="lg:col-span-2">
            <BrandLogo size="sm" />
            <p className="m-0 mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              PagerLook is the professional trust platform for verified identities, employment
              history, and consent-based workforce data sharing.
            </p>
            <p className="m-0 mt-6 text-xs text-slate-400">© {new Date().getFullYear()} PagerLook. All rights reserved.</p>
          </div>

          <FooterColumn title="Product" links={LANDING_FOOTER_LINKS.product} />
          <FooterColumn title="Company" links={LANDING_FOOTER_LINKS.company} />
          <FooterColumn title="Legal" links={LANDING_FOOTER_LINKS.legal} />
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-8">
          <div className="flex flex-wrap gap-2">
            {['ISO 27001', '256-bit SSL', 'DigiLocker'].map((badge) => (
              <span
                key={badge}
                className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-600"
              >
                {badge}
              </span>
            ))}
          </div>
          <p className="m-0 text-xs text-slate-400">v2.4.0 Build 882</p>
        </div>
      </div>
    </footer>
  )
}

export default LandingFooter

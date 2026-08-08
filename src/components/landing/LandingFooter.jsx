import { Link } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo'
import { LANDING_FOOTER_LINKS } from '../../utils/landingData'
import { CallIcon, MailIcon, WhatsAppIcon } from '../common/Icons'
import SocialLinks from '../common/SocialLinks'
import {
  CONTACT_LINKS,
  SUPPORT_EMAIL,
  SUPPORT_PHONE_DISPLAY,
  whatsappLink,
} from '../../utils/contactInfo'

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
                className="text-sm text-slate-500 no-underline transition hover:text-[#1e3a8a]"
              >
                {link.label}
              </Link>
            ) : (
              <a
                href={link.href}
                className="text-sm text-slate-500 no-underline transition hover:text-[#1e3a8a]"
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

const CONTACT_CHANNELS = [
  {
    label: 'WhatsApp',
    value: SUPPORT_PHONE_DISPLAY,
    href: whatsappLink('Hi PagerLook, I would like to know more about the platform.'),
    icon: WhatsAppIcon,
    external: true,
  },
  { label: 'Call us', value: SUPPORT_PHONE_DISPLAY, href: CONTACT_LINKS.call, icon: CallIcon },
  { label: 'Email', value: SUPPORT_EMAIL, href: CONTACT_LINKS.email, icon: MailIcon },
]

function LandingFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-6 lg:gap-8">
          <div className="lg:col-span-2">
            <BrandLogo size="sm" />
            <p className="m-0 mt-4 max-w-xs text-sm leading-relaxed text-slate-500">
              PagerLook is the professional trust platform for verified identities, employment
              history, and consent-based workforce data sharing.
            </p>

            <SocialLinks className="mt-6" />

            <p className="m-0 mt-6 text-xs text-slate-400">© {new Date().getFullYear()} PagerLook. All rights reserved.</p>
          </div>

          <FooterColumn title="Product" links={LANDING_FOOTER_LINKS.product} />
          <FooterColumn title="Company" links={LANDING_FOOTER_LINKS.company} />
          <FooterColumn title="Legal" links={LANDING_FOOTER_LINKS.legal} />

          <div>
            <p className="m-0 text-sm font-bold text-slate-900">Contact</p>
            <ul className="m-0 mt-4 flex flex-col gap-3 p-0 list-none">
              {CONTACT_CHANNELS.map(({ label, value, href, icon: Icon, external }) => (
                <li key={label}>
                  <a
                    href={href}
                    {...(external ? { target: '_blank', rel: 'noreferrer noopener' } : {})}
                    className="group flex items-start gap-2 text-sm text-slate-500 no-underline transition hover:text-[#1e3a8a]"
                  >
                    <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400 transition group-hover:text-[#1e3a8a]" />
                    <span className="flex flex-col">
                      <span className="font-semibold text-slate-700 transition group-hover:text-[#1e3a8a]">{label}</span>
                      <span className="break-all text-xs">{value}</span>
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          </div>
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

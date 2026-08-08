import {
  FacebookIcon,
  InstagramIcon,
  LinkedInGlyphIcon,
  XIcon,
  YouTubeIcon,
} from './Icons'
import { SOCIAL_LINKS } from '../../utils/contactInfo'

const ICONS = {
  instagram: InstagramIcon,
  linkedin: LinkedInGlyphIcon,
  facebook: FacebookIcon,
  x: XIcon,
  youtube: YouTubeIcon,
}

const THEMES = {
  light:
    'border-slate-200 bg-white text-slate-500 hover:border-[#1e3a8a] hover:text-[#1e3a8a]',
  dark: 'border-white/20 bg-white/5 text-white/70 hover:border-white/60 hover:text-white',
}

/**
 * Social profile row. Placeholder handles (href '#') still render so the set
 * looks complete, but they don't navigate — the anchor would otherwise jump to
 * the top of the current page.
 */
function SocialLinks({ theme = 'light', className = '' }) {
  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`.trim()}>
      {SOCIAL_LINKS.map(({ key, label, href, live }) => {
        const Icon = ICONS[key]
        if (!Icon) return null

        return (
          <a
            key={key}
            href={href}
            {...(live
              ? { target: '_blank', rel: 'noreferrer noopener' }
              : { onClick: (e) => e.preventDefault(), 'aria-disabled': 'true', tabIndex: -1 })}
            aria-label={live ? `PagerLook on ${label}` : `${label} — coming soon`}
            title={live ? label : `${label} — coming soon`}
            className={`flex h-9 w-9 items-center justify-center rounded-full border no-underline transition ${THEMES[theme]} ${
              live ? '' : 'cursor-default opacity-50'
            }`.trim()}
          >
            <Icon className="h-[18px] w-[18px]" />
          </a>
        )
      })}
    </div>
  )
}

export default SocialLinks

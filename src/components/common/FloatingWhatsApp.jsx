import { WhatsAppIcon } from './Icons'
import { SUPPORT_PHONE_DISPLAY, whatsappLink } from '../../utils/contactInfo'

/**
 * Fixed click-to-chat button, pinned to the bottom-right of the viewport.
 * Sits above page content but below modals/toasts (z-40), and respects the
 * iOS safe-area inset so it clears the home indicator.
 */
function FloatingWhatsApp({ message = 'Hi PagerLook, I would like to know more about the platform.' }) {
  return (
    <a
      href={whatsappLink(message)}
      target="_blank"
      rel="noreferrer noopener"
      aria-label={`Chat with PagerLook on WhatsApp at ${SUPPORT_PHONE_DISPLAY}`}
      className="group fixed right-5 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white no-underline shadow-lg shadow-green-900/25 transition hover:scale-105 hover:bg-[#1ebe5b] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#25D366] md:right-8 md:h-16 md:w-16"
      style={{ bottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))' }}
    >
      <WhatsAppIcon className="h-7 w-7 md:h-8 md:w-8" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-slate-900 px-3 py-2 text-xs font-semibold text-white opacity-0 transition-opacity group-hover:opacity-100 md:block">
        Chat on WhatsApp
      </span>
    </a>
  )
}

export default FloatingWhatsApp

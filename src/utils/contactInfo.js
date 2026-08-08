// Single source of truth for PagerLook support/contact channels.
// Update here — every footer, support page and onboarding screen reads from this.

export const SUPPORT_PHONE = '+918510099972'
export const SUPPORT_PHONE_DISPLAY = '+91 85100 99972'
export const SUPPORT_EMAIL = 'info@pagerlook.com'

export const CONTACT_LINKS = {
  call: `tel:${SUPPORT_PHONE}`,
  // wa.me expects the number without '+' or separators
  whatsapp: `https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}`,
  email: `mailto:${SUPPORT_EMAIL}`,
  instagram: 'https://www.instagram.com/pagerlook/',
}

export function whatsappLink(message) {
  if (!message) return CONTACT_LINKS.whatsapp
  return `${CONTACT_LINKS.whatsapp}?text=${encodeURIComponent(message)}`
}

export function mailtoLink(subject, body) {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString()
  return query ? `${CONTACT_LINKS.email}?${query}` : CONTACT_LINKS.email
}

/*
 * Social profiles. Only Instagram is live — the rest are placeholders held at
 * '#' until the handles exist. `live: false` keeps them non-navigating so a
 * click can't dump the user on the current page's top anchor.
 */
export const SOCIAL_LINKS = [
  { key: 'instagram', label: 'Instagram', href: CONTACT_LINKS.instagram, live: true },
  { key: 'linkedin', label: 'LinkedIn', href: '#', live: false },
  { key: 'facebook', label: 'Facebook', href: '#', live: false },
  { key: 'x', label: 'X', href: '#', live: false },
  { key: 'youtube', label: 'YouTube', href: '#', live: false },
]

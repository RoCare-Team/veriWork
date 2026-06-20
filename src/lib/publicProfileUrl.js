/** App origin for public profile links — env first, then current browser origin. */
export function getPublicProfileBaseUrl() {
  const fromEnv = import.meta.env.VITE_APP_URL || import.meta.env.VITE_FRONTEND_URL
  return (fromEnv || (typeof window !== 'undefined' ? window.location.origin : '')).replace(/\/$/, '')
}

/** URL path segment — publicSlug first, veriworkId as fallback. */
export function getPublicProfileIdentity(profile) {
  const identity = profile?.publicSlug?.trim() || profile?.veriworkId?.trim()
  return identity || ''
}

export function buildPublicProfileUrl(profile) {
  const base = getPublicProfileBaseUrl()
  const identity = getPublicProfileIdentity(profile)
  if (!base || !identity) return ''
  return `${base}/u/${encodeURIComponent(identity)}`
}

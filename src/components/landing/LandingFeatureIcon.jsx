const ICONS = {
  shield: (
    <path
      d="M10 2.5 16.5 5v4.5c0 3.2-2.4 5.8-6.5 6.5C6.4 14.8 4 12.2 4 9V5L10 2.5Z"
      stroke="currentColor"
      strokeWidth="1.5"
    />
  ),
  grid: (
    <>
      <rect x="3" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="11" width="6" height="6" rx="1.2" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  briefcase: (
    <>
      <rect x="3" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7V5.5A1.5 1.5 0 0 1 8.5 4h3A1.5 1.5 0 0 1 13 5.5V7" stroke="currentColor" strokeWidth="1.5" />
    </>
  ),
  vault: (
    <>
      <rect x="4" y="3" width="12" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="10" cy="10" r="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 12v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  qr: (
    <>
      <rect x="3" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11" y="3" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <rect x="3" y="11" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13 13h2v2M15 15h2v2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </>
  ),
  activity: (
    <>
      <path d="M4 4h12v12H4V4Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
}

function LandingFeatureIcon({ name, className = 'h-6 w-6' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {ICONS[name] || ICONS.shield}
    </svg>
  )
}

export default LandingFeatureIcon

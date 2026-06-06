export function BriefcaseIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 7V5.5A2.5 2.5 0 0 1 9.5 3h1A2.5 2.5 0 0 1 13 5.5V7" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

export function CardIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2" y="5" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M2 9h16" stroke="currentColor" strokeWidth="1.5" />
      <path d="M6 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function DocumentIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 2h6l4 4v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M12 2v4h4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function BuildingIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M4 18V6l6-3 6 3v12" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M8 10h1M11 10h1M8 13h1M11 13h1M8 16h1M11 16h1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function UploadIcon({ className = 'h-7 w-7' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 16V6m0 0-4 4m4-4 4 4M5 18h14"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function InfoIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 9v5M10 7h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

export function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.92a8.78 8.78 0 0 0 2.68-6.61Z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.71H.96v2.33A9 9 0 0 0 9 18Z" />
      <path fill="#FBBC05" d="M3.97 10.71A5.41 5.41 0 0 1 3.68 9c0-.59.1-1.16.28-1.71V4.96H.96a9 9 0 0 0 0 8.08l3.01-2.33Z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.33l2.58-2.58A8.96 8.96 0 0 0 9 0 9 9 0 0 0 .96 4.96l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58Z" />
    </svg>
  )
}

export function MicrosoftIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <rect width="8" height="8" fill="#F25022" />
      <rect x="10" width="8" height="8" fill="#7FBA00" />
      <rect y="10" width="8" height="8" fill="#00A4EF" />
      <rect x="10" y="10" width="8" height="8" fill="#FFB900" />
    </svg>
  )
}

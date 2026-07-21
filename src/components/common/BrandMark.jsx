import { useId } from 'react'

/**
 * Crisp inline-SVG PagerLook logo — shield + wordmark. Unlike the PNG lockup,
 * this stays sharp at any size, needs no background chip, and keeps the blue
 * "Look" accent on dark surfaces (the all-white PNG loses it).
 *
 * @param {'light'|'dark'} tone  'light' = light-coloured logo for DARK surfaces;
 *                               'dark'  = dark-coloured logo for LIGHT surfaces.
 */
function BrandMark({ tone = 'light', showTagline = false, size = 'md', className = '' }) {
  const gradId = useId()
  const onDark = tone === 'light'
  const shieldPx = { sm: 28, md: 34, lg: 40 }[size] || 34
  const wordCls = { sm: 'text-[16px]', md: 'text-[20px]', lg: 'text-[24px]' }[size] || 'text-[20px]'

  const pagerColor = onDark ? '#ffffff' : '#0f2350'
  const lookColor = onDark ? '#6cb2ff' : '#1e88ff'
  const tagColor = onDark ? 'rgba(226,240,255,.6)' : '#64748b'
  const rim = onDark ? 'rgba(255,255,255,.35)' : 'rgba(30,58,138,.15)'

  const shieldPath =
    'M20 3.5 L33.5 8.6 V19.8 C33.5 28.4 27.7 34.4 20 36.8 C12.3 34.4 6.5 28.4 6.5 19.8 V8.6 Z'

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`.trim()}>
      <svg width={shieldPx} height={shieldPx} viewBox="0 0 40 40" fill="none" aria-hidden="true" className="shrink-0">
        <path d={shieldPath} fill={`url(#${gradId})`} />
        <path d={shieldPath} stroke={rim} strokeWidth="1" />
        <path d="M13.8 20.2 l4 4 8.4 -8.8" stroke="#ffffff" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id={gradId} x1="6" y1="4" x2="34" y2="37" gradientUnits="userSpaceOnUse">
            <stop stopColor="#2aa0f4" />
            <stop offset="1" stopColor="#1e3a8a" />
          </linearGradient>
        </defs>
      </svg>

      <span className="flex min-w-0 flex-col leading-none">
        <span className={`${wordCls} font-extrabold tracking-tight`}>
          <span style={{ color: pagerColor }}>Pager</span>
          <span style={{ color: lookColor }}>Look</span>
        </span>
        {showTagline && (
          <span className="mt-1 text-[8px] font-bold uppercase tracking-[0.22em]" style={{ color: tagColor }}>
            Verify · Trust · Grow
          </span>
        )}
      </span>
    </span>
  )
}

export default BrandMark

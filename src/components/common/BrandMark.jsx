/**
 * Official PagerLook logo lockup from `public/pagerLookLogo.png` — shield +
 * wordmark + "Verify · Trust · Grow" tagline, all baked into the artwork.
 *
 * The lockup is navy-on-transparent, so on dark surfaces it is placed inside a
 * white chip instead of being recoloured — that keeps the blue "Look" accent
 * and the gradient shield intact (the all-white PNG flattens both).
 *
 * @param {'light'|'dark'} tone  'light' = for DARK surfaces (renders a white chip);
 *                               'dark'  = for LIGHT surfaces (bare logo).
 * @param {boolean} chip         Dark surfaces only. `false` drops the white chip
 *                               and uses the all-white lockup instead — for
 *                               chrome like the sidebar header, where a floating
 *                               white card reads as a pasted-on box.
 * @param {boolean} showTagline  Kept for API compatibility — the tagline is part
 *                               of the artwork and always visible.
 */
function BrandMark({ tone = 'light', size = 'md', chip = true, className = '' }) {
  const onDark = tone === 'light'
  const heightCls = { sm: 'h-7', md: 'h-9', lg: 'h-12' }[size] || 'h-9'
  const chipCls =
    onDark && chip
      ? 'rounded-2xl bg-white px-3 py-2 shadow-lg shadow-black/20 ring-1 ring-black/5'
      : ''
  const src = onDark && !chip ? '/pagerLookLogo-white.png' : '/pagerLookLogo.png'

  return (
    <span className={`inline-flex items-center ${chipCls} ${className}`.trim()}>
      <img
        src={src}
        alt="PagerLook"
        className={`${heightCls} w-auto object-contain`}
        draggable="false"
      />
    </span>
  )
}

export default BrandMark

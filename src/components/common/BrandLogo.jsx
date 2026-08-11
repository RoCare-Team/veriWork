import BrandMark from './BrandMark'

/**
 * PagerLook logo. Thin wrapper over {@link BrandMark} so every existing call
 * site renders the same official logo lockup.
 *
 * Legacy props are mapped to BrandMark's `tone`:
 *  - `variant="white"` (light logo for dark surfaces) → tone `light`
 *  - `theme="light"`    (was a white chip on dark hero) → tone `light`
 *  - otherwise (dark logo on a light surface)          → tone `dark`
 *
 * @param {'default'|'white'} variant
 * @param {'dark'|'light'} theme
 */
function BrandLogo({ size = 'md', showTagline = false, theme = 'dark', variant = 'default' }) {
  const tone = variant === 'white' || theme === 'light' ? 'light' : 'dark'
  return <BrandMark tone={tone} size={size} showTagline={showTagline} />
}

export default BrandLogo

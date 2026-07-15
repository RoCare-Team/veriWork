function BrandLogo({ size = 'md', showTagline = false, theme = 'dark' }) {
  const heights = {
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
  }

  const h = heights[size] || heights.md
  const isLight = theme === 'light'

  return (
    <div
      className={`inline-flex w-fit items-center ${
        isLight
          ? 'rounded-2xl bg-white px-4 py-2.5 shadow-lg shadow-black/20 ring-1 ring-black/5'
          : ''
      }`}
    >
      <img
        src="/pagerLookLogo.png"
        alt="PagerLook"
        className={`${h} w-auto object-contain`}
        draggable="false"
      />
    </div>
  )
}

export default BrandLogo

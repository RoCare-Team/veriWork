function BrandLogo({ size = 'md', showTagline = false, theme = 'dark' }) {
  const sizes = {
    sm: { icon: 'h-10 w-10 rounded-xl', mark: 'h-3.5 w-5', name: 'text-xl' },
    md: { icon: 'h-[52px] w-[52px] rounded-2xl', mark: 'h-[18px] w-[26px]', name: 'text-[30px]' },
    lg: { icon: 'h-[68px] w-[68px] rounded-[20px]', mark: 'h-6 w-[34px]', name: 'text-[40px]' },
  }

  const s = sizes[size] || sizes.md
  const isLight = theme === 'light'

  return (
    <div className="inline-flex items-center gap-3">
      <div
        className={`grid place-items-center bg-gradient-to-b from-[#2747b2] to-[#1a3a8f] shadow-lg shadow-blue-900/25 ${s.icon}`}
        aria-hidden="true"
      >
        <span
          className={`block rounded-[4px] bg-[#ea7a3b] ${s.mark}`}
          style={{
            background:
              'linear-gradient(180deg, #ea7a3b 0%, #ea7a3b 72%, #ffffff 72%, #ffffff 100%)',
          }}
        />
      </div>
      <div className="flex flex-col leading-none">
        <span
          className={`font-extrabold tracking-tight ${s.name} ${isLight ? 'text-white' : 'text-[#1a3a8f]'}`}
        >
          VeriWork
        </span>
        {showTagline && (
          <span
            className={`mt-1 text-[11px] font-bold tracking-[0.14em] ${isLight ? 'text-white/75' : 'text-[#2747b2]'}`}
          >
            EMPLOYER
          </span>
        )}
      </div>
    </div>
  )
}

export default BrandLogo

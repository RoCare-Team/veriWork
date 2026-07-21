import BrandLogo from './BrandLogo'

function Loader({
  variant = 'inline',
  label = 'Loading...',
  size = 'md',
  className = '',
}) {
  const spinnerSizes = {
    sm: 'h-[18px] w-[18px] border-2',
    md: 'h-9 w-9 border-[3px]',
    lg: 'h-11 w-11 border-[3px]',
  }

  const spinner = (
    <span
      className={`inline-block animate-spin rounded-full border-slate-200 border-t-[#1e3a8a] ${spinnerSizes[size] || spinnerSizes.md}`}
      aria-hidden="true"
    />
  )

  if (variant === 'fullPage') {
    return (
      <div
        className={`fixed inset-0 z-[1000] flex flex-col items-center justify-center gap-6 bg-white ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <BrandLogo size="lg" showTagline />
        {spinner}
        {label && (
          <p className="m-0 text-sm font-medium text-slate-500">{label}</p>
        )}
      </div>
    )
  }

  if (variant === 'overlay') {
    return (
      <div
        className={`fixed inset-0 z-[900] flex items-center justify-center bg-slate-900/30 backdrop-blur-[2px] ${className}`.trim()}
        role="status"
        aria-live="polite"
        aria-busy="true"
      >
        <div className="flex min-w-[220px] flex-col items-center gap-3.5 rounded-2xl bg-white px-8 py-7 shadow-xl">
          {spinner}
          {label && (
            <p className="m-0 text-sm font-medium text-slate-500">{label}</p>
          )}
        </div>
      </div>
    )
  }

  return (
    <div
      className={`flex items-center justify-center gap-2.5 ${className}`.trim()}
      role="status"
      aria-live="polite"
      aria-busy="true"
    >
      {spinner}
      {label && (
        <span className="text-sm font-medium text-slate-500">{label}</span>
      )}
    </div>
  )
}

export default Loader

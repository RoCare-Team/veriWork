const variants = {
  primary: 'bg-brand-600 text-white shadow-xs hover:bg-brand-700 active:bg-brand-900',
  secondary:
    'border border-hairline bg-surface text-ink-body shadow-xs hover:border-line hover:bg-canvas hover:text-ink-strong',
  ghost: 'border border-transparent bg-transparent text-ink-body hover:bg-ink-strong/[0.04] hover:text-ink-strong',
  danger: 'bg-danger text-white shadow-xs hover:brightness-95 active:brightness-90',
}

const sizes = {
  sm: 'min-h-[32px] gap-1.5 px-3 text-[13px]',
  md: 'min-h-[40px] gap-2 px-4 text-sm',
  lg: 'min-h-[48px] gap-2.5 px-6 text-[15px]',
}

/**
 * `fullWidth` defaults to true — existing callers rely on it.
 * Variant names primary|secondary|ghost are load-bearing across the app.
 */
function Button({
  children,
  className = '',
  variant = 'primary',
  size = 'md',
  fullWidth = true,
  ...props
}) {
  return (
    <button
      className={`inline-flex items-center justify-center rounded-ctl font-semibold outline-none transition duration-150 ease-swift focus-visible:ring-2 focus-visible:ring-brand-500/40 active:translate-y-px disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 ${
        fullWidth ? 'w-full' : ''
      } ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

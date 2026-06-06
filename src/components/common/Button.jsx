const variants = {
  primary:
    'bg-[#1a3a8f] text-white shadow-lg shadow-blue-900/20 hover:bg-[#152b6e] active:shadow-md',
  secondary:
    'border border-slate-200 bg-white text-slate-700 shadow-sm hover:border-slate-300 hover:bg-slate-50',
  ghost:
    'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50',
}

function Button({
  children,
  className = '',
  variant = 'primary',
  fullWidth = true,
  ...props
}) {
  return (
    <button
      className={`inline-flex min-h-[48px] items-center justify-center gap-2.5 rounded-2xl px-6 text-[15px] font-semibold transition active:translate-y-px disabled:cursor-not-allowed disabled:opacity-55 ${fullWidth ? 'w-full' : ''} ${variants[variant] || variants.primary} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  )
}

export default Button

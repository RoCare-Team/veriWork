const paddings = {
  none: '',
  sm: 'p-4',
  md: 'p-5',
  lg: 'p-5 xl:p-6',
}

/**
 * Card shell: white surface + hairline + soft shadow. Never border AND heavy
 * shadow both shouting. Pass `padding="none"` for edge-to-edge content (tables).
 */
function Card({ title, subtitle, action, padding = 'lg', className = '', children }) {
  const pad = paddings[padding] ?? paddings.lg
  const hasHeader = Boolean(title || subtitle || action)

  return (
    <section className={`rounded-xl border border-hairline bg-surface shadow-sm ${pad} ${className}`.trim()}>
      {hasHeader && (
        <div className={`flex items-start justify-between gap-3 ${padding === 'none' ? 'p-5 pb-0' : ''} mb-5`}>
          <div className="min-w-0">
            {title && <h3 className="m-0 text-[15px] font-semibold tracking-tight text-ink-strong">{title}</h3>}
            {subtitle && <p className="m-0 mt-0.5 text-xs text-ink-muted">{subtitle}</p>}
          </div>
          {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
        </div>
      )}
      {children}
    </section>
  )
}

export default Card

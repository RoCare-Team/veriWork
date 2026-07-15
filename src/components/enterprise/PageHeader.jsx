/* {title, subtitle, badge, action} is the established contract — breadcrumb is additive. */
function PageHeader({ title, subtitle, badge, action, breadcrumb }) {
  return (
    <div className="mb-6 flex flex-wrap items-start justify-between gap-x-4 gap-y-3">
      <div className="min-w-0">
        {breadcrumb && <div className="mb-1.5 text-xs font-medium text-ink-muted">{breadcrumb}</div>}
        <h2 className="m-0 text-2xl font-bold tracking-tight text-ink-strong md:text-[28px]">{title}</h2>
        {subtitle && <p className="m-0 mt-1 text-sm text-ink-muted">{subtitle}</p>}
      </div>
      {(badge || action) && (
        <div className="flex shrink-0 items-center gap-2">
          {badge}
          {action}
        </div>
      )}
    </div>
  )
}

export default PageHeader

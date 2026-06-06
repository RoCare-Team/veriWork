function PageHeader({ title, subtitle, badge, action }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h2 className="m-0 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
        )}
      </div>
      <div className="flex shrink-0 items-center gap-2">
        {badge}
        {action}
      </div>
    </div>
  )
}

export default PageHeader

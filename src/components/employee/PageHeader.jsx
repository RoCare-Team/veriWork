function EmployeePageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4 md:mb-8">
      <div>
        <h2 className="m-0 text-xl font-extrabold tracking-tight text-slate-900 md:text-2xl lg:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-slate-500 md:text-base">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}

export default EmployeePageHeader

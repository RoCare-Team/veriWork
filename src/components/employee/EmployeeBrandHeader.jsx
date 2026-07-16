function EmployeeBrandHeader({ badge = 'Professional Trust Platform' }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="inline-flex items-center rounded-2xl bg-white px-4 py-2.5 shadow-lg shadow-black/20 ring-1 ring-black/5">
        <img
          src="/pagerLookLogo.png"
          alt="PagerLook"
          className="h-11 w-auto object-contain"
          draggable="false"
        />
      </div>
      {badge && (
        <span className="mt-3 rounded-full border border-slate-200 bg-white/90 px-3 py-1 text-[11px] font-semibold text-slate-500 shadow-sm">
          {badge}
        </span>
      )}
    </div>
  )
}

export default EmployeeBrandHeader

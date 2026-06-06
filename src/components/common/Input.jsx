function Input({ label, id, type = 'text', leftIcon, error, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          type={type}
          className={`h-12 w-full rounded-xl border bg-white px-3.5 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 md:h-[52px] md:text-base ${leftIcon ? 'pl-10' : ''} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : 'border-slate-300'}`}
          {...props}
        />
      </div>
    </div>
  )
}

export default Input

function Select({ label, id, options, placeholder, error, required = false, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="text-red-500"> *</span>}
        </label>
      )}
      <select
        id={id}
        required={required}
        aria-invalid={error ? 'true' : undefined}
        className={`h-12 w-full appearance-none rounded-2xl border bg-white px-4 text-[15px] text-slate-900 outline-none transition focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 md:h-[52px] md:text-base ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : 'border-slate-200'}`}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => {
          const value = typeof opt === 'string' ? opt : opt.value
          const label = typeof opt === 'string' ? opt : opt.label
          return (
            <option key={value} value={value}>
              {label}
            </option>
          )
        })}
      </select>
    </div>
  )
}

export default Select

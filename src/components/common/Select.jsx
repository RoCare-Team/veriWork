function Select({ label, id, options, placeholder, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}
      <select
        id={id}
        className="h-12 w-full appearance-none rounded-xl border border-slate-300 bg-white px-3.5 text-[15px] text-slate-900 outline-none transition focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 md:h-[52px] md:text-base"
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
    </div>
  )
}

export default Select

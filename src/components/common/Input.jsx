function Input({
  label,
  id,
  type = 'text',
  leftIcon,
  rightSlot,
  hint,
  error,
  errorText,
  required = false,
  className = '',
  ...props
}) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
          {required && <span className="text-red-500"> *</span>}
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
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hint || errorText ? `${id}-desc` : undefined}
          className={`h-12 w-full rounded-2xl border bg-white px-4 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 md:h-[52px] md:text-base ${leftIcon ? 'pl-11' : ''} ${rightSlot ? 'pr-11' : ''} ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : 'border-slate-200'}`}
          {...props}
        />
        {rightSlot && (
          <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400">
            {rightSlot}
          </span>
        )}
      </div>
      {error && errorText && (
        <p id={`${id}-desc`} className="m-0 text-xs text-red-600" role="alert">
          {errorText}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-desc`} className="m-0 text-xs text-slate-400">
          {hint}
        </p>
      )}
    </div>
  )
}

export default Input

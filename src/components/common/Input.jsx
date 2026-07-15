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
    <div className={`flex flex-col gap-1.5 ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="text-[13px] font-semibold text-ink-body">
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          type={type}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hint || errorText ? `${id}-desc` : undefined}
          className={`h-10 w-full rounded-ctl border bg-surface px-3 text-sm text-ink-strong outline-none transition duration-150 ease-swift placeholder:text-ink-faint disabled:cursor-not-allowed disabled:bg-canvas disabled:text-ink-faint ${
            leftIcon ? 'pl-9' : ''
          } ${rightSlot ? 'pr-10' : ''} ${
            error
              ? 'border-danger focus:border-danger focus:ring-2 focus:ring-danger/20'
              : 'border-line hover:border-ink-faint focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25'
          }`}
          {...props}
        />
        {rightSlot && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
            {rightSlot}
          </span>
        )}
      </div>
      {error && errorText && (
        <p id={`${id}-desc`} className="m-0 text-xs text-danger" role="alert">
          {errorText}
        </p>
      )}
      {!error && hint && (
        <p id={`${id}-desc`} className="m-0 text-xs text-ink-muted">
          {hint}
        </p>
      )}
    </div>
  )
}

export default Input

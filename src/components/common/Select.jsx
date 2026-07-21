import { FIELD_LABEL, FIELD_MESSAGE, FIELD_WRAP, fieldControlClass } from './fieldStyles'

function ChevronIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 8l4 4 4-4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function Select({
  label,
  id,
  options = [],
  placeholder,
  hint,
  error,
  errorText,
  required = false,
  className = '',
  ...props
}) {
  const hasMessageSlot = hint !== undefined || errorText !== undefined
  const showError = Boolean(error && errorText)
  const message = showError ? errorText : error ? '' : hint

  return (
    <div className={`${FIELD_WRAP} ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className={FIELD_LABEL}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={hasMessageSlot ? `${id}-desc` : undefined}
          // appearance-none strips the native arrow, so we draw our own below.
          className={`${fieldControlClass({ error, rightSlot: true })} appearance-none`}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((opt) => {
            const value = typeof opt === 'string' ? opt : opt.value
            const optLabel = typeof opt === 'string' ? opt : opt.label
            return (
              <option key={value} value={value}>
                {optLabel}
              </option>
            )
          })}
        </select>
        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
          <ChevronIcon />
        </span>
      </div>
      {hasMessageSlot && (
        <p
          id={`${id}-desc`}
          className={`${FIELD_MESSAGE} ${showError ? 'text-danger' : 'text-ink-muted'}`}
          role={showError ? 'alert' : undefined}
        >
          {message}
        </p>
      )}
    </div>
  )
}

export default Select

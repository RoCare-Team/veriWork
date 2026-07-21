import { FIELD_LABEL, FIELD_MESSAGE, FIELD_WRAP, fieldControlClass } from './fieldStyles'

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
  /*
   * Fields that can show a hint or an error keep a permanent one-line slot, so
   * swapping hint -> error (or a hint appearing as you type) never reflows the
   * form. Fields that pass neither prop get no slot and are unaffected.
   */
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
          aria-describedby={hasMessageSlot ? `${id}-desc` : undefined}
          className={fieldControlClass({
            error,
            leftIcon: Boolean(leftIcon),
            rightSlot: Boolean(rightSlot),
          })}
          {...props}
        />
        {rightSlot && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint">
            {rightSlot}
          </span>
        )}
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

export default Input

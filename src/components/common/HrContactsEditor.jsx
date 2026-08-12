/**
 * Editable list of HR contact emails for an employment verification request.
 *
 * A verification stalls most often because the one address on file is dead or
 * mistyped, so the list is open-ended rather than the two fixed slots it used
 * to be — every address here is mailed the same secure link.
 *
 * Kept controlled (the parent owns the array) so the same editor backs the
 * first send, the employee's resend, and the admin support resend.
 */
function HrContactsEditor({
  contacts,
  onChange,
  max = 10,
  disabled = false,
  label = 'HR contacts',
  hint = '',
  size = 'md',
}) {
  // Always render at least one row — an empty list would leave nothing to type in.
  const rows = contacts.length ? contacts : ['']

  const setAt = (index, value) => {
    onChange(rows.map((c, i) => (i === index ? value : c)))
  }

  const removeAt = (index) => {
    const next = rows.filter((_, i) => i !== index)
    onChange(next.length ? next : [''])
  }

  const inputClass =
    size === 'sm'
      ? 'w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-[#1e3a8a]'
      : 'w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a8a]'

  return (
    <div>
      {label && <p className="m-0 text-xs font-semibold text-slate-700">{label}</p>}
      {hint && <p className="m-0 mt-1 text-xs text-slate-500">{hint}</p>}

      <div className="mt-2 space-y-2">
        {rows.map((contact, index) => (
          // Rows are positional and only ever added/removed at the ends, so the
          // index is the identity here — a half-typed email is not unique.
          <div key={index} className="flex items-center gap-2">
            <input
              type="email"
              className={inputClass}
              value={contact}
              disabled={disabled}
              onChange={(e) => setAt(index, e.target.value)}
              placeholder={index === 0 ? 'hr@company.com' : 'another.hr@company.com'}
              aria-label={`HR contact ${index + 1}`}
            />
            {rows.length > 1 && (
              <button
                type="button"
                onClick={() => removeAt(index)}
                disabled={disabled}
                aria-label={`Remove HR contact ${index + 1}`}
                className="shrink-0 rounded-lg border border-slate-200 px-2.5 py-2 text-xs font-semibold text-slate-500 transition hover:border-red-200 hover:text-red-600 disabled:opacity-50"
              >
                Remove
              </button>
            )}
          </div>
        ))}
      </div>

      {rows.length < max ? (
        <button
          type="button"
          onClick={() => onChange([...rows, ''])}
          disabled={disabled}
          className="mt-2 rounded-lg text-xs font-semibold text-[#1e3a8a] transition hover:underline disabled:opacity-50"
        >
          + Add another HR contact
        </button>
      ) : (
        <p className="m-0 mt-2 text-xs text-slate-400">
          You can add up to {max} HR contacts.
        </p>
      )}
    </div>
  )
}

export default HrContactsEditor

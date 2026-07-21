import { useCallback, useEffect, useId, useRef, useState } from 'react'
import { FIELD_LABEL, FIELD_WRAP, fieldControlClass } from './fieldStyles'

function AutocompleteInput({
  id,
  label,
  required = false,
  value,
  onChange,
  onSelect,
  fetchSuggestions,
  minChars = 2,
  placeholder,
  leftIcon,
  disabled = false,
  error = false,
  errorText,
  hint,
  emptyHint,
}) {
  const listId = useId()
  const wrapRef = useRef(null)
  const skipNextLoadRef = useRef(false)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [suggestions, setSuggestions] = useState([])
  const [activeIndex, setActiveIndex] = useState(-1)

  const loadSuggestions = useCallback(
    async (query) => {
      const q = query.trim()
      if (q.length < minChars) {
        setSuggestions([])
        setOpen(false)
        return
      }
      setLoading(true)
      try {
        const results = await fetchSuggestions(q)
        setSuggestions(Array.isArray(results) ? results : [])
        setOpen(true)
        setActiveIndex(-1)
      } catch {
        setSuggestions([])
        setOpen(false)
      } finally {
        setLoading(false)
      }
    },
    [fetchSuggestions, minChars],
  )

  useEffect(() => {
    // Picking a suggestion changes `value`, which would re-trigger this fetch and
    // pop the dropdown straight back open — making it look like the click never
    // registered. Skip exactly one cycle after a pick.
    if (skipNextLoadRef.current) {
      skipNextLoadRef.current = false
      return undefined
    }
    const timer = window.setTimeout(() => {
      loadSuggestions(value)
    }, 280)
    return () => window.clearTimeout(timer)
  }, [value, loadSuggestions])

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const pick = (item) => {
    const labelText = typeof item === 'string' ? item : item.name
    skipNextLoadRef.current = true
    onChange(labelText)
    onSelect?.(item)
    setOpen(false)
    setSuggestions([])
  }

  const handleKeyDown = (e) => {
    if (!open || !suggestions.length) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, suggestions.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, 0))
    } else if (e.key === 'Enter' && activeIndex >= 0) {
      e.preventDefault()
      pick(suggestions[activeIndex])
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  const showDropdown = open && (loading || suggestions.length > 0 || value.trim().length >= minChars)

  return (
    <div ref={wrapRef} className={`relative ${FIELD_WRAP}`}>
      {label && (
        <label htmlFor={id} className={FIELD_LABEL}>
          {label}
          {required && <span className="text-danger"> *</span>}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2 text-ink-faint">
            {leftIcon}
          </span>
        )}
        <input
          id={id}
          type="text"
          value={value}
          disabled={disabled}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={showDropdown}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-invalid={error ? 'true' : undefined}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => value.trim().length >= minChars && suggestions.length > 0 && setOpen(true)}
          onKeyDown={handleKeyDown}
          className={fieldControlClass({ error, leftIcon: Boolean(leftIcon), rightSlot: loading })}
        />
        {loading && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-faint">
            ...
          </span>
        )}

        {showDropdown && (
          <ul
            id={listId}
            role="listbox"
            className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-52 overflow-auto rounded-xl border border-slate-200 bg-white py-1 shadow-lg"
          >
            {loading && (
              <li className="px-4 py-2.5 text-sm text-slate-500">Searching...</li>
            )}
            {!loading && suggestions.length === 0 && (
              <li className="px-4 py-2.5 text-sm text-slate-500">
                {emptyHint || 'No matches — you can still type your own'}
              </li>
            )}
            {!loading &&
              suggestions.map((item, index) => {
                const name = typeof item === 'string' ? item : item.name
                const meta = typeof item === 'object' && item.industry
                  ? [item.industry, item.city].filter(Boolean).join(' · ')
                  : typeof item === 'object' && item.source === 'registered'
                    ? 'On PagerLook'
                    : null
                return (
                  <li key={`${name}-${index}`} role="option" aria-selected={activeIndex === index}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pick(item)}
                      className={`flex w-full flex-col items-start px-4 py-2.5 text-left transition hover:bg-blue-50 ${
                        activeIndex === index ? 'bg-blue-50' : ''
                      }`}
                    >
                      <span className="text-sm font-semibold text-slate-900">{name}</span>
                      {meta && <span className="text-xs text-slate-500">{meta}</span>}
                    </button>
                  </li>
                )
              })}
          </ul>
        )}
      </div>

      {error && errorText && (
        <p className="m-0 text-xs text-red-600" role="alert">
          {errorText}
        </p>
      )}
      {!error && hint && (
        <p className="m-0 text-xs text-slate-400">{hint}</p>
      )}
    </div>
  )
}

export default AutocompleteInput

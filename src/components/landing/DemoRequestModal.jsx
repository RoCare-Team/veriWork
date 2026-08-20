import { useEffect, useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { submitDemoRequest } from '../../api/public'

/*
 * "Book a demo" — the visitor has no account yet, so this asks only for what a
 * sales call needs and files the lead into the admin console. Success stays in
 * the modal rather than navigating away: the page they were reading is the
 * reason they asked, and they may want to keep reading it.
 */

const TEAM_SIZES = ['1-10', '11-50', '51-200', '201-1000', '1000+']

const EMPTY = { name: '', email: '', phone: '', company: '', teamSize: '', message: '' }

function Field({ label, hint, children }) {
  return (
    <label className="flex flex-col gap-1.5 text-sm">
      <span className="font-semibold text-slate-800">
        {label}
        {hint && <span className="ml-1 font-normal text-slate-400">{hint}</span>}
      </span>
      {children}
    </label>
  )
}

const inputClass =
  'h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100'

// Mounted only while open (see LandingNavbar), so every visit starts on a fresh
// form — no reset effect needed.
function DemoRequestModal({ onClose }) {
  const [form, setForm] = useState(EMPTY)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const mutation = useMutation({
    mutationFn: () => submitDemoRequest(form),
    onSuccess: () => {
      setError('')
      setDone(true)
    },
    onError: (err) => setError(err.message || 'Could not send your request. Please try again.'),
  })

  const phoneDigits = form.phone.replace(/\D/g, '')
  const canSubmit =
    form.name.trim().length >= 2 && /\S+@\S+\.\S+/.test(form.email) && phoneDigits.length >= 10

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!canSubmit || mutation.isPending) return
    mutation.mutate()
  }

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Book a demo"
    >
      <button
        type="button"
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      {/* Full-height sheet on a phone, centred card from sm up. */}
      <div className="animate-fade-in relative z-10 flex max-h-[92vh] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-slate-200 bg-white shadow-2xl sm:rounded-3xl">
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4 md:px-7 md:py-5">
          <div>
            <h2 className="m-0 text-lg font-extrabold tracking-tight text-slate-900 md:text-xl">
              Book a demo
            </h2>
            <p className="m-0 mt-1 text-sm text-slate-500">
              See PagerLook on your own workforce — a 20-minute walkthrough.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {done ? (
          <div className="px-5 py-10 text-center md:px-7">
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <h3 className="m-0 mt-4 text-lg font-extrabold text-slate-900">Request received</h3>
            <p className="m-0 mx-auto mt-2 max-w-sm text-sm leading-relaxed text-slate-600">
              Our team will call you on <strong>{form.phone}</strong> to fix a time. You&apos;ll also
              get a confirmation at {form.email}.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-6 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#1e3a8a] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#172554]"
            >
              Back to site
            </button>
          </div>
        ) : (
          <form className="flex min-h-0 flex-1 flex-col" onSubmit={handleSubmit} noValidate>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 md:px-7">
              {error && (
                <p
                  className="m-0 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                  role="alert"
                >
                  {error}
                </p>
              )}

              <div className="flex flex-col gap-4">
                <Field label="Your name">
                  <input
                    className={inputClass}
                    value={form.name}
                    onChange={set('name')}
                    placeholder="Priya Sharma"
                    autoComplete="name"
                  />
                </Field>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Work email">
                    <input
                      className={inputClass}
                      type="email"
                      value={form.email}
                      onChange={set('email')}
                      placeholder="you@company.com"
                      autoComplete="email"
                    />
                  </Field>
                  <Field label="Phone">
                    <input
                      className={inputClass}
                      type="tel"
                      inputMode="numeric"
                      value={form.phone}
                      onChange={set('phone')}
                      placeholder="98765 43210"
                      autoComplete="tel"
                    />
                  </Field>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Company" hint="(optional)">
                    <input
                      className={inputClass}
                      value={form.company}
                      onChange={set('company')}
                      placeholder="Acme Pvt Ltd"
                      autoComplete="organization"
                    />
                  </Field>
                  <Field label="Team size" hint="(optional)">
                    <select className={inputClass} value={form.teamSize} onChange={set('teamSize')}>
                      <option value="">Select</option>
                      {TEAM_SIZES.map((size) => (
                        <option key={size} value={size}>
                          {size} people
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>

                <Field label="What would you like to see?" hint="(optional)">
                  <textarea
                    className="min-h-24 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100"
                    value={form.message}
                    onChange={set('message')}
                    placeholder="Bulk onboarding for 200 field staff, Aadhaar verification…"
                    maxLength={1000}
                  />
                </Field>
              </div>
            </div>

            <div className="border-t border-slate-100 px-5 py-4 md:px-7">
              <button
                type="submit"
                disabled={!canSubmit || mutation.isPending}
                className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-[#1e3a8a] px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-900/20 transition hover:bg-[#172554] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {mutation.isPending ? 'Sending…' : 'Request demo'}
              </button>
              <p className="m-0 mt-3 text-center text-xs text-slate-400">
                We only use these details to contact you about the demo.
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

export default DemoRequestModal

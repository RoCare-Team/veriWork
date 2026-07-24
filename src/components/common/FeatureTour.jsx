import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getTourForPortal, TOUR_VERSION } from '../../utils/featureTourContent'

/**
 * First-run feature guide. Appears once per user, per portal, after they land
 * in the portal (so only ever after login is complete) and can always be
 * skipped. "Seen" is stored locally so it never nags on a return visit.
 */

const ICONS = {
  shield: 'M12 3l7 2.6v6.1c0 4.8-3.3 8.5-7 9.6-3.7-1.1-7-4.8-7-9.6V5.6L12 3Z',
  chart: 'M4 19h16M7 16V9M12 16V5M17 16v-4',
  idcard: 'M3 6h18v12H3zM7 10h3M7 14h6M15 10h2M15 14h2',
  lock: 'M6 11h12v9H6zM9 11V8a3 3 0 0 1 6 0v3',
  users: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM2 20c0-3.3 2.7-5.5 6-5.5S14 16.7 14 20M17 11a3 3 0 1 0 0-6M16 14.6c3 .3 5 2.3 5 5.4',
  badge: 'M12 3l2.2 1.6 2.7-.2.8 2.6 2.2 1.6-1 2.5 1 2.5-2.2 1.6-.8 2.6-2.7-.2L12 21l-2.2-1.6-2.7.2-.8-2.6L4.1 15.4l1-2.5-1-2.5 2.2-1.6.8-2.6 2.7.2L12 3Z',
  key: 'M14 7a4 4 0 1 1-3.4 6.1L4 20l-1 -1 1.5-1.5L3 16l1.5-1.5L3 13l7.9-7.9A4 4 0 0 1 14 7Z',
}

function TourIcon({ name }) {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={ICONS[name] || ICONS.shield}
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function storageKey(portal, userId) {
  return `pl_tour_${TOUR_VERSION}_${portal}_${userId || 'anon'}`
}

function hasSeenTour(portal, userId) {
  try {
    return localStorage.getItem(storageKey(portal, userId)) === 'seen'
  } catch {
    // Private mode / storage disabled — treat as seen so we never trap the user.
    return true
  }
}

function markTourSeen(portal, userId) {
  try {
    localStorage.setItem(storageKey(portal, userId), 'seen')
  } catch {
    /* ignore */
  }
}

function FeatureTour({ portal = 'employee' }) {
  const { user, profile, company } = useAuth()
  const userId = user?.id || user?._id || profile?.id || company?.id || ''

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState(0)

  // Wait a beat so the page paints first — the tour should feel like a welcome,
  // not a blocking splash.
  useEffect(() => {
    if (!userId || hasSeenTour(portal, userId)) return undefined
    const timer = setTimeout(() => setOpen(true), 600)
    return () => clearTimeout(timer)
  }, [portal, userId])

  if (!open) return null

  const tour = getTourForPortal(portal)
  const steps = tour.steps
  const current = steps[step]
  const isLast = step === steps.length - 1

  const close = () => {
    markTourSeen(portal, userId)
    setOpen(false)
  }

  return (
    <div className="fixed inset-0 z-[1200] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#172554] via-[#1e3a8a] to-[#2748a6] px-6 py-5 text-white md:px-8">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="m-0 text-[11px] font-bold uppercase tracking-widest text-white/60">
                {step + 1} of {steps.length}
              </p>
              <h2 className="m-0 mt-1 text-lg font-extrabold md:text-xl">{tour.title}</h2>
              <p className="m-0 mt-1 text-sm text-white/70">{tour.subtitle}</p>
            </div>
            <button
              type="button"
              onClick={close}
              aria-label="Skip tour"
              className="shrink-0 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            >
              <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 py-6 md:px-8">
          <div className="flex items-start gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-[#1e3a8a]">
              <TourIcon name={current.icon} />
            </span>
            <div className="min-w-0">
              <h3 className="m-0 text-base font-extrabold text-slate-900">{current.title}</h3>
              <p className="m-0 mt-1.5 text-sm leading-relaxed text-slate-600">{current.body}</p>
            </div>
          </div>

          {current.points?.length > 0 && (
            <ul className="m-0 mt-4 list-none space-y-2 p-0">
              {current.points.map((point) => (
                <li key={point} className="flex items-center gap-2.5 text-sm text-slate-700">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-emerald-600">
                    <svg width="12" height="12" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                      <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          )}

          {/* Progress dots */}
          <div className="mt-6 flex justify-center gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.title}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === step ? 'w-6 bg-[#1e3a8a]' : 'w-1.5 bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={close}
            className="text-sm font-semibold text-slate-500 underline-offset-2 hover:text-slate-700 hover:underline"
          >
            Skip tour
          </button>

          <div className="flex items-center gap-2">
            {step > 0 && (
              <button
                type="button"
                onClick={() => setStep((s) => s - 1)}
                className="rounded-ctl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Back
              </button>
            )}
            <button
              type="button"
              onClick={() => (isLast ? close() : setStep((s) => s + 1))}
              className="rounded-ctl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172554]"
            >
              {isLast ? 'Get started' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FeatureTour

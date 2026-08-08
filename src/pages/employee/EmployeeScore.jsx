import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import EmployeeScoreGauge from '../../components/employee/EmployeeScoreGauge'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { useState } from 'react'
import { employeeKeys, fetchScore } from '../../api/employee'
import { SCORE_MAX, SCORE_MIN, getScoreRating } from '../../utils/employeeScoreUtils'
import { useAuth } from '../../context/AuthContext'
import { getMissingJourneySteps } from '../../utils/employeeJourney'

function CheckDot({ done }) {
  return (
    <span
      className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full ${
        done ? 'bg-emerald-500 text-white' : 'border border-slate-300 bg-white'
      }`}
    >
      {done && (
        <svg width="10" height="10" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="M5 10.5l3.2 3.2L15 7" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  )
}

/** One score category — expandable to show exactly which items earn points. */
function FactorRow({ factor }) {
  const [open, setOpen] = useState(false)
  const pct = factor.max > 0 ? (factor.points / factor.max) * 100 : 0
  const items = factor.items || []
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <button
        type="button"
        onClick={() => items.length && setOpen((o) => !o)}
        className="flex w-full items-start justify-between gap-3 text-left"
      >
        <div>
          <p className="m-0 text-sm font-bold text-slate-900">{factor.label}</p>
          <p className="m-0 mt-1 text-xs text-slate-500">{factor.tip}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-xs font-bold text-slate-600">{factor.points}/{factor.max}</span>
          {items.length > 0 && (
            <svg
              width="14" height="14" viewBox="0 0 20 20" fill="none"
              className={`text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`}
              aria-hidden="true"
            >
              <path d="M5 8l5 5 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </div>
      </button>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#1e3a8a]" style={{ width: `${pct}%` }} />
      </div>

      {open && items.length > 0 && (
        <ul className="m-0 mt-3 list-none space-y-2 border-t border-slate-100 p-0 pt-3">
          {items.map((it) => (
            <li key={it.id} className="flex items-center justify-between gap-3 text-xs">
              <span className="flex items-center gap-2">
                <CheckDot done={it.done} />
                <span className={it.done ? 'text-slate-700' : 'text-slate-400'}>{it.label}</span>
              </span>
              <span className={`font-bold ${it.done ? 'text-emerald-600' : 'text-slate-400'}`}>
                {it.points}/{it.max}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function EmployeeScore() {
  const { profile } = useAuth()
  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.score,
    queryFn: fetchScore,
  })

  // Optional journey steps not done yet — surfaced here as the "what next".
  const missingSteps = getMissingJourneySteps(profile)

  if (isLoading) return <Loader variant="fullPage" label="Loading your score..." />

  if (error) {
    return (
      <EmployeeLayout>
        <EmployeePageHeader title="Employee Score" subtitle="Unable to load score data" />
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message || 'Failed to load score'}
        </p>
      </EmployeeLayout>
    )
  }

  if (!data) {
    return (
      <EmployeeLayout>
        <EmployeePageHeader title="Employee Score" subtitle="No score data available yet" />
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Complete profile verification and add job history to generate your score.
        </p>
      </EmployeeLayout>
    )
  }

  // Derive rating locally so the badge/number get proper Tailwind colours for
  // all six bands (the API sends a hex colour, not a class).
  const rating = getScoreRating(data.employeeScore)

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Employee Score" subtitle="Your PagerLook Score — like CIBIL, but for your career" />

      <div className="lg:grid lg:grid-cols-5 lg:gap-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <EmployeeScoreGauge score={data.employeeScore} rating={rating} size="lg" />
          <p className="mt-4 text-center text-sm text-slate-600">{rating.description}</p>
          <p className="mt-2 text-center text-xs font-semibold text-[#1e3a8a]">{data.percentile}</p>
          {data.trustPoints != null && (
            <p className="mt-3 text-center text-xs font-semibold text-slate-500">
              <span className="text-slate-900">{data.trustPoints}</span> / {data.maxTrustPoints ?? 1000} trust points verified
            </p>
          )}
          <p className="mt-2 text-center text-xs text-slate-400">Range {data.minScore ?? SCORE_MIN}–{data.maxScore ?? SCORE_MAX}</p>

          {(data.verificationTags || []).length > 0 && (
            <div className="mt-5 border-t border-slate-100 pt-4">
              <p className="m-0 text-center text-xs font-bold uppercase text-slate-400">Trust levels</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {data.verificationTags.map((tag) => (
                  <span key={tag.id} className="rounded-full bg-green-50 px-2.5 py-1 text-[10px] font-bold text-green-700">
                    ✓ {tag.label}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-6 space-y-4 lg:col-span-3 lg:mt-0">
          {/* Anything they skipped during setup, with what it's worth. This is
              why finishing setup lands here — it turns a skip into a next step. */}
          {missingSteps.length > 0 && (
            <section className="rounded-2xl border border-amber-200 bg-amber-50/70 p-5">
              <h3 className="m-0 text-sm font-bold text-slate-900">
                Boost your score by up to +{missingSteps.reduce((sum, s) => sum + s.points, 0)} points
              </h3>
              <p className="m-0 mt-1 text-xs text-slate-600">
                You skipped these during setup — add them any time to earn the points.
              </p>
              <div className="mt-4 flex flex-col gap-3">
                {missingSteps.map((s) => (
                  <div
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-bold text-slate-900">
                        {s.title}{' '}
                        <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                          +{s.points} pts
                        </span>
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-slate-500">{s.description}</p>
                    </div>
                    <Link
                      to={s.path}
                      className="shrink-0 rounded-ctl bg-brand-600 px-4 py-2 text-xs font-semibold text-white no-underline hover:bg-brand-700"
                    >
                      Add now
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-600">
            Employers use your PagerLook Score ({data.employeeScore}) for hiring and workforce decisions.
          </div>

          <h2 className="m-0 text-sm font-bold text-slate-800">Score breakdown</h2>
          {data.factors?.length ? (
            data.factors.map((f) => <FactorRow key={f.id || f.label} factor={f} />)
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No score factors available yet.
            </p>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/employee/job-history/add" className="flex-1 no-underline">
              <Button type="button">Add job to improve score</Button>
            </Link>
            <Link to="/employee/professional-id" className="flex-1 no-underline">
              <Button type="button" variant="secondary">Share Professional ID</Button>
            </Link>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default EmployeeScore

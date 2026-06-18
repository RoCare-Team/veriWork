import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import EmployeeScoreGauge from '../../components/employee/EmployeeScoreGauge'
import EndorseColleagueModal from '../../components/employee/EndorseColleagueModal'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { employeeKeys, fetchEndorsements, fetchScore } from '../../api/employee'
import { SCORE_MAX, SCORE_MIN } from '../../utils/employeeScoreUtils'

function FactorRow({ factor }) {
  const pct = factor.max > 0 ? (factor.points / factor.max) * 100 : 0
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4">
      <div className="flex justify-between gap-3">
        <div>
          <p className="m-0 text-sm font-bold text-slate-900">{factor.label}</p>
          <p className="m-0 mt-1 text-xs text-slate-500">{factor.tip}</p>
        </div>
        <span className="text-xs font-bold text-slate-600">+{factor.points}/{factor.max}</span>
      </div>
      <div className="mt-3 h-2 rounded-full bg-slate-100">
        <div className="h-full rounded-full bg-[#1a3a8f]" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

function EndorsementsSummary({ endorsements }) {
  if (!endorsements) return null
  const { count = 0, maxCount = 0, points = 0, maxPoints = 60 } = endorsements

  return (
    <div className="rounded-2xl border border-amber-100 bg-amber-50/50 p-4">
      <p className="m-0 text-sm font-bold text-slate-900">Peer endorsements</p>
      <div className="mt-3 grid grid-cols-2 gap-4">
        <div>
          <p className="m-0 text-xs text-slate-500">Endorsements received</p>
          <p className="m-0 mt-1 text-lg font-extrabold text-slate-900">
            {count}/{maxCount || '—'}
          </p>
        </div>
        <div>
          <p className="m-0 text-xs text-slate-500">Score contribution</p>
          <p className="m-0 mt-1 text-lg font-extrabold text-amber-600">
            {points}/{maxPoints}
          </p>
        </div>
      </div>
      <p className="m-0 mt-3 text-xs text-slate-600">Get endorsed by colleagues and managers to boost your VeriScore.</p>
    </div>
  )
}

function EndorsementCard({ item }) {
  const name = item.endorserName || item.name || 'Colleague'
  const relationship = item.relationship || item.relation
  return (
    <article className="rounded-xl border border-slate-100 bg-white p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-sm font-bold text-slate-900">{name}</p>
          {relationship && (
            <p className="m-0 mt-0.5 text-xs capitalize text-slate-500">{relationship}</p>
          )}
        </div>
        {item.createdAt && (
          <time className="shrink-0 text-[10px] text-slate-400">
            {new Date(item.createdAt).toLocaleDateString()}
          </time>
        )}
      </div>
      {item.message && (
        <p className="m-0 mt-2 text-sm text-slate-600">{item.message}</p>
      )}
    </article>
  )
}

function EmployeeScore() {
  const queryClient = useQueryClient()
  const [showEndorseModal, setShowEndorseModal] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.score,
    queryFn: fetchScore,
  })

  const endorsementsQuery = useQuery({
    queryKey: employeeKeys.endorsements,
    queryFn: fetchEndorsements,
    retry: false,
  })

  const endorsementList = Array.isArray(endorsementsQuery.data)
    ? endorsementsQuery.data
    : endorsementsQuery.data?.endorsements || endorsementsQuery.data?.items || []

  const refreshScore = () => {
    queryClient.invalidateQueries({ queryKey: employeeKeys.score })
    queryClient.invalidateQueries({ queryKey: employeeKeys.endorsements })
  }

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

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Employee Score" subtitle="Your VeriScore — like CIBIL, but for your career" />

      <div className="lg:grid lg:grid-cols-5 lg:gap-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm lg:col-span-2">
          <EmployeeScoreGauge score={data.employeeScore} rating={data.scoreRating} size="lg" />
          <p className="mt-4 text-center text-sm text-slate-600">{data.scoreRating?.description}</p>
          <p className="mt-2 text-center text-xs font-semibold text-[#ea7a3b]">{data.percentile}</p>
          <p className="mt-4 text-center text-xs text-slate-400">Range {SCORE_MIN}–{SCORE_MAX}</p>
        </div>

        <div className="mt-6 space-y-4 lg:col-span-3 lg:mt-0">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-600">
            Employers use your VeriScore ({data.employeeScore}) for hiring and workforce decisions.
          </div>

          <EndorsementsSummary endorsements={data.endorsements} />

          <h2 className="m-0 text-sm font-bold text-slate-800">Score breakdown</h2>
          {data.factors?.length ? (
            data.factors.map((f) => <FactorRow key={f.id || f.label} factor={f} />)
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No score factors available yet.
            </p>
          )}

          <div className="rounded-2xl border border-slate-100 bg-white p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-sm font-bold text-slate-900">Peer endorsements</h3>
                <p className="m-0 mt-1 text-xs text-slate-500">Endorse colleagues or get endorsed to grow your score.</p>
              </div>
              <Button type="button" onClick={() => setShowEndorseModal(true)} fullWidth={false}>
                Endorse a colleague
              </Button>
            </div>

            {endorsementsQuery.isLoading && (
              <p className="m-0 mt-4 text-sm text-slate-500">Loading endorsements...</p>
            )}

            {!endorsementsQuery.isLoading && endorsementList.length > 0 && (
              <div className="mt-4 flex flex-col gap-2">
                {endorsementList.map((item, index) => (
                  <EndorsementCard key={item._id || item.id || index} item={item} />
                ))}
              </div>
            )}

            {!endorsementsQuery.isLoading && !endorsementList.length && !endorsementsQuery.error && (
              <p className="m-0 mt-4 rounded-xl border border-dashed border-slate-200 p-4 text-center text-sm text-slate-500">
                No endorsements yet. Share your VeriWork ID from Professional ID so others can endorse you.
              </p>
            )}
          </div>

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

      {showEndorseModal && (
        <EndorseColleagueModal
          onClose={() => setShowEndorseModal(false)}
          onSuccess={refreshScore}
        />
      )}
    </EmployeeLayout>
  )
}

export default EmployeeScore

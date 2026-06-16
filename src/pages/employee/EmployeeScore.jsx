import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import EmployeeScoreGauge from '../../components/employee/EmployeeScoreGauge'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { employeeKeys, fetchScore } from '../../api/employee'
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

function EmployeeScore() {
  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.score,
    queryFn: fetchScore,
  })

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
          <h2 className="m-0 text-sm font-bold text-slate-800">Score breakdown</h2>
          {data.factors?.length ? (
            data.factors.map((f) => <FactorRow key={f.id || f.label} factor={f} />)
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No score factors available yet.
            </p>
          )}
          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/employee/job-history/add" className="flex-1 no-underline"><Button type="button">Add job to improve score</Button></Link>
            <Link to="/employee/professional-id" className="flex-1 no-underline"><Button type="button" variant="secondary">Professional ID</Button></Link>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default EmployeeScore

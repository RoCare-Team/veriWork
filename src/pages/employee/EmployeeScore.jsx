import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import EmployeeScoreGauge from '../../components/employee/EmployeeScoreGauge'
import Button from '../../components/common/Button'
import {
  getEmployeeData,
  getEmployeeProfile,
  isVerificationComplete,
} from '../../store/employeeStore'
import {
  getScoreFactors,
  getScorePercentile,
  SCORE_MAX,
  SCORE_MIN,
} from '../../utils/employeeScoreUtils'

function FactorRow({ factor }) {
  const pct = factor.max > 0 ? (factor.points / factor.max) * 100 : 0

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="m-0 text-sm font-bold text-slate-900">{factor.label}</p>
          <p className="m-0 mt-1 text-xs text-slate-500">{factor.tip}</p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-bold ${
            factor.done ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
          }`}
        >
          +{factor.points}/{factor.max}
        </span>
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all ${factor.done ? 'bg-green-500' : 'bg-[#1a3a8f]'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  )
}

function EmployeeScore() {
  const navigate = useNavigate()
  const data = getEmployeeData()
  const profile = getEmployeeProfile()
  const factors = getScoreFactors(data)

  useEffect(() => {
    if (!isVerificationComplete()) {
      navigate('/employee/verification', { replace: true })
    }
  }, [navigate])

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Employee Score"
        subtitle="Your VeriScore — like CIBIL, but for your career"
      />

      <div className="lg:grid lg:grid-cols-5 lg:items-start lg:gap-8">
        <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8 lg:col-span-2">
          <EmployeeScoreGauge
            score={profile.employeeScore}
            rating={profile.scoreRating}
            size="lg"
          />
          <p className="m-0 mt-4 text-center text-sm leading-relaxed text-slate-600">
            {profile.scoreRating.description}
          </p>
          <p className="m-0 mt-2 text-center text-xs font-semibold text-[#ea7a3b]">
            {getScorePercentile(profile.employeeScore)}
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 border-t border-slate-100 pt-6">
            <div className="text-center">
              <p className="m-0 text-xs text-slate-400">Range</p>
              <p className="m-0 mt-1 text-sm font-bold text-slate-800">
                {SCORE_MIN}–{SCORE_MAX}
              </p>
            </div>
            <div className="text-center">
              <p className="m-0 text-xs text-slate-400">Verification</p>
              <p className="m-0 mt-1 text-sm font-bold text-green-600">
                {profile.verificationPercent}% complete
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 space-y-4 lg:col-span-3 lg:mt-0">
          <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 md:p-5">
            <p className="m-0 text-sm font-bold text-[#1a3a8f]">How companies use your score</p>
            <p className="m-0 mt-2 text-sm leading-relaxed text-slate-600">
              Employers see your VeriScore during hiring, onboarding, and workforce management —
              similar to how banks use CIBIL. A higher score means faster approvals and stronger trust.
            </p>
          </div>

          <h2 className="m-0 text-sm font-bold text-slate-800">Score breakdown</h2>
          <div className="flex flex-col gap-3">
            {factors.map((factor) => (
              <FactorRow key={factor.id} factor={factor} />
            ))}
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <Link to="/employee/job-history/add" className="flex-1 no-underline">
              <Button type="button">Add job to improve score</Button>
            </Link>
            <Link to="/employee/professional-id" className="flex-1 no-underline">
              <Button type="button" variant="secondary">
                View Professional ID
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default EmployeeScore

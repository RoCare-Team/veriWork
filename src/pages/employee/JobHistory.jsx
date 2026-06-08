import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { getJobHistory, isVerificationComplete } from '../../store/employeeStore'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import JobHistoryCard from '../../components/employee/JobHistoryCard'

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function DocumentPlusIcon() {
  return (
    <svg className="mx-auto h-10 w-10 text-slate-300 md:h-12 md:w-12" viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <rect x="8" y="6" width="24" height="28" rx="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M14 14h12M14 20h8M22 28v-6h-6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function JobHistory() {
  const navigate = useNavigate()
  const jobs = getJobHistory()
  const verifiedCount = jobs.filter((j) => j.status === 'verified').length
  const totalCount = jobs.length
  const progress = totalCount > 0 ? (verifiedCount / totalCount) * 100 : 0

  useEffect(() => {
    if (!isVerificationComplete()) {
      navigate('/employee/verification', { replace: true })
    }
  }, [navigate])

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Job History"
        subtitle="Your verified employment records"
        action={
          <Link
            to="/employee/job-history/add"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 md:h-11 md:w-11"
            aria-label="Add experience"
          >
            <PlusIcon />
          </Link>
        }
      />

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1a3a8f] to-[#2747b2] p-5 text-white shadow-lg shadow-blue-900/20 md:p-6 lg:p-7">
        <div>
          <p className="m-0 text-xs text-white/70 md:text-sm">Your Records</p>
          <p className="m-0 mt-1 text-2xl font-extrabold md:text-3xl">
            {totalCount} role{totalCount !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="relative flex h-16 w-16 items-center justify-center md:h-20 md:w-20">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#4ade80"
              strokeWidth="5"
              strokeLinecap="round"
              strokeDasharray={2 * Math.PI * 26}
              strokeDashoffset={2 * Math.PI * 26 * (1 - progress / 100)}
            />
          </svg>
          <span className="absolute text-sm font-bold md:text-base">
            {verifiedCount}/{totalCount || 0}
          </span>
        </div>
      </div>

      {jobs.length > 0 ? (
        <>
          <div className="mt-6 flex items-center justify-between md:mt-8">
            <h2 className="m-0 text-sm font-bold text-slate-800 md:text-base">Employment Records</h2>
            <span className="text-xs text-slate-400 md:text-sm">Recent First</span>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
            {jobs.map((job) => (
              <JobHistoryCard key={job.id} job={job} />
            ))}
          </div>
        </>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center md:mt-8 md:p-12">
          <DocumentPlusIcon />
          <p className="m-0 mt-3 text-base font-bold text-slate-800">No job history yet</p>
          <p className="m-0 mt-2 text-sm text-slate-500">
            Add your first role to start building your verified work record.
          </p>
        </div>
      )}

      <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center md:mt-8 md:p-8">
        <p className="m-0 text-sm text-slate-500 md:text-base">
          Add another role to increase your Trust Score
        </p>
        <Link
          to="/employee/job-history/add"
          className="mt-3 inline-flex items-center gap-2 rounded-2xl bg-[#1a3a8f] px-6 py-3.5 text-sm font-semibold text-white no-underline shadow-lg shadow-blue-900/20 transition hover:bg-[#152b6e] md:text-base"
        >
          <PlusIcon />
          Add Experience
        </Link>
      </div>
    </EmployeeLayout>
  )
}

export default JobHistory

import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import JobHistoryCard from '../../components/employee/JobHistoryCard'
import Loader from '../../components/common/Loader'
import { employeeKeys, fetchJobs } from '../../api/employee'

function PlusIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function mapJob(job) {
  return {
    id: job._id || job.id,
    title: job.title,
    company: job.company,
    duration: job.duration,
    type: job.employmentType || job.type,
    status: job.status,
    statusLabel: job.statusLabel,
  }
}

function JobHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.jobs,
    queryFn: fetchJobs,
  })

  const summary = data?.summary || {}
  const jobs = (data?.jobs || data || []).map?.(mapJob) ?? []
  const mapped = Array.isArray(data?.jobs) ? data.jobs.map(mapJob) : Array.isArray(data) ? data.map(mapJob) : []
  const list = mapped.length ? mapped : jobs

  const totalRoles = summary.totalRoles ?? list.length
  const verifiedCount = summary.verifiedCount ?? list.filter((j) => j.status === 'verified').length
  const verifiedLabel = summary.verifiedLabel || `${verifiedCount}/${totalRoles || list.length || 0}`
  const progress = totalRoles > 0 ? (verifiedCount / totalRoles) * 100 : 0

  if (isLoading) return <Loader variant="fullPage" label="Loading job history..." />

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Job History"
        subtitle="Your verified employment records"
        action={
          <Link to="/employee/job-history/add" className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50" aria-label="Add experience">
            <PlusIcon />
          </Link>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      )}

      <div className="flex items-center justify-between gap-4 rounded-2xl bg-gradient-to-r from-[#1a3a8f] to-[#2747b2] p-5 text-white shadow-lg">
        <div>
          <p className="m-0 text-xs text-white/70">Your Records</p>
          <p className="m-0 mt-1 text-2xl font-extrabold">
            {totalRoles} role{totalRoles !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="relative flex h-16 w-16 items-center justify-center">
          <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
            <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="5" />
            <circle
              cx="32"
              cy="32"
              r="26"
              fill="none"
              stroke="#4ade80"
              strokeWidth="5"
              strokeDasharray={163.36}
              strokeDashoffset={163.36 * (1 - progress / 100)}
            />
          </svg>
          <span className="absolute text-sm font-bold">{verifiedLabel}</span>
        </div>
      </div>

      {list.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-3 lg:grid-cols-2">
          {list.map((job) => (
            <JobHistoryCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
          <p className="m-0 font-bold text-slate-800">No job history yet</p>
          <p className="m-0 mt-2 text-sm text-slate-500">Add your first role to build your VeriScore.</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <Link to="/employee/job-history/add" className="inline-flex items-center gap-2 rounded-2xl bg-[#1a3a8f] px-6 py-3.5 text-sm font-semibold text-white no-underline shadow-lg hover:bg-[#152b6e]">
          <PlusIcon /> Add Experience
        </Link>
      </div>
    </EmployeeLayout>
  )
}

export default JobHistory

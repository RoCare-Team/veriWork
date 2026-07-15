import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import JobHistoryCard from '../../components/employee/JobHistoryCard'
import Loader from '../../components/common/Loader'
import { employeeKeys, fetchJobs } from '../../api/employee'
import { isJobVerified } from '../../utils/jobHistoryUtils'

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
    joiningDate: job.joiningDate,
    exitDate: job.exitDate,
    isPresent: job.isPresent,
    salaryBand: job.salaryBand,
    type: job.employmentType || job.type,
    employmentType: job.employmentType,
    employeeCode: job.employeeCode,
    department: job.department,
    workLocation: job.workLocation,
    uanNumber: job.uanNumber,
    pfNumber: job.pfNumber,
    esiNumber: job.esiNumber,
    companyPan: job.companyPan,
    companyCin: job.companyCin,
    companyGst: job.companyGst,
    managerName: job.managerName,
    status: job.status,
    statusLabel: job.statusLabel,
    verificationTag: job.verificationTag,
    verificationLevel: job.verificationLevel,
    verifiedAt: job.verifiedAt,
  }
}

function StatCard({ label, value, sub, accent }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
      <p className="m-0 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
      <p className={`m-0 mt-1 text-2xl font-extrabold ${accent || 'text-slate-900'}`}>{value}</p>
      {sub && <p className="m-0 mt-0.5 text-xs text-slate-500">{sub}</p>}
    </div>
  )
}

function JobHistory() {
  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.jobs,
    queryFn: fetchJobs,
  })

  const list = Array.isArray(data?.jobs)
    ? data.jobs.map(mapJob)
    : Array.isArray(data)
      ? data.map(mapJob)
      : []

  const totalRoles = data?.summary?.totalRoles ?? list.length
  const verifiedCount = list.filter((j) => isJobVerified(j)).length
  const inProgressCount = list.filter((j) => j.status === 'in_process').length
  const pendingCount = Math.max(0, totalRoles - verifiedCount - inProgressCount)
  const progress = totalRoles > 0 ? Math.round((verifiedCount / totalRoles) * 100) : 0

  if (isLoading) return <Loader variant="fullPage" label="Loading job history..." />

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Job History"
        subtitle="Verified employment records that power your VeriScore"
        action={
          <Link
            to="/employee/job-history/add"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:border-[#005fd6] hover:text-[#005fd6]"
            aria-label="Add experience"
          >
            <PlusIcon />
          </Link>
        }
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error.message}
        </p>
      )}

      <div className="mb-6 grid grid-cols-3 gap-3">
        <StatCard label="Total roles" value={totalRoles} sub="On your profile" />
        <StatCard label="Verified" value={verifiedCount} sub={`${progress}% complete`} accent="text-green-600" />
        <StatCard
          label="Pending"
          value={pendingCount + inProgressCount}
          sub={inProgressCount ? `${inProgressCount} in progress` : 'Needs verification'}
          accent="text-amber-600"
        />
      </div>

      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#005fd6] via-[#1f3d9a] to-[#0073fe] p-5 text-white shadow-lg md:p-6">
        <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/5" />
        <div className="relative flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="m-0 text-xs font-medium uppercase tracking-wider text-white/60">Verification progress</p>
            <p className="m-0 mt-1 text-xl font-bold md:text-2xl">
              {verifiedCount} of {totalRoles} roles verified
            </p>
            <p className="m-0 mt-1 max-w-md text-sm text-white/70">
              Each verified role adds trust to your profile and improves your VeriScore.
            </p>
          </div>
          <div className="relative flex h-[72px] w-[72px] shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 72 72" aria-hidden="true">
              <circle cx="36" cy="36" r="30" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="6" />
              <circle
                cx="36"
                cy="36"
                r="30"
                fill="none"
                stroke="#4ade80"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={188.5}
                strokeDashoffset={188.5 * (1 - progress / 100)}
              />
            </svg>
            <span className="absolute text-sm font-bold">{verifiedCount}/{totalRoles}</span>
          </div>
        </div>
        <div className="relative mt-4 h-2 overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-300 transition-all duration-700"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {list.length > 0 ? (
        <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {list.map((job) => (
            <JobHistoryCard key={job.id} job={job} />
          ))}
        </div>
      ) : (
        <div className="mt-6 rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
          <p className="m-0 font-bold text-slate-800">No job history yet</p>
          <p className="m-0 mt-2 text-sm text-slate-500">
            Add your work experience to start building a verified career record.
          </p>
          <Link
            to="/employee/job-history/add"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-[#005fd6] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#004bab]"
          >
            <PlusIcon /> Add your first role
          </Link>
        </div>
      )}

      {list.length > 0 && (
        <div className="mt-8 text-center">
          <Link
            to="/employee/job-history/add"
            className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 no-underline shadow-sm transition hover:border-[#005fd6] hover:text-[#005fd6]"
          >
            <PlusIcon /> Add another role
          </Link>
        </div>
      )}
    </EmployeeLayout>
  )
}

export default JobHistory

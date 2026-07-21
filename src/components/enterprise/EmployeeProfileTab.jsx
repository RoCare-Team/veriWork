import { formatDate } from '../../utils/formatters'
import CompanyEmploymentCard from './CompanyEmploymentCard'

function VerificationFlowStepper() {
  const steps = [
    { n: 1, label: 'Review employment', desc: 'Company-wise history below' },
    { n: 2, label: 'Verify previous job', desc: 'Platform or email path' },
    { n: 3, label: 'Assign to team', desc: 'After verification' },
  ]

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {steps.map((step) => (
        <div
          key={step.n}
          className="flex items-start gap-3 rounded-xl border border-green-200/60 bg-white/80 px-4 py-3"
        >
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-sm font-bold text-white">
            {step.n}
          </span>
          <div>
            <p className="m-0 text-sm font-bold text-slate-900">{step.label}</p>
            <p className="m-0 mt-0.5 text-xs text-slate-500">{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  )
}

function PersonalDetailsCard({ profileSection }) {
  const skills = Array.isArray(profileSection?.skills) ? profileSection.skills : []

  const fields = [
    { label: 'Email', value: profileSection?.email },
    { label: 'Phone', value: profileSection?.phone || profileSection?.mobile },
    {
      label: 'Date of birth',
      value: profileSection?.dateOfBirth ? formatDate(profileSection.dateOfBirth) : null,
    },
    { label: 'Gender', value: profileSection?.gender },
    { label: 'City', value: profileSection?.currentCity || profileSection?.city },
    { label: 'Department', value: profileSection?.department },
    { label: 'Current address', value: profileSection?.currentAddress },
    { label: 'Permanent address', value: profileSection?.permanentAddress },
  ].filter((f) => f.value)

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="m-0 text-sm font-bold text-slate-800">Personal details</h3>
      <dl className="m-0 mt-4 grid gap-3 sm:grid-cols-2">
        {fields.map(({ label, value }) => (
          <div key={label} className="rounded-xl bg-slate-50 px-3 py-2.5">
            <dt className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{label}</dt>
            <dd className="m-0 mt-0.5 text-sm font-medium text-slate-900">{value}</dd>
          </div>
        ))}
      </dl>
      {skills.length > 0 && (
        <div className="mt-4 border-t border-slate-100 pt-4">
          <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Skills</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-[#1e3a8a]"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function EmploymentHistorySection({ jobs, canVerify, onVerifyJob }) {
  if (!jobs.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
        <p className="m-0 text-sm text-slate-500">No employment history recorded.</p>
      </div>
    )
  }

  const verifiedCount = jobs.filter(
    (j) => j.isReusable || j.status === 'verified' || j.verificationLevel !== 'none',
  ).length

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="m-0 text-base font-extrabold text-slate-900">Employment by company</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Complete verification data, documents, and HR feedback — per employer
          </p>
        </div>
        <div className="rounded-xl bg-[#1e3a8a]/10 px-4 py-2 text-center">
          <p className="m-0 text-[10px] font-bold uppercase text-[#1e3a8a]">Verified</p>
          <p className="m-0 text-lg font-extrabold text-[#1e3a8a]">
            {verifiedCount}/{jobs.length}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-5">
        {jobs.map((job) => (
          <CompanyEmploymentCard
            key={job.id || job._id || `${job.company}-${job.title}`}
            job={job}
            canVerify={canVerify}
            onVerify={onVerifyJob}
          />
        ))}
      </div>
    </section>
  )
}

function ProfileTab({ profileSection, employmentHistory, canVerify, onVerifyJob, showFlowStepper }) {
  const jobs = Array.isArray(employmentHistory) ? employmentHistory : []

  return (
    <div className="space-y-6">
      {showFlowStepper && (
        <div className="rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50/50 p-5">
          <p className="m-0 text-sm font-bold text-green-900">Verification workflow</p>
          <div className="mt-4">
            <VerificationFlowStepper />
          </div>
        </div>
      )}

      <EmploymentHistorySection jobs={jobs} canVerify={canVerify} onVerifyJob={onVerifyJob} />

      <PersonalDetailsCard profileSection={profileSection} />
    </div>
  )
}

export default ProfileTab
export { VerificationFlowStepper, PersonalDetailsCard, EmploymentHistorySection }

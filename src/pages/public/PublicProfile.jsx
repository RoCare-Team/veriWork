import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import BrandLogo from '../../components/common/BrandLogo'
import ProfessionalIdCard from '../../components/employee/ProfessionalIdCard'
import JobHistoryCard from '../../components/employee/JobHistoryCard'
import EmployeeScoreGauge from '../../components/employee/EmployeeScoreGauge'
import Loader from '../../components/common/Loader'
import { fetchPublicProfile } from '../../api/public'
import { mediaUrl } from '../../lib/mediaUrl'
import { ShieldCheckIcon } from '../../components/common/Icons'

function PublicProfile() {
  const { slug } = useParams()

  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'profile', slug],
    queryFn: () => fetchPublicProfile(slug),
    enabled: Boolean(slug),
    retry: false,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Loader variant="fullPage" label="Loading profile..." />
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 px-4">
        <BrandLogo size="md" />
        <h1 className="mt-8 text-xl font-bold text-slate-900">Profile not found</h1>
        <p className="mt-2 max-w-md text-center text-sm text-slate-500">
          {error?.message || 'This public profile does not exist or is not shared yet.'}
        </p>
        <Link
          to="/"
          className="mt-6 rounded-xl bg-[#1a3a8f] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#152b6e]"
        >
          Go to VeriWork
        </Link>
      </div>
    )
  }

  const profile = {
    ...data,
    experience: data.totalExperience,
    verifiedJobs: data.verifiedJobsCount,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 md:px-6">
          <Link to="/" className="no-underline">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Verified on VeriWork
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        <div className="mb-6 text-center md:mb-8">
          <p className="m-0 text-xs font-semibold uppercase tracking-wider text-slate-400">Public Profile</p>
          <h1 className="m-0 mt-1 text-2xl font-extrabold text-slate-900 md:text-3xl">{data.name}</h1>
          <p className="m-0 mt-1 text-sm text-slate-500">
            {data.role}
            {data.company ? ` · ${data.company}` : ''}
            {data.currentCity ? ` · ${data.currentCity}` : ''}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <ProfessionalIdCard profile={profile} photoUrl={mediaUrl(data.photoUrl)} />

            {(data.verificationTags || []).length > 0 && (
              <div className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
                <h2 className="m-0 text-sm font-bold text-slate-900">Trust & verification</h2>
                <div className="mt-3 flex flex-wrap gap-2">
                  {data.verificationTags.map((tag) => (
                    <span
                      key={tag.id}
                      className="rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700"
                    >
                      ✓ {tag.label}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <section className="mt-6">
              <h2 className="m-0 text-base font-bold text-slate-900">Employment history</h2>
              <p className="m-0 mt-1 text-sm text-slate-500">
                {data.verifiedJobsCount} of {data.totalJobsCount} roles verified
              </p>
              {data.jobs?.length > 0 ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {data.jobs.map((job) => (
                    <JobHistoryCard key={job.id} job={{ ...job, type: job.employmentType }} />
                  ))}
                </div>
              ) : (
                <p className="mt-4 rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No job history added yet.
                </p>
              )}
            </section>
          </div>

          <aside className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <EmployeeScoreGauge score={data.employeeScore} rating={data.scoreRating} size="md" />
              <p className="mt-3 text-center text-xs text-slate-500">{data.scoreRating?.description}</p>
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="m-0 text-sm font-bold text-slate-900">Profile details</h3>
              <dl className="mt-4 space-y-3 text-sm">
                {data.totalExperience && (
                  <div>
                    <dt className="text-xs text-slate-400">Experience</dt>
                    <dd className="m-0 font-semibold text-slate-800">{data.totalExperience}</dd>
                  </div>
                )}
                {data.email && (
                  <div>
                    <dt className="text-xs text-slate-400">Email</dt>
                    <dd className="m-0 font-semibold text-slate-800">{data.email}</dd>
                  </div>
                )}
                {data.phoneMasked && (
                  <div>
                    <dt className="text-xs text-slate-400">Phone</dt>
                    <dd className="m-0 font-semibold text-slate-800">{data.phoneMasked}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-slate-400">VeriWork ID</dt>
                  <dd className="m-0 font-semibold text-slate-800">{data.veriworkId}</dd>
                </div>
                {data.publicSlug && (
                  <div>
                    <dt className="text-xs text-slate-400">Public slug</dt>
                    <dd className="m-0 font-semibold text-slate-800">{data.publicSlug}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-center text-xs text-slate-600">
              This is a VeriWork verified professional profile. Employers can trust the score and verification badges shown here.
            </div>
          </aside>
        </div>
      </main>
    </div>
  )
}

export default PublicProfile

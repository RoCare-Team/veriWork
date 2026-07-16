function ResumeSection({ title, children }) {
  return (
    <section className="mb-5">
      <h2 className="m-0 border-b-2 border-[#005fd6] pb-1 text-[11px] font-bold uppercase tracking-[0.15em] text-[#005fd6]">
        {title}
      </h2>
      <div className="mt-3">{children}</div>
    </section>
  )
}

function PublicResume({ profile, photoUrl, compact = false }) {
  const jobs = profile.jobs || []

  return (
    <article
      id="veriwork-public-resume"
      className={`overflow-hidden rounded-2xl bg-white text-slate-800 shadow-lg ${
        compact ? 'p-0' : 'border border-slate-200 p-6 md:p-8'
      }`}
    >
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          {photoUrl ? (
            <img
              src={photoUrl}
              alt=""
              className="h-20 w-20 shrink-0 rounded-xl object-cover ring-2 ring-slate-100"
            />
          ) : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl bg-[#005fd6] text-2xl font-bold text-white">
              {profile.initials}
            </div>
          )}
          <div>
            <h1 className="m-0 text-2xl font-extrabold tracking-tight text-slate-900">{profile.name}</h1>
            <p className="m-0 mt-1 text-base font-semibold text-[#005fd6]">{profile.role}</p>
            <p className="m-0 mt-1 text-sm text-slate-500">
              {[profile.company, profile.currentCity, profile.totalExperience].filter(Boolean).join(' · ')}
            </p>
          </div>
        </div>
        <div className="score-box shrink-0 rounded-xl bg-gradient-to-br from-[#005fd6] to-[#0073fe] px-4 py-3 text-center text-white">
          <p className="m-0 text-[10px] font-semibold uppercase tracking-wider text-white/70">PagerLook Score</p>
          <p className="m-0 text-3xl font-extrabold leading-none">{profile.employeeScore}</p>
          <p className="m-0 mt-1 text-xs font-medium text-white/80">{profile.scoreRating?.label}</p>
        </div>
      </header>

      {(profile.verificationTags || []).length > 0 && (
        <ResumeSection title="Verification">
          <div className="flex flex-wrap gap-2">
            {profile.verificationTags.map((tag) => (
              <span
                key={tag.id}
                className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-semibold text-green-700"
              >
                ✓ {tag.label}
              </span>
            ))}
          </div>
        </ResumeSection>
      )}

      {profile.skills?.length > 0 && (
        <ResumeSection title="Skills">
          <div className="flex flex-wrap gap-2">
            {profile.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-lg border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-700"
              >
                {skill}
              </span>
            ))}
          </div>
        </ResumeSection>
      )}

      <ResumeSection title="Experience">
        {jobs.length > 0 ? (
          <div className="space-y-4">
            {jobs.map((job) => (
              <div key={job.id} className="relative border-l-2 border-slate-200 pl-4">
                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-[#005fd6]" />
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="m-0 text-sm font-bold text-slate-900">{job.title}</p>
                    <p className="m-0 text-sm text-slate-600">{job.company}</p>
                  </div>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                    {job.duration || '—'}
                  </span>
                </div>
                <p className="m-0 mt-1 text-xs text-slate-500">
                  {job.employmentType}
                  {job.verificationTag?.label ? ` · ${job.verificationTag.label}` : ''}
                </p>
                {job.description && (
                  <p className="m-0 mt-2 text-xs leading-relaxed text-slate-600">{job.description}</p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="m-0 text-sm text-slate-500">No employment history listed.</p>
        )}
      </ResumeSection>

      <footer className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 pt-4 text-[10px] text-slate-400">
        <span>PagerLook ID: {profile.veriworkId}</span>
        <span>
          Verified professional profile · {profile.verifiedJobsCount}/{profile.totalJobsCount} roles verified
        </span>
      </footer>
    </article>
  )
}

export default PublicResume

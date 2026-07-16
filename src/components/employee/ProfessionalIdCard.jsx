import { BuildingIcon, ShieldCheckIcon } from '../common/Icons'



function ProfessionalIdCard({ profile, photoUrl }) {

  if (!profile) return null



  return (

    <div className="overflow-hidden rounded-3xl bg-gradient-to-b from-[#3b5fc7] via-[#005fd6] to-[#0f1f4d] p-6 text-white shadow-xl shadow-blue-900/25 md:p-8 lg:p-10">

      <div className="flex flex-col items-center text-center">

        <div className="relative">

          <div className="h-24 w-24 overflow-hidden rounded-full border-[3px] border-green-400 bg-slate-200 md:h-28 md:w-28 lg:h-32 lg:w-32">

            {photoUrl ? (

              <img src={photoUrl} alt={profile.name} className="h-full w-full object-cover" />

            ) : (

              <div className="flex h-full w-full items-center justify-center bg-slate-300 text-2xl font-bold text-slate-600">

                {profile.initials}

              </div>

            )}

          </div>

          <span className="absolute -bottom-0.5 -right-0.5 flex h-7 w-7 items-center justify-center rounded-full bg-green-500 text-white shadow-md">

            <ShieldCheckIcon className="h-4 w-4" />

          </span>

        </div>



        <h2 className="m-0 mt-4 text-xl font-extrabold tracking-tight md:text-2xl lg:text-3xl">{profile.name}</h2>

        <p className="m-0 mt-1 text-sm text-white/80 md:text-base">{profile.role}</p>



        <p className="m-0 mt-2 flex items-center gap-1.5 text-xs text-white/70">

          <BuildingIcon className="h-3.5 w-3.5" />

          {profile.company}
          {profile.experience ? ` • ${profile.experience}` : ''}

        </p>

      </div>



      <div className="mt-6 grid grid-cols-3 gap-2 border-t border-white/15 pt-5 text-center">

        <div>

          <p className="m-0 text-2xl font-extrabold md:text-3xl">{profile.employeeScore ?? profile.trustScore}</p>

          <p className="m-0 mt-0.5 text-[11px] text-white/65">PagerLook Score</p>

        </div>

        <div>

          <p className="m-0 text-2xl font-extrabold">
            {profile.verifiedJobsCount ?? profile.verifiedJobs ?? 0}
            {profile.totalJobsCount != null ? `/${profile.totalJobsCount}` : ''}
          </p>

          <p className="m-0 mt-0.5 text-[11px] text-white/65">Verified Jobs</p>

        </div>

        <div>

          <p className="m-0 text-2xl font-extrabold">{profile.endorsements}</p>

          <p className="m-0 mt-0.5 text-[11px] text-white/65">Endorsements</p>

        </div>

      </div>



      {profile.skills?.length > 0 && (

        <div className="mt-5 border-t border-white/15 pt-5">

          <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-white/55">

            Core Proficiencies

          </p>

          <div className="mt-3 flex flex-wrap justify-center gap-2">

            {profile.skills.map((skill) => (

              <span

                key={skill}

                className="rounded-full border border-white/25 bg-white/10 px-3 py-1 text-xs font-medium text-white"

              >

                {skill}

              </span>

            ))}

          </div>

        </div>

      )}



      <div className="mt-5 rounded-2xl bg-white px-4 py-3.5 text-center text-slate-900">

        <p className="m-0 text-sm font-extrabold">ID: {profile.veriworkId}</p>

        <p className="m-0 mt-0.5 text-xs text-slate-500">Scan to verify profile</p>

      </div>

    </div>

  )

}



export default ProfessionalIdCard


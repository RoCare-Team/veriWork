import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import ProfessionalIdCard from '../../components/employee/ProfessionalIdCard'
import Loader from '../../components/common/Loader'
import { ShieldCheckIcon } from '../../components/common/Icons'
import { employeeKeys, fetchProfessionalId } from '../../api/employee'
import { mediaUrl } from '../../lib/mediaUrl'
import { buildPublicProfileUrl } from '../../lib/publicProfileUrl'

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M14 11v5H4V6h5M11 3h6v6M8 12l9-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ProfessionalId() {
  const [copied, setCopied] = useState(false)
  const [idCopied, setIdCopied] = useState(false)
  const { data, isLoading, error } = useQuery({
    queryKey: employeeKeys.professionalId,
    queryFn: fetchProfessionalId,
  })

  if (isLoading) return <Loader variant="fullPage" label="Loading professional ID..." />

  if (error) {
    return (
      <EmployeeLayout>
        <EmployeePageHeader title="Professional ID" subtitle="Unable to load profile" />
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      </EmployeeLayout>
    )
  }

  if (!data) {
    return (
      <EmployeeLayout>
        <EmployeePageHeader title="Professional ID" subtitle="No profile data found" />
        <p className="rounded-2xl border border-dashed border-slate-200 p-8 text-center text-sm text-slate-500">
          Complete your profile to generate your Professional ID.
        </p>
      </EmployeeLayout>
    )
  }

  const profile = {
    ...data,
    employeeScore: data.employeeScore ?? data.trustScore,
    verifiedJobs: data.verifiedJobsCount,
  }

  const publicProfileUrl = buildPublicProfileUrl({
    publicSlug: data.publicSlug,
    veriworkId: data.veriworkId,
  })

  const handleCopy = async () => {
    if (!publicProfileUrl) return
    try {
      await navigator.clipboard.writeText(publicProfileUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  const handleCopyId = async () => {
    if (!data.veriworkId) return
    try {
      await navigator.clipboard.writeText(data.veriworkId)
      setIdCopied(true)
      window.setTimeout(() => setIdCopied(false), 2000)
    } catch {
      setIdCopied(false)
    }
  }

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Professional ID"
        subtitle={`${data.name} · ${data.veriworkId}`}
        action={
          <button type="button" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm" aria-label="Share">
            <ShareIcon />
          </button>
        }
      />

      <div className="lg:grid lg:grid-cols-5 lg:gap-8">
        <div className="lg:col-span-3">
          <ProfessionalIdCard profile={profile} photoUrl={mediaUrl(data.photoUrl)} />
        </div>
        <div className="mt-6 space-y-5 lg:col-span-2 lg:mt-0">
          <Link to="/employee/profile-setup" className="block text-center text-sm font-semibold text-[#005fd6] no-underline hover:underline">
            Edit Identity Details
          </Link>
          <p className="m-0 flex items-start gap-2 text-xs text-slate-500">
            <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
            Cryptographically signed document.
          </p>
          {data.veriworkId && (
            <div className="rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-amber-800">Your PagerLook ID</p>
              <p className="m-0 mt-1 text-lg font-extrabold text-slate-900">{data.veriworkId}</p>
              <p className="m-0 mt-2 text-xs text-slate-600">
                Share this ID so colleagues and managers can endorse you on PagerLook Score.
              </p>
              <button
                type="button"
                onClick={handleCopyId}
                className="mt-3 text-sm font-semibold text-[#005fd6] hover:underline"
              >
                {idCopied ? 'Copied!' : 'Copy PagerLook ID'}
              </button>
            </div>
          )}
          {publicProfileUrl && (
            <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4">
              <div className="min-w-0 flex-1">
                <p className="m-0 text-xs text-slate-400">Public Profile Link</p>
                <a
                  href={publicProfileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="m-0 block truncate text-sm font-semibold text-[#005fd6] no-underline hover:underline"
                >
                  {publicProfileUrl}
                </a>
              </div>
              <button type="button" onClick={handleCopy} className="shrink-0 text-sm font-semibold text-[#005fd6]">
                Copy
              </button>
            </div>
          )}
          {copied && <p className="m-0 text-center text-xs font-semibold text-green-600">Link copied!</p>}
          <Link to="/employee/job-history" className="flex h-12 items-center justify-center rounded-2xl bg-[#005fd6] text-sm font-semibold text-white no-underline hover:bg-[#004bab]">
            View Job History
          </Link>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default ProfessionalId

import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import ProfessionalIdCard from '../../components/employee/ProfessionalIdCard'
import { ShieldCheckIcon } from '../../components/common/Icons'
import { getEmployeeData, getEmployeeProfile, isVerificationComplete } from '../../store/employeeStore'

function ShareIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M14 11v5H4V6h5M11 3h6v6M8 12l9-9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LinkIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8.5 11.5 11.5 8.5M7 13l-1.5 1.5a2.5 2.5 0 0 1-3.5-3.5L7 6M13 7l1.5-1.5a2.5 2.5 0 0 1 3.5 3.5L13 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function CopyIcon({ className = 'h-5 w-5' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="7" y="7" width="9" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M5 13H4a1.5 1.5 0 0 1-1.5-1.5V4A1.5 1.5 0 0 1 4 2.5h7.5A1.5 1.5 0 0 1 13 4v1" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ProfessionalId() {
  const navigate = useNavigate()
  const { profilePhoto } = getEmployeeData()
  const profile = getEmployeeProfile()
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!isVerificationComplete()) {
      navigate('/employee/verification', { replace: true })
    }
  }, [navigate])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(profile.publicProfileUrl)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Professional ID"
        subtitle={`${profile.name} · ${profile.veriworkId}`}
        action={
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 md:h-11 md:w-11"
            aria-label="Share"
          >
            <ShareIcon />
          </button>
        }
      />

      <div className="lg:grid lg:grid-cols-5 lg:items-start lg:gap-8 xl:gap-10">
        <div className="lg:col-span-3">
          <ProfessionalIdCard profile={profile} photoUrl={profilePhoto} />
        </div>

        <div className="mt-6 space-y-5 lg:col-span-2 lg:mt-0 lg:space-y-6">
          <div className="flex flex-col gap-3">
            <button
              type="button"
              className="flex h-12 w-full items-center justify-center rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50 md:h-[52px] md:text-base"
            >
              Download PDF Certificate
            </button>
            <Link
              to="/employee/profile-setup"
              className="text-center text-sm font-semibold text-[#1a3a8f] no-underline hover:underline md:text-base"
            >
              Edit Identity Details
            </Link>
          </div>

          <p className="m-0 flex items-start gap-2 text-xs leading-relaxed text-slate-500 md:text-sm">
            <ShieldCheckIcon className="mt-0.5 h-4 w-4 shrink-0" />
            This card is a cryptographically signed document. Any tampering voids the verification.
          </p>

          <div className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 md:h-11 md:w-11">
              <LinkIcon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="m-0 text-[11px] text-slate-400 md:text-xs">Public Profile Link</p>
              <p className="m-0 truncate text-sm font-semibold text-slate-800 md:text-base">
                {profile.publicProfileUrl}
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-slate-500 transition hover:bg-slate-100 md:h-11 md:w-11"
              aria-label="Copy link"
            >
              <CopyIcon className="h-5 w-5" />
            </button>
          </div>

          {copied && (
            <p className="m-0 text-center text-xs font-semibold text-green-600 md:text-sm">Link copied!</p>
          )}

          <Link
            to="/employee/job-history"
            className="flex h-12 items-center justify-center rounded-2xl bg-[#1a3a8f] text-sm font-semibold text-white no-underline shadow-lg shadow-blue-900/20 transition hover:bg-[#152b6e] md:h-[52px] md:text-base"
          >
            View Job History
          </Link>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default ProfessionalId

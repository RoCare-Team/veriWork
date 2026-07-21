import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import BrandLogo from '../../components/common/BrandLogo'
import EmployeeScoreGauge from '../../components/employee/EmployeeScoreGauge'
import PublicResume from '../../components/public/PublicResume'
import PublicFullAccessModal from '../../components/public/PublicFullAccessModal'
import Loader from '../../components/common/Loader'
import { fetchPublicProfile } from '../../api/public'
import { mediaUrl } from '../../lib/mediaUrl'
import { printResumePdf } from '../../utils/printResumePdf'
import { ShieldCheckIcon } from '../../components/common/Icons'

function DownloadIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3v10M6 9l4 4 4-4M4 17h12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="5" y="9" width="10" height="8" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V6a3 3 0 0 1 6 0v3" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function PublicProfile() {
  const { slug } = useParams()
  const [showAccessModal, setShowAccessModal] = useState(false)
  const [accessSent, setAccessSent] = useState(false)

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
          className="mt-6 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white no-underline hover:bg-[#172554]"
        >
          Go to PagerLook
        </Link>
      </div>
    )
  }

  const photoSrc = mediaUrl(data.photoUrl)

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-white">
      <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center justify-between gap-3 px-4 py-4 md:px-6">
          <Link to="/" className="no-underline">
            <BrandLogo size="sm" />
          </Link>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={printResumePdf}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-[#1e3a8a] hover:text-[#1e3a8a]"
            >
              <DownloadIcon />
              Download Resume PDF
            </button>
            <button
              type="button"
              onClick={() => setShowAccessModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-[#1e3a8a] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#172554]"
            >
              <LockIcon />
              Get Full Profile Access
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8 md:px-6 md:py-10">
        {accessSent && (
          <div className="mb-6 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800">
            Access request sent. {data.name} will review your request and approve if appropriate.
          </div>
        )}

        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
            <ShieldCheckIcon className="h-3.5 w-3.5" />
            Verified on PagerLook
          </span>
          <span className="text-xs text-slate-400">Public profile · {data.veriworkId}</span>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <PublicResume profile={data} photoUrl={photoSrc} />

            <div className="relative mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white">
              <div className="p-5 blur-[2px] select-none">
                <h3 className="m-0 text-sm font-bold text-slate-900">Full contact & documents</h3>
                <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                  <div>
                    <dt className="text-xs text-slate-400">Email</dt>
                    <dd className="m-0 font-semibold">{data.emailMasked || '••••@••••.com'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Phone</dt>
                    <dd className="m-0 font-semibold">{data.phoneMasked || '+91••••••••••'}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Document vault</dt>
                    <dd className="m-0 font-semibold">Offer letters, payslips, ID proofs</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-slate-400">Background check data</dt>
                    <dd className="m-0 font-semibold">Verification records & audit trail</dd>
                  </div>
                </dl>
              </div>
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/75 p-6 text-center backdrop-blur-[1px]">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[#1e3a8a]/10 text-[#1e3a8a]">
                  <LockIcon />
                </div>
                <p className="m-0 mt-3 text-sm font-bold text-slate-900">Full profile is protected</p>
                <p className="m-0 mt-1 max-w-sm text-xs text-slate-500">
                  Contact details, documents, and complete verification data require employee consent.
                </p>
                <button
                  type="button"
                  onClick={() => setShowAccessModal(true)}
                  className="mt-4 rounded-xl bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#172554]"
                >
                  Get Full Profile Access
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-5 lg:col-span-2">
            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <EmployeeScoreGauge score={data.employeeScore} rating={data.scoreRating} size="md" />
            </div>

            <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <h3 className="m-0 text-sm font-bold text-slate-900">At a glance</h3>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs text-slate-400">Role</dt>
                  <dd className="m-0 font-semibold text-slate-800">{data.role}</dd>
                </div>
                {data.company && (
                  <div>
                    <dt className="text-xs text-slate-400">Company</dt>
                    <dd className="m-0 font-semibold text-slate-800">{data.company}</dd>
                  </div>
                )}
                {data.totalExperience && (
                  <div>
                    <dt className="text-xs text-slate-400">Experience</dt>
                    <dd className="m-0 font-semibold text-slate-800">{data.totalExperience}</dd>
                  </div>
                )}
                {data.currentCity && (
                  <div>
                    <dt className="text-xs text-slate-400">Location</dt>
                    <dd className="m-0 font-semibold text-slate-800">{data.currentCity}</dd>
                  </div>
                )}
                <div>
                  <dt className="text-xs text-slate-400">Verified roles</dt>
                  <dd className="m-0 font-semibold text-slate-800">
                    {data.verifiedJobsCount} / {data.totalJobsCount}
                  </dd>
                </div>
              </dl>
            </div>

            <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-xs leading-relaxed text-slate-600">
              This resume is auto-generated from a PagerLook verified profile. Download the PDF for sharing, or request full access for hiring and background verification.
            </div>
          </aside>
        </div>
      </main>

      {showAccessModal && (
        <PublicFullAccessModal
          slug={slug}
          employeeName={data.name}
          onClose={() => setShowAccessModal(false)}
          onSuccess={() => setAccessSent(true)}
        />
      )}
    </div>
  )
}

export default PublicProfile

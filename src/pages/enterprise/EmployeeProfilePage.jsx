import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import Loader from '../../components/common/Loader'
import EmploymentStatusBadge from '../../components/enterprise/EmploymentStatusBadge'
import SendAccessRequestModal from '../../components/enterprise/SendAccessRequestModal'
import RemoveAccessConfirmModal from '../../components/enterprise/RemoveAccessConfirmModal'
import VerificationRequestModal from '../../components/enterprise/VerificationRequestModal'
import AssignEmployeeModal from '../../components/enterprise/AssignEmployeeModal'
import ProfileTab from '../../components/enterprise/EmployeeProfileTab'
import TrustScoreDisplay from '../../components/enterprise/TrustScoreDisplay'
import { COMPANY_ROUTES } from '../../constants/companyRoutes'
import {
  enterpriseKeys,
  fetchEmployeeDocuments,
  fetchEmployeeProfile,
} from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'
import { formatDate, getInitials } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'
import { getTrustScoreStyle } from '../../utils/enterpriseTeamUtils'
import { SCORE_MAX } from '../../utils/employeeScoreUtils'

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'documents', label: 'Background' },
  { id: 'verification', label: 'Verification' },
]

function ProfileScoreRing({ score, maxScore = SCORE_MAX }) {
  const style = getTrustScoreStyle(score)
  const pct = maxScore > 0 ? Math.min(100, ((Number(score) || 0) / maxScore) * 100) : 0
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (pct / 100) * circumference

  return (
    <div className="relative h-16 w-16">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 64 64" aria-hidden="true">
        <circle cx="32" cy="32" r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="currentColor"
          className={style.color}
          strokeWidth="4"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className={`text-sm font-extrabold ${style.color}`}>{score ?? '—'}</span>
      </div>
    </div>
  )
}

function ScoreFactorsBreakdown({ factors = [], title = 'Score breakdown' }) {
  if (!factors.length) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
        No score factors available yet.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {title && <h3 className="m-0 text-sm font-bold text-slate-800">{title}</h3>}
      {factors.map((factor) => {
        const points = factor.points ?? 0
        const max = factor.max ?? 0
        const pct = max > 0 ? (points / max) * 100 : 0
        return (
          <div key={factor.id || factor.label} className="rounded-2xl border border-slate-100 bg-white p-4">
            <div className="flex justify-between gap-3">
              <p className="m-0 text-sm font-bold text-slate-900">{factor.label}</p>
              <span className="text-xs font-bold text-slate-600">{points}/{max}</span>
            </div>
            {factor.tip && <p className="m-0 mt-1 text-xs text-slate-500">{factor.tip}</p>}
            <div className="mt-3 h-2 rounded-full bg-slate-100">
              <div className="h-full rounded-full bg-[#005fd6]" style={{ width: `${pct}%` }} />
            </div>
          </div>
        )
      })}
    </div>
  )
}

function resolveAccessFlags(access = {}, preview = {}) {
  const fullGranted =
    access.fullProfileAccess === true ||
    access.full_profile_access === true ||
    access.fullProfileAccessGranted === true ||
    access.hasAllAccess === true ||
    preview.fullProfileAccessGranted === true ||
    preview.showFullProfileButton === true

  const pendingFull =
    access.pendingFullProfileAccess === true ||
    access.pending_full_profile_access === true

  return {
    fullProfileAccess: fullGranted,
    profileAccess:
      fullGranted ||
      access.profileAccess === true ||
      access.profile_access === true ||
      access.hasProfileAccess === true,
    backgroundCheck:
      fullGranted ||
      access.backgroundCheck === true ||
      access.background_check === true ||
      access.hasBackgroundCheck === true,
    verificationData:
      fullGranted ||
      access.verificationData === true ||
      access.verification_data === true ||
      access.hasVerificationData === true,
    pendingFullProfileAccess: pendingFull,
    pendingProfileAccess:
      pendingFull ||
      access.pendingProfileAccess === true ||
      access.pending_profile_access === true,
    pendingBackgroundCheck:
      pendingFull ||
      access.pendingBackgroundCheck === true ||
      access.pending_background_check === true,
    pendingVerificationData:
      pendingFull ||
      access.pendingVerificationData === true ||
      access.pending_verification_data === true,
  }
}

function dedupeDocuments(docs) {
  const seen = new Set()
  const unique = []
  docs.forEach((doc) => {
    if (!doc) return
    const key =
      doc._id ||
      doc.id ||
      `${String(doc.originalName || doc.name || '').toLowerCase()}::${String(doc.category || doc.type || '').toLowerCase()}`
    if (seen.has(key)) return
    seen.add(key)
    unique.push(doc)
  })
  return unique
}

function resolveDocumentUrl(doc) {
  if (!doc) return null
  const candidates = [
    typeof doc.url === 'string' ? doc.url : null,
    doc.url?.url,
    doc.url?.signedUrl,
    doc.fileUrl,
    doc.documentUrl,
    doc.downloadUrl,
    doc.signedUrl,
    doc.link,
    typeof doc.file === 'string' ? doc.file : doc.file?.url,
    doc.path,
    doc.storagePath,
    doc.filePath,
  ].filter(Boolean)

  for (const candidate of candidates) {
    const resolved = mediaUrl(candidate) || candidate
    if (typeof resolved === 'string' && resolved.length > 0) return resolved
  }
  return null
}

function formatSummaryEntries(summary = {}) {
  const entries = []
  Object.entries(summary).forEach(([key, value]) => {
    if (value == null || value === '') return
    const normalizedKey = key.toLowerCase()

    if (normalizedKey === 'bycategory' && typeof value === 'object' && !Array.isArray(value)) {
      Object.entries(value).forEach(([category, count]) => {
        if (count == null) return
        entries.push({
          key: `category-${category}`,
          label: category.replace(/_/g, ' '),
          value: String(count),
        })
      })
      return
    }

    if (typeof value === 'object') return

    entries.push({
      key,
      label: key.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim(),
      value: String(value),
    })
  })
  return entries
}

function flattenDocuments(documentsData) {
  if (!documentsData) return []
  if (Array.isArray(documentsData)) return documentsData.filter(Boolean)
  if (Array.isArray(documentsData.documents)) return documentsData.documents.filter(Boolean)
  if (Array.isArray(documentsData.items)) return documentsData.items.filter(Boolean)
  if (Array.isArray(documentsData.vaultItems)) return documentsData.vaultItems.filter(Boolean)

  if (typeof documentsData === 'object') {
    const flat = []
    Object.values(documentsData).forEach((value) => {
      if (Array.isArray(value)) flat.push(...value.filter(Boolean))
    })
    return flat
  }
  return []
}

function PendingChip() {
  return (
    <span className="ml-2 inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase text-amber-700">
      Pending
    </span>
  )
}

function AccessBadge({ granted, label }) {
  return (
    <span
      className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${
        granted ? 'bg-green-50 text-green-700' : 'bg-slate-100 text-slate-500'
      }`}
    >
      {label} {granted ? '✓' : '—'}
    </span>
  )
}

function LockedSection({ pending, message, buttonLabel, onRequest }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div className="pointer-events-none select-none p-6 opacity-30 blur-[2px]">
        <div className="h-4 w-1/3 rounded bg-slate-200" />
        <div className="mt-4 h-3 w-full rounded bg-slate-100" />
        <div className="mt-2 h-3 w-5/6 rounded bg-slate-100" />
        <div className="mt-2 h-3 w-4/6 rounded bg-slate-100" />
      </div>
      <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/70 p-6 text-center backdrop-blur-[1px]">
        {pending && <PendingChip />}
        <p className="m-0 mt-2 max-w-sm text-sm font-medium text-slate-700">{message}</p>
        <button
          type="button"
          onClick={onRequest}
          className="mt-4 rounded-xl bg-[#005fd6] px-5 py-2.5 text-sm font-semibold text-white hover:bg-[#004bab]"
        >
          {buttonLabel}
        </button>
      </div>
    </div>
  )
}

function DocumentRow({ doc }) {
  const href = resolveDocumentUrl(doc)
  const name = doc.originalName || doc.name || doc.fileName || 'Document'
  const status = doc.status || doc.verificationStatus
  const statusStyle =
    status === 'verified' || status === 'approved'
      ? 'bg-green-50 text-green-700'
      : 'bg-amber-50 text-amber-700'

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
      <div className="min-w-0">
        <p className="m-0 truncate text-sm font-semibold text-slate-900">{name}</p>
        {status && (
          <span className={`mt-1 inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${statusStyle}`}>
            {status}
          </span>
        )}
      </div>
      {href ? (
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          className="shrink-0 rounded-lg bg-[#005fd6] px-3 py-1.5 text-xs font-semibold text-white no-underline hover:bg-[#004bab]"
        >
          View
        </a>
      ) : (
        <span className="shrink-0 text-xs text-slate-400" title="File URL not available from API">
          No link
        </span>
      )}
    </div>
  )
}

function DocumentsTab({ documentsSection, documentsData, isLoading, error }) {
  const summary =
    documentsSection?.summary && typeof documentsSection.summary === 'object'
      ? documentsSection.summary
      : {}
  const vaultItems = Array.isArray(documentsSection?.vaultItems)
    ? documentsSection.vaultItems.filter(Boolean)
    : []
  const employmentDocuments = Array.isArray(documentsSection?.employmentDocuments)
    ? documentsSection.employmentDocuments.filter(Boolean)
    : []

  const downloaded = useMemo(() => flattenDocuments(documentsData), [documentsData])

  const allDocuments = useMemo(() => {
    // Prefer API list when available — profile vaultItems are often the same records duplicated
    const primary = downloaded.length > 0 ? downloaded : vaultItems
    return dedupeDocuments([...primary, ...employmentDocuments])
  }, [vaultItems, downloaded, employmentDocuments])

  const grouped = useMemo(() => {
    const map = {}
    allDocuments.forEach((doc) => {
      const cat = String(doc.category || doc.type || 'other').toLowerCase()
      if (!map[cat]) map[cat] = []
      map[cat].push(doc)
    })
    return map
  }, [allDocuments])

  const summaryEntries = formatSummaryEntries(summary)
  const groupedEntries = Object.entries(grouped).filter(([, items]) => items.length > 0)
  const hasContent = summaryEntries.length > 0 || groupedEntries.length > 0

  if (isLoading) return <Loader variant="inline" label="Loading documents..." />

  if (error && error.status !== 403) {
    return (
      <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
        {error.message || 'Failed to load documents'}
      </p>
    )
  }

  if (!hasContent) {
    return (
      <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center text-sm text-slate-500">
        No documents uploaded yet
      </p>
    )
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700">
        <p className="m-0 font-semibold text-slate-900">Background check flow</p>
        <p className="m-0 mt-1">
          Employee uploads documents to vault → you request <strong>Background Check</strong> access → employee approves →
          documents appear here. Status <strong>pending</strong> means not yet verified; <strong>verified</strong> means reviewed.
        </p>
      </div>

      {summaryEntries.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {summaryEntries.map((entry) => (
            <div key={entry.key} className="rounded-xl border border-slate-100 bg-white p-4 text-center">
              <p className="m-0 text-xs capitalize text-slate-500">{entry.label}</p>
              <p className="m-0 mt-1 text-xl font-extrabold text-slate-900">{entry.value}</p>
            </div>
          ))}
        </div>
      )}

      {groupedEntries.map(([category, items]) => (
        <div key={category} className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="m-0 text-sm font-bold capitalize text-slate-800">{category.replace(/_/g, ' ')}</h3>
          <div className="mt-3 flex flex-col gap-2">
            {items.map((doc, index) => (
              <DocumentRow key={doc._id || doc.id || doc.url || `${category}-${index}`} doc={doc} />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

function VerificationTab({ verificationSection, trustScore }) {
  const factors = verificationSection?.scoreFactors || verificationSection?.factors || []
  const status = verificationSection?.verificationStatus || {}
  const tags = verificationSection?.verificationTags || verificationSection?.verificationHierarchy?.tags || []
  const checklist = [
    { key: 'profileSetupComplete', label: 'Profile Verified' },
    { key: 'aadhaarVerified', label: 'Aadhaar Verified' },
    { key: 'biometricVerified', label: 'Biometric Verified' },
  ]

  return (
    <div className="space-y-6">
      {tags.length > 0 && (
        <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-5">
          <h3 className="m-0 text-sm font-bold text-slate-800">Verification hierarchy</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <span key={tag.id} className="inline-flex rounded-full bg-white px-3 py-1 text-xs font-bold text-[#005fd6] shadow-sm">
                ✓ {tag.label}
              </span>
            ))}
          </div>
        </div>
      )}
      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <div className="flex flex-wrap items-center gap-6">
          <ProfileScoreRing score={trustScore ?? verificationSection?.trustScore} maxScore={SCORE_MAX} />
          <div>
            <p className="m-0 text-xs font-bold uppercase text-slate-400">Score rating</p>
            <p className="m-0 mt-1 text-lg font-extrabold text-[#005fd6]">
              {verificationSection?.scoreRating?.label || verificationSection?.scoreRating || '—'}
            </p>
            {(verificationSection?.verifiedJobsCount != null || verificationSection?.totalJobsCount != null) && (
              <p className="m-0 mt-2 text-sm text-slate-600">
                Verified jobs: {verificationSection.verifiedJobsCount ?? 0} / {verificationSection.totalJobsCount ?? 0}
              </p>
            )}
          </div>
        </div>
      </div>

      <ScoreFactorsBreakdown factors={factors} title="Score factors" />

      {verificationSection?.jobs?.length > 0 && (
        <div className="rounded-2xl border border-slate-100 bg-white p-5">
          <h3 className="m-0 text-sm font-bold text-slate-800">Verification by company</h3>
          <div className="mt-4 flex flex-col gap-3">
            {verificationSection.jobs.map((job) => (
              <div
                key={job.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3"
              >
                <div>
                  <p className="m-0 text-sm font-bold text-slate-900">{job.company}</p>
                  <p className="m-0 text-xs text-slate-500">{job.title}</p>
                </div>
                <span className="rounded-full bg-[#005fd6]/10 px-3 py-1 text-xs font-bold text-[#005fd6]">
                  {job.verificationTag?.label || 'Not verified'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-slate-100 bg-white p-5">
        <h3 className="m-0 text-sm font-bold text-slate-800">Verification status</h3>
        <ul className="m-0 mt-3 list-none space-y-2 p-0">
          {checklist.map(({ key, label }) => {
            const val = status[key] ?? status[key.replace(/([A-Z])/g, '_$1').toLowerCase()]
            const done = val === true || val === 'verified' || val === 'approved' || val === 'complete'
            return (
              <li key={key} className="flex items-center gap-3 text-sm">
                <span className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${done ? 'bg-green-500 text-white' : 'bg-slate-200 text-slate-500'}`}>
                  {done ? '✓' : '·'}
                </span>
                <span className={done ? 'font-semibold text-slate-900' : 'text-slate-600'}>{label}</span>
              </li>
            )
          })}
        </ul>
      </div>
    </div>
  )
}

function EmployeeProfilePage() {
  const { employeeId } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [tab, setTab] = useState('profile')
  const [accessModal, setAccessModal] = useState(null)
  const [showRemoveAccess, setShowRemoveAccess] = useState(false)
  const [verifyJob, setVerifyJob] = useState(null)
  const [showAssign, setShowAssign] = useState(false)

  const profileQuery = useQuery({
    queryKey: enterpriseKeys.employeeProfile(employeeId),
    queryFn: () => fetchEmployeeProfile(employeeId),
    enabled: Boolean(employeeId),
  })

  const data = profileQuery.data || {}
  const preview = data.preview || {}
  const access = resolveAccessFlags(data.access || {}, preview)
  const lockedSections = Array.isArray(data.lockedSections) ? data.lockedSections : []

  const hasProfileAccess = access.profileAccess
  const hasBackgroundAccess = access.backgroundCheck
  const hasVerificationAccess = access.verificationData

  const documentsQuery = useQuery({
    queryKey: enterpriseKeys.employeeDocuments(employeeId),
    queryFn: () => fetchEmployeeDocuments(employeeId),
    enabled: Boolean(employeeId) && hasBackgroundAccess && tab === 'documents',
    retry: false,
  })

  useEffect(() => {
    if (documentsQuery.error?.status === 403) {
      toast('Document access not granted yet', 'error')
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.employeeProfile(employeeId) })
    }
  }, [documentsQuery.error, toast, queryClient, employeeId])

  const handleTabChange = (nextTab) => {
    setTab(nextTab)
    if (nextTab === 'documents' || nextTab === 'profile' || nextTab === 'verification') {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.employeeProfile(employeeId) })
    }
  }

  const refreshProfile = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.employeeProfile(employeeId) })
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.employeeDocuments(employeeId) })
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.employeeAccessStatus(employeeId) })
  }

  const openRequest = (requestType) => {
    setAccessModal({
      requestType,
      name: preview.name || preview.employeeName || 'Employee',
    })
  }

  const displayName = preview.name || preview.employeeName || 'Employee'
  const photoSrc = mediaUrl(preview.photoUrl || preview.profilePhoto || preview.avatar)

  if (profileQuery.isLoading) return <Loader variant="fullPage" label="Loading profile..." />

  if (profileQuery.error) {
    const isNotFound =
      profileQuery.error.status === 404 ||
      /not found/i.test(profileQuery.error.message || '')
    const displayError = isNotFound ? 'Employee not found' : profileQuery.error.message

    return (
      <EnterpriseLayout>
        <div className="px-4 py-8">
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {displayError}
          </p>
          <button
            type="button"
            onClick={() => navigate(COMPANY_ROUTES.TEAM)}
            className="mt-4 text-sm font-semibold text-[#005fd6] hover:underline"
          >
            ← Back to team
          </button>
        </div>
      </EnterpriseLayout>
    )
  }

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <button
          type="button"
          onClick={() => navigate(COMPANY_ROUTES.TEAM)}
          className="mb-4 text-sm font-semibold text-[#005fd6] hover:underline"
        >
          ← Back to Team
        </button>

        {access.fullProfileAccess && (
          <div className="mb-6 rounded-2xl border border-green-200 bg-gradient-to-r from-green-50 to-white p-4 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500 text-lg text-white">✓</span>
                <div>
                  <p className="m-0 text-sm font-bold text-green-900">Full profile access granted</p>
                  <p className="m-0 mt-0.5 text-xs text-green-700">
                    Review company-wise employment records below, then verify previous employers
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {preview.onboardingStage === 'verified' && (
                  <button
                    type="button"
                    onClick={() => setShowAssign(true)}
                    className="rounded-xl bg-[#005fd6] px-4 py-2 text-sm font-semibold text-white hover:bg-[#004bab]"
                  >
                    Assign Department
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowRemoveAccess(true)}
                  className="rounded-xl border border-red-200 bg-white px-4 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                >
                  Remove Access
                </button>
              </div>
            </div>
          </div>
        )}

        <header className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="flex gap-4">
              {photoSrc ? (
                <img src={photoSrc} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-xl font-bold text-[#005fd6]">
                  {getInitials(displayName)}
                </div>
              )}
              <div>
                <h1 className="m-0 text-2xl font-extrabold text-slate-900">{displayName}</h1>
                <p className="m-0 mt-1 text-sm text-slate-600">{preview.role || preview.designation}</p>
                <p className="m-0 mt-0.5 text-sm text-slate-500">{preview.department}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <EmploymentStatusBadge status={preview.employmentStatus || 'active'} />
                </div>
              </div>
            </div>
            <div className="flex flex-col items-center gap-3 sm:items-end">
              <ProfileScoreRing score={preview.trustScore} maxScore={preview.trustScoreMax || SCORE_MAX} />
              <TrustScoreDisplay score={preview.trustScore} compact />
              <div className="flex flex-wrap justify-center gap-2 sm:justify-end">
                <AccessBadge granted={hasProfileAccess} label="Profile" />
                <AccessBadge granted={hasBackgroundAccess} label="Docs" />
                <AccessBadge granted={hasVerificationAccess} label="Verify" />
              </div>
            </div>
          </div>
          <dl className="m-0 mt-6 grid gap-3 border-t border-slate-100 pt-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-bold uppercase text-slate-400">PagerLook ID</dt>
              <dd className="m-0 mt-1 text-sm font-semibold text-slate-900">{preview.veriworkId || preview.pagerlookId || '—'}</dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase text-slate-400">Joined</dt>
              <dd className="m-0 mt-1 text-sm font-semibold text-slate-900">
                {preview.joinedDate || preview.joiningDate ? formatDate(preview.joinedDate || preview.joiningDate) : '—'}
              </dd>
            </div>
          </dl>
        </header>

        <div className="mt-6 flex gap-1 rounded-2xl bg-slate-100 p-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => handleTabChange(t.id)}
              className={`flex flex-1 items-center justify-center rounded-xl py-2.5 text-sm font-semibold transition ${
                tab === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {t.label}
              {t.id === 'profile' && access.pendingProfileAccess && <PendingChip />}
              {t.id === 'documents' && access.pendingBackgroundCheck && <PendingChip />}
              {t.id === 'verification' && access.pendingVerificationData && <PendingChip />}
            </button>
          ))}
        </div>

        <div className="mt-6">
          {tab === 'profile' && (
            hasProfileAccess ? (
              <ProfileTab
                profileSection={data.profileSection || data.basicProfile}
                employmentHistory={data.employmentHistory || data.profileSection?.employmentHistory}
                canVerify={access.fullProfileAccess}
                onVerifyJob={(job) => setVerifyJob(job)}
                showFlowStepper={access.fullProfileAccess}
              />
            ) : (
              <LockedSection
                pending={access.pendingProfileAccess || lockedSections.includes('profile')}
                message="Request profile access to view full details"
                buttonLabel="Request Profile Access"
                onRequest={() => openRequest('profile_access')}
              />
            )
          )}

          {tab === 'documents' && (
            hasBackgroundAccess ? (
              <DocumentsTab
                documentsSection={data.documentsSection}
                documentsData={documentsQuery.data}
                isLoading={documentsQuery.isLoading}
                error={documentsQuery.error}
              />
            ) : (
              <LockedSection
                pending={access.pendingBackgroundCheck || lockedSections.includes('documents')}
                message="Request background check access to view vault documents"
                buttonLabel="Request Background Check Access"
                onRequest={() => openRequest('background_check')}
              />
            )
          )}

          {tab === 'verification' && (
            hasVerificationAccess ? (
              <VerificationTab
                verificationSection={data.verificationSection}
                trustScore={preview.trustScore}
              />
            ) : (
              <LockedSection
                pending={access.pendingVerificationData || lockedSections.includes('verification')}
                message="Request verification data access to view trust breakdown"
                buttonLabel="Request Verification Data"
                onRequest={() => openRequest('verification_data')}
              />
            )
          )}
        </div>

        {!access.fullProfileAccess && (
          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={() => openRequest('full_profile_access')}
              className="rounded-xl border border-[#005fd6] px-4 py-2.5 text-sm font-semibold text-[#005fd6] hover:bg-blue-50"
            >
              Request Access
            </button>
          </div>
        )}
      </div>

      {accessModal && (
        <SendAccessRequestModal
          employeeId={employeeId}
          employeeName={accessModal.name}
          defaultRequestType={accessModal.requestType}
          onClose={() => setAccessModal(null)}
          onSuccess={refreshProfile}
        />
      )}

      {showRemoveAccess && (
        <RemoveAccessConfirmModal
          employee={{ employeeId, name: displayName }}
          onClose={() => setShowRemoveAccess(false)}
          onSuccess={() => {
            refreshProfile()
            queryClient.invalidateQueries({ queryKey: enterpriseKeys.team })
          }}
        />
      )}

      {verifyJob && (
        <VerificationRequestModal
          employeeId={employeeId}
          jobExperienceId={verifyJob.id || verifyJob._id}
          jobTitle={verifyJob.title}
          companyName={verifyJob.company}
          previousCompanyOnPlatform={Boolean(verifyJob.previousCompanyOnPlatform)}
          matchedPlatformCompany={verifyJob.matchedPlatformCompany || null}
          defaultHrEmail={verifyJob.hrEmail || ''}
          defaultManagerEmail={verifyJob.managerEmail || ''}
          defaultHrName={verifyJob.managerName || ''}
          department={verifyJob.department || ''}
          duration={verifyJob.duration || ''}
          employmentType={verifyJob.employmentType || ''}
          onClose={() => setVerifyJob(null)}
          onSuccess={refreshProfile}
        />
      )}

      {showAssign && (
        <AssignEmployeeModal
          employee={{ employeeId, employeeName: displayName, department: preview.department, designation: preview.role }}
          onClose={() => setShowAssign(false)}
          onSuccess={refreshProfile}
        />
      )}
    </EnterpriseLayout>
  )
}

export default EmployeeProfilePage

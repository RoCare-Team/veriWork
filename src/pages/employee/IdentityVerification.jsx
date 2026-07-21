import { useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import VerificationProgressCard from '../../components/employee/VerificationProgressCard'
import VerificationStepBar from '../../components/employee/VerificationStepBar'
import { getCompletedJourneySteps, hasAnyEducation } from '../../utils/employeeJourney'
import VerificationFlowGuide from '../../components/employee/VerificationFlowGuide'
import SecurityFooter from '../../components/employee/SecurityFooter'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { LockIcon } from '../../components/common/Icons'
import { employeeKeys, fetchVerificationStatus } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'

// Points per sub-item — mirrors the journey/score model. Identity's 200 is split
// across its two checks so the completion bar moves as each one is done.
const ITEM_POINTS = { profile: 100, education: 45, aadhaar: 100, face: 100 }
const TOTAL_POINTS = Object.values(ITEM_POINTS).reduce((a, b) => a + b, 0)

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 10l3 3 6-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/**
 * The verification hub shows the WHOLE profile at a glance: what's filled, what
 * isn't, and how complete you are overall — not just the identity checks. That's
 * why basics being done already reads as progress instead of "0%".
 */
function IdentityVerification() {
  const navigate = useNavigate()
  const { profile } = useAuth()
  const { data: status, isLoading, error } = useQuery({
    queryKey: employeeKeys.verification,
    queryFn: fetchVerificationStatus,
  })

  const profileIncomplete =
    status?.profileSetupComplete === false ||
    (status?.currentStep === 'profile' && !status?.isComplete)

  if (isLoading) return <Loader variant="fullPage" label="Loading verification..." />

  if (error) {
    return (
      <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
        <EmployeePageHeader title="Identity Verification" subtitle="Unable to load status" />
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      </EmployeeLayout>
    )
  }

  if (profileIncomplete) {
    return (
      <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
        <VerificationStepBar currentStep="profile" className="mb-6" />
        <EmployeePageHeader title="Identity Verification" subtitle="Complete your profile first" />
        <VerificationFlowGuide />
        <Link to="/employee/profile-setup" className="mt-6 block no-underline">
          <Button type="button">Create Your Profile</Button>
        </Link>
      </EmployeeLayout>
    )
  }

  const merged = { ...profile, ...status }
  const profileDone = true // profileIncomplete already returned above
  const educationDone = hasAnyEducation(merged)
  const aadhaarDone = Boolean(status?.aadhaarVerified ?? profile?.aadhaarVerified)
  const biometricDone = Boolean(status?.biometricVerified ?? profile?.biometricVerified)

  // Every part of the profile, with what each is worth and how to finish it.
  const ITEMS = [
    {
      key: 'profile',
      title: 'Basic details',
      desc: 'Name, role, contact and location',
      done: profileDone,
      to: '/employee/profile-setup',
      cta: 'Edit',
    },
    {
      key: 'education',
      title: 'Education',
      desc: '10th, 12th and graduation',
      done: educationDone,
      to: '/employee/profile-setup',
      cta: 'Add',
    },
    {
      key: 'aadhaar',
      title: 'Aadhaar verification',
      desc: 'Secure e-KYC via DigiLocker or OTP',
      done: aadhaarDone,
      to: '/employee/verification/aadhaar',
      cta: 'Verify',
    },
    {
      key: 'face',
      title: 'Face verification',
      desc: 'A quick liveness selfie matched to your ID',
      done: biometricDone,
      to: '/employee/verification/biometric',
      cta: 'Verify',
    },
  ]

  const earned = ITEMS.reduce((sum, it) => sum + (it.done ? ITEM_POINTS[it.key] : 0), 0)
  const percent = Math.round((earned / TOTAL_POINTS) * 100)
  const pending = ITEMS.filter((it) => !it.done)
  const allDone = pending.length === 0
  const identityComplete = aadhaarDone && biometricDone

  const completed = getCompletedJourneySteps(merged)

  const progressMessage = allDone ? 'Profile complete!' : 'Keep going!'
  const progressCaption = allDone
    ? 'Your Identity Verified badge is unlocked and your score is fully boosted.'
    : `You've filled the basics — ${pending.length} thing${pending.length > 1 ? 's' : ''} left to reach 100%.`

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
      <VerificationStepBar currentStep="identity" completed={completed} className="mb-6" />
      <EmployeePageHeader
        title="Identity Verification"
        subtitle={`${profile?.name || 'Your account'} · ${profile?.veriworkId || ''}`}
      />

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="lg:sticky lg:top-24">
          <VerificationProgressCard
            percent={percent}
            message={progressMessage}
            hint={`Profile ${percent}% complete`}
            caption={progressCaption}
          />
          <div className="mt-5"><VerificationFlowGuide /></div>
        </div>

        <div>
          <div className="mb-4">
            <h2 className="m-0 text-sm font-bold text-slate-800">
              {allDone ? 'Everything is complete' : "What's left to complete"}
            </h2>
            <p className="m-0 mt-1 text-xs text-slate-500">
              {identityComplete
                ? 'Your identity is fully verified.'
                : <>Verifying Aadhaar + Face adds <strong>+200 pts</strong> and the <strong>Identity Verified</strong> badge.</>}
            </p>
          </div>

          <div className="flex flex-col gap-3">
            {ITEMS.map((it) => (
              <div
                key={it.key}
                className={`flex items-center justify-between gap-3 rounded-2xl border p-4 shadow-sm ${
                  it.done ? 'border-emerald-100 bg-emerald-50/40' : 'border-slate-200 bg-white'
                }`}
              >
                <div className="flex min-w-0 items-center gap-3">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                      it.done ? 'bg-emerald-500 text-white' : 'bg-slate-100 text-slate-400'
                    }`}
                  >
                    {it.done ? <CheckIcon /> : <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />}
                  </span>
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-bold text-slate-900">{it.title}</p>
                    <p className="m-0 mt-0.5 truncate text-xs text-slate-500">{it.desc}</p>
                  </div>
                </div>

                {it.done ? (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                    Done
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate(it.to)}
                    className="shrink-0 rounded-ctl bg-brand-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-brand-700"
                  >
                    +{ITEM_POINTS[it.key]} · {it.cta}
                  </button>
                )}
              </div>
            ))}
          </div>

          <Link to="/employee/score" className="mt-6 block no-underline">
            <Button type="button" variant={allDone ? 'primary' : 'secondary'}>
              {allDone ? 'View Your Employee Score' : 'Do this later — go to my score'}
            </Button>
          </Link>

          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
            <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1e3a8a]" />
            <p className="m-0 text-sm text-slate-600">Your data is encrypted end-to-end.</p>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default IdentityVerification

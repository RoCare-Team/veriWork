import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import SecurityFooter from '../../components/employee/SecurityFooter'
import DigiLockerButton from '../../components/employee/DigiLockerButton'
import { LockIcon, CheckCircleIcon, InfoIcon } from '../../components/common/Icons'
import VerificationStepBar, { VerificationBackLink } from '../../components/employee/VerificationStepBar'
import { employeeKeys, fetchAadhaarSubmission, startDigiLockerConnect } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'
import { getCompletedJourneySteps } from '../../utils/employeeJourney'
import { formatDate } from '../../utils/formatters'

const FIELD_LABELS = { name: 'Name', dob: 'Date of birth', gender: 'Gender' }

function StatusBanner({ tone, icon, title, children }) {
  const tones = {
    info: 'border-blue-200 bg-blue-50 text-blue-900',
    success: 'border-green-200 bg-green-50 text-green-900',
    warning: 'border-amber-200 bg-amber-50 text-amber-900',
    danger: 'border-red-200 bg-red-50 text-red-900',
  }

  return (
    <div className={`flex gap-3 rounded-2xl border p-4 ${tones[tone] || tones.info}`}>
      {icon}
      <div className="min-w-0">
        <p className="m-0 text-sm font-bold">{title}</p>
        <div className="mt-1 text-sm opacity-90">{children}</div>
      </div>
    </div>
  )
}

/** Profile vs e-Aadhaar, field by field — the standard KYC match report. */
function MatchReport({ submission }) {
  const checks = submission.checks || []

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="m-0 text-sm font-bold text-slate-900">Aadhaar details (from UIDAI via DigiLocker)</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Aadhaar number</dt>
          <dd className="m-0 font-mono font-semibold text-slate-900">{submission.aadhaarMasked}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Checked on</dt>
          <dd className="m-0 font-semibold text-slate-900">{formatDate(submission.reviewedAt)}</dd>
        </div>
      </dl>

      {checks.length > 0 && (
        <table className="mt-4 w-full text-left text-sm">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-slate-400">
              <th className="pb-2 font-semibold">Field</th>
              <th className="pb-2 font-semibold">Your profile</th>
              <th className="pb-2 font-semibold">Aadhaar</th>
              <th className="pb-2 text-right font-semibold">Result</th>
            </tr>
          </thead>
          <tbody>
            {checks.map((c) => (
              <tr key={c.field} className="border-t border-slate-100">
                <td className="py-2 text-slate-500">{FIELD_LABELS[c.field] || c.field}</td>
                <td className="py-2 text-slate-900">{c.expected || '—'}</td>
                <td className="py-2 text-slate-900">{c.actual || '—'}</td>
                <td className={`py-2 text-right font-semibold ${c.matched ? 'text-green-700' : 'text-red-600'}`}>
                  {c.matched ? 'Valid' : 'Mismatch'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

function AadhaarVerification() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile, updateProfileState } = useAuth()
  const journeyCompleted = getCompletedJourneySteps(profile)
  const [searchParams, setSearchParams] = useSearchParams()

  // One-shot result from the DigiLocker callback (?status=success|mismatch|failed&message=…).
  const [callbackResult] = useState(() => ({
    status: searchParams.get('status'),
    message: searchParams.get('message'),
  }))
  useEffect(() => {
    if (!searchParams.has('status') && !searchParams.has('message')) return
    setSearchParams({}, { replace: true })
    // The callback changed verification state server-side — pull it fresh.
    queryClient.invalidateQueries({ queryKey: employeeKeys.aadhaarSubmission })
    queryClient.invalidateQueries({ queryKey: employeeKeys.verification })
    queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
  }, [searchParams, setSearchParams, queryClient])

  const { data: submission, isLoading } = useQuery({
    queryKey: employeeKeys.aadhaarSubmission,
    queryFn: fetchAadhaarSubmission,
    // Legacy manual submissions are still decided by an admin out of band.
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 20000 : false),
  })

  // The DigiLocker result lands server-side during the redirect; mirror it into
  // the stored profile so the step bar and the face-match gate see it.
  useEffect(() => {
    if (!profile || !submission || submission.method !== 'digilocker') return
    const verified = submission.status === 'approved'
    if (profile.aadhaarVerified === verified && (!verified || profile.digilockerUsed)) return
    updateProfileState({
      ...profile,
      aadhaarVerified: verified,
      digilockerUsed: verified || profile.digilockerUsed,
      biometricVerified: verified ? profile.biometricVerified : false,
    })
  }, [profile, submission, updateProfileState])

  const [error, setError] = useState('')
  const connect = useMutation({
    mutationFn: () => startDigiLockerConnect('aadhaar'),
    onSuccess: (data) => window.location.assign(data.authorizationUrl),
    onError: (err) => setError(err.message || 'Could not start DigiLocker'),
  })

  const status = submission?.status || 'not_submitted'
  // Aadhaar is matched against the saved profile, so it has to exist first.
  const profileIncomplete = profile?.profileSetupComplete === false
  const canVerify = !profileIncomplete && (status === 'not_submitted' || status === 'rejected')

  const subtitle =
    {
      not_submitted: 'Identity check 1 of 2 — verify instantly with DigiLocker',
      pending: 'Identity check 1 of 2 — your Aadhaar is with our verification team',
      approved: 'Identity check 1 of 2 — verified',
      rejected: 'Identity check 1 of 2 — details did not match Aadhaar',
    }[status] || 'Identity check 1 of 2'

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
      <VerificationBackLink />
      <VerificationStepBar currentStep="identity" completed={journeyCompleted} className="mb-6" />
      <EmployeePageHeader title="Aadhaar verification" subtitle={subtitle} />

      {isLoading ? (
        <Loader label="Loading your Aadhaar status..." />
      ) : (
        <div className="space-y-5">
          {error && (
            <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
          )}

          {callbackResult.status === 'failed' && (
            <StatusBanner
              tone="danger"
              icon={<InfoIcon className="mt-0.5 h-5 w-5 shrink-0" />}
              title="DigiLocker verification did not complete"
            >
              {callbackResult.message || 'Please try again.'}
            </StatusBanner>
          )}

          {profileIncomplete && (
            <>
              <StatusBanner
                tone="warning"
                icon={<InfoIcon className="mt-0.5 h-5 w-5 shrink-0" />}
                title="Finish your basic details first"
              >
                Your name, date of birth and gender are matched against Aadhaar, so they need to be on
                record before this check can run.
              </StatusBanner>
              <Button type="button" onClick={() => navigate('/employee/profile-setup')}>
                Complete profile setup
              </Button>
            </>
          )}

          {!profileIncomplete && status === 'pending' && (
            <StatusBanner
              tone="warning"
              icon={<InfoIcon className="mt-0.5 h-5 w-5 shrink-0" />}
              title="Under review by the PagerLook team"
            >
              Your earlier card upload is being reviewed. You can also verify instantly with DigiLocker
              once that review is finished.
            </StatusBanner>
          )}

          {status === 'approved' && (
            <>
              <StatusBanner
                tone="success"
                icon={<CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />}
                title="Aadhaar verified"
              >
                Your profile details match your Aadhaar. Next, we match your live selfie against your
                Aadhaar photo.
              </StatusBanner>
              {submission.method === 'digilocker' && <MatchReport submission={submission} />}
              <Button type="button" onClick={() => navigate('/employee/verification/biometric')}>
                Continue to face match
              </Button>
            </>
          )}

          {status === 'rejected' && (
            <>
              <StatusBanner
                tone="danger"
                icon={<InfoIcon className="mt-0.5 h-5 w-5 shrink-0" />}
                title="Details did not match your Aadhaar"
              >
                {submission.rejectionReason || 'Update your profile to match Aadhaar and verify again.'}
              </StatusBanner>
              {submission.method === 'digilocker' && <MatchReport submission={submission} />}
              <Button type="button" variant="secondary" onClick={() => navigate('/employee/profile-setup')}>
                Fix profile details
              </Button>
            </>
          )}

          {canVerify && (
            <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
                <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1e3a8a]" />
                <p className="m-0 text-sm text-slate-600">
                  You will sign in to DigiLocker and allow PagerLook to read your e-Aadhaar. We match
                  the name, date of birth and gender on Aadhaar with your profile. Your full Aadhaar
                  number is never shared with us — only the last 4 digits.
                </p>
              </div>
              <DigiLockerButton loading={connect.isPending} onClick={() => connect.mutate()} />
            </div>
          )}
        </div>
      )}
    </EmployeeLayout>
  )
}

export default AadhaarVerification

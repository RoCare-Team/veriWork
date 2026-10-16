import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Loader from '../../components/common/Loader'
import SecurityFooter from '../../components/employee/SecurityFooter'
import DigiLockerButton from '../../components/employee/DigiLockerButton'
import { LockIcon, CheckCircleIcon, InfoIcon } from '../../components/common/Icons'
import VerificationStepBar, { VerificationBackLink } from '../../components/employee/VerificationStepBar'
import {
  applyAadhaarDetails,
  employeeKeys,
  fetchAadhaarSubmission,
  startDigiLockerConnect,
  updateProfile,
} from '../../api/employee'
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

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

/**
 * Mismatch resolution — the employee picks which values to continue with:
 *  A. Aadhaar's values (copied onto the profile → verified immediately), or
 *  B. their own, edited inline; every save is re-matched against the Aadhaar
 *     data already fetched, so the table above updates without a new login.
 */
function ResolveMismatch({ submission, profile, onProfileUpdated }) {
  const queryClient = useQueryClient()
  const [editing, setEditing] = useState(false)
  const [form, setForm] = useState({ name: '', dateOfBirth: '', gender: '' })
  const [error, setError] = useState('')

  const failed = (submission.checks || []).filter((c) => !c.matched)

  const refresh = (nextProfile) => {
    onProfileUpdated(nextProfile)
    queryClient.invalidateQueries({ queryKey: employeeKeys.aadhaarSubmission })
    queryClient.invalidateQueries({ queryKey: employeeKeys.verification })
    queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
    queryClient.invalidateQueries({ queryKey: employeeKeys.score })
  }

  const applyAadhaar = useMutation({
    mutationFn: applyAadhaarDetails,
    onSuccess: (data) => {
      setError('')
      queryClient.setQueryData(employeeKeys.aadhaarSubmission, data.submission)
      refresh(data.profile)
    },
    onError: (err) => setError(err.message || 'Could not update your details'),
  })

  const saveOwn = useMutation({
    mutationFn: () =>
      updateProfile({
        name: form.name.trim(),
        ...(form.dateOfBirth ? { dateOfBirth: form.dateOfBirth } : {}),
        ...(form.gender ? { gender: form.gender } : {}),
      }),
    onSuccess: (data) => {
      setError('')
      setEditing(false)
      refresh(data)
    },
    onError: (err) => setError(err.message || 'Could not save your details'),
  })

  const startEditing = () => {
    setForm({
      name: profile?.name || '',
      dateOfBirth: profile?.dateOfBirth || '',
      gender: profile?.gender || '',
    })
    setError('')
    setEditing(true)
  }

  const busy = applyAadhaar.isPending || saveOwn.isPending

  return (
    <div className="space-y-4">
      {error && (
        <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Option A — Aadhaar is the source of truth */}
        <div className="flex flex-col rounded-2xl border-2 border-[#1e3a8a]/20 bg-white p-5 shadow-sm">
          <p className="m-0 text-sm font-bold text-slate-900">Continue with Aadhaar details</p>
          <p className="m-0 mt-1 text-xs text-slate-500">Recommended — verified instantly</p>
          <ul className="m-0 mt-3 flex-1 list-none space-y-1.5 p-0 text-sm">
            {failed.map((c) => (
              <li key={c.field} className="text-slate-600">
                <span className="text-slate-500">{FIELD_LABELS[c.field] || c.field}:</span>{' '}
                <span className="line-through opacity-60">{c.expected || '—'}</span>{' '}
                → <span className="font-semibold text-slate-900">{c.actual || '—'}</span>
              </li>
            ))}
          </ul>
          <Button type="button" className="mt-4" disabled={busy} onClick={() => applyAadhaar.mutate()}>
            {applyAadhaar.isPending ? 'Updating...' : 'Use Aadhaar details'}
          </Button>
        </div>

        {/* Option B — keep/correct their own values; re-matched on save */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="m-0 text-sm font-bold text-slate-900">Continue with my details</p>
          <p className="m-0 mt-1 text-xs text-slate-500">
            Correct them below — they are re-checked against Aadhaar as soon as you save.
          </p>

          {editing ? (
            <form
              className="mt-3 space-y-3"
              onSubmit={(e) => {
                e.preventDefault()
                if (form.name.trim().length < 2) {
                  setError('Enter your full name')
                  return
                }
                saveOwn.mutate()
              }}
            >
              <Input
                id="resolveName"
                label="Full name"
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              />
              <Input
                id="resolveDob"
                label="Date of birth"
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm((prev) => ({ ...prev, dateOfBirth: e.target.value }))}
              />
              <Select
                id="resolveGender"
                label="Gender"
                placeholder="Select gender"
                options={GENDER_OPTIONS}
                value={form.gender}
                onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))}
              />
              <div className="flex gap-3">
                <Button type="submit" disabled={busy}>
                  {saveOwn.isPending ? 'Saving...' : 'Save & re-check'}
                </Button>
                <Button type="button" variant="ghost" disabled={busy} onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <Button type="button" variant="secondary" className="mt-auto" disabled={busy} onClick={startEditing}>
              Edit my details
            </Button>
          )}
        </div>
      </div>

      <p className="m-0 text-xs text-slate-500">
        Aadhaar stays unverified until your profile matches it. You can also skip this for now and
        come back later from the verification hub.
      </p>
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
  // A DigiLocker mismatch is resolved in place (ResolveMismatch) — no new login needed.
  const canVerify =
    !profileIncomplete &&
    (status === 'not_submitted' || (status === 'rejected' && submission?.method !== 'digilocker'))

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
              {submission.method === 'digilocker' && (
                <>
                  <MatchReport submission={submission} />
                  <ResolveMismatch
                    submission={submission}
                    profile={profile}
                    onProfileUpdated={(next) => updateProfileState({ ...profile, ...next })}
                  />
                </>
              )}
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

import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Loader from '../../components/common/Loader'
import SecurityFooter from '../../components/employee/SecurityFooter'
import AadhaarImagePicker from '../../components/employee/AadhaarImagePicker'
import { LockIcon, IdCardIcon, CheckCircleIcon, InfoIcon } from '../../components/common/Icons'
import VerificationStepBar, { VerificationBackLink } from '../../components/employee/VerificationStepBar'
import { employeeKeys, fetchAadhaarSubmission, submitAadhaar } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'
import { getCompletedJourneySteps } from '../../utils/employeeJourney'
import { aadhaarDigits, formatAadhaar, isValidAadhaar } from '../../utils/aadhaar'
import { mediaUrl } from '../../lib/mediaUrl'
import { formatDate } from '../../utils/formatters'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
]

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

/** Read-only view of what the employee already sent in. */
function SubmittedSummary({ submission }) {
  const front = mediaUrl(submission.frontImageUrl)
  const back = mediaUrl(submission.backImageUrl)

  return (
    <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm">
      <h3 className="m-0 text-sm font-bold text-slate-900">What you submitted</h3>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Aadhaar number</dt>
          <dd className="m-0 font-mono font-semibold text-slate-900">{submission.aadhaarMasked}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Name on card</dt>
          <dd className="m-0 font-semibold text-slate-900">{submission.nameOnAadhaar || '—'}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-500">Submitted</dt>
          <dd className="m-0 font-semibold text-slate-900">{formatDate(submission.submittedAt)}</dd>
        </div>
      </dl>

      {(front || back) && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          {front && <img src={front} alt="Aadhaar front" className="w-full rounded-xl border border-slate-100 object-contain" />}
          {back && <img src={back} alt="Aadhaar back" className="w-full rounded-xl border border-slate-100 object-contain" />}
        </div>
      )}
    </div>
  )
}

function AadhaarVerification() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { profile } = useAuth()
  const journeyCompleted = getCompletedJourneySteps(profile)

  const { data: submission, isLoading } = useQuery({
    queryKey: employeeKeys.aadhaarSubmission,
    queryFn: fetchAadhaarSubmission,
    // The admin decision lands out of band, so keep the page fresh while it's open.
    refetchInterval: (query) => (query.state.data?.status === 'pending' ? 20000 : false),
  })

  const [form, setForm] = useState({
    aadhaar: '',
    nameOnAadhaar: '',
    dobOnAadhaar: '',
    genderOnAadhaar: '',
    addressOnAadhaar: '',
  })
  const [frontImage, setFrontImage] = useState(null)
  const [backImage, setBackImage] = useState(null)
  const [consent, setConsent] = useState(false)
  const [touched, setTouched] = useState(false)
  const [error, setError] = useState('')

  // Prefill from the profile so most people only have to type the number.
  useEffect(() => {
    if (!profile) return
    setForm((prev) => ({
      ...prev,
      nameOnAadhaar: prev.nameOnAadhaar || profile.name || '',
      dobOnAadhaar: prev.dobOnAadhaar || profile.dateOfBirth || '',
      genderOnAadhaar:
        prev.genderOnAadhaar ||
        (['male', 'female', 'other'].includes(profile.gender) ? profile.gender : ''),
    }))
  }, [profile])

  const numberValid = useMemo(() => isValidAadhaar(form.aadhaar), [form.aadhaar])
  const numberComplete = aadhaarDigits(form.aadhaar).length === 12

  const mutation = useMutation({
    mutationFn: () =>
      submitAadhaar({
        aadhaarNumber: aadhaarDigits(form.aadhaar),
        nameOnAadhaar: form.nameOnAadhaar.trim(),
        dobOnAadhaar: form.dobOnAadhaar.trim(),
        genderOnAadhaar: form.genderOnAadhaar,
        addressOnAadhaar: form.addressOnAadhaar.trim(),
        frontImage,
        backImage,
      }),
    onSuccess: () => {
      setError('')
      setFrontImage(null)
      setBackImage(null)
      setConsent(false)
      setTouched(false)
      queryClient.invalidateQueries({ queryKey: employeeKeys.aadhaarSubmission })
      queryClient.invalidateQueries({ queryKey: employeeKeys.verification })
    },
    onError: (err) => setError(err.message || 'Could not submit Aadhaar for verification'),
  })

  const canSubmit =
    numberValid &&
    form.nameOnAadhaar.trim().length >= 2 &&
    frontImage &&
    backImage &&
    consent &&
    !mutation.isPending

  const handleSubmit = (event) => {
    event.preventDefault()
    setTouched(true)
    if (!canSubmit) return
    mutation.mutate()
  }

  const setField = (key) => (event) =>
    setForm((prev) => ({ ...prev, [key]: event.target.value }))

  const status = submission?.status || 'not_submitted'
  const showForm = status === 'not_submitted' || status === 'rejected'

  const subtitle =
    {
      not_submitted: 'Identity check 1 of 2 — upload your Aadhaar card for manual verification',
      pending: 'Identity check 1 of 2 — your Aadhaar is with our verification team',
      approved: 'Identity check 1 of 2 — approved',
      rejected: 'Identity check 1 of 2 — resubmit with the issue fixed',
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

          {status === 'pending' && (
            <>
              <StatusBanner
                tone="warning"
                icon={<InfoIcon className="mt-0.5 h-5 w-5 shrink-0" />}
                title="Under review by the PagerLook team"
              >
                We are matching the details you typed against the card images. This usually takes a
                few hours. You will be able to start the face check as soon as it is approved.
              </StatusBanner>
              <SubmittedSummary submission={submission} />
            </>
          )}

          {status === 'approved' && (
            <>
              <StatusBanner
                tone="success"
                icon={<CheckCircleIcon className="mt-0.5 h-5 w-5 shrink-0 text-green-600" />}
                title="Aadhaar approved"
              >
                Approved on {formatDate(submission.reviewedAt)}. Next, we match your live selfie
                against the photo printed on this card.
              </StatusBanner>
              <SubmittedSummary submission={submission} />
              <Button type="button" onClick={() => navigate('/employee/verification/biometric')}>
                Continue to face match
              </Button>
            </>
          )}

          {status === 'rejected' && (
            <StatusBanner
              tone="danger"
              icon={<InfoIcon className="mt-0.5 h-5 w-5 shrink-0" />}
              title="Your submission was rejected"
            >
              {submission.rejectionReason || 'Please resubmit with clearer images.'}
            </StatusBanner>
          )}

          {showForm && (
            <form className="space-y-5" onSubmit={handleSubmit} noValidate>
              <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
                <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1e3a8a]" />
                <p className="m-0 text-sm text-slate-600">
                  Your Aadhaar number is encrypted at rest and only the last 4 digits are ever shown
                  back to you. The card images are visible to our verification team only.
                </p>
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <AadhaarImagePicker
                  label="Aadhaar front"
                  hint="Photo side with your name and number"
                  file={frontImage}
                  onChange={setFrontImage}
                  error={touched && !frontImage ? 'Front image is required' : ''}
                />
                <AadhaarImagePicker
                  label="Aadhaar back"
                  hint="Address side with the QR code"
                  file={backImage}
                  onChange={setBackImage}
                  error={touched && !backImage ? 'Back image is required' : ''}
                />
              </div>

              <div className="grid gap-4 lg:grid-cols-2">
                <Input
                  id="aadhaar"
                  label="Aadhaar number"
                  required
                  inputMode="numeric"
                  autoComplete="off"
                  placeholder="1234 5678 9012"
                  value={form.aadhaar}
                  onChange={(e) => setForm((prev) => ({ ...prev, aadhaar: formatAadhaar(e.target.value) }))}
                  leftIcon={<IdCardIcon className="h-[18px] w-[18px]" />}
                  error={(touched || numberComplete) && !numberValid}
                  errorText={
                    numberComplete
                      ? 'That is not a valid Aadhaar number — check the digits'
                      : 'Enter all 12 digits'
                  }
                  hint="Exactly as printed on the card"
                />
                <Input
                  id="nameOnAadhaar"
                  label="Name as on Aadhaar"
                  required
                  value={form.nameOnAadhaar}
                  onChange={setField('nameOnAadhaar')}
                  error={touched && form.nameOnAadhaar.trim().length < 2}
                  errorText="Enter the name printed on the card"
                  hint="Must match the card, not your preferred name"
                />
                <Input
                  id="dobOnAadhaar"
                  label="Date of birth on Aadhaar"
                  type="date"
                  value={form.dobOnAadhaar}
                  onChange={setField('dobOnAadhaar')}
                />
                <Select
                  id="genderOnAadhaar"
                  label="Gender on Aadhaar"
                  placeholder="Select gender"
                  options={GENDER_OPTIONS}
                  value={form.genderOnAadhaar}
                  onChange={setField('genderOnAadhaar')}
                />
              </div>

              <Input
                id="addressOnAadhaar"
                label="Address on Aadhaar (optional)"
                value={form.addressOnAadhaar}
                onChange={setField('addressOnAadhaar')}
              />

              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-1"
                />
                I confirm this is my own Aadhaar card and authorise PagerLook to verify these details
                and store the images securely.
              </label>
              {touched && !consent && (
                <p className="m-0 text-xs font-medium text-red-600">Consent is required to submit</p>
              )}

              <Button type="submit" disabled={!canSubmit}>
                {mutation.isPending ? 'Submitting...' : 'Submit for verification'}
              </Button>
            </form>
          )}
        </div>
      )}

      {mutation.isPending && <Loader variant="overlay" label="Uploading your Aadhaar..." />}
    </EmployeeLayout>
  )
}

export default AadhaarVerification

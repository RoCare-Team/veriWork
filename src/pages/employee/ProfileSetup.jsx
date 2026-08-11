import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Input from '../../components/common/Input'
import AutocompleteInput from '../../components/common/AutocompleteInput'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import PhoneInput from '../../components/employee/PhoneInput'
import VerificationStepBar from '../../components/employee/VerificationStepBar'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { BriefcaseIcon, BuildingIcon } from '../../components/common/Icons'
import { employeeKeys, fetchRoleSuggestions } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'
import { normalizePhone } from '../../lib/api'
import { getProfile, setupProfile } from '../../lib/employeeProfile'
import { mediaUrl } from '../../lib/mediaUrl'
import { COUNTRY_CODES } from '../../utils/countryCodes'
import { JOURNEY_STEPS } from '../../utils/employeeJourney'
import {
  clearInvitationSession,
  getInvitationDetails,
  getInvitationToken,
} from '../../utils/invitationSession'
import { useToast } from '../../context/ToastContext'

const GENDER_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
  { value: 'other', label: 'Other' },
  { value: 'prefer_not_to_say', label: 'Prefer not to say' },
]

const EXPERIENCE_OPTIONS = [
  { value: '0-1 years', label: '0-1 years' },
  { value: '1-3 years', label: '1-3 years' },
  { value: '3-5 years', label: '3-5 years' },
  { value: '5-8 years', label: '5-8 years' },
  { value: '8-12 years', label: '8-12 years' },
  { value: '12+ years', label: '12+ years' },
]

const STREAM_OPTIONS = [
  { value: '', label: 'Select stream (optional)' },
  { value: 'Science', label: 'Science' },
  { value: 'Commerce', label: 'Commerce' },
  { value: 'Arts', label: 'Arts' },
  { value: 'Vocational', label: 'Vocational' },
]

/** Score per completed education level — mirrors scoreService. */
const EDU_POINTS = 15

/*
 * This page owns the first two steps of the shared journey (see
 * utils/employeeJourney.js). Aadhaar and Face are steps 3 and 4 and live on
 * their own pages — the progress bar is the same on all of them, so the journey
 * never appears to change shape as you move between screens.
 */
const STEPS = [
  {
    id: 'profile',
    optional: false,
    subtitle: 'Step 1 of 3 — the essentials employers need to find and verify you',
  },
  {
    id: 'education',
    optional: true,
    subtitle: 'Step 2 of 3 — optional, adds +45 to your PagerLook score',
  },
  {
    id: 'identity',
    optional: true,
    subtitle: 'Step 3 of 3 — optional, the biggest score boost (+200)',
  },
]

const EMPTY_EDUCATION = {
  class10: { board: '', school: '', passingYear: '', percentage: '' },
  class12: { board: '', school: '', stream: '', passingYear: '', percentage: '' },
  graduation: { degree: '', college: '', university: '', passingYear: '', percentage: '' },
}

/*
 * Which optional steps the user deliberately jumped over. Kept in sessionStorage
 * so a reload mid-setup doesn't quietly turn "I skipped this" back into "not
 * reached yet" — the whole point is that a skip stays visible.
 */
const SKIPPED_STORAGE_KEY = 'pagerlook.profileSetup.skippedSteps'

function readSkippedSteps() {
  try {
    const parsed = JSON.parse(sessionStorage.getItem(SKIPPED_STORAGE_KEY) || '[]')
    return Array.isArray(parsed) ? parsed.filter((id) => STEPS.some((s) => s.id === id)) : []
  } catch {
    return []
  }
}

const MAX_PHOTO_SIZE = 5 * 1024 * 1024
const ALLOWED_PHOTO_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function UserIcon({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EducationLevelCard({ title, subtitle, children }) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 md:p-5">
      <div className="mb-4">
        <h3 className="m-0 text-sm font-bold text-slate-900 md:text-base">{title}</h3>
        {subtitle && <p className="m-0 mt-0.5 text-xs text-slate-500">{subtitle}</p>}
      </div>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  )
}

function FormSection({ title, description, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6 ${className}`.trim()}>
      <div className="mb-5 border-b border-slate-100 pb-4">
        <h2 className="m-0 text-base font-bold text-slate-900">{title}</h2>
        {description && <p className="m-0 mt-1 text-sm text-slate-500">{description}</p>}
      </div>
      <div className="flex flex-col gap-5">{children}</div>
    </section>
  )
}

function AddressTextarea({ id, label, value, onChange, error, errorText, disabled, required }) {
  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </label>
      <textarea
        id={id}
        rows={3}
        value={value}
        onChange={onChange}
        disabled={disabled}
        aria-invalid={error ? 'true' : undefined}
        className={`w-full resize-y rounded-2xl border bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 md:text-base ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : 'border-slate-200'}`}
      />
      {error && errorText && (
        <p className="m-0 text-xs text-red-600" role="alert">
          {errorText}
        </p>
      )}
    </div>
  )
}

function formatPhoneDisplay(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

function parseStoredPhone(phone) {
  if (!phone) return { countryCode: '+91', phone: '' }
  const trimmed = String(phone).trim()
  if (trimmed.startsWith('+')) {
    const match = COUNTRY_CODES.find((c) => trimmed.startsWith(c.code))
    if (match) {
      return {
        countryCode: match.code,
        phone: formatPhoneDisplay(trimmed.slice(match.code.length)),
      }
    }
    const digits = trimmed.replace(/\D/g, '')
    return { countryCode: '+91', phone: formatPhoneDisplay(digits.slice(-10)) }
  }
  return { countryCode: '+91', phone: formatPhoneDisplay(trimmed) }
}

function toDateInputValue(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function extractFieldErrors(details) {
  const fieldErrors = {}
  const general = []
  if (!Array.isArray(details)) return { fieldErrors, general }

  for (const item of details) {
    if (typeof item === 'string') {
      general.push(item)
      continue
    }
    const field = item.field || (Array.isArray(item.path) ? item.path.join('.') : item.path)
    const message = item.message || item.msg
    if (field && message) fieldErrors[field] = message
    else if (message) general.push(message)
  }
  return { fieldErrors, general }
}

function validatePhoto(file) {
  if (!ALLOWED_PHOTO_TYPES.includes(file.type)) {
    return 'Photo must be JPEG, PNG, WebP, or GIF'
  }
  if (file.size > MAX_PHOTO_SIZE) {
    return 'Photo must be 5MB or smaller'
  }
  return null
}

function applyProfileToForm(data, setters) {
  const parsedPhone = parseStoredPhone(data.phone)
  const currentAddress = data.currentAddress || ''
  const permanentAddress = data.permanentAddress || ''

  setters.setName(data.name && data.name !== 'New User' ? data.name : '')
  setters.setCountryCode(parsedPhone.countryCode)
  setters.setPhone(parsedPhone.phone)
  setters.setEmail(data.email || '')
  setters.setDateOfBirth(toDateInputValue(data.dateOfBirth))
  setters.setGender(data.gender || '')
  setters.setRole(data.role && data.role !== 'Professional' ? data.role : '')
  setters.setCompany(data.company || '')
  setters.setTotalExperience(data.totalExperience ? String(data.totalExperience) : '')
  setters.setCurrentCity(data.currentCity || '')
  setters.setCurrentAddress(currentAddress)
  setters.setPermanentAddress(permanentAddress)
  setters.setSameAsCurrentAddress(
    Boolean(currentAddress) &&
      (!permanentAddress || permanentAddress.trim() === currentAddress.trim()),
  )
  setters.setPhotoUrl(data.photoUrl || '')
  // Drives the tick on the identity step — verification happens on its own pages.
  setters.setAadhaarVerified?.(Boolean(data.aadhaarVerified))
  setters.setBiometricVerified?.(Boolean(data.biometricVerified))
  setters.setEducation({
    class10: {
      board: data.education?.class10?.board || '',
      school: data.education?.class10?.school || '',
      passingYear: data.education?.class10?.passingYear || '',
      percentage: data.education?.class10?.percentage || '',
    },
    class12: {
      board: data.education?.class12?.board || '',
      school: data.education?.class12?.school || '',
      stream: data.education?.class12?.stream || '',
      passingYear: data.education?.class12?.passingYear || '',
      percentage: data.education?.class12?.percentage || '',
    },
    graduation: {
      degree: data.education?.graduation?.degree || '',
      college: data.education?.graduation?.college || '',
      university: data.education?.graduation?.university || '',
      passingYear: data.education?.graduation?.passingYear || '',
      percentage: data.education?.graduation?.percentage || '',
    },
  })
}

function ProfileSetup() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { user, profile, updateProfileState } = useAuth()
  const isEditing = profile?.profileSetupComplete === true

  const [loading, setLoading] = useState(true)
  const [name, setName] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [dateOfBirth, setDateOfBirth] = useState('')
  const [gender, setGender] = useState('')
  const [role, setRole] = useState('')
  const [company, setCompany] = useState('')
  const [totalExperience, setTotalExperience] = useState('')
  const [currentCity, setCurrentCity] = useState('')
  const [currentAddress, setCurrentAddress] = useState('')
  const [permanentAddress, setPermanentAddress] = useState('')
  const [sameAsCurrentAddress, setSameAsCurrentAddress] = useState(false)
  const [photo, setPhoto] = useState(null)
  const [photoUrl, setPhotoUrl] = useState('')
  // Derived from the picked file — no state, so nothing to sync in an effect.
  const photoPreview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo])
  const [photoError, setPhotoError] = useState('')
  const [education, setEducation] = useState(EMPTY_EDUCATION)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  // Wizard position. Step 2 (education) and 3 (identity) are skippable.
  // `?step=education` (from the score page's "Add now") opens that step directly
  // instead of dropping the user back on basic details.
  const requestedStepId = searchParams.get('step')
  const [step, setStep] = useState(() => {
    const index = STEPS.findIndex((s) => s.id === requestedStepId)
    return index >= 0 ? index : 0
  })
  // Optional steps the user chose to jump over. A step here is *not* the same as
  // an unvisited one, and the progress bar renders it differently.
  const [skippedSteps, setSkippedSteps] = useState(readSkippedSteps)
  // Only surface "what's missing" after they try to continue — not while typing.
  const [showStep1Errors, setShowStep1Errors] = useState(false)
  const [aadhaarVerified, setAadhaarVerified] = useState(false)
  const [biometricVerified, setBiometricVerified] = useState(false)
  // Set just before a mutation that should save without navigating away.
  const saveOnlyRef = useRef(false)
  // Where to go once the save lands, when the save exists only to unblock a
  // route (see `startVerification`).
  const nextPathRef = useRef('')
  const [generalErrors, setGeneralErrors] = useState([])

  const setters = {
    setName,
    setCountryCode,
    setPhone,
    setEmail,
    setDateOfBirth,
    setGender,
    setRole,
    setCompany,
    setTotalExperience,
    setCurrentCity,
    setCurrentAddress,
    setPermanentAddress,
    setSameAsCurrentAddress,
    setPhotoUrl,
    setEducation,
    setAadhaarVerified,
    setBiometricVerified,
  }

  useEffect(() => {
    let cancelled = false

    /*
     * Anything the inviting company already entered (name, mobile, email, role,
     * company) pre-fills the form — but only where the saved profile is still
     * blank, so a returning user's own data always wins.
     */
    const withInvitationDefaults = (data = {}) => {
      const invite = getInvitationDetails()
      const hasName = data.name && data.name !== 'New User'
      const hasRole = data.role && data.role !== 'Professional'
      return {
        ...data,
        name: hasName ? data.name : invite.name || data.name,
        email: data.email || invite.email || '',
        phone: data.phone || invite.phone || '',
        role: hasRole ? data.role : invite.designation || data.role,
        company: data.company || invite.companyName || '',
      }
    }

    async function loadProfile() {
      setLoading(true)
      try {
        const data = await getProfile()
        if (!cancelled) applyProfileToForm(withInvitationDefaults(data), setters)
      } catch {
        if (!cancelled) {
          applyProfileToForm(
            withInvitationDefaults({
              ...profile,
              phone: profile?.phone || user?.phone,
              email: profile?.email || user?.email,
            }),
            setters,
          )
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadProfile()
    return () => {
      cancelled = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    try {
      sessionStorage.setItem(SKIPPED_STORAGE_KEY, JSON.stringify(skippedSteps))
    } catch {
      // Private-mode storage failures are not worth interrupting setup over.
    }
  }, [skippedSteps])

  // Release the object URL when the pick changes or the page unmounts.
  useEffect(() => {
    if (!photoPreview) return undefined
    return () => URL.revokeObjectURL(photoPreview)
  }, [photoPreview])

  const phoneDigits = phone.replace(/\D/g, '')
  const fullPhone = normalizePhone(countryCode, phone)

  const mutation = useMutation({
    mutationFn: () => {
      const formData = new FormData()
      formData.append('name', name.trim())
      formData.append('phone', fullPhone)
      formData.append('email', email.trim())
      formData.append('dateOfBirth', dateOfBirth)
      formData.append('gender', gender)
      formData.append('role', role.trim())
      formData.append('company', company.trim())
      formData.append('totalExperience', totalExperience)
      formData.append('currentCity', currentCity.trim())
      formData.append('currentAddress', currentAddress.trim())
      formData.append('sameAsCurrentAddress', sameAsCurrentAddress ? 'true' : 'false')
      if (!sameAsCurrentAddress) {
        formData.append('permanentAddress', permanentAddress.trim())
      }
      // Only send education if something was actually filled — sending empty
      // strings would otherwise wipe a level the user added earlier.
      const trimLevel = (obj) =>
        Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, (v || '').trim()]))
      const eduPayload = {
        class10: trimLevel(education.class10),
        class12: trimLevel(education.class12),
        graduation: trimLevel(education.graduation),
      }
      const anyEducation = Object.values(eduPayload).some((lvl) =>
        Object.values(lvl).some(Boolean),
      )
      if (anyEducation) {
        formData.append('education', JSON.stringify(eduPayload))
      }
      if (photo) formData.append('photo', photo)
      const invitationToken = getInvitationToken()
      if (invitationToken) formData.append('invitationToken', invitationToken)
      return setupProfile(formData)
    },
    onSuccess: (data) => {
      // "Save" persists without leaving the wizard; "Continue"/"Finish" navigate.
      const saveOnly = saveOnlyRef.current
      // Set when the save was only a prerequisite for going somewhere else
      // (the Aadhaar / face flows), which is neither of the above.
      const nextPath = nextPathRef.current
      saveOnlyRef.current = false
      nextPathRef.current = ''

      // Setup is over — the skip marks were wizard state, not profile state.
      // What's still missing now lives on the score page instead.
      if (!saveOnly && !nextPath) setSkippedSteps([])

      updateProfileState({
        ...profile,
        profileSetupComplete: data.profileSetupComplete ?? true,
        photoUrl: data.photoUrl ?? profile?.photoUrl,
      })
      queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
      queryClient.invalidateQueries({ queryKey: employeeKeys.score })

      const autoJoined = data?.invitationResult?.autoJoined
      if (Array.isArray(autoJoined) && autoJoined.length > 0) {
        const entry = autoJoined[0]
        const companyName =
          typeof entry === 'string' ? entry : entry?.companyName || entry?.name || 'the company'
        clearInvitationSession()
        toast(`You have been added to ${companyName} team!`, 'success')
        if (nextPath) navigate(nextPath)
        else if (!saveOnly) navigate('/employee/score')
        return
      }

      if (nextPath) {
        navigate(nextPath)
        return
      }

      if (saveOnly) {
        toast('Progress saved', 'success')
        return
      }

      // Finishing setup lands on the score — it's the payoff, and it shows
      // exactly what the skipped steps would still be worth.
      navigate(isEditing ? '/employee/professional-id' : '/employee/score')
    },
    onError: (err) => {
      // Don't let a failed save leave a pending destination behind — the next
      // successful save would then navigate away for no reason.
      saveOnlyRef.current = false
      nextPathRef.current = ''
      const { fieldErrors: nextFieldErrors, general } = extractFieldErrors(err.details)
      setFieldErrors(nextFieldErrors)
      setGeneralErrors(general)
      setError(err.message || 'Failed to save profile')
    },
  })

  /*
   * Education is optional. A level is only validated once the user has started
   * filling it — an untouched level is "skipped", a half-filled one is an error,
   * because a partial record looks complete on a profile but isn't.
   */
  const EDU_KEYS = {
    class10: ['board', 'school'],
    class12: ['board', 'school'],
    graduation: ['degree', 'college'],
  }

  const eduLevelState = (level) => {
    const data = education[level]
    const keys = EDU_KEYS[level]
    const touched = Object.values(data).some((v) => v?.trim())
    if (!touched) return 'empty'
    const complete = keys.every((k) => data[k]?.trim().length >= 2)
    return complete ? 'complete' : 'partial'
  }

  const eduStates = {
    class10: eduLevelState('class10'),
    class12: eduLevelState('class12'),
    graduation: eduLevelState('graduation'),
  }
  const completedEduLevels = Object.values(eduStates).filter((s) => s === 'complete').length
  const hasPartialEdu = Object.values(eduStates).some((s) => s === 'partial')

  /** Step 1 — the only genuinely required information. */
  const step1Missing = [
    [name.trim().length >= 2, 'Full name'],
    [phoneDigits.length >= 10, 'Phone number'],
    [email.trim().length > 0, 'Email'],
    [Boolean(dateOfBirth), 'Date of birth'],
    [Boolean(gender), 'Gender'],
    [role.trim().length >= 2, 'Current role'],
    [company.trim().length >= 1, 'Current company'],
    [Boolean(totalExperience), 'Total experience'],
    [currentCity.trim().length >= 2, 'Current city'],
    [currentAddress.trim().length >= 5, 'Current address'],
    [sameAsCurrentAddress || permanentAddress.trim().length >= 5, 'Permanent address'],
  ]
    .filter(([ok]) => !ok)
    .map(([, label]) => label)

  const isStep1Valid = step1Missing.length === 0

  // Ticks on the shared journey bar. Aadhaar/Face come from the saved profile —
  // they're done on their own pages, but must still show as complete here.
  const completedSteps = [
    ...(isStep1Valid ? ['profile'] : []),
    ...(completedEduLevels > 0 && !hasPartialEdu ? ['education'] : []),
    ...(aadhaarVerified && biometricVerified ? ['identity'] : []),
  ]

  // Completing a step always wins over having skipped it earlier.
  const visibleSkipped = skippedSteps.filter((id) => !completedSteps.includes(id))
  const skippedDetails = JOURNEY_STEPS.filter((s) => visibleSkipped.includes(s.id))

  const markSkipped = (id) => setSkippedSteps((prev) => (prev.includes(id) ? prev : [...prev, id]))
  const clearSkipped = (id) => setSkippedSteps((prev) => prev.filter((s) => s !== id))

  const updateEducation = (level, field, value) => {
    setEducation((prev) => ({
      ...prev,
      [level]: { ...prev[level], [field]: value },
    }))
  }

  const handlePhotoSelect = (e) => {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (!file) return

    const validationError = validatePhoto(file)
    if (validationError) {
      setPhoto(null)
      setPhotoError(validationError)
      return
    }

    setPhotoError('')
    setPhoto(file)
  }

  const handleSameAddressChange = (checked) => {
    setSameAsCurrentAddress(checked)
    if (checked) setPermanentAddress('')
  }

  const submitProfile = () => {
    if (mutation.isPending || loading) return
    setError('')
    setFieldErrors({})
    setGeneralErrors([])
    mutation.mutate()
  }

  /** Persist what's filled so far and stay on the current step. */
  const handleSave = () => {
    if (!isStep1Valid) {
      setShowStep1Errors(true)
      setStep(0)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (hasPartialEdu) {
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    saveOnlyRef.current = true
    submitProfile()
  }

  const goToStep = (index) => {
    setStep(index)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /**
   * Move forward, or submit if there is nowhere left to go. Never called
   * directly by a control — `goNext`/`skipStep` decide what leaving the current
   * step *means* first.
   */
  const advance = () => {
    if (step === STEPS.length - 1) {
      submitProfile()
      return
    }
    goToStep(step + 1)
  }

  /**
   * Record what leaving an optional step meant: filled in = done and no longer
   * skipped, left empty = skipped. Without this, walking past a step with
   * "Continue" would look identical to never having reached it.
   */
  const settleOptionalStep = (index) => {
    const meta = STEPS[index]
    if (!meta?.optional) return
    if (completedSteps.includes(meta.id)) clearSkipped(meta.id)
    else markSkipped(meta.id)
  }

  /**
   * Advance a step. Step 1 must be valid; optional steps just must not be
   * half-filled.
   */
  const goNext = () => {
    if (step === 0) {
      if (!isStep1Valid) {
        setShowStep1Errors(true)
        window.scrollTo({ top: 0, behavior: 'smooth' })
        return
      }
      setShowStep1Errors(false)
    }
    if (step === 1 && hasPartialEdu) {
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    settleOptionalStep(step)
    advance()
  }

  /**
   * Explicit skip. On the LAST step there is nowhere to advance to, so "skip"
   * there means "finish without doing this" and submits.
   */
  const skipStep = () => {
    const meta = STEPS[step]
    if (!meta?.optional) return

    /*
     * Skipping means "none of this", so a half-filled level is cleared rather
     * than left behind — a partial record looks complete on a profile but isn't,
     * and the backend rejects it on submit anyway.
     */
    if (meta.id === 'education' && hasPartialEdu) {
      setEducation((prev) => {
        const next = { ...prev }
        for (const [level, state] of Object.entries(eduStates)) {
          if (state === 'partial') next[level] = { ...EMPTY_EDUCATION[level] }
        }
        return next
      })
    }

    markSkipped(meta.id)
    advance()
  }

  /**
   * Leave the wizard for one of the identity checks.
   *
   * The server refuses Aadhaar until the profile is actually saved
   * ("Complete profile setup before Aadhaar verification"), and until now the
   * wizard sent people there with an unsaved profile — so the check only failed
   * once they had filled the whole Aadhaar form. Save first, then go.
   */
  const startVerification = (to) => {
    if (mutation.isPending || loading) return

    if (profile?.profileSetupComplete) {
      navigate(to)
      return
    }
    if (!isStep1Valid) {
      setShowStep1Errors(true)
      goToStep(0)
      return
    }
    if (hasPartialEdu) {
      goToStep(1)
      return
    }

    nextPathRef.current = to
    // Not a "finish" — the wizard state (including skips) must survive the trip.
    saveOnlyRef.current = true
    submitProfile()
  }

  /** Jump straight to a step from the progress bar. */
  const handleStepSelect = (id) => {
    const index = STEPS.findIndex((s) => s.id === id)
    if (index < 0 || index === step) return
    // Step 1 gates everything after it — jumping ahead with it incomplete would
    // only fail on submit, so send them back with the reason instead.
    if (index > 0 && !isStep1Valid) {
      setShowStep1Errors(true)
      goToStep(0)
      return
    }
    // Don't strand a half-filled education level behind them.
    if (step === 1 && index !== 1 && hasPartialEdu) return
    // Only moving *forward* past a step counts as leaving it behind — going
    // Back is a second look, not a skip.
    if (index > step) settleOptionalStep(step)
    // Going *to* a step means they're giving it another look — it isn't skipped
    // any more until they leave it empty again.
    clearSkipped(id)
    goToStep(index)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (mutation.isPending || loading) return
    if (!isStep1Valid) {
      // Send them back to the step that's actually blocking, and say why.
      setShowStep1Errors(true)
      setStep(0)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    if (hasPartialEdu) {
      setStep(1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }
    submitProfile()
  }

  const fieldError = (key) => Boolean(fieldErrors[key])
  const fieldErrorText = (key) => fieldErrors[key]
  const eduError = (level, field) => fieldError(`education.${level}.${field}`)
  const eduErrorText = (level, field) => fieldErrorText(`education.${level}.${field}`)
  const displayPhoto = photoPreview || mediaUrl(photoUrl)

  if (loading) {
    return (
      <EmployeeLayout fullWidth footer={<SecurityFooter variant="shield" text="Your profile is private & encrypted" />}>
        <Loader variant="fullPage" label="Loading profile..." />
      </EmployeeLayout>
    )
  }

  return (
    <EmployeeLayout fullWidth footer={<SecurityFooter variant="shield" text="Your profile is private & encrypted" />}>
      <EmployeePageHeader
        title={isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
        subtitle={STEPS[step].subtitle}
      />

      <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <VerificationStepBar
          currentStep={STEPS[step].id}
          completed={completedSteps}
          skipped={visibleSkipped}
          onStepSelect={handleStepSelect}
        />

        {/* A skipped step is called out by name, right under the bar, with the
            way back to it — so it can never be mistaken for "not reached yet". */}
        {skippedDetails.length > 0 && (
          <div className="mt-5 flex flex-col gap-2 border-t border-dashed border-slate-200 pt-4">
            {skippedDetails.map((s) => (
              <div
                key={s.id}
                className="flex flex-wrap items-center justify-between gap-x-3 gap-y-2 rounded-xl border border-amber-200 bg-amber-50/70 px-3.5 py-2.5"
              >
                <p className="m-0 flex flex-wrap items-center gap-2 text-xs text-amber-900">
                  <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-700">
                    Skipped
                  </span>
                  <span>
                    <strong>{s.label}</strong> — you can add this any time, but{' '}
                    <strong>+{s.points} pts</strong> stay locked until you do.
                  </span>
                </p>
                <button
                  type="button"
                  onClick={() => handleStepSelect(s.id)}
                  className="shrink-0 rounded-ctl border border-amber-300 bg-white px-3 py-1.5 text-xs font-bold text-amber-700 transition hover:bg-amber-100"
                >
                  Add it now
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {(error || generalErrors.length > 0) && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
          {error && <p className="m-0">{error}</p>}
          {generalErrors.length > 0 && (
            <ul className={`m-0 list-disc pl-5 ${error ? 'mt-2' : ''}`}>
              {generalErrors.map((msg) => (
                <li key={msg}>{msg}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Tell them exactly what is still missing, instead of a dead button. */}
      {showStep1Errors && step === 0 && step1Missing.length > 0 && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800" role="alert">
          <p className="m-0 font-semibold">Still needed to continue:</p>
          <ul className="m-0 mt-1 list-disc pl-5">
            {step1Missing.map((label) => (
              <li key={label}>{label}</li>
            ))}
          </ul>
        </div>
      )}

      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
        {/* items-start: without it the grid stretches every card to the tallest
            in its row, which left big dead gaps and made the page shift as
            content (photo preview, address field) appeared. */}
        <div className={`grid grid-cols-1 items-start gap-6 ${step === 0 ? 'lg:grid-cols-2' : ''}`}>
        {step === 0 && (
          <>
        <FormSection title="Personal details" description="Basic identity information for your PagerLook account">
          <Input
            id="full-name"
            label="Full Name"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon />}
            disabled={mutation.isPending}
            error={fieldError('name')}
            errorText={fieldErrorText('name')}
          />

          <PhoneInput
            countryCode={countryCode}
            onCountryCodeChange={setCountryCode}
            value={phone}
            onChange={(e) => setPhone(formatPhoneDisplay(e.target.value))}
            disabled={mutation.isPending}
          />
          {fieldError('phone') && (
            <p className="-mt-3 text-xs text-red-600" role="alert">
              {fieldErrorText('phone')}
            </p>
          )}

          <Input
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<span className="text-sm font-semibold">@</span>}
            disabled={mutation.isPending}
            error={fieldError('email')}
            errorText={fieldErrorText('email')}
          />

          <div className="grid gap-5 sm:grid-cols-2">
            <Input
              id="date-of-birth"
              label="Date of Birth"
              type="date"
              required
              value={dateOfBirth}
              onChange={(e) => setDateOfBirth(e.target.value)}
              disabled={mutation.isPending}
              error={fieldError('dateOfBirth')}
              errorText={fieldErrorText('dateOfBirth')}
            />
            <Select
              id="gender"
              label="Gender"
              required
              placeholder="Select gender"
              options={GENDER_OPTIONS}
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              disabled={mutation.isPending}
              error={fieldError('gender')}
            />
            {fieldError('gender') && (
              <p className="-mt-3 text-xs text-red-600 sm:col-span-2" role="alert">
                {fieldErrorText('gender')}
              </p>
            )}
          </div>
        </FormSection>

        <FormSection title="Work details" description="Your current role helps employers find and verify you">
          <AutocompleteInput
            id="role"
            label="Current Role"
            required
            value={role}
            onChange={setRole}
            fetchSuggestions={fetchRoleSuggestions}
            minChars={1}
            placeholder="e.g. Software Engineer"
            leftIcon={<BriefcaseIcon className="h-[18px] w-[18px]" />}
            disabled={mutation.isPending}
            error={fieldError('role')}
            errorText={fieldErrorText('role')}
            hint="Start typing to see role suggestions"
          />

          {/* Plain input, no lookup: people work at companies that aren't on
              PagerLook, and a dropdown fighting their typing was worse than useless. */}
          <Input
            id="company"
            label="Current Company"
            required
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            placeholder="Type any company name, or None"
            leftIcon={<BuildingIcon className="h-[18px] w-[18px]" />}
            disabled={mutation.isPending}
            error={fieldError('company')}
            errorText={fieldErrorText('company')}
            hint="Not working right now? Just type None"
          />

          <Select
            id="total-experience"
            label="Total Experience"
            required
            placeholder="Select experience"
            options={EXPERIENCE_OPTIONS}
            value={totalExperience}
            onChange={(e) => setTotalExperience(e.target.value)}
            disabled={mutation.isPending}
            error={fieldError('totalExperience')}
          />
          {fieldError('totalExperience') && (
            <p className="-mt-3 text-xs text-red-600" role="alert">
              {fieldErrorText('totalExperience')}
            </p>
          )}
        </FormSection>

        <FormSection title="Location" description="Used for employment verification and your public profile">
          <Input
            id="current-city"
            label="Current City"
            required
            value={currentCity}
            onChange={(e) => setCurrentCity(e.target.value)}
            disabled={mutation.isPending}
            error={fieldError('currentCity')}
            errorText={fieldErrorText('currentCity')}
          />

          <AddressTextarea
            id="current-address"
            label="Current Address"
            required
            value={currentAddress}
            onChange={(e) => setCurrentAddress(e.target.value)}
            disabled={mutation.isPending}
            error={fieldError('currentAddress')}
            errorText={fieldErrorText('currentAddress')}
          />

          <label className="-mt-2 flex cursor-pointer items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 px-4 py-3 text-sm text-slate-700">
            <input
              type="checkbox"
              checked={sameAsCurrentAddress}
              onChange={(e) => handleSameAddressChange(e.target.checked)}
              disabled={mutation.isPending}
              className="h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
            />
            Permanent address same as current address
          </label>

          {!sameAsCurrentAddress && (
            <AddressTextarea
              id="permanent-address"
              label="Permanent Address"
              required
              value={permanentAddress}
              onChange={(e) => setPermanentAddress(e.target.value)}
              disabled={mutation.isPending}
              error={fieldError('permanentAddress')}
              errorText={fieldErrorText('permanentAddress')}
            />
          )}
        </FormSection>

        <FormSection title="Profile photo" description="Optional — upload a clear photo for your professional ID">
          <div className="flex items-center gap-4">
            {/* Fixed square, never grows with the image — keeps the row stable. */}
            <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-slate-300" />
              )}
            </div>
            {/* relative: the file input is `sr-only`, which is position:absolute.
                Without a positioned ancestor it lands at the top of the document,
                so focusing it (clicking the label) scrolled the page up. */}
            <div className="relative flex flex-1 flex-col gap-2 text-left">
              <label
                htmlFor="photo"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#1e3a8a]/30 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#1e3a8a] transition hover:bg-blue-100 sm:w-fit"
              >
                Choose photo
              </label>
              <input
                id="photo"
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                disabled={mutation.isPending}
                onChange={handlePhotoSelect}
                className="sr-only"
              />
              <p className="m-0 text-xs text-slate-400">JPEG, PNG or WebP · Max 5MB</p>
              {photoError && (
                <p className="m-0 text-xs text-red-600" role="alert">
                  {photoError}
                </p>
              )}
              {fieldError('photo') && (
                <p className="m-0 text-xs text-red-600" role="alert">
                  {fieldErrorText('photo')}
                </p>
              )}
            </div>
          </div>
        </FormSection>
          </>
        )}
        </div>

        {step === 1 && (
        <FormSection
          title="Education"
          description="Optional — add what you have. Each completed level adds +15 to your PagerLook score."
          className="w-full"
        >
          <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
            <p className="m-0 text-xs text-slate-700">
              You can skip this and add it later — but you'll earn{' '}
              <strong>+{completedEduLevels * EDU_POINTS} pts</strong> of a possible{' '}
              <strong>+{3 * EDU_POINTS}</strong> right now.
            </p>
            <span className="rounded-full bg-white px-3 py-1 text-[11px] font-bold text-amber-700">
              {completedEduLevels}/3 completed
            </span>
          </div>

          {hasPartialEdu && (
            <p className="m-0 mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
              One of your education levels is half-filled. Complete it (board/school, or
              degree/college) or clear it to skip.
            </p>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <EducationLevelCard title="Class 10th" subtitle="Secondary school">
              <Input
                id="class10-board"
                label="Board"
                required
                value={education.class10.board}
                onChange={(e) => updateEducation('class10', 'board', e.target.value)}
                placeholder="e.g. CBSE, ICSE, State Board"
                disabled={mutation.isPending}
                error={eduError('class10', 'board')}
                errorText={eduErrorText('class10', 'board')}
              />
              <Input
                id="class10-school"
                label="School Name"
                required
                value={education.class10.school}
                onChange={(e) => updateEducation('class10', 'school', e.target.value)}
                placeholder="School name"
                disabled={mutation.isPending}
                error={eduError('class10', 'school')}
                errorText={eduErrorText('class10', 'school')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="class10-year"
                  label="Passing Year"
                  required
                  value={education.class10.passingYear}
                  onChange={(e) => updateEducation('class10', 'passingYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  disabled={mutation.isPending}
                  error={eduError('class10', 'passingYear')}
                  errorText={eduErrorText('class10', 'passingYear')}
                />
                <Input
                  id="class10-percentage"
                  label="Percentage"
                  value={education.class10.percentage}
                  onChange={(e) => updateEducation('class10', 'percentage', e.target.value)}
                  placeholder="e.g. 85.5"
                  disabled={mutation.isPending}
                  error={eduError('class10', 'percentage')}
                  errorText={eduErrorText('class10', 'percentage')}
                />
              </div>
            </EducationLevelCard>

            <EducationLevelCard title="Class 12th" subtitle="Higher secondary">
              <Input
                id="class12-board"
                label="Board"
                required
                value={education.class12.board}
                onChange={(e) => updateEducation('class12', 'board', e.target.value)}
                placeholder="e.g. CBSE, ICSE, State Board"
                disabled={mutation.isPending}
                error={eduError('class12', 'board')}
                errorText={eduErrorText('class12', 'board')}
              />
              <Input
                id="class12-school"
                label="School Name"
                required
                value={education.class12.school}
                onChange={(e) => updateEducation('class12', 'school', e.target.value)}
                placeholder="School name"
                disabled={mutation.isPending}
                error={eduError('class12', 'school')}
                errorText={eduErrorText('class12', 'school')}
              />
              <Select
                id="class12-stream"
                label="Stream"
                options={STREAM_OPTIONS}
                value={education.class12.stream}
                onChange={(e) => updateEducation('class12', 'stream', e.target.value)}
                disabled={mutation.isPending}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="class12-year"
                  label="Passing Year"
                  required
                  value={education.class12.passingYear}
                  onChange={(e) => updateEducation('class12', 'passingYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  disabled={mutation.isPending}
                  error={eduError('class12', 'passingYear')}
                  errorText={eduErrorText('class12', 'passingYear')}
                />
                <Input
                  id="class12-percentage"
                  label="Percentage"
                  value={education.class12.percentage}
                  onChange={(e) => updateEducation('class12', 'percentage', e.target.value)}
                  placeholder="e.g. 78"
                  disabled={mutation.isPending}
                  error={eduError('class12', 'percentage')}
                  errorText={eduErrorText('class12', 'percentage')}
                />
              </div>
            </EducationLevelCard>

            <EducationLevelCard title="Graduation" subtitle="Undergraduate degree">
              <Input
                id="graduation-degree"
                label="Degree"
                required
                value={education.graduation.degree}
                onChange={(e) => updateEducation('graduation', 'degree', e.target.value)}
                placeholder="e.g. B.Tech, B.Com, B.A"
                disabled={mutation.isPending}
                error={eduError('graduation', 'degree')}
                errorText={eduErrorText('graduation', 'degree')}
              />
              <Input
                id="graduation-college"
                label="College Name"
                required
                value={education.graduation.college}
                onChange={(e) => updateEducation('graduation', 'college', e.target.value)}
                placeholder="College name"
                disabled={mutation.isPending}
                error={eduError('graduation', 'college')}
                errorText={eduErrorText('graduation', 'college')}
              />
              <Input
                id="graduation-university"
                label="University"
                value={education.graduation.university}
                onChange={(e) => updateEducation('graduation', 'university', e.target.value)}
                placeholder="University name (optional)"
                disabled={mutation.isPending}
                error={eduError('graduation', 'university')}
                errorText={eduErrorText('graduation', 'university')}
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <Input
                  id="graduation-year"
                  label="Passing Year"
                  required
                  value={education.graduation.passingYear}
                  onChange={(e) => updateEducation('graduation', 'passingYear', e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="YYYY"
                  disabled={mutation.isPending}
                  error={eduError('graduation', 'passingYear')}
                  errorText={eduErrorText('graduation', 'passingYear')}
                />
                <Input
                  id="graduation-percentage"
                  label="Percentage / CGPA"
                  value={education.graduation.percentage}
                  onChange={(e) => updateEducation('graduation', 'percentage', e.target.value)}
                  placeholder="e.g. 8.2 CGPA"
                  disabled={mutation.isPending}
                  error={eduError('graduation', 'percentage')}
                  errorText={eduErrorText('graduation', 'percentage')}
                />
              </div>
            </EducationLevelCard>
          </div>
        </FormSection>
        )}

        {/* Step 3 — Identity. The two checks run on their own pages (DigiLocker,
            camera), so this step launches them and never blocks finishing. */}
        {step === 2 && (
          <FormSection
            title="Identity verification"
            description="Optional — verify Aadhaar and your face to unlock the biggest score boost."
            className="w-full"
          >
            <div className="rounded-xl border border-amber-100 bg-amber-50/60 px-4 py-3">
              <p className="m-0 text-xs text-slate-700">
                Both checks together add <strong>+200 pts</strong> and unlock the{' '}
                <strong>Identity Verified</strong> badge employers look for. Skip now and you can do
                it any time — you just won't get these points until you do.
              </p>
              {!profile?.profileSetupComplete && (
                <p className="m-0 mt-2 text-xs text-slate-500">
                  Starting a check saves your details first — Aadhaar can only run against a saved
                  profile.
                </p>
              )}
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              {[
                {
                  key: 'aadhaar',
                  title: 'Aadhaar verification',
                  desc: 'Secure e-KYC via DigiLocker or OTP.',
                  done: aadhaarVerified,
                  to: '/employee/verification/aadhaar',
                },
                {
                  key: 'face',
                  title: 'Face verification',
                  desc: 'A quick liveness selfie matched to your ID.',
                  done: biometricVerified,
                  to: '/employee/verification/biometric',
                },
              ].map((c) => (
                <div key={c.key} className="rounded-2xl border border-slate-200 p-5">
                  <div className="flex items-start justify-between gap-2">
                    <p className="m-0 text-sm font-bold text-slate-900">{c.title}</p>
                    {c.done && (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-emerald-700">
                        Done
                      </span>
                    )}
                  </div>
                  <p className="m-0 mt-1 text-xs text-slate-500">{c.desc}</p>
                  <button
                    type="button"
                    onClick={() => startVerification(c.to)}
                    disabled={c.done || mutation.isPending}
                    className="mt-4 w-full rounded-ctl bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:bg-slate-100 disabled:text-slate-400"
                  >
                    {c.done ? 'Verified' : `Verify ${c.key === 'aadhaar' ? 'Aadhaar' : 'face'}`}
                  </button>
                </div>
              ))}
            </div>
          </FormSection>
        )}

        {/* Last step — one honest summary of what is about to be saved, so
            nobody finishes setup without knowing what they left behind. */}
        {step === STEPS.length - 1 && (
          <FormSection
            title="Before you finish"
            description="This is exactly where each step stands. Anything skipped can be added later from your score page."
            className="w-full"
          >
            <ul className="m-0 flex list-none flex-col gap-3 p-0">
              {JOURNEY_STEPS.map((s, index) => {
                const done = completedSteps.includes(s.id)
                const wasSkipped = visibleSkipped.includes(s.id)
                const status = done ? 'done' : wasSkipped ? 'skipped' : 'pending'
                const chip = {
                  done: 'border-green-200 bg-green-50 text-green-700',
                  skipped: 'border-amber-200 bg-amber-50 text-amber-700',
                  pending: 'border-slate-200 bg-slate-50 text-slate-500',
                }[status]
                const chipText = { done: 'Completed', skipped: 'Skipped', pending: 'Not added yet' }[status]

                return (
                  <li
                    key={s.id}
                    className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 rounded-xl border border-slate-100 bg-slate-50/70 px-4 py-3"
                  >
                    <div className="min-w-0">
                      <p className="m-0 text-sm font-bold text-slate-900">
                        <span className="text-slate-400">{index + 1}.</span> {s.title}
                      </p>
                      <p className="m-0 mt-0.5 text-xs text-slate-500">
                        {s.description}
                        {!done && !s.required && ` · worth +${s.points} pts`}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${chip}`}>
                        {chipText}
                      </span>
                      {/* No button for the step they're already standing on —
                          its own controls are right above this summary. */}
                      {!done && s.id !== STEPS[step].id && (
                        <button
                          type="button"
                          onClick={() => handleStepSelect(s.id)}
                          className="rounded-ctl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 transition hover:bg-slate-100"
                        >
                          Add now
                        </button>
                      )}
                    </div>
                  </li>
                )
              })}
            </ul>
          </FormSection>
        )}

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              {step > 0 && (
                <button
                  type="button"
                  onClick={() => handleStepSelect(STEPS[step - 1].id)}
                  disabled={mutation.isPending}
                  className="rounded-ctl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Back
                </button>
              )}
              <div className="min-w-0">
                <p className="m-0 text-sm font-semibold text-slate-700">
                  Step {step + 1} of {STEPS.length} · {JOURNEY_STEPS[step].label}
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
                      STEPS[step].optional
                        ? 'bg-amber-50 text-amber-700'
                        : 'bg-brand-600/10 text-brand-600'
                    }`}
                  >
                    {STEPS[step].optional ? 'Optional' : 'Required'}
                  </span>
                </p>
                <p className="m-0 text-xs text-slate-500">
                  {step === 0
                    ? 'Fields marked * are required'
                    : 'Skip now and add it later from your score page'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {STEPS[step].optional && (
                <button
                  type="button"
                  onClick={skipStep}
                  disabled={mutation.isPending}
                  className="rounded-ctl border border-dashed border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-500 transition hover:border-slate-400 hover:bg-white hover:text-slate-700 disabled:opacity-50"
                >
                  {step === STEPS.length - 1 ? 'Skip & finish' : 'Skip this step'}
                </button>
              )}

              {/* Save without leaving the step — useful when filling this over
                  more than one sitting. */}
              <button
                type="button"
                onClick={handleSave}
                disabled={mutation.isPending}
                className="rounded-ctl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                {mutation.isPending ? 'Saving...' : 'Save'}
              </button>

              {step < STEPS.length - 1 ? (
                <Button
                  type="button"
                  onClick={goNext}
                  disabled={mutation.isPending}
                  className="w-full shadow-lg sm:w-auto sm:min-w-[200px]"
                >
                  Continue
                </Button>
              ) : (
                // Not disabled on purpose: submitting jumps to whichever step is
                // blocking and explains it, which beats a dead button.
                <Button
                  type="submit"
                  disabled={mutation.isPending}
                  className="w-full shadow-lg sm:w-auto sm:min-w-[200px]"
                >
                  {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Finish setup'}
                </Button>
              )}
            </div>
          </div>
        </div>
      </form>

      {mutation.isPending && <Loader variant="overlay" label="Saving profile..." />}
    </EmployeeLayout>
  )
}

export default ProfileSetup

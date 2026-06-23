import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
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
import { employeeKeys, fetchCompanySuggestions, fetchRoleSuggestions } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'
import { normalizePhone } from '../../lib/api'
import { getProfile, setupProfile } from '../../lib/employeeProfile'
import { mediaUrl } from '../../lib/mediaUrl'
import { COUNTRY_CODES } from '../../utils/countryCodes'
import {
  clearInvitationSession,
  getInvitationEmail,
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

const EMPTY_EDUCATION = {
  class10: { board: '', school: '', passingYear: '', percentage: '' },
  class12: { board: '', school: '', stream: '', passingYear: '', percentage: '' },
  graduation: { degree: '', college: '', university: '', passingYear: '', percentage: '' },
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
        className={`w-full resize-y rounded-2xl border bg-white px-4 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100 disabled:cursor-not-allowed disabled:bg-slate-50 md:text-base ${error ? 'border-red-400 focus:border-red-400 focus:ring-red-50' : 'border-slate-200'}`}
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
  const [photoPreview, setPhotoPreview] = useState(null)
  const [photoError, setPhotoError] = useState('')
  const [education, setEducation] = useState(EMPTY_EDUCATION)
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
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
  }

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setLoading(true)
      try {
        const data = await getProfile()
        if (!cancelled) {
          applyProfileToForm(
            {
              ...data,
              email: data.email || getInvitationEmail() || '',
            },
            setters,
          )
        }
      } catch {
        if (!cancelled) {
          applyProfileToForm(
            {
              ...profile,
              phone: profile?.phone || user?.phone,
              email: profile?.email || user?.email || getInvitationEmail(),
            },
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
    if (!photo) {
      setPhotoPreview(null)
      return undefined
    }
    const url = URL.createObjectURL(photo)
    setPhotoPreview(url)
    return () => URL.revokeObjectURL(url)
  }, [photo])

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
      formData.append('education', JSON.stringify({
        class10: {
          board: education.class10.board.trim(),
          school: education.class10.school.trim(),
          passingYear: education.class10.passingYear.trim(),
          percentage: education.class10.percentage.trim(),
        },
        class12: {
          board: education.class12.board.trim(),
          school: education.class12.school.trim(),
          stream: education.class12.stream.trim(),
          passingYear: education.class12.passingYear.trim(),
          percentage: education.class12.percentage.trim(),
        },
        graduation: {
          degree: education.graduation.degree.trim(),
          college: education.graduation.college.trim(),
          university: education.graduation.university.trim(),
          passingYear: education.graduation.passingYear.trim(),
          percentage: education.graduation.percentage.trim(),
        },
      }))
      if (photo) formData.append('photo', photo)
      const invitationToken = getInvitationToken()
      if (invitationToken) formData.append('invitationToken', invitationToken)
      return setupProfile(formData)
    },
    onSuccess: (data) => {
      const autoJoined = data?.invitationResult?.autoJoined
      if (Array.isArray(autoJoined) && autoJoined.length > 0) {
        const entry = autoJoined[0]
        const companyName =
          typeof entry === 'string' ? entry : entry?.companyName || entry?.name || 'the company'
        updateProfileState({
          ...profile,
          profileSetupComplete: data.profileSetupComplete ?? true,
          photoUrl: data.photoUrl ?? profile?.photoUrl,
        })
        queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
        clearInvitationSession()
        toast(`You have been added to ${companyName} team!`, 'success')
        navigate('/employee/verification')
        return
      }

      updateProfileState({
        ...profile,
        profileSetupComplete: data.profileSetupComplete ?? true,
        photoUrl: data.photoUrl ?? profile?.photoUrl,
      })
      queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
      navigate(
        isEditing
          ? '/employee/professional-id'
          : data.nextRoute || '/employee/verification',
      )
    },
    onError: (err) => {
      const { fieldErrors: nextFieldErrors, general } = extractFieldErrors(err.details)
      setFieldErrors(nextFieldErrors)
      setGeneralErrors(general)
      setError(err.message || 'Failed to save profile')
    },
  })

  const isEducationValid =
    education.class10.board.trim().length >= 2 &&
    education.class10.school.trim().length >= 2 &&
    /^\d{4}$/.test(education.class10.passingYear.trim()) &&
    education.class12.board.trim().length >= 2 &&
    education.class12.school.trim().length >= 2 &&
    /^\d{4}$/.test(education.class12.passingYear.trim()) &&
    education.graduation.degree.trim().length >= 2 &&
    education.graduation.college.trim().length >= 2 &&
    /^\d{4}$/.test(education.graduation.passingYear.trim())

  const isValid =
    name.trim().length >= 2 &&
    phoneDigits.length >= 10 &&
    email.trim().length > 0 &&
    dateOfBirth &&
    gender &&
    role.trim().length >= 2 &&
    company.trim().length >= 1 &&
    totalExperience &&
    currentCity.trim().length >= 2 &&
    currentAddress.trim().length >= 5 &&
    (sameAsCurrentAddress || permanentAddress.trim().length >= 5) &&
    isEducationValid

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

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid || mutation.isPending || loading) return
    setError('')
    setFieldErrors({})
    setGeneralErrors([])
    mutation.mutate()
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
      <VerificationStepBar currentStep="profile" className="mb-6" />
      <EmployeePageHeader
        title={isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
        subtitle={isEditing ? 'Update your identity details' : 'Step 1 of 3 — This account is unique to you'}
      />

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

      <form className="flex w-full flex-col gap-6" onSubmit={handleSubmit} noValidate>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <FormSection title="Personal details" description="Basic identity information for your VeriWork account">
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

          <AutocompleteInput
            id="company"
            label="Current Company"
            required
            value={company}
            onChange={setCompany}
            fetchSuggestions={fetchCompanySuggestions}
            minChars={3}
            placeholder="e.g. Acme Technologies"
            leftIcon={<BuildingIcon className="h-[18px] w-[18px]" />}
            disabled={mutation.isPending}
            error={fieldError('company')}
            errorText={fieldErrorText('company')}
            hint="Type at least 3 characters for company suggestions"
            emptyHint="No match found — you can enter any company name"
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
              className="h-4 w-4 rounded border-slate-300 text-[#1a3a8f] focus:ring-[#1a3a8f]"
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
          <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
            <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 md:h-32 md:w-32">
              {displayPhoto ? (
                <img src={displayPhoto} alt="Profile preview" className="h-full w-full object-cover" />
              ) : (
                <UserIcon className="h-10 w-10 text-slate-300" />
              )}
            </div>
            <div className="flex flex-1 flex-col gap-2 text-center sm:text-left">
              <label
                htmlFor="photo"
                className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-[#1a3a8f]/30 bg-blue-50 px-4 py-2.5 text-sm font-semibold text-[#1a3a8f] transition hover:bg-blue-100 sm:w-fit"
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
        </div>

        <FormSection
          title="Education"
          description="10th, 12th and graduation details for verification and your professional profile"
          className="w-full"
        >
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

        <div className="sticky bottom-0 z-10 -mx-4 border-t border-slate-200 bg-slate-50/95 px-4 py-4 backdrop-blur md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="m-0 text-sm text-slate-500">
              All fields marked with <span className="text-red-500">*</span> are required
            </p>
            <Button type="submit" disabled={!isValid || mutation.isPending} className="w-full shadow-lg sm:w-auto sm:min-w-[200px]">
              {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Save & Continue'}
            </Button>
          </div>
        </div>
      </form>

      {mutation.isPending && <Loader variant="overlay" label="Saving profile..." />}
    </EmployeeLayout>
  )
}

export default ProfileSetup

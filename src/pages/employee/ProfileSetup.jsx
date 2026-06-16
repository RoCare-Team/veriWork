import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import PhoneInput from '../../components/employee/PhoneInput'
import VerificationStepBar from '../../components/employee/VerificationStepBar'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { BriefcaseIcon } from '../../components/common/Icons'
import { employeeKeys } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'
import { normalizePhone } from '../../lib/api'
import { getProfile, setupProfile } from '../../lib/employeeProfile'
import { mediaUrl } from '../../lib/mediaUrl'
import { COUNTRY_CODES } from '../../utils/countryCodes'

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
    const field = item.field || item.path?.[0] || item.param
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
}

function ProfileSetup() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
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
  }

  useEffect(() => {
    let cancelled = false

    async function loadProfile() {
      setLoading(true)
      try {
        const data = await getProfile()
        if (!cancelled) applyProfileToForm(data, setters)
      } catch {
        if (!cancelled) {
          applyProfileToForm(
            {
              ...profile,
              phone: profile?.phone || user?.phone,
              email: profile?.email || user?.email,
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
      if (photo) formData.append('photo', photo)
      return setupProfile(formData)
    },
    onSuccess: (data) => {
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
    (sameAsCurrentAddress || permanentAddress.trim().length >= 5)

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
  const displayPhoto = photoPreview || mediaUrl(photoUrl)

  if (loading) {
    return (
      <EmployeeLayout footer={<SecurityFooter variant="shield" text="Your profile is private & encrypted" />}>
        <Loader variant="fullPage" label="Loading profile..." />
      </EmployeeLayout>
    )
  }

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Your profile is private & encrypted" />}>
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

      <form className="flex max-w-xl flex-col gap-5" onSubmit={handleSubmit} noValidate>
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

        <Input
          id="role"
          label="Current Role"
          required
          value={role}
          onChange={(e) => setRole(e.target.value)}
          leftIcon={<BriefcaseIcon className="h-[18px] w-[18px]" />}
          disabled={mutation.isPending}
          error={fieldError('role')}
          errorText={fieldErrorText('role')}
        />

        <Input
          id="company"
          label="Current Company"
          required
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          leftIcon={<BriefcaseIcon className="h-[18px] w-[18px]" />}
          disabled={mutation.isPending}
          error={fieldError('company')}
          errorText={fieldErrorText('company')}
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

        <label className="-mt-2 flex cursor-pointer items-center gap-2.5 text-sm text-slate-700">
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

        <div className="flex flex-col gap-2">
          <label htmlFor="photo" className="text-sm font-semibold text-slate-800">
            Profile Photo <span className="font-normal text-slate-400">(optional, max 5MB)</span>
          </label>
          <input
            id="photo"
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            disabled={mutation.isPending}
            onChange={handlePhotoSelect}
            className="block w-full text-sm text-slate-600 file:mr-4 file:rounded-xl file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-[#1a3a8f] hover:file:bg-blue-100 disabled:opacity-60"
          />
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
          {displayPhoto && (
            <img
              src={displayPhoto}
              alt="Profile preview"
              className="mt-1 h-24 w-24 rounded-2xl border border-slate-200 object-cover"
            />
          )}
        </div>

        <Button type="submit" disabled={!isValid || mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Save & Continue'}
        </Button>
      </form>

      {mutation.isPending && <Loader variant="overlay" label="Saving profile..." />}
    </EmployeeLayout>
  )
}

export default ProfileSetup

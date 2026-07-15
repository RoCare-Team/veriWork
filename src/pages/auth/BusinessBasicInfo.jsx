import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import StepProgress from '../../components/common/StepProgress'
import SectionTitle from '../../components/common/SectionTitle'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { buildEnterpriseRegisterPayload, registerEnterprise } from '../../api/auth'
import { enterpriseKeys, fetchOnboarding, updateBasicInfo, updateRegistration } from '../../api/enterprise'
import { useAuth } from '../../context/AuthContext'
import {
  ONBOARDING_STEPS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
} from '../../utils/onboardingConstants'
import { COMPANY_TYPE_OPTIONS, getCompanyTypeConfig } from '../../utils/enterpriseCompanyTypes'
import { BriefcaseIcon, CardIcon } from '../../components/common/Icons'
import { isValidEmail } from '../../utils/validators'
import { useToast } from '../../context/ToastContext'
import { lookupIndianPincode } from '../../lib/pincodeApi'
import {
  GSTIN_HINT,
  formatGSTINInput,
  formatPincodeInput,
  formatRegistrationInput,
  getRegistrationHint,
  getRegistrationLabel,
  isValidBRN,
  isValidGSTIN,
  isValidIndianPincode,
} from '../../utils/enterpriseValidators'

const EMPTY_FORM = {
  companyType: '',
  brn: '',
  taxId: '',
  companyName: '',
  industry: '',
  companySize: '',
  workEmail: '',
  contactName: '',
  phone: '',
  pincode: '',
  locality: '',
  city: '',
  state: '',
  country: 'India',
}

function PincodeSpinner() {
  return (
    <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.37 0 0 5.37 0 12h4z" />
    </svg>
  )
}

function isValidPhone(phone) {
  const digits = phone.replace(/\D/g, '')
  return digits.length >= 10
}

function BusinessBasicInfo() {
  const navigate = useNavigate()
  const { isAuthenticated, isEnterprise, loginEnterprise } = useAuth()
  const [form, setForm] = useState(EMPTY_FORM)
  const [loginEmail, setLoginEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [touched, setTouched] = useState(false)
  const [pincodeLoading, setPincodeLoading] = useState(false)
  const { toast } = useToast()

  const { data: onboarding, isLoading } = useQuery({
    queryKey: enterpriseKeys.onboarding,
    queryFn: fetchOnboarding,
    enabled: isAuthenticated && isEnterprise,
  })

  useEffect(() => {
    if (!onboarding?.company && !onboarding?.onboarding?.basicInfo) return
    const c = onboarding.company || {}
    const b = onboarding.onboarding?.basicInfo || {}
    const r = onboarding.onboarding?.registration || {}
    const email = b.workEmail || c.workEmail || ''
    setForm({
      companyType: b.companyType || c.companyType || '',
      brn: r.brn || c.brn || '',
      taxId: r.taxId || c.taxId || '',
      companyName: b.companyName || b.companyLegalName || c.companyLegalName || c.name || '',
      industry: b.industry || c.industry || '',
      companySize: b.companySize || c.companySize || '',
      workEmail: email,
      contactName: b.contactName || c.contactName || '',
      phone: b.phone || c.phone || '',
      pincode: b.pincode || c.pincode || '',
      locality: b.locality || c.locality || '',
      city: b.city || c.city || '',
      state: b.state || c.state || '',
      country: b.country || c.country || 'India',
    })
    setLoginEmail(email)
  }, [onboarding])

  useEffect(() => {
    const pin = form.pincode.replace(/\D/g, '')
    if (pin.length !== 6) return undefined

    const timer = window.setTimeout(async () => {
      setPincodeLoading(true)
      try {
        const result = await lookupIndianPincode(pin)
        if (result) {
          setForm((prev) => ({
            ...prev,
            city: result.city,
            locality: result.locality,
            state: result.state,
            country: result.country,
          }))
          toast(`${result.locality}, ${result.city} — address filled automatically`, 'success', 3000)
        } else {
          toast('Pincode not found. Please enter city and locality manually.', 'error')
        }
      } catch {
        toast('Could not look up pincode. Enter address manually.', 'error')
      } finally {
        setPincodeLoading(false)
      }
    }, 450)

    return () => window.clearTimeout(timer)
  }, [form.pincode, toast])

  const update = (field) => (e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleCompanyTypeChange = (e) => {
    const companyType = e.target.value
    setForm((prev) => ({ ...prev, companyType, brn: '', taxId: '' }))
  }

  const handleBrnChange = (e) => {
    setForm((prev) => ({
      ...prev,
      brn: formatRegistrationInput(e.target.value, prev.companyType),
    }))
  }

  const handleTaxIdChange = (e) => {
    setForm((prev) => ({ ...prev, taxId: formatGSTINInput(e.target.value) }))
  }

  const handlePincodeChange = (e) => {
    setForm((prev) => ({ ...prev, pincode: formatPincodeInput(e.target.value) }))
  }

  const needsAccount = !isAuthenticated || !isEnterprise

  const passwordsMatch = password === confirmPassword
  const accountValid =
    !needsAccount ||
    (isValidEmail(loginEmail) && password.length >= 8 && passwordsMatch)

  const typeConfig = getCompanyTypeConfig(form.companyType)
  const brnValid = form.companyType && isValidBRN(form.brn, form.companyType)
  const gstValid = form.companyType && (
    typeConfig.gstRequired
      ? form.taxId.trim() && isValidGSTIN(form.taxId)
      : !form.taxId.trim() || isValidGSTIN(form.taxId)
  )

  const isValid =
    accountValid &&
    form.companyType &&
    brnValid &&
    gstValid &&
    form.companyName.trim() &&
    form.industry &&
    form.companySize &&
    isValidEmail(form.workEmail) &&
    form.contactName.trim() &&
    isValidPhone(form.phone) &&
    isValidIndianPincode(form.pincode) &&
    form.locality.trim() &&
    form.city.trim() &&
    form.country.trim()

  const saveMutation = useMutation({
    mutationFn: async () => {
      const registrationPayload = {
        brn: form.brn.trim().toUpperCase(),
        ...(form.taxId.trim() ? { taxId: form.taxId.trim().toUpperCase() } : {}),
      }

      if (needsAccount) {
        const data = await registerEnterprise(
          buildEnterpriseRegisterPayload({
            email: loginEmail,
            password,
            confirmPassword,
            companyLegalName: form.companyName,
            companyType: form.companyType,
            industry: form.industry,
            companySize: form.companySize,
            workEmail: form.workEmail,
            contactName: form.contactName,
            phone: form.phone,
            country: form.country,
            city: form.city,
            state: form.state,
            pincode: form.pincode,
            locality: form.locality,
            brn: form.brn,
            taxId: form.taxId,
          }),
        )
        if (data?.accessToken) loginEnterprise(data)
        await updateRegistration(registrationPayload)
        return data
      }

      await updateBasicInfo({
        companyName: form.companyName.trim(),
        companyType: form.companyType,
        industry: form.industry,
        companySize: form.companySize,
        workEmail: form.workEmail.trim(),
        contactName: form.contactName.trim(),
        phone: form.phone.trim(),
        pincode: form.pincode,
        locality: form.locality.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
      })
      await updateRegistration(registrationPayload)
    },
    onSuccess: (data) => {
      if (data?.accessToken) {
        loginEnterprise(data)
        toast('Account created successfully', 'success')
        navigate('/enterprise/verify')
        return
      }
      toast('Company details saved successfully', 'success')
      navigate('/enterprise/verify')
    },
    onError: (err) => {
      const detail = err.details?.[0]?.message || err.details?.[0]
      toast(detail || err.message || 'Registration failed', 'error')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) {
      toast('Please fill all required fields correctly', 'error')
      return
    }
    saveMutation.mutate()
  }

  const syncWorkEmail = () => {
    if (!form.workEmail && loginEmail) {
      setForm((prev) => ({ ...prev, workEmail: loginEmail }))
    }
  }

  if (isLoading && isAuthenticated) {
    return <Loader variant="fullPage" label="Loading onboarding..." />
  }

  return (
    <OnboardingLayout
      step={1}
      totalSteps={3}
      steps={ONBOARDING_STEPS}
      title="Business Basic Info"
      subtitle="Tell us about your company to set up your employer account."
      backTo="/enterprise/login"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" type="button" fullWidth={false} className="sm:min-w-[120px]" onClick={() => navigate('/enterprise/login')}>
            Back
          </Button>
          <Button type="submit" form="basic-info-form" fullWidth={false} className="sm:min-w-[160px]" disabled={saveMutation.isPending}>
            Continue
          </Button>
        </div>
      }
    >
      <form id="basic-info-form" className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
        <div className="lg:hidden">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={1} />
        </div>

        {needsAccount && (
          <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
            <SectionTitle>Account Credentials</SectionTitle>
            <p className="mt-2 text-sm text-slate-500">Create your admin login for the PagerLook employer portal.</p>
            <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
              <Input
                id="login-email"
                label="Admin Email"
                type="email"
                placeholder="admin@company.com"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                onBlur={syncWorkEmail}
                required
                error={touched && !isValidEmail(loginEmail)}
                autoComplete="email"
              />
              <Input
                id="password"
                label="Password"
                type="password"
                placeholder="Min. 8 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                error={touched && password.length < 8}
                autoComplete="new-password"
              />
              <Input
                id="confirm-password"
                label="Confirm Password"
                type="password"
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                error={touched && (!confirmPassword || !passwordsMatch)}
                autoComplete="new-password"
                className="md:col-span-2 md:max-w-[calc(50%-0.625rem)]"
              />
            </div>
            {touched && needsAccount && !passwordsMatch && confirmPassword && (
              <p className="mt-2 text-sm text-red-600">Passwords do not match.</p>
            )}
          </section>
        )}

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <SectionTitle>Company Details</SectionTitle>
          <p className="mt-2 text-sm text-slate-500">
            Start by selecting your business type — registration fields will appear automatically.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Select
              id="company-type"
              label="Company Type"
              placeholder="Select business entity type"
              options={COMPANY_TYPE_OPTIONS}
              value={form.companyType}
              onChange={handleCompanyTypeChange}
              required
              error={touched && !form.companyType}
              className="md:col-span-2"
            />

            {form.companyType && (
              <>
                {/* <div className="md:col-span-2">
                  <p className="m-0 text-sm font-semibold text-slate-800">Registration Details</p>
                  <p className="mt-1 text-sm text-slate-500">
                    Official government registration numbers for your {typeConfig.label}.
                  </p>
                </div> */}
                <Input
                  id="brn"
                  label={getRegistrationLabel(form.companyType)}
                  placeholder={typeConfig.registration.placeholder}
                  value={form.brn}
                  onChange={handleBrnChange}
                  leftIcon={<BriefcaseIcon className="h-[18px] w-[18px] text-slate-400" />}
                  required
                  hint={getRegistrationHint(form.companyType)}
                  error={touched && !brnValid}
                  errorText={
                    touched && form.brn.trim() && !brnValid
                      ? `Invalid ${getRegistrationLabel(form.companyType)} format`
                      : touched && !form.brn.trim()
                        ? 'Registration number is required'
                        : ''
                  }
                />
                <Input
                  id="tax-id"
                  label={typeConfig.gstRequired ? 'GSTIN (Tax Identification)' : 'GSTIN (Optional)'}
                  placeholder="e.g. 27AABCU9603R1ZM"
                  value={form.taxId}
                  onChange={handleTaxIdChange}
                  leftIcon={<CardIcon className="h-[18px] w-[18px] text-slate-400" />}
                  required={typeConfig.gstRequired}
                  hint={typeConfig.gstRequired ? GSTIN_HINT : 'Leave blank if not registered for GST'}
                  error={touched && typeConfig.gstRequired && !gstValid}
                  errorText={
                    touched && form.taxId.trim() && !isValidGSTIN(form.taxId)
                      ? 'Invalid GSTIN — must be 15 characters'
                      : touched && typeConfig.gstRequired && !form.taxId.trim()
                        ? 'GSTIN is required'
                        : ''
                  }
                  maxLength={15}
                />
                {form.taxId.length === 15 && isValidGSTIN(form.taxId) && (
                  <p className="m-0 text-xs font-medium text-green-600 md:col-span-2">✓ Valid GSTIN format</p>
                )}
                {form.brn.trim() && brnValid && (
                  <p className="m-0 text-xs font-medium text-green-600 md:col-span-2">✓ Valid registration number format</p>
                )}
              </>
            )}

            <Input
              id="company-name"
              label="Company Legal Name"
              placeholder="e.g. Acme Technologies Pvt. Ltd."
              value={form.companyName}
              onChange={update('companyName')}
              required
              error={touched && !form.companyName.trim()}
            />
            <Select
              id="industry"
              label="Industry"
              placeholder="Select industry"
              options={INDUSTRY_OPTIONS}
              value={form.industry}
              onChange={update('industry')}
              required
              error={touched && !form.industry}
            />
            <Select
              id="company-size"
              label="Company Size"
              placeholder="Select company size"
              options={COMPANY_SIZE_OPTIONS}
              value={form.companySize}
              onChange={update('companySize')}
              required
              error={touched && !form.companySize}
            />
            <Input
              id="work-email"
              label="Official Work Email"
              type="email"
              placeholder="hr@company.com"
              value={form.workEmail}
              onChange={update('workEmail')}
              required
              error={touched && !isValidEmail(form.workEmail)}
              autoComplete="organization"
            />
          </div>
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <SectionTitle>Contact & Address</SectionTitle>
          <p className="mt-2 text-sm text-slate-500">
            Enter your 6-digit pincode — city and locality will fill automatically.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              id="contact-name"
              label="Authorized Contact Person"
              placeholder="Full name"
              value={form.contactName}
              onChange={update('contactName')}
              required
              error={touched && !form.contactName.trim()}
            />
            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={update('phone')}
              required
              error={touched && !isValidPhone(form.phone)}
            />
            <Input
              id="pincode"
              label="Pincode"
              placeholder="e.g. 400001"
              value={form.pincode}
              onChange={handlePincodeChange}
              inputMode="numeric"
              maxLength={6}
              required
              hint="6-digit Indian pincode"
              rightSlot={pincodeLoading ? <PincodeSpinner /> : null}
              error={touched && !isValidIndianPincode(form.pincode)}
              errorText={touched && !isValidIndianPincode(form.pincode) ? 'Enter a valid 6-digit pincode' : ''}
            />
            <Input
              id="locality"
              label="Locality / Area"
              placeholder="Auto-filled from pincode"
              value={form.locality}
              onChange={update('locality')}
              required
              error={touched && !form.locality.trim()}
            />
            <Input
              id="city"
              label="City / District"
              placeholder="Auto-filled from pincode"
              value={form.city}
              onChange={update('city')}
              required
              error={touched && !form.city.trim()}
            />
            <Input
              id="state"
              label="State"
              placeholder="Auto-filled from pincode"
              value={form.state}
              onChange={update('state')}
            />
            <Input
              id="country"
              label="Country"
              placeholder="e.g. India"
              value={form.country}
              onChange={update('country')}
              required
              error={touched && !form.country.trim()}
            />
          </div>
        </section>

        <p className="m-0 pb-2 text-xs text-slate-400">
          Fields marked with <span className="text-red-500">*</span> are required.
        </p>

        <p className="m-0 pb-2 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/enterprise/login" className="font-semibold text-[#005fd6] hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      {saveMutation.isPending && <Loader variant="overlay" label="Saving..." />}
    </OnboardingLayout>
  )
}

export default BusinessBasicInfo

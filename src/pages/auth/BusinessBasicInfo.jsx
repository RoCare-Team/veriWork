import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import StepProgress from '../../components/common/StepProgress'
import SectionTitle from '../../components/common/SectionTitle'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import { getOnboardingData, saveBasicInfo } from '../../store/onboardingStore'
import {
  ONBOARDING_STEPS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
} from '../../utils/onboardingConstants'
import { isValidEmail } from '../../utils/validators'

function BusinessBasicInfo() {
  const navigate = useNavigate()
  const saved = getOnboardingData().basicInfo

  const [form, setForm] = useState(saved)
  const [touched, setTouched] = useState(false)

  const update = (field) => (e) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const isValid =
    form.companyName.trim() &&
    form.industry &&
    form.companySize &&
    isValidEmail(form.workEmail) &&
    form.contactName.trim() &&
    form.phone.trim() &&
    form.country.trim()

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    saveBasicInfo(form)
    navigate('/enterprise/verify')
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
          <Button
            variant="ghost"
            type="button"
            fullWidth={false}
            className="sm:min-w-[120px]"
            onClick={() => navigate('/enterprise/login')}
          >
            Back
          </Button>
          <Button
            type="submit"
            form="basic-info-form"
            fullWidth={false}
            className="sm:min-w-[160px]"
          >
            Continue
          </Button>
        </div>
      }
    >
      <form
        id="basic-info-form"
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="lg:hidden">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={1} />
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>Company Details</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              id="company-name"
              label="Company Legal Name"
              placeholder="e.g. Acme Technologies Pvt. Ltd."
              value={form.companyName}
              onChange={update('companyName')}
              error={touched && !form.companyName.trim()}
            />
            <Select
              id="industry"
              label="Industry"
              placeholder="Select industry"
              options={INDUSTRY_OPTIONS}
              value={form.industry}
              onChange={update('industry')}
            />
            <Select
              id="company-size"
              label="Company Size"
              placeholder="Select company size"
              options={COMPANY_SIZE_OPTIONS}
              value={form.companySize}
              onChange={update('companySize')}
            />
            <Input
              id="work-email"
              label="Official Work Email"
              type="email"
              placeholder="hr@company.com"
              value={form.workEmail}
              onChange={update('workEmail')}
              error={touched && !isValidEmail(form.workEmail)}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>Contact Information</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              id="contact-name"
              label="Authorized Contact Person"
              placeholder="Full name"
              value={form.contactName}
              onChange={update('contactName')}
              error={touched && !form.contactName.trim()}
            />
            <Input
              id="phone"
              label="Phone Number"
              type="tel"
              placeholder="+91 98765 43210"
              value={form.phone}
              onChange={update('phone')}
              error={touched && !form.phone.trim()}
            />
            <Input
              id="country"
              label="Country"
              placeholder="e.g. India"
              value={form.country}
              onChange={update('country')}
              error={touched && !form.country.trim()}
            />
            <Input
              id="city"
              label="City"
              placeholder="e.g. Mumbai"
              value={form.city}
              onChange={update('city')}
            />
          </div>
        </section>

        {touched && !isValid && (
          <p className="text-sm text-red-600" role="alert">
            Please fill all required fields with valid information.
          </p>
        )}

        <p className="m-0 pb-2 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/enterprise/login" className="font-semibold text-[#1a3a8f] hover:underline">
            Sign in
          </Link>
        </p>
      </form>
    </OnboardingLayout>
  )
}

export default BusinessBasicInfo

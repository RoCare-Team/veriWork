import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import StepProgress from '../../components/common/StepProgress'
import SectionTitle from '../../components/common/SectionTitle'
import ReviewRow from '../../components/common/ReviewRow'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { InfoIcon } from '../../components/common/Icons'
import {
  getOnboardingData,
  setCertified,
  clearOnboarding,
  saveCompanyProfile,
} from '../../store/onboardingStore'
import {
  ONBOARDING_STEPS,
  COMPANY_DOCUMENTS,
} from '../../utils/onboardingConstants'

function ReviewSubmission() {
  const navigate = useNavigate()
  const data = getOnboardingData()
  const { basicInfo, registration, documents } = data

  const [certified, setCertifiedState] = useState(data.certified)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const uploadedCount = COMPANY_DOCUMENTS.filter((d) => documents[d.id]).length
  const requiredCount = COMPANY_DOCUMENTS.filter((d) => d.required).length
  const requiredUploaded = COMPANY_DOCUMENTS.filter(
    (d) => d.required && documents[d.id],
  ).length

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!certified) return

    setIsSubmitting(true)
    setCertified(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1500))
    if (basicInfo.companyName?.trim()) {
      saveCompanyProfile({ companyName: basicInfo.companyName.trim() })
    }
    clearOnboarding()
    setIsSubmitting(false)
    navigate('/enterprise/dashboard?verified=true')
  }

  return (
    <OnboardingLayout
      step={3}
      totalSteps={3}
      steps={ONBOARDING_STEPS}
      title="Review Final Check"
      subtitle="Review your details before submitting for compliance verification."
      backTo="/enterprise/verify"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            type="button"
            fullWidth={false}
            className="sm:min-w-[120px]"
            onClick={() => navigate('/enterprise/verify')}
            disabled={isSubmitting}
          >
            Back
          </Button>
          <Button
            type="submit"
            form="review-form"
            fullWidth={false}
            className="sm:min-w-[200px]"
            disabled={!certified || isSubmitting}
          >
            Submit for Review
          </Button>
        </div>
      }
    >
      <form
        id="review-form"
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="lg:hidden">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={3} />
        </div>

        {/* Status banner */}
        <div className="flex items-center gap-4 rounded-2xl border border-green-100 bg-green-50/60 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
            {requiredUploaded}/{requiredCount}
          </div>
          <div>
            <p className="m-0 text-sm font-bold text-green-800">
              {requiredUploaded === requiredCount
                ? 'All required documents uploaded'
                : 'Some required documents are missing'}
            </p>
            <p className="mt-1 text-xs text-green-700/80">
              {uploadedCount} of {COMPANY_DOCUMENTS.length} documents uploaded total
            </p>
          </div>
        </div>

        {/* Company info summary */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Company Information</SectionTitle>
            <Link
              to="/enterprise/register"
              className="text-xs font-semibold text-[#1a3a8f] hover:underline"
            >
              Edit
            </Link>
          </div>
          <ReviewRow label="Company Name" value={basicInfo.companyName} />
          <ReviewRow label="Industry" value={basicInfo.industry} />
          <ReviewRow label="Company Size" value={basicInfo.companySize} />
          <ReviewRow label="Work Email" value={basicInfo.workEmail} />
          <ReviewRow label="Contact Person" value={basicInfo.contactName} />
          <ReviewRow label="Phone" value={basicInfo.phone} />
          <ReviewRow
            label="Location"
            value={
              basicInfo.city && basicInfo.country
                ? `${basicInfo.city}, ${basicInfo.country}`
                : basicInfo.country
            }
          />
        </section>

        {/* Registration summary */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Registration Details</SectionTitle>
            <Link
              to="/enterprise/verify"
              className="text-xs font-semibold text-[#1a3a8f] hover:underline"
            >
              Edit
            </Link>
          </div>
          <ReviewRow label="Business Registration No. (BRN)" value={registration.brn} />
          <ReviewRow label="Tax ID / GST" value={registration.taxId} />
        </section>

        {/* Documents summary */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Uploaded Documents</SectionTitle>
            <Link
              to="/enterprise/verify"
              className="text-xs font-semibold text-[#1a3a8f] hover:underline"
            >
              Edit
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {COMPANY_DOCUMENTS.map((doc) => {
              const uploaded = documents[doc.id]
              return (
                <div
                  key={doc.id}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3"
                >
                  <div>
                    <p className="m-0 text-sm font-semibold text-slate-800">
                      {doc.title}
                    </p>
                    {uploaded && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {uploaded}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      uploaded
                        ? 'bg-green-50 text-green-700'
                        : doc.required
                          ? 'bg-red-50 text-red-600'
                          : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {uploaded ? 'Uploaded' : doc.required ? 'Missing' : 'Skipped'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="shrink-0 text-[#1a3a8f]">
            <InfoIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="m-0 text-sm font-bold text-[#1a3a8f]">
              What happens next?
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              After submission, our compliance team will review your application
              within 24–48 business hours. You&apos;ll receive an email at{' '}
              <strong>{basicInfo.workEmail || 'your work email'}</strong> once
              your account is verified and activated.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-slate-300">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => setCertifiedState(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#1a3a8f] focus:ring-[#1a3a8f]"
          />
          <span className="text-sm leading-relaxed text-slate-700">
            I certify that all information and documents provided are authentic
            and accurate. I understand that falsifying records will lead to
            immediate account suspension and legal action.
          </span>
        </label>

        <p className="m-0 pb-2 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/enterprise/login" className="font-semibold text-[#1a3a8f] hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      {isSubmitting && (
        <Loader variant="overlay" label="Submitting for review..." />
      )}
    </OnboardingLayout>
  )
}

export default ReviewSubmission

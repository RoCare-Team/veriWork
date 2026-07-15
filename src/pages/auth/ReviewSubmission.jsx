import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import StepProgress from '../../components/common/StepProgress'
import SectionTitle from '../../components/common/SectionTitle'
import ReviewRow from '../../components/common/ReviewRow'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { InfoIcon } from '../../components/common/Icons'
import { enterpriseKeys, fetchOnboarding, submitOnboarding } from '../../api/enterprise'
import { useAuth } from '../../context/AuthContext'
import { ONBOARDING_STEPS } from '../../utils/onboardingConstants'
import {
  getCompanyTypeLabel,
  getDocumentsForCompanyType,
  getCompanyTypeConfig,
  resolveCompanyType,
} from '../../utils/enterpriseCompanyTypes'
import { getRegistrationLabel } from '../../utils/enterpriseValidators'
import { useToast } from '../../context/ToastContext'

function ReviewSubmission() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { company: storedCompany, updateCompanyState } = useAuth()
  const [certified, setCertifiedState] = useState(false)
  const { toast } = useToast()

  const { data: onboarding, isLoading } = useQuery({
    queryKey: enterpriseKeys.onboarding,
    queryFn: fetchOnboarding,
  })

  const company = onboarding?.company || {}
  const basicInfo = onboarding?.onboarding?.basicInfo || {
    companyName: company.name,
    industry: company.industry,
    companySize: company.companySize,
    workEmail: company.workEmail,
    contactName: company.contactName,
    phone: company.phone,
    country: company.country,
    city: company.city,
  }
  const registration = onboarding?.onboarding?.registration || {
    brn: company.brn,
    taxId: company.taxId,
  }
  const documents = onboarding?.onboarding?.documents || {}
  const companyType = resolveCompanyType(company, basicInfo)
  const companyDocuments = getDocumentsForCompanyType(companyType)
  const typeConfig = getCompanyTypeConfig(companyType)

  const hasDocument = (docId) => Boolean(documents[docId])
  const uploadedCount = companyDocuments.filter((d) => hasDocument(d.id)).length
  const requiredCount = companyDocuments.filter((d) => d.required).length
  const requiredUploaded = companyDocuments.filter((d) => d.required && hasDocument(d.id)).length

  const submitMutation = useMutation({
    mutationFn: () => submitOnboarding(true),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.onboarding })
      updateCompanyState({
        ...storedCompany,
        ...company,
        onboardingComplete: data.onboardingComplete ?? true,
        isVerified: false,
        approvalStatus: data.approvalStatus || 'submitted',
      })
      toast('Application submitted — awaiting admin approval', 'success')
      navigate('/enterprise/pending-approval')
    },
    onError: (err) => toast(err.message || 'Submission failed', 'error'),
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!certified) {
      toast('Please certify that all information is accurate', 'error')
      return
    }
    submitMutation.mutate()
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading review..." />

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
          <Button variant="ghost" type="button" fullWidth={false} className="sm:min-w-[120px]" onClick={() => navigate('/enterprise/verify')} disabled={submitMutation.isPending}>
            Back
          </Button>
          <Button type="submit" form="review-form" fullWidth={false} className="sm:min-w-[200px]" disabled={!certified || submitMutation.isPending}>
            Submit for Review
          </Button>
        </div>
      }
    >
      <form id="review-form" className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
        <div className="lg:hidden">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={3} />
        </div>

        <div className="flex items-center gap-4 rounded-3xl border border-green-100 bg-green-50/60 p-5">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-lg font-bold text-green-700">
            {requiredUploaded}/{requiredCount}
          </div>
          <div>
            <p className="m-0 text-sm font-bold text-green-800">
              {requiredUploaded === requiredCount ? 'All required documents uploaded' : 'Some required documents are missing'}
            </p>
            <p className="mt-1 text-xs text-green-700/80">
              {uploadedCount} of {companyDocuments.length} documents uploaded total
            </p>
          </div>
        </div>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Company Information</SectionTitle>
            <Link to="/enterprise/register" className="text-xs font-semibold text-[#005fd6] hover:underline">
              Edit
            </Link>
          </div>
          <ReviewRow label="Company Name" value={basicInfo.companyName} />
          <ReviewRow label="Company Type" value={getCompanyTypeLabel(companyType)} />
          <ReviewRow label={getRegistrationLabel(companyType)} value={registration.brn} />
          <ReviewRow
            label={typeConfig.gstRequired ? 'GSTIN' : 'GSTIN (if applicable)'}
            value={registration.taxId || (typeConfig.gstRequired ? '—' : 'Not provided')}
          />
          <ReviewRow label="Industry" value={basicInfo.industry} />
          <ReviewRow label="Company Size" value={basicInfo.companySize} />
          <ReviewRow label="Work Email" value={basicInfo.workEmail} />
          <ReviewRow label="Contact Person" value={basicInfo.contactName} />
          <ReviewRow label="Phone" value={basicInfo.phone} />
          <ReviewRow
            label="Location"
            value={basicInfo.city && basicInfo.country ? `${basicInfo.city}, ${basicInfo.country}` : basicInfo.country}
          />
        </section>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <div className="mb-4 flex items-center justify-between">
            <SectionTitle>Uploaded Documents</SectionTitle>
            <Link to="/enterprise/verify" className="text-xs font-semibold text-[#005fd6] hover:underline">
              Edit
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            {companyDocuments.map((doc) => {
              const uploaded = documents[doc.id]
              return (
                <div key={doc.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/50 px-4 py-3">
                  <div>
                    <p className="m-0 text-sm font-semibold text-slate-800">{doc.title}</p>
                    {uploaded && (
                      <p className="mt-0.5 truncate text-xs text-slate-500">
                        {typeof uploaded === 'string' ? uploaded.split('/').pop() : uploaded}
                      </p>
                    )}
                  </div>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                      uploaded ? 'bg-green-50 text-green-700' : doc.required ? 'bg-red-50 text-red-600' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    {uploaded ? 'Uploaded' : doc.required ? 'Missing' : 'Skipped'}
                  </span>
                </div>
              )
            })}
          </div>
        </section>

        <div className="flex gap-3 rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="shrink-0 text-[#005fd6]">
            <InfoIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="m-0 text-sm font-bold text-[#005fd6]">What happens next?</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              After submission, our compliance team will review your application within 24–48 business hours. You&apos;ll
              receive an email at <strong>{basicInfo.workEmail || 'your work email'}</strong> once your account is verified
              and activated.
            </p>
          </div>
        </div>

        <label className="flex cursor-pointer items-start gap-3.5 rounded-3xl border border-slate-200 bg-slate-50/50 p-5 transition hover:border-slate-300">
          <input
            type="checkbox"
            checked={certified}
            onChange={(e) => setCertifiedState(e.target.checked)}
            className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#005fd6] focus:ring-[#005fd6]"
          />
          <span className="text-sm leading-relaxed text-slate-700">
            I certify that all information and documents provided are authentic and accurate. I understand that falsifying
            records will lead to immediate account suspension and legal action.
          </span>
        </label>

        <p className="m-0 pb-2 text-center text-xs text-slate-400">
          Already registered?{' '}
          <Link to="/enterprise/login" className="font-semibold text-[#005fd6] hover:underline">
            Sign in
          </Link>
        </p>
      </form>

      {submitMutation.isPending && <Loader variant="overlay" label="Submitting for review..." />}
    </OnboardingLayout>
  )
}

export default ReviewSubmission

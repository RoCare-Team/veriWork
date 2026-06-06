import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import StepProgress from '../../components/common/StepProgress'
import SectionTitle from '../../components/common/SectionTitle'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import DocumentUploadCard from '../../components/common/DocumentUploadCard'
import {
  BriefcaseIcon,
  BuildingIcon,
  CardIcon,
  DocumentIcon,
  InfoIcon,
} from '../../components/common/Icons'
import {
  getOnboardingData,
  saveRegistration,
  saveDocument,
  removeDocument,
} from '../../store/onboardingStore'
import {
  ONBOARDING_STEPS,
  COMPANY_DOCUMENTS,
} from '../../utils/onboardingConstants'

function CompanyVerification() {
  const navigate = useNavigate()
  const saved = getOnboardingData()

  const [brn, setBrn] = useState(saved.registration.brn)
  const [taxId, setTaxId] = useState(saved.registration.taxId)
  const [documents, setDocuments] = useState(saved.documents)
  const [touched, setTouched] = useState(false)

  const requiredDocs = COMPANY_DOCUMENTS.filter((d) => d.required)
  const allRequiredUploaded = requiredDocs.every((d) => documents[d.id])
  const isValid = brn.trim() && taxId.trim() && allRequiredUploaded

  const handleUpload = (docId, title) => {
    const mockName = `${title.replace(/\s+/g, '_').toLowerCase()}.pdf`
    saveDocument(docId, mockName)
    setDocuments((prev) => ({ ...prev, [docId]: mockName }))
  }

  const handleRemove = (docId) => {
    removeDocument(docId)
    setDocuments((prev) => {
      const next = { ...prev }
      delete next[docId]
      return next
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!isValid) return
    saveRegistration({ brn, taxId })
    navigate('/enterprise/review')
  }

  const docIcon = (id) => {
    if (id === 'addressProof') {
      return <BuildingIcon className="h-5 w-5 text-[#1a3a8f]" />
    }
    if (id === 'taxCertificate') {
      return <CardIcon className="h-5 w-5 text-[#1a3a8f]" />
    }
    return <DocumentIcon className="h-5 w-5 text-[#1a3a8f]" />
  }

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      steps={ONBOARDING_STEPS}
      title="Company Verification"
      subtitle="Complete your business profile to start verifying employees."
      backTo="/enterprise/register"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button
            variant="ghost"
            type="button"
            fullWidth={false}
            className="sm:min-w-[120px]"
            onClick={() => navigate('/enterprise/register')}
          >
            Back
          </Button>
          <Button
            type="submit"
            form="verification-form"
            fullWidth={false}
            className="sm:min-w-[160px]"
          >
            Continue
          </Button>
        </div>
      }
    >
      <form
        id="verification-form"
        className="flex flex-col gap-8"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="lg:hidden">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={2} />
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>Registration Details</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-5 md:grid-cols-2">
            <Input
              id="brn"
              label="Business Registration Number (BRN)"
              placeholder="e.g. 12345678-000"
              value={brn}
              onChange={(e) => setBrn(e.target.value)}
              leftIcon={<BriefcaseIcon className="h-[18px] w-[18px] text-slate-400" />}
              error={touched && !brn.trim()}
            />
            <Input
              id="tax-id"
              label="Tax Identification Number / GST"
              placeholder="Enter your tax ID"
              value={taxId}
              onChange={(e) => setTaxId(e.target.value)}
              leftIcon={<CardIcon className="h-[18px] w-[18px] text-slate-400" />}
              error={touched && !taxId.trim()}
            />
          </div>
        </section>

        <section>
          <SectionTitle>Required Documents</SectionTitle>
          <p className="mt-2 text-sm text-slate-500">
            Upload all mandatory documents. Optional documents speed up verification.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            {COMPANY_DOCUMENTS.map((doc) => (
              <DocumentUploadCard
                key={doc.id}
                icon={docIcon(doc.id)}
                title={doc.title}
                description={doc.description}
                required={doc.required}
                fileName={documents[doc.id]}
                onUpload={() => handleUpload(doc.id, doc.title)}
                onRemove={() => handleRemove(doc.id)}
              />
            ))}
          </div>
        </section>

        <div className="flex gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="shrink-0 text-[#1a3a8f]">
            <InfoIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="m-0 text-sm font-bold text-[#1a3a8f]">
              Verification Timeline
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Our compliance team typically reviews documents within 24–48
              business hours. You will receive an email once verified.
            </p>
          </div>
        </div>

        {touched && !isValid && (
          <p className="text-sm text-red-600" role="alert">
            Please fill registration details and upload all required documents.
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

export default CompanyVerification

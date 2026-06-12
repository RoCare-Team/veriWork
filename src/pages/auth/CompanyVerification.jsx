import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import OnboardingLayout from '../../layouts/OnboardingLayout'
import StepProgress from '../../components/common/StepProgress'
import SectionTitle from '../../components/common/SectionTitle'
import Button from '../../components/common/Button'
import DocumentUploadCard from '../../components/common/DocumentUploadCard'
import Loader from '../../components/common/Loader'
import {
  BuildingIcon,
  CardIcon,
  DocumentIcon,
  InfoIcon,
} from '../../components/common/Icons'
import { enterpriseKeys, fetchOnboarding } from '../../api/enterprise'
import { ONBOARDING_STEPS } from '../../utils/onboardingConstants'
import {
  getCompanyTypeLabel,
  getDocumentsForCompanyType,
  resolveCompanyType,
} from '../../utils/enterpriseCompanyTypes'
import {
  getEnterpriseDocType,
  uploadEnterpriseDocument,
  validateDocumentFile,
} from '../../lib/uploadDocument'
import { useToast } from '../../context/ToastContext'

function CompanyVerification() {
  const navigate = useNavigate()
  const [documents, setDocuments] = useState({})
  const [touched, setTouched] = useState(false)
  const { toast } = useToast()
  const [uploadingId, setUploadingId] = useState(null)
  const [uploadErrors, setUploadErrors] = useState({})

  const { data: onboarding, isLoading } = useQuery({
    queryKey: enterpriseKeys.onboarding,
    queryFn: fetchOnboarding,
  })

  useEffect(() => {
    if (!onboarding) return
    setDocuments(onboarding.onboarding?.documents || {})
  }, [onboarding])

  const companyType = resolveCompanyType(onboarding?.company, onboarding?.onboarding?.basicInfo)
  const companyDocuments = getDocumentsForCompanyType(companyType)

  const getDocValue = (docId) => {
    const docType = getEnterpriseDocType(docId)
    return documents[docId] || documents[docType] || null
  }

  const requiredDocs = companyDocuments.filter((d) => d.required)
  const hasDocument = (docId) => Boolean(getDocValue(docId))
  const allRequiredUploaded = requiredDocs.every((d) => hasDocument(d.id))

  const handleUpload = async (docId, file) => {
    if (!file) return

    const clientError = validateDocumentFile(file)
    if (clientError) {
      setUploadErrors((prev) => ({ ...prev, [docId]: clientError }))
      return
    }

    const docType = getEnterpriseDocType(docId)
    setUploadingId(docId)
    setUploadErrors((prev) => ({ ...prev, [docId]: null }))

    try {
      const data = await uploadEnterpriseDocument(docType, file)
      setDocuments((prev) => ({
        ...(data.documents || prev),
        [docId]: data.url,
        [docType]: data.url,
      }))
      toast('Document uploaded successfully', 'success')
    } catch (err) {
      const message = err.message || 'Upload failed'
      setUploadErrors((prev) => ({ ...prev, [docId]: message }))
      toast(message, 'error')
    } finally {
      setUploadingId(null)
    }
  }

  const handleRemove = (docId) => {
    const docType = getEnterpriseDocType(docId)
    setDocuments((prev) => {
      const next = { ...prev }
      delete next[docId]
      delete next[docType]
      return next
    })
    setUploadErrors((prev) => ({ ...prev, [docId]: null }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setTouched(true)
    if (!allRequiredUploaded) {
      toast('Please upload all required documents', 'error')
      return
    }
    navigate('/enterprise/review')
  }

  const docIcon = (id) => {
    if (id === 'addressProof') return <BuildingIcon className="h-5 w-5 text-[#1a3a8f]" />
    if (id === 'taxCertificate') return <CardIcon className="h-5 w-5 text-[#1a3a8f]" />
    return <DocumentIcon className="h-5 w-5 text-[#1a3a8f]" />
  }

  const docDisplay = (docId) => {
    const val = getDocValue(docId)
    if (!val) return { fileName: null, fileUrl: null }
    if (typeof val === 'string') {
      return { fileName: val.split('/').pop(), fileUrl: val }
    }
    return { fileName: String(val), fileUrl: null }
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading..." />

  return (
    <OnboardingLayout
      step={2}
      totalSteps={3}
      steps={ONBOARDING_STEPS}
      title="Document Verification"
      subtitle="Upload required documents for your business verification."
      backTo="/enterprise/register"
      footer={
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" type="button" fullWidth={false} className="sm:min-w-[120px]" onClick={() => navigate('/enterprise/register')}>
            Back
          </Button>
          <Button type="submit" form="verification-form" fullWidth={false} className="sm:min-w-[160px]">
            Continue
          </Button>
        </div>
      }
    >
      <form id="verification-form" className="flex flex-col gap-8" onSubmit={handleSubmit} noValidate>
        <div className="lg:hidden">
          <StepProgress steps={ONBOARDING_STEPS} currentStep={2} />
        </div>

        <section className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm md:p-7">
          <SectionTitle>Required Documents</SectionTitle>
          <p className="mt-2 text-sm text-slate-500">
            Upload mandatory documents for your{' '}
            <span className="font-semibold text-slate-700">{getCompanyTypeLabel(companyType)}</span>.
            Optional documents speed up verification.
          </p>
          <div className="mt-5 flex flex-col gap-4">
            {companyDocuments.map((doc) => {
              const { fileName, fileUrl } = docDisplay(doc.id)
              return (
                <DocumentUploadCard
                  key={doc.id}
                  icon={docIcon(doc.id)}
                  title={doc.title}
                  description={doc.description}
                  required={doc.required}
                  fileName={fileName}
                  fileUrl={fileUrl}
                  uploading={uploadingId === doc.id}
                  error={uploadErrors[doc.id]}
                  onUpload={(file) => handleUpload(doc.id, file)}
                  onRemove={() => handleRemove(doc.id)}
                />
              )
            })}
          </div>
          {touched && !allRequiredUploaded && (
            <p className="mt-4 text-sm text-red-600">Please upload all required documents before continuing.</p>
          )}
        </section>

        <div className="flex gap-3 rounded-3xl border border-blue-100 bg-blue-50/60 p-5">
          <div className="shrink-0 text-[#1a3a8f]">
            <InfoIcon className="h-5 w-5" />
          </div>
          <div>
            <p className="m-0 text-sm font-bold text-[#1a3a8f]">Verification Timeline</p>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-600">
              Our compliance team typically reviews documents within 24–48 business hours. You will receive an email once
              verified.
            </p>
          </div>
        </div>

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

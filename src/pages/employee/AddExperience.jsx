import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SectionTitle from '../../components/common/SectionTitle'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import ExperienceDocumentCard from '../../components/employee/ExperienceDocumentCard'
import { BuildingIcon, BriefcaseIcon, CardIcon } from '../../components/common/Icons'
import { addJobExperience, isVerificationComplete } from '../../store/employeeStore'
import { EMPLOYMENT_TYPES, EXPERIENCE_DOCUMENTS } from '../../utils/addExperienceConstants'

function CalendarIcon({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 8h14M7 2v3M13 2v3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HrEmailIcon({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 7l7 5 7-5" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function TextArea({ label, id, leftIcon, className = '', ...props }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`.trim()}>
      {label && (
        <label htmlFor={id} className="text-sm font-semibold text-slate-800">
          {label}
        </label>
      )}
      <div className="relative">
        {leftIcon && (
          <span className="pointer-events-none absolute left-3.5 top-3.5 text-slate-400">
            {leftIcon}
          </span>
        )}
        <textarea
          id={id}
          rows={4}
          className={`w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1a3a8f] focus:ring-4 focus:ring-blue-100 md:text-base ${leftIcon ? 'pl-10' : ''}`}
          {...props}
        />
      </div>
    </div>
  )
}

const INITIAL_FORM = {
  companyName: '',
  role: '',
  employmentType: 'Full-time',
  salaryBand: '',
  joiningDate: '',
  exitDate: '',
  isPresent: false,
  companyEmail: '',
  hrEmail: '',
  description: '',
}

function AddExperience() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [documents, setDocuments] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!isVerificationComplete()) {
      navigate('/employee/verification', { replace: true })
    }
  }, [navigate])

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleUpload = (docId, fileName) => {
    setDocuments((prev) => ({ ...prev, [docId]: fileName }))
  }

  const isValid =
    form.companyName.trim() &&
    form.role.trim() &&
    form.joiningDate.trim() &&
    (form.isPresent || form.exitDate.trim()) &&
    form.companyEmail.trim()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1500))
    addJobExperience(form)
    setIsSubmitting(false)
    navigate('/employee/job-history')
  }

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Add Job Detail"
        subtitle="Add employment details for verification"
      />

      <form className="flex flex-col gap-8 md:gap-10" onSubmit={handleSubmit} noValidate>
        <section>
          <SectionTitle>Company Information</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
            <Input
              id="company-name"
              label="Company Name"
              placeholder="e.g. Google India"
              value={form.companyName}
              onChange={update('companyName')}
              leftIcon={<BuildingIcon className="h-[18px] w-[18px]" />}
              disabled={isSubmitting}
            />
            <Input
              id="role"
              label="Role / Position"
              placeholder="e.g. Senior Product Designer"
              value={form.role}
              onChange={update('role')}
              leftIcon={<BriefcaseIcon className="h-[18px] w-[18px]" />}
              disabled={isSubmitting}
            />
            <Select
              id="employment-type"
              label="Employment Type"
              options={EMPLOYMENT_TYPES}
              value={form.employmentType}
              onChange={update('employmentType')}
              disabled={isSubmitting}
            />
            <Input
              id="salary-band"
              label="Salary Band"
              placeholder="Optional"
              value={form.salaryBand}
              onChange={update('salaryBand')}
              leftIcon={<CardIcon className="h-[18px] w-[18px]" />}
              disabled={isSubmitting}
            />
          </div>
        </section>

        <section>
          <SectionTitle>Employment Timeline</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
            <Input
              id="joining-date"
              label="Joining Date"
              placeholder="MM/YYYY"
              value={form.joiningDate}
              onChange={update('joiningDate')}
              leftIcon={<CalendarIcon />}
              disabled={isSubmitting}
            />
            <div>
              <Input
                id="exit-date"
                label="Exit Date"
                placeholder={form.isPresent ? 'Present' : 'MM/YYYY'}
                value={form.isPresent ? 'Present' : form.exitDate}
                onChange={update('exitDate')}
                leftIcon={<CalendarIcon />}
                disabled={isSubmitting || form.isPresent}
              />
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isPresent}
                  onChange={update('isPresent')}
                  className="h-4 w-4 rounded border-slate-300 text-[#1a3a8f] focus:ring-[#1a3a8f]"
                  disabled={isSubmitting}
                />
                Currently working here
              </label>
            </div>
          </div>
        </section>

        <section>
          <SectionTitle>Verification Contacts</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-4 md:gap-5 lg:grid-cols-2">
            <Input
              id="company-email"
              label="Company Email"
              type="email"
              placeholder="yourname@company.com"
              value={form.companyEmail}
              onChange={update('companyEmail')}
              leftIcon={<span className="text-sm font-semibold">@</span>}
              disabled={isSubmitting}
            />
            <Input
              id="hr-email"
              label="HR Contact Email"
              type="email"
              placeholder="hr@company.com"
              value={form.hrEmail}
              onChange={update('hrEmail')}
              leftIcon={<HrEmailIcon />}
              disabled={isSubmitting}
            />
          </div>
        </section>

        <section>
          <SectionTitle>Supporting Documents</SectionTitle>
          <p className="mt-2 text-sm text-slate-500 md:text-base">
            Upload official documents to increase your Trust Score
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:gap-4 lg:grid-cols-2">
            {EXPERIENCE_DOCUMENTS.map((doc) => (
              <ExperienceDocumentCard
                key={doc.id}
                doc={doc}
                fileName={documents[doc.id]}
                onUpload={handleUpload}
              />
            ))}
          </div>
        </section>

        <section>
          <SectionTitle>Work Description</SectionTitle>
          <div className="mt-5">
            <TextArea
              id="description"
              label="Key Responsibilities"
              placeholder="Briefly describe your role and impact..."
              value={form.description}
              onChange={update('description')}
              disabled={isSubmitting}
            />
          </div>
        </section>

        <Button type="submit" disabled={!isValid || isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Save & Request Verification'}
        </Button>
      </form>

      {isSubmitting && <Loader variant="overlay" label="Submitting for verification..." />}
    </EmployeeLayout>
  )
}

export default AddExperience

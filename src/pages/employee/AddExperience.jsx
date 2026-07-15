import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SectionTitle from '../../components/common/SectionTitle'
import Input from '../../components/common/Input'
import Select from '../../components/common/Select'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import ExperienceDocumentCard from '../../components/employee/ExperienceDocumentCard'
import { BuildingIcon, BriefcaseIcon, CardIcon } from '../../components/common/Icons'
import { createJob, employeeKeys, uploadJobDocumentWithType } from '../../api/employee'
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

function PlusIcon({ className = 'h-4 w-4' }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function RemoveIcon({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M6 6l8 8M14 6l-8 8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
          className={`w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#005fd6] focus:ring-4 focus:ring-blue-100 md:text-base ${leftIcon ? 'pl-10' : ''}`}
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
  department: '',
  workLocation: '',
  employeeCode: '',
  joiningDate: '',
  exitDate: '',
  isPresent: false,
  uanNumber: '',
  pfNumber: '',
  esiNumber: '',
  lastDrawnSalary: '',
  companyEmail: '',
  description: '',
}

// Two slots by default — HR 1 and HR 2 — with more addable.
const INITIAL_HR_CONTACTS = ['', '']
const MAX_HR_CONTACTS = 6

function toDateInputValue(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function AddExperience() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(INITIAL_FORM)
  const [hrContacts, setHrContacts] = useState(INITIAL_HR_CONTACTS)
  const [documents, setDocuments] = useState({})
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const job = await createJob({
        title: form.role.trim(),
        company: form.companyName.trim(),
        employmentType: form.employmentType,
        salaryBand: form.salaryBand.trim(),
        department: form.department.trim(),
        workLocation: form.workLocation.trim(),
        employeeCode: form.employeeCode.trim(),
        joiningDate: form.joiningDate,
        exitDate: form.isPresent ? '' : form.exitDate,
        isPresent: form.isPresent,
        uanNumber: form.uanNumber.trim(),
        pfNumber: form.pfNumber.trim(),
        esiNumber: form.esiNumber.trim(),
        lastDrawnSalary: form.lastDrawnSalary.trim(),
        companyEmail: form.companyEmail.trim(),
        // hrContacts is the full list; hrEmail/managerEmail mirror the first two
        // so pre-existing readers (companyLinkingService, older rows) still work.
        // sendVerificationEmails mails the deduped union of all three.
        hrContacts: cleanHrContacts,
        hrEmail: cleanHrContacts[0] || '',
        managerEmail: cleanHrContacts[1] || '',
        description: form.description.trim(),
      })
      const jobId = job._id || job.id
      const entries = Object.entries(documents).filter(([, file]) => Boolean(file))
      for (const [documentType, file] of entries) {
        await uploadJobDocumentWithType(jobId, file, documentType)
      }
      return job
    },
    onSuccess: (job) => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.jobs })
      queryClient.invalidateQueries({ queryKey: employeeKeys.score })
      const jobId = job._id || job.id
      navigate(jobId ? `/employee/jobs/${jobId}/verify` : '/employee/job-history')
    },
    onError: (err) => setError(err.message || 'Failed to add job'),
  })

  const update = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const updateHrContact = (index) => (e) => {
    const { value } = e.target
    setHrContacts((prev) => prev.map((c, i) => (i === index ? value : c)))
  }

  const addHrContact = () =>
    setHrContacts((prev) => (prev.length >= MAX_HR_CONTACTS ? prev : [...prev, '']))

  // Keep at least the two base slots so the section never collapses to nothing.
  const removeHrContact = (index) =>
    setHrContacts((prev) =>
      prev.length <= INITIAL_HR_CONTACTS.length ? prev : prev.filter((_, i) => i !== index),
    )

  const updateDigits = (field, max) => (e) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, max)
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handlePresentChange = (e) => {
    const checked = e.target.checked
    setForm((prev) => ({
      ...prev,
      isPresent: checked,
      exitDate: checked ? '' : prev.exitDate,
    }))
  }

  const handleUpload = (docId, file) => {
    setDocuments((prev) => ({ ...prev, [docId]: file }))
  }

  const uanValid = !form.uanNumber || form.uanNumber.length === 12
  const datesValid = !form.exitDate || !form.joiningDate || form.exitDate >= form.joiningDate

  // Deduped case-insensitively to match what the backend mails.
  const cleanHrContacts = Array.from(
    new Map(
      hrContacts
        .map((c) => c.trim())
        .filter(Boolean)
        .map((c) => [c.toLowerCase(), c]),
    ).values(),
  )

  const isValid =
    form.companyName.trim() &&
    form.role.trim() &&
    form.joiningDate &&
    (form.isPresent || form.exitDate) &&
    form.companyEmail.trim() &&
    uanValid &&
    datesValid

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) return
    mutation.mutate()
  }

  const isSubmitting = mutation.isPending

  return (
    <EmployeeLayout fullWidth>
      <EmployeePageHeader
        title="Add Employment Details"
        subtitle="Complete employment and statutory details for verification"
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form className="flex w-full flex-col gap-8 md:gap-10" onSubmit={handleSubmit} noValidate>
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>Company & Role</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-5">
            <Input
              id="company-name"
              label="Company Name"
              required
              placeholder="e.g. Tata Consultancy Services"
              value={form.companyName}
              onChange={update('companyName')}
              leftIcon={<BuildingIcon className="h-[18px] w-[18px]" />}
              disabled={isSubmitting}
            />
            <Input
              id="role"
              label="Role / Designation"
              required
              placeholder="e.g. Senior Software Engineer"
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
              id="department"
              label="Department"
              placeholder="e.g. Engineering"
              value={form.department}
              onChange={update('department')}
              disabled={isSubmitting}
            />
            <Input
              id="work-location"
              label="Work Location"
              placeholder="e.g. Mumbai, Maharashtra"
              value={form.workLocation}
              onChange={update('workLocation')}
              disabled={isSubmitting}
            />
            <Input
              id="employee-code"
              label="Employee ID / Code"
              placeholder="Company employee number"
              value={form.employeeCode}
              onChange={update('employeeCode')}
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
            <Input
              id="last-drawn-salary"
              label="Last Drawn Salary"
              placeholder="Optional — for verification"
              value={form.lastDrawnSalary}
              onChange={update('lastDrawnSalary')}
              disabled={isSubmitting}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>Employment Timeline</SectionTitle>
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
            <Input
              id="joining-date"
              label="Joining Date"
              type="date"
              required
              value={toDateInputValue(form.joiningDate)}
              onChange={update('joiningDate')}
              leftIcon={<CalendarIcon />}
              disabled={isSubmitting}
            />
            <div>
              <Input
                id="exit-date"
                label="Exit Date"
                type="date"
                required={!form.isPresent}
                value={toDateInputValue(form.exitDate)}
                onChange={update('exitDate')}
                leftIcon={<CalendarIcon />}
                disabled={isSubmitting || form.isPresent}
              />
              {!datesValid && (
                <p className="mt-1 text-xs text-red-600">Exit date cannot be before joining date</p>
              )}
              <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                <input
                  type="checkbox"
                  checked={form.isPresent}
                  onChange={handlePresentChange}
                  className="h-4 w-4 rounded border-slate-300 text-[#005fd6] focus:ring-[#005fd6]"
                  disabled={isSubmitting}
                />
                Currently working here
              </label>
            </div>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>PF, ESI & Statutory Details</SectionTitle>
          <p className="mt-2 text-sm text-slate-500">
            Provident Fund and ESI details strengthen employment verification
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3 md:gap-5">
            <Input
              id="uan-number"
              label="UAN (PF)"
              placeholder="12-digit Universal Account Number"
              value={form.uanNumber}
              onChange={updateDigits('uanNumber', 12)}
              disabled={isSubmitting}
              error={!uanValid}
              errorText={!uanValid ? 'UAN must be exactly 12 digits' : ''}
            />
            <Input
              id="pf-number"
              label="PF Member ID"
              placeholder="EPF member / PF account number"
              value={form.pfNumber}
              onChange={update('pfNumber')}
              disabled={isSubmitting}
            />
            <Input
              id="esi-number"
              label="ESI / ESIC Number"
              placeholder="Employee State Insurance number"
              value={form.esiNumber}
              onChange={updateDigits('esiNumber', 17)}
              disabled={isSubmitting}
            />
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>Verification Contacts</SectionTitle>
          <p className="mt-2 text-sm text-slate-500">
            We email your verification request to these HR contacts.
          </p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3 md:gap-5">
            <Input
              id="company-email"
              label="Company Email"
              type="email"
              required
              placeholder="yourname@company.com"
              value={form.companyEmail}
              onChange={update('companyEmail')}
              leftIcon={<span className="text-sm font-semibold">@</span>}
              disabled={isSubmitting}
            />
            {hrContacts.map((contact, index) => (
              <div key={index} className="flex items-end gap-2">
                <Input
                  id={`hr-email-${index + 1}`}
                  className="flex-1"
                  label={`HR Contact ${index + 1}`}
                  type="email"
                  placeholder={`hr${index + 1}@company.com`}
                  value={contact}
                  onChange={updateHrContact(index)}
                  leftIcon={<HrEmailIcon />}
                  disabled={isSubmitting}
                />
                {hrContacts.length > INITIAL_HR_CONTACTS.length && (
                  <button
                    type="button"
                    onClick={() => removeHrContact(index)}
                    disabled={isSubmitting}
                    aria-label={`Remove HR Contact ${index + 1}`}
                    className="mb-0.5 flex h-12 w-10 shrink-0 items-center justify-center rounded-ctl text-ink-faint outline-none transition-colors duration-150 ease-swift hover:bg-danger-bg hover:text-danger focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-50"
                  >
                    <RemoveIcon />
                  </button>
                )}
              </div>
            ))}
          </div>

          {hrContacts.length < MAX_HR_CONTACTS && (
            <button
              type="button"
              onClick={addHrContact}
              disabled={isSubmitting}
              className="mt-4 inline-flex items-center gap-1.5 rounded-ctl px-2.5 py-1.5 text-sm font-semibold text-brand-600 outline-none transition-colors duration-150 ease-swift hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500/40 disabled:opacity-50"
            >
              <PlusIcon />
              Add HR contact
            </button>
          )}
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>Supporting Documents</SectionTitle>
          <p className="mt-2 text-sm text-slate-500">
            Upload offer letter, salary slip, PF statement, Form 16, or relieving letter to increase trust score
          </p>
          <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3 md:gap-4">
            {EXPERIENCE_DOCUMENTS.map((doc) => (
              <ExperienceDocumentCard
                key={doc.id}
                doc={doc}
                fileName={documents[doc.id]?.name}
                onUpload={handleUpload}
              />
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
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

        <Button type="submit" disabled={!isValid || isSubmitting} className="shadow-lg">
          {isSubmitting ? 'Saving...' : 'Save & Verify Employment'}
        </Button>
      </form>

      {isSubmitting && <Loader variant="overlay" label="Saving employment..." />}
    </EmployeeLayout>
  )
}

export default AddExperience

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
          className={`w-full resize-none rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-[15px] text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-[#1e3a8a] focus:ring-4 focus:ring-blue-100 md:text-base ${leftIcon ? 'pl-10' : ''}`}
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
  department: '',
  workLocation: '',
  employeeCode: '',
  joiningDate: '',
  exitDate: '',
  isPresent: false,
  uanNumber: '',
  pfNumber: '',
  esiNumber: '',
  yearlyPackage: '',
  monthlyInHandSalary: '',
  companyEmail: '',
  description: '',
}

// Two slots by default — HR 1 and HR 2 — with more addable.
const INITIAL_HR_CONTACTS = ['', '']
const MAX_HR_CONTACTS = 6

// A role held at this company. Employees add one per promotion so the whole
// journey (joined as X → promoted to Y) is on record for the verifier.
const EMPTY_POSITION = {
  title: '',
  fromDate: '',
  toDate: '',
  isCurrent: false,
  yearlyPackage: '',
  monthlyInHandSalary: '',
}
const MAX_POSITIONS = 15

function toDateInputValue(value) {
  if (!value) return ''
  return String(value).slice(0, 10)
}

function AddExperience() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(INITIAL_FORM)
  const [positions, setPositions] = useState([])
  const [hrContacts, setHrContacts] = useState(INITIAL_HR_CONTACTS)
  const [documents, setDocuments] = useState({})
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: async () => {
      const job = await createJob({
        title: form.role.trim(),
        company: form.companyName.trim(),
        employmentType: form.employmentType,
        department: form.department.trim(),
        workLocation: form.workLocation.trim(),
        employeeCode: form.employeeCode.trim(),
        joiningDate: form.joiningDate,
        exitDate: form.isPresent ? '' : form.exitDate,
        isPresent: form.isPresent,
        uanNumber: form.uanNumber.trim(),
        pfNumber: form.pfNumber.trim(),
        esiNumber: form.esiNumber.trim(),
        yearlyPackage: form.yearlyPackage.trim(),
        monthlyInHandSalary: form.monthlyInHandSalary.trim(),
        positions: cleanPositions,
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

  const addPosition = () =>
    setPositions((prev) => (prev.length >= MAX_POSITIONS ? prev : [...prev, { ...EMPTY_POSITION }]))

  const removePosition = (index) =>
    setPositions((prev) => prev.filter((_, i) => i !== index))

  const updatePosition = (index, field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setPositions((prev) =>
      prev.map((row, i) =>
        i === index
          ? { ...row, [field]: value, ...(field === 'isCurrent' && value ? { toDate: '' } : {}) }
          : row,
      ),
    )
  }

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

  // Only rows the user actually named are sent; a blank row is just noise.
  const cleanPositions = positions
    .map((p) => ({
      title: p.title.trim(),
      fromDate: p.fromDate || '',
      toDate: p.isCurrent ? '' : p.toDate || '',
      isCurrent: Boolean(p.isCurrent),
      yearlyPackage: p.yearlyPackage.trim(),
      monthlyInHandSalary: p.monthlyInHandSalary.trim(),
    }))
    .filter((p) => p.title)

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
              id="yearly-package"
              label="Yearly Package (CTC)"
              placeholder="e.g. 1200000"
              value={form.yearlyPackage}
              onChange={update('yearlyPackage')}
              leftIcon={<CardIcon className="h-[18px] w-[18px]" />}
              disabled={isSubmitting}
              hint="Annual cost to company"
            />
            <Input
              id="monthly-in-hand-salary"
              label="Monthly In-Hand"
              placeholder="e.g. 45000"
              value={form.monthlyInHandSalary}
              onChange={update('monthlyInHandSalary')}
              leftIcon={<span className="text-sm font-semibold">₹</span>}
              disabled={isSubmitting}
              hint="Monthly take-home — HR confirms this during verification"
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
                  className="h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                  disabled={isSubmitting}
                />
                Currently working here
              </label>
            </div>
          </div>
        </section>

        {/* Growth inside the same company — each promotion is its own row, so a
            verifier can confirm the whole journey, not just the final title. */}
        <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
          <SectionTitle>Career Journey at this Company</SectionTitle>
          <p className="mt-2 text-sm text-slate-500">
            Optional — add each role you held here. E.g. joined as Software Engineer, then
            promoted to Senior Software Engineer.
          </p>

          {positions.length === 0 ? (
            <p className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50/60 px-4 py-5 text-center text-sm text-slate-500">
              No roles added yet. Add one for each promotion or title change.
            </p>
          ) : (
            <div className="mt-4 flex flex-col gap-4">
              {positions.map((pos, index) => (
                <div key={index} className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
                  <div className="mb-3 flex items-center justify-between">
                    <span className="rounded-full bg-[#1e3a8a]/10 px-2.5 py-1 text-[11px] font-bold text-[#1e3a8a]">
                      Role {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removePosition(index)}
                      disabled={isSubmitting}
                      className="text-xs font-semibold text-red-600 hover:underline disabled:opacity-50"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:gap-5">
                    <Input
                      id={`position-title-${index}`}
                      label="Role / Designation"
                      placeholder="e.g. Software Engineer"
                      value={pos.title}
                      onChange={updatePosition(index, 'title')}
                      leftIcon={<BriefcaseIcon className="h-[18px] w-[18px]" />}
                      disabled={isSubmitting}
                    />
                    <Input
                      id={`position-package-${index}`}
                      label="Yearly Package (CTC)"
                      placeholder="e.g. 900000"
                      value={pos.yearlyPackage}
                      onChange={updatePosition(index, 'yearlyPackage')}
                      disabled={isSubmitting}
                    />
                    <Input
                      id={`position-from-${index}`}
                      label="From"
                      type="date"
                      value={toDateInputValue(pos.fromDate)}
                      onChange={updatePosition(index, 'fromDate')}
                      leftIcon={<CalendarIcon />}
                      disabled={isSubmitting}
                    />
                    <div>
                      <Input
                        id={`position-to-${index}`}
                        label="To"
                        type="date"
                        value={toDateInputValue(pos.toDate)}
                        onChange={updatePosition(index, 'toDate')}
                        leftIcon={<CalendarIcon />}
                        disabled={isSubmitting || pos.isCurrent}
                      />
                      <label className="mt-2 flex cursor-pointer items-center gap-2 text-sm text-slate-600">
                        <input
                          type="checkbox"
                          checked={pos.isCurrent}
                          onChange={updatePosition(index, 'isCurrent')}
                          className="h-4 w-4 rounded border-slate-300 text-[#1e3a8a] focus:ring-[#1e3a8a]"
                          disabled={isSubmitting}
                        />
                        This is my current role
                      </label>
                    </div>
                    <Input
                      id={`position-monthly-${index}`}
                      label="Monthly In-Hand"
                      placeholder="e.g. 45000"
                      value={pos.monthlyInHandSalary}
                      onChange={updatePosition(index, 'monthlyInHandSalary')}
                      leftIcon={<span className="text-sm font-semibold">₹</span>}
                      disabled={isSubmitting}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          {positions.length < MAX_POSITIONS && (
            <button
              type="button"
              onClick={addPosition}
              disabled={isSubmitting}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-[#1e3a8a] hover:underline disabled:opacity-50"
            >
              + Add role / promotion
            </button>
          )}
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

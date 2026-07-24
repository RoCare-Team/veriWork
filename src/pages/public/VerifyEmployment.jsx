import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { mediaUrl } from '../../lib/mediaUrl'
import {
  fetchPublicEmploymentVerification,
  submitPublicEmploymentVerification,
  uploadPublicVerificationDocument,
} from '../../api/public'

const RATING_OPTIONS = [
  { value: 'excellent', label: 'Excellent' },
  { value: 'good', label: 'Good' },
  { value: 'average', label: 'Average' },
  { value: 'below_average', label: 'Below Average' },
  { value: 'poor', label: 'Poor' },
]

const RECOMMENDATION_OPTIONS = [
  { value: 'strongly_recommend', label: 'Strongly recommend' },
  { value: 'recommend', label: 'Recommend' },
  { value: 'neutral', label: 'Neutral' },
  { value: 'not_recommend', label: 'Do not recommend' },
]

const INITIAL_FORM = {
  workedHere: true,
  designation: '',
  joiningDate: '',
  exitDate: '',
  duration: '',
  employeeCode: '',
  department: '',
  reportingManager: '',
  uanNumber: '',
  pfNumber: '',
  esiNumber: '',
  monthlyInHandSalary: '',
  yearlyPackage: '',
  salaryVerificationStatus: '',
  employmentVerificationStatus: '',
  performanceRating: '',
  behaviorRemarks: '',
  disciplinaryIssues: false,
  disciplinaryDetails: '',
  recommendation: '',
  rehireEligible: true,
  feedback: '',
  hrRemarks: '',
  supportingDocumentUrl: '',
  supportingDocumentName: '',
  verifierName: '',
  verifierDesignation: '',
  verifierEmail: '',
  verifierPhone: '',
  declarationAccepted: false,
}

const fieldClass =
  'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#1e3a8a]'

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-800">{label}</span>
      {children}
    </label>
  )
}

/**
 * Two-button choice — reads faster than a dropdown and makes the answer
 * visible at a glance, which is what this form needs most.
 */
function Choice({ label, hint, value, onChange, options, required = false }) {
  return (
    <div>
      <p className="m-0 text-sm font-semibold text-slate-800">
        {label}
        {required && <span className="text-red-500"> *</span>}
      </p>
      {hint && <p className="m-0 mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className="mt-2 flex gap-2">
        {options.map((o) => {
          const active = value === o.value
          return (
            <button
              key={String(o.value)}
              type="button"
              onClick={() => onChange(o.value)}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold transition ${
                active
                  ? o.tone === 'negative'
                    ? 'border-red-400 bg-red-50 text-red-700'
                    : 'border-emerald-500 bg-emerald-50 text-emerald-700'
                  : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
              }`}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}

const YES_NO = [
  { value: true, label: 'Yes' },
  { value: false, label: 'No', tone: 'negative' },
]

const VERIFY_OPTIONS = [
  { value: 'verified', label: 'Verified' },
  { value: 'unverified', label: 'Unverified', tone: 'negative' },
]

/** Titled block — keeps this long form scannable instead of one flat list. */
function Group({ title, hint, children }) {
  return (
    <section className="border-t border-slate-100 pt-5 first:border-0 first:pt-0">
      <p className="m-0 text-[11px] font-bold uppercase tracking-wider text-[#1e3a8a]">{title}</p>
      {hint && <p className="m-0 mt-0.5 text-xs text-slate-400">{hint}</p>}
      <div className="mt-3 space-y-4">{children}</div>
    </section>
  )
}

function VerifyEmployment() {
  const { token } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState(INITIAL_FORM)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'employment-verification', token],
    queryFn: () => fetchPublicEmploymentVerification(token),
    enabled: Boolean(token),
    retry: false,
  })

  const info = data?.data || data
  const documents = info?.documents || []

  useEffect(() => {
    if (!info) return
    setForm((prev) => ({
      ...prev,
      designation: info.designation || prev.designation,
      joiningDate: info.joiningDate ? String(info.joiningDate).slice(0, 10) : prev.joiningDate,
      exitDate: info.exitDate ? String(info.exitDate).slice(0, 10) : prev.exitDate,
      duration: info.duration || prev.duration,
      employeeCode: info.employeeCode || prev.employeeCode,
      department: info.department || prev.department,
      reportingManager: info.reportingManager || prev.reportingManager,
      uanNumber: info.uanNumber || prev.uanNumber,
      pfNumber: info.pfNumber || prev.pfNumber,
      esiNumber: info.esiNumber || prev.esiNumber,
      // Pre-fill with what the employee declared so HR only corrects it if wrong.
      monthlyInHandSalary: info.monthlyInHandSalary || prev.monthlyInHandSalary,
      yearlyPackage: info.yearlyPackage || prev.yearlyPackage,
    }))
  }, [info])

  const set = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const mutation = useMutation({
    mutationFn: () => submitPublicEmploymentVerification(token, form),
    onSuccess: () => setSubmitted(true),
  })

  const handleUpload = async (e) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadError('')
    setUploading(true)
    try {
      const res = await uploadPublicVerificationDocument(token, file)
      const result = res?.data || res
      setForm((f) => ({
        ...f,
        supportingDocumentUrl: result.url || '',
        supportingDocumentName: result.originalName || file.name,
      }))
    } catch (err) {
      setUploadError(err.message || 'Upload failed')
    } finally {
      setUploading(false)
    }
  }

  if (!token) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <p className="text-sm text-red-600">Invalid verification link.</p>
      </div>
    )
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading verification request..." />

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <p className="m-0 text-sm text-red-600">{error.message || 'Verification link is invalid or expired.'}</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
            ✓
          </div>
          <h1 className="m-0 text-xl font-bold text-slate-900">Thank you</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your employment verification response has been recorded on PagerLook. The requesting
            company will review your submission.
          </p>
        </div>
      </div>
    )
  }

  // When employment is confirmed, both the salary and the overall decision must
  // be explicitly marked — the backend enforces the same rules.
  const salaryStatusMissing = form.workedHere && !form.salaryVerificationStatus
  const decisionMissing = form.workedHere && !form.employmentVerificationStatus
  const canSubmit =
    form.declarationAccepted && !salaryStatusMissing && !decisionMissing && !mutation.isPending

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <p className="m-0 text-xs font-semibold uppercase tracking-widest text-slate-500">PagerLook</p>
          <h1 className="m-0 mt-2 text-2xl font-bold text-slate-900">Employment Verification</h1>
          <p className="m-0 mt-2 text-sm text-slate-600">
            {info?.requestingCompanyName ? <><strong>{info.requestingCompanyName}</strong> has requested verification of </> : 'Please confirm employment details for '}
            <strong>{info?.employeeName}</strong>
            {info?.previousCompanyName ? <> at <strong>{info.previousCompanyName}</strong></> : ''}.
          </p>
        </div>

        {/* Employee details on record */}
        <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">Employee on record</p>
          <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
            <Detail label="Name" value={info?.employeeName} />
            <Detail label="PagerLook ID" value={info?.employeePagerlookId} />
            <Detail label="Designation" value={info?.designation} />
            <Detail label="Department" value={info?.department} />
            <Detail label="Duration" value={info?.duration} />
            <Detail label="Reporting manager" value={info?.reportingManager} />
            <Detail
              label="Monthly in-hand (declared)"
              value={info?.monthlyInHandSalary ? `₹${info.monthlyInHandSalary}` : ''}
            />
            <Detail
              label="Yearly package (declared)"
              value={info?.yearlyPackage ? `₹${info.yearlyPackage}` : ''}
            />
          </dl>
        </div>

        {/* Role progression the employee declared — makes it easy to confirm the
            whole journey (joined as X, promoted to Y) in one glance. */}
        {(info?.positions || []).length > 0 && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Career journey at your company ({info.positions.length})
            </p>
            <ol className="m-0 mt-3 list-none space-y-3 p-0">
              {info.positions.map((pos, i) => (
                <li key={`${pos.title}-${i}`} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#1e3a8a] text-[10px] font-bold text-white">
                      {i + 1}
                    </span>
                    {i < info.positions.length - 1 && <span className="my-1 w-px flex-1 bg-slate-200" />}
                  </div>
                  <div className="min-w-0 pb-1">
                    <p className="m-0 text-sm font-bold text-slate-900">{pos.title}</p>
                    <p className="m-0 mt-0.5 text-xs text-slate-500">
                      {pos.fromDate || '—'} → {pos.isCurrent ? 'Present' : pos.toDate || '—'}
                      {pos.yearlyPackage ? ` · CTC ₹${pos.yearlyPackage}` : ''}
                      {pos.monthlyInHandSalary ? ` · In-hand ₹${pos.monthlyInHandSalary}/mo` : ''}
                    </p>
                  </div>
                </li>
              ))}
            </ol>
            <p className="m-0 mt-3 text-xs text-slate-400">
              Please confirm this progression is accurate in your response below.
            </p>
          </div>
        )}

        {/* Uploaded documents */}
        {documents.length > 0 && (
          <div className="mb-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="m-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Employee documents ({documents.length})
            </p>
            <ul className="m-0 mt-3 list-none space-y-2 p-0">
              {documents.map((doc) => (
                <li key={doc.id} className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2">
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-semibold text-slate-800">
                      {(doc.documentType || 'document').replace(/_/g, ' ')}
                    </p>
                    <p className="m-0 truncate text-xs text-slate-400">{doc.originalName}</p>
                  </div>
                  <a
                    href={mediaUrl(doc.url)}
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 text-sm font-semibold text-[#1e3a8a] no-underline hover:underline"
                  >
                    View
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}

        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault()
            if (!form.declarationAccepted || salaryStatusMissing || decisionMissing) return
            mutation.mutate()
          }}
        >
          {/* Employment confirmation */}
          <p className="m-0 mb-2 text-sm font-bold text-slate-900">Did this person work at your company?</p>
          <div className="mb-5 flex gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, workedHere: true }))}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                form.workedHere ? 'border-[#1e3a8a] bg-slate-50 text-[#1e3a8a]' : 'border-slate-200 text-slate-600'
              }`}
            >
              Yes, worked here
            </button>
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, workedHere: false }))}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                !form.workedHere ? 'border-slate-400 bg-slate-50 text-slate-700' : 'border-slate-200 text-slate-600'
              }`}
            >
              Did not work here
            </button>
          </div>

          {form.workedHere && (
            <div className="space-y-6">
              <Group title="Employment details">
                <Field label="Job title / Designation">
                  <input className={fieldClass} value={form.designation} onChange={set('designation')} placeholder="Job title" />
                </Field>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Joining date">
                    <input type="date" className={fieldClass} value={form.joiningDate} onChange={set('joiningDate')} />
                  </Field>
                  <Field label="Exit date">
                    <input type="date" className={fieldClass} value={form.exitDate} onChange={set('exitDate')} />
                  </Field>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Department">
                    <input className={fieldClass} value={form.department} onChange={set('department')} placeholder="Department" />
                  </Field>
                  <Field label="Reporting manager">
                    <input className={fieldClass} value={form.reportingManager} onChange={set('reportingManager')} placeholder="Manager name" />
                  </Field>
                </div>

                <Field label="Employee ID / Code">
                  <input className={fieldClass} value={form.employeeCode} onChange={set('employeeCode')} placeholder="Company employee code" />
                </Field>
              </Group>

              {/* Salary — the whole point of the request, so it gets a highlighted
                  block showing what the employee declared next to the inputs. */}
              <Group title="Salary" hint="Confirm the amount, then mark it verified or unverified">
                <div className="rounded-xl border border-[#1e3a8a]/20 bg-blue-50/60 p-4">
                  <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[#1e3a8a]">
                    Employee declared
                  </p>
                  <div className="mt-1.5 flex flex-wrap gap-x-6 gap-y-1">
                    <span className="text-sm text-slate-700">
                      Monthly in-hand:{' '}
                      <strong className="text-slate-900">
                        {info?.monthlyInHandSalary ? `₹${info.monthlyInHandSalary}` : 'Not provided'}
                      </strong>
                    </span>
                    <span className="text-sm text-slate-700">
                      Yearly package:{' '}
                      <strong className="text-slate-900">
                        {info?.yearlyPackage ? `₹${info.yearlyPackage}` : 'Not provided'}
                      </strong>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <Field label="Monthly in-hand (₹)">
                    <input
                      className={fieldClass}
                      value={form.monthlyInHandSalary}
                      onChange={set('monthlyInHandSalary')}
                      placeholder="e.g. 45000"
                      inputMode="numeric"
                    />
                  </Field>
                  <Field label="Yearly package (₹)">
                    <input
                      className={fieldClass}
                      value={form.yearlyPackage}
                      onChange={set('yearlyPackage')}
                      placeholder="e.g. 1200000"
                      inputMode="numeric"
                    />
                  </Field>
                </div>

                <Choice
                  label="Are these salary figures correct?"
                  required
                  value={form.salaryVerificationStatus}
                  onChange={(v) => setForm((f) => ({ ...f, salaryVerificationStatus: v }))}
                  options={VERIFY_OPTIONS}
                />
              </Group>

              <Group title="Statutory IDs" hint="Optional — strengthens the verification">
                <div className="grid grid-cols-3 gap-3">
                  <Field label="UAN (PF)">
                    <input
                      className={fieldClass}
                      value={form.uanNumber}
                      onChange={(e) => setForm((f) => ({ ...f, uanNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
                      placeholder="12 digits"
                    />
                  </Field>
                  <Field label="PF ID">
                    <input className={fieldClass} value={form.pfNumber} onChange={set('pfNumber')} />
                  </Field>
                  <Field label="ESI No.">
                    <input className={fieldClass} value={form.esiNumber} onChange={set('esiNumber')} />
                  </Field>
                </div>
              </Group>

              <Group title="Performance & conduct">
              <div className="grid grid-cols-2 gap-3">
                <Field label="Performance rating">
                  <select className={fieldClass} value={form.performanceRating} onChange={set('performanceRating')}>
                    <option value="">Select…</option>
                    {RATING_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Recommendation">
                  <select className={fieldClass} value={form.recommendation} onChange={set('recommendation')}>
                    <option value="">Select…</option>
                    {RECOMMENDATION_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <Field label="Behavior / Conduct remarks">
                <textarea rows={2} className={fieldClass} value={form.behaviorRemarks} onChange={set('behaviorRemarks')} placeholder="Professionalism, teamwork, conduct…" />
              </Field>

              <div>
                <Choice
                  label="Any disciplinary issues on record?"
                  value={form.disciplinaryIssues}
                  onChange={(v) => setForm((f) => ({ ...f, disciplinaryIssues: v }))}
                  options={[
                    { value: false, label: 'No' },
                    { value: true, label: 'Yes', tone: 'negative' },
                  ]}
                />
                {form.disciplinaryIssues && (
                  <textarea
                    rows={2}
                    className={`${fieldClass} mt-2`}
                    value={form.disciplinaryDetails}
                    onChange={set('disciplinaryDetails')}
                    placeholder="Please describe the disciplinary issue(s)"
                  />
                )}
              </div>

              <Choice
                label="Eligible for rehire?"
                value={form.rehireEligible}
                onChange={(v) => setForm((f) => ({ ...f, rehireEligible: v }))}
                options={YES_NO}
              />
              </Group>

              {/* The final call — this is what marks the employment verified. */}
              <Group
                title="Final verification"
                hint="Your decision on this employment record"
              >
                <div className="rounded-xl border border-[#1e3a8a]/20 bg-blue-50/60 p-4">
                  <Choice
                    label={`Do you verify ${info?.employeeName || 'this person'}'s employment?`}
                    required
                    value={form.employmentVerificationStatus}
                    onChange={(v) => setForm((f) => ({ ...f, employmentVerificationStatus: v }))}
                    options={VERIFY_OPTIONS}
                  />
                  <p className="m-0 mt-3 text-xs text-slate-500">
                    {form.employmentVerificationStatus === 'verified'
                      ? '✓ This employment will be marked as verified on their PagerLook profile.'
                      : form.employmentVerificationStatus === 'unverified'
                        ? '✗ This employment will be marked as unverified — the details could not be confirmed.'
                        : 'Choose Verified or Unverified to complete the verification.'}
                  </p>
                </div>
              </Group>
            </div>
          )}

          <Field label="HR remarks / additional comments">
            <textarea
              rows={3}
              className={fieldClass}
              value={form.feedback}
              onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value, hrRemarks: e.target.value }))}
              placeholder="Optional notes"
            />
          </Field>

          {/* Optional supporting document */}
          <div className="mt-4">
            <span className="text-sm font-semibold text-slate-800">Supporting document (optional)</span>
            {form.supportingDocumentUrl ? (
              <div className="mt-1 flex items-center justify-between gap-3 rounded-xl bg-emerald-50 px-3 py-2 text-sm">
                <span className="truncate text-emerald-800">{form.supportingDocumentName}</span>
                <button
                  type="button"
                  className="shrink-0 text-xs font-semibold text-red-500 hover:underline"
                  onClick={() => setForm((f) => ({ ...f, supportingDocumentUrl: '', supportingDocumentName: '' }))}
                >
                  Remove
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept=".pdf,image/*"
                onChange={handleUpload}
                disabled={uploading}
                className="mt-1 w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-slate-100 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-slate-700"
              />
            )}
            {uploading && <p className="m-0 mt-1 text-xs text-slate-400">Uploading…</p>}
            {uploadError && <p className="m-0 mt-1 text-xs text-red-600">{uploadError}</p>}
          </div>

          {/* Verifier details */}
          <div className="mt-6 border-t border-slate-100 pt-5">
            <p className="m-0 mb-3 text-sm font-bold text-slate-900">Verifier details</p>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Your name">
                <input className={fieldClass} value={form.verifierName} onChange={set('verifierName')} placeholder="Full name" />
              </Field>
              <Field label="Your designation">
                <input className={fieldClass} value={form.verifierDesignation} onChange={set('verifierDesignation')} placeholder="e.g. HR Manager" />
              </Field>
              <Field label="Your email">
                <input type="email" className={fieldClass} value={form.verifierEmail} onChange={set('verifierEmail')} placeholder="you@company.com" />
              </Field>
              <Field label="Your phone">
                <input className={fieldClass} value={form.verifierPhone} onChange={set('verifierPhone')} placeholder="Optional" />
              </Field>
            </div>
          </div>

          {/* Declaration */}
          <label className="mt-5 flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm">
            <input
              type="checkbox"
              className="mt-0.5"
              checked={form.declarationAccepted}
              onChange={set('declarationAccepted')}
            />
            <span className="text-slate-700">
              I declare that the information provided above is true and accurate to the best of my
              knowledge, and that I am authorised to verify this employment on behalf of{' '}
              <strong>{info?.previousCompanyName || 'the company'}</strong>.
            </span>
          </label>

          {mutation.error && <p className="mt-3 text-sm text-red-600">{mutation.error.message}</p>}

          <Button type="submit" className="mt-6 w-full" disabled={!canSubmit}>
            {mutation.isPending ? 'Submitting…' : 'Submit verification'}
          </Button>
          {decisionMissing ? (
            <p className="m-0 mt-2 text-center text-xs text-amber-600">
              Please mark this employment as Verified or Unverified to submit.
            </p>
          ) : salaryStatusMissing ? (
            <p className="m-0 mt-2 text-center text-xs text-amber-600">
              Please confirm whether the salary is correct to submit.
            </p>
          ) : !form.declarationAccepted ? (
            <p className="m-0 mt-2 text-center text-xs text-slate-400">
              Please accept the declaration to submit.
            </p>
          ) : null}
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure verification powered by{' '}
          <Link to="/" className="font-semibold text-[#1e3a8a] no-underline">
            PagerLook
          </Link>
        </p>
      </div>
    </div>
  )
}

function Detail({ label, value }) {
  return (
    <div>
      <dt className="text-xs text-slate-500">{label}</dt>
      <dd className="m-0 font-semibold text-slate-900">{value || '—'}</dd>
    </div>
  )
}

export default VerifyEmployment

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
  'mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-[#005fd6]'

function Field({ label, children }) {
  return (
    <label className="block text-sm">
      <span className="font-semibold text-slate-800">{label}</span>
      {children}
    </label>
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

  const canSubmit = form.declarationAccepted && !mutation.isPending

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
          </dl>
        </div>

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
                    className="shrink-0 text-sm font-semibold text-[#005fd6] no-underline hover:underline"
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
            if (!form.declarationAccepted) return
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
                form.workedHere ? 'border-[#005fd6] bg-slate-50 text-[#005fd6]' : 'border-slate-200 text-slate-600'
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
            <div className="space-y-4">
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

              {/* Assessment */}
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
                <label className="flex items-center gap-2 text-sm">
                  <input type="checkbox" checked={form.disciplinaryIssues} onChange={set('disciplinaryIssues')} />
                  <span className="font-semibold text-slate-800">Any disciplinary issues on record</span>
                </label>
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

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={form.rehireEligible} onChange={set('rehireEligible')} />
                <span className="font-semibold text-slate-800">Eligible for rehire</span>
              </label>
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
          {!form.declarationAccepted && (
            <p className="m-0 mt-2 text-center text-xs text-slate-400">
              Please accept the declaration to submit.
            </p>
          )}
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure verification powered by{' '}
          <Link to="/" className="font-semibold text-[#005fd6] no-underline">
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

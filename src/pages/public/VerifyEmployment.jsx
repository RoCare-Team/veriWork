import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useMutation, useQuery } from '@tanstack/react-query'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import {
  fetchPublicEmploymentVerification,
  submitPublicEmploymentVerification,
} from '../../api/public'

function VerifyEmployment() {
  const { token } = useParams()
  const [submitted, setSubmitted] = useState(false)
  const [form, setForm] = useState({
    workedHere: true,
    designation: '',
    joiningDate: '',
    exitDate: '',
    duration: '',
    feedback: '',
    rehireEligible: true,
    verificationNotes: '',
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'employment-verification', token],
    queryFn: () => fetchPublicEmploymentVerification(token),
    enabled: Boolean(token),
    retry: false,
  })

  const info = data?.data || data

  useEffect(() => {
    if (!info) return
    setForm((prev) => ({
      ...prev,
      designation: info.designation || prev.designation,
      joiningDate: info.joiningDate || prev.joiningDate,
      exitDate: info.exitDate || prev.exitDate,
      duration: info.duration || prev.duration,
    }))
  }, [info])

  const mutation = useMutation({
    mutationFn: () => submitPublicEmploymentVerification(token, form),
    onSuccess: () => setSubmitted(true),
  })

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
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-2xl text-slate-700">
            ✓
          </div>
          <h1 className="m-0 text-xl font-bold text-slate-900">Thank you</h1>
          <p className="mt-2 text-sm text-slate-600">
            Your employment verification response has been recorded on PagerLook.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto max-w-xl">
        <div className="mb-6 text-center">
          <p className="m-0 text-xs font-semibold uppercase tracking-widest text-slate-500">PagerLook</p>
          <h1 className="m-0 mt-2 text-2xl font-bold text-slate-900">Employment Verification</h1>
          <p className="m-0 mt-2 text-sm text-slate-600">
            Please confirm employment details for <strong>{info?.employeeName}</strong>
            {info?.previousCompanyName ? ` at ${info.previousCompanyName}` : ''}.
          </p>
        </div>

        <form
          className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <div className="mb-5 flex gap-3">
            <button
              type="button"
              onClick={() => setForm((f) => ({ ...f, workedHere: true }))}
              className={`flex-1 rounded-xl border py-2.5 text-sm font-semibold ${
                form.workedHere ? 'border-[#1a3a8f] bg-slate-50 text-[#1a3a8f]' : 'border-slate-200 text-slate-600'
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
              <label className="block text-sm">
                <span className="font-semibold text-slate-800">Designation</span>
                <input
                  className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                  value={form.designation}
                  onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
                  placeholder="Job title"
                />
              </label>
              {form.duration && (
                <p className="m-0 text-xs text-slate-500">Employment duration: {form.duration}</p>
              )}
              <div className="grid grid-cols-2 gap-3">
                <label className="block text-sm">
                  <span className="font-semibold text-slate-800">Joining date</span>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.joiningDate}
                    onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))}
                  />
                </label>
                <label className="block text-sm">
                  <span className="font-semibold text-slate-800">Exit date</span>
                  <input
                    type="date"
                    className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
                    value={form.exitDate}
                    onChange={(e) => setForm((f) => ({ ...f, exitDate: e.target.value }))}
                  />
                </label>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={form.rehireEligible}
                  onChange={(e) => setForm((f) => ({ ...f, rehireEligible: e.target.checked }))}
                />
                <span className="font-semibold text-slate-800">Would rehire this employee</span>
              </label>
            </div>
          )}

          <label className="mt-4 block text-sm">
            <span className="font-semibold text-slate-800">Comments / feedback</span>
            <textarea
              rows={4}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.feedback}
              onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value, verificationNotes: e.target.value }))}
              placeholder="Optional performance notes"
            />
          </label>

          {mutation.error && (
            <p className="mt-3 text-sm text-red-600">{mutation.error.message}</p>
          )}

          <Button type="submit" className="mt-6 w-full" disabled={mutation.isPending}>
            Submit verification
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-slate-400">
          Secure verification powered by{' '}
          <Link to="/" className="font-semibold text-[#1a3a8f] no-underline">
            PagerLook
          </Link>
        </p>
      </div>
    </div>
  )
}

export default VerifyEmployment

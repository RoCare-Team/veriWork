import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import Loader from '../common/Loader'
import { approveVerificationRequest } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

function IncomingVerificationApproveModal({ request, onClose, onSuccess }) {
  const { toast } = useToast()
  const [form, setForm] = useState({
    designation: request.jobTitle || request.title || '',
    joiningDate: request.joiningDate ? String(request.joiningDate).slice(0, 10) : '',
    exitDate: request.exitDate ? String(request.exitDate).slice(0, 10) : '',
    duration: request.duration || '',
    employeeCode: request.employeeCode || '',
    department: request.department || '',
    uanNumber: request.uanNumber || '',
    pfNumber: request.pfNumber || '',
    esiNumber: request.esiNumber || '',
    feedback: '',
    rehireEligible: true,
    employmentStatus: 'confirmed',
  })

  const mutation = useMutation({
    mutationFn: () =>
      approveVerificationRequest(request._id || request.id, {
        workedHere: true,
        designation: form.designation,
        joiningDate: form.joiningDate,
        exitDate: form.exitDate,
        duration: form.duration,
        employeeCode: form.employeeCode,
        department: form.department,
        uanNumber: form.uanNumber,
        pfNumber: form.pfNumber,
        esiNumber: form.esiNumber,
        feedback: form.feedback,
        rehireEligible: form.rehireEligible,
        employmentStatus: form.employmentStatus,
      }),
    onSuccess: () => {
      toast('Employment verified — Employer Verified', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Failed to approve', 'error'),
  })

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Approve Employment Verification</h3>
        <p className="mt-1 text-sm text-slate-500">
          Confirm details for {request.employeeName} at {request.previousCompanyName || request.companyName}.
        </p>

        <div className="mt-5 space-y-4">
          <Input
            id="designation"
            label="Designation"
            value={form.designation}
            onChange={(e) => setForm((f) => ({ ...f, designation: e.target.value }))}
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="joining"
              label="Joining date"
              type="date"
              value={form.joiningDate}
              onChange={(e) => setForm((f) => ({ ...f, joiningDate: e.target.value }))}
            />
            <Input
              id="exit"
              label="Exit date"
              type="date"
              value={form.exitDate}
              onChange={(e) => setForm((f) => ({ ...f, exitDate: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Input
              id="employee-code"
              label="Employee ID"
              value={form.employeeCode}
              onChange={(e) => setForm((f) => ({ ...f, employeeCode: e.target.value }))}
            />
            <Input
              id="department"
              label="Department"
              value={form.department}
              onChange={(e) => setForm((f) => ({ ...f, department: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Input
              id="uan"
              label="UAN (PF)"
              value={form.uanNumber}
              onChange={(e) => setForm((f) => ({ ...f, uanNumber: e.target.value.replace(/\D/g, '').slice(0, 12) }))}
            />
            <Input
              id="pf"
              label="PF Member ID"
              value={form.pfNumber}
              onChange={(e) => setForm((f) => ({ ...f, pfNumber: e.target.value }))}
            />
            <Input
              id="esi"
              label="ESI Number"
              value={form.esiNumber}
              onChange={(e) => setForm((f) => ({ ...f, esiNumber: e.target.value }))}
            />
          </div>
          <Input
            id="duration"
            label="Duration"
            value={form.duration}
            onChange={(e) => setForm((f) => ({ ...f, duration: e.target.value }))}
            placeholder="e.g. Jan 2022 – Mar 2024"
          />
          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.rehireEligible}
              onChange={(e) => setForm((f) => ({ ...f, rehireEligible: e.target.checked }))}
            />
            <span className="font-semibold text-slate-800">Eligible for rehire</span>
          </label>
          <label className="block text-sm">
            <span className="font-semibold text-slate-800">HR feedback</span>
            <textarea
              rows={3}
              className="mt-1 w-full rounded-xl border border-slate-200 px-3 py-2.5 text-sm"
              value={form.feedback}
              onChange={(e) => setForm((f) => ({ ...f, feedback: e.target.value }))}
            />
          </label>
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending}>
            Approve → Employer Verified
          </Button>
        </div>

        {mutation.isPending && <Loader variant="overlay" label="Saving..." />}
      </div>
    </div>
  )
}

export default IncomingVerificationApproveModal

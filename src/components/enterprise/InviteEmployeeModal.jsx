import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import Loader from '../common/Loader'
import { inviteEmployee } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'
import { getInvitationStatusStyle } from '../../utils/enterpriseTeamUtils'

function InviteEmployeeModal({ onClose, onSuccess, defaultDepartment = '' }) {
  const { toast } = useToast()
  const [employeeName, setEmployeeName] = useState('')
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [department, setDepartment] = useState(defaultDepartment)
  const [designation, setDesignation] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})
  const [lastResult, setLastResult] = useState(null)

  const isValid =
    employeeName.trim() &&
    email.trim() &&
    department.trim() &&
    designation.trim()

  const mutation = useMutation({
    mutationFn: () =>
      inviteEmployee({
        employeeName: employeeName.trim(),
        employeeEmail: email.trim(),
        ...(mobile.trim() ? { employeeMobile: mobile.trim() } : {}),
        department: department.trim(),
        designation: designation.trim(),
      }),
    onSuccess: (data) => {
      setLastResult(data)
      if (data.caseType === 'registered') {
        toast('Invitation sent. Employee will see it in their portal.', 'success')
        onSuccess?.(data)
        onClose()
        return
      }
      if (data.caseType === 'not_registered') {
        toast(`Registration email sent to ${email.trim()}`, 'success')
        if (data.emailMock && data.registrationLink) {
          toast(`Dev link: ${data.registrationLink}`, 'info')
        }
        onSuccess?.(data)
        return
      }
      toast('Invitation sent successfully', 'success')
      onSuccess?.(data)
      onClose()
    },
    onError: (err) => {
      if (err?.status === 409) {
        toast('Pending invitation already exists', 'error')
        return
      }
      if (Array.isArray(err.details)) {
        const next = {}
        err.details.forEach((d) => {
          const field = d.field || d.path?.[0]
          if (field) next[field] = d.message
        })
        setFieldErrors(next)
      }
      toast(err.message || 'Failed to send invitation', 'error')
    },
  })

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isValid) {
      const next = {}
      if (!employeeName.trim()) next.employeeName = 'Employee name is required'
      if (!email.trim()) next.employeeEmail = 'Email is required'
      if (!department.trim()) next.department = 'Department is required'
      if (!designation.trim()) next.designation = 'Designation is required'
      setFieldErrors(next)
      return
    }
    setFieldErrors({})
    mutation.mutate()
  }

  const statusStyle = lastResult?.status ? getInvitationStatusStyle(lastResult.status) : null

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Invite Employee</h3>
        <p className="mt-1 text-sm text-slate-500">
          Email is required. Employee will register via link if not on PagerLook yet.
        </p>

        {lastResult?.registrationLink && (
          <div className="mt-4 rounded-xl border border-blue-100 bg-blue-50 p-4 text-sm">
            <p className="m-0 font-semibold text-slate-800">Registration link {lastResult.emailMock ? '(dev mode)' : ''}</p>
            <a
              href={lastResult.registrationLink}
              target="_blank"
              rel="noreferrer"
              className="m-0 mt-1 block break-all text-[#005fd6] hover:underline"
            >
              {lastResult.registrationLink}
            </a>
            {statusStyle && (
              <span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase ${statusStyle.bg} ${statusStyle.color}`}>
                {statusStyle.label}
              </span>
            )}
            <Button type="button" className="mt-4 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        )}

        {!lastResult?.registrationLink && (
          <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
            <Input
              id="invite-name"
              label="Employee Name"
              required
              value={employeeName}
              onChange={(e) => setEmployeeName(e.target.value)}
              disabled={mutation.isPending}
              error={Boolean(fieldErrors.employeeName)}
              errorText={fieldErrors.employeeName}
            />
            <Input
              id="invite-email"
              label="Employee Email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={mutation.isPending}
              error={Boolean(fieldErrors.employeeEmail)}
              errorText={fieldErrors.employeeEmail}
            />
            <Input
              id="invite-mobile"
              label="Employee Mobile"
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value)}
              disabled={mutation.isPending}
              placeholder="Optional"
            />
            <Input
              id="invite-department"
              label="Department"
              required
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              disabled={mutation.isPending}
              error={Boolean(fieldErrors.department)}
              errorText={fieldErrors.department}
            />
            <Input
              id="invite-designation"
              label="Designation"
              required
              value={designation}
              onChange={(e) => setDesignation(e.target.value)}
              disabled={mutation.isPending}
              error={Boolean(fieldErrors.designation)}
              errorText={fieldErrors.designation}
            />

            <div className="mt-2 flex gap-3">
              <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
                Cancel
              </Button>
              <Button type="submit" className="flex-1" disabled={mutation.isPending}>
                Send Invitation
              </Button>
            </div>
          </form>
        )}

        {mutation.isPending && <Loader variant="overlay" label="Sending invitation..." />}
      </div>
    </div>
  )
}

export default InviteEmployeeModal

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import Loader from '../common/Loader'
import { inviteEmployee } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

const SUCCESS_MESSAGES = {
  pending: 'Invitation sent. Waiting for employee to accept.',
  pending_registration: 'Invitation sent. Employee must register on VeriWork first.',
}

function InviteEmployeeModal({ onClose, onSuccess, defaultDepartment = '' }) {
  const { toast } = useToast()
  const [email, setEmail] = useState('')
  const [mobile, setMobile] = useState('')
  const [pagerlookId, setPagerlookId] = useState('')
  const [department, setDepartment] = useState(defaultDepartment)
  const [designation, setDesignation] = useState('')
  const [fieldErrors, setFieldErrors] = useState({})

  const hasIdentifier = email.trim() || mobile.trim() || pagerlookId.trim()
  const isValid = hasIdentifier && department.trim() && designation.trim()

  const mutation = useMutation({
    mutationFn: () =>
      inviteEmployee({
        ...(email.trim() ? { employeeEmail: email.trim() } : {}),
        ...(mobile.trim() ? { employeeMobile: mobile.trim() } : {}),
        ...(pagerlookId.trim() ? { employeePagerlookId: pagerlookId.trim() } : {}),
        department: department.trim(),
        designation: designation.trim(),
      }),
    onSuccess: (data) => {
      const msg = SUCCESS_MESSAGES[data.status] || 'Invitation sent successfully'
      toast(msg, 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => {
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
      if (!hasIdentifier) next.identifier = 'Provide at least one of email, mobile, or VeriWork ID'
      if (!department.trim()) next.department = 'Department is required'
      if (!designation.trim()) next.designation = 'Designation is required'
      setFieldErrors(next)
      return
    }
    setFieldErrors({})
    mutation.mutate()
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Invite Employee</h3>
        <p className="mt-1 text-sm text-slate-500">
          Send an invitation using email, mobile, or VeriWork ID.
        </p>

        <form className="mt-5 flex flex-col gap-4" onSubmit={handleSubmit} noValidate>
          <Input
            id="invite-email"
            label="Employee Email"
            type="email"
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
            error={Boolean(fieldErrors.employeeMobile)}
            errorText={fieldErrors.employeeMobile}
          />
          <Input
            id="invite-pagerlook-id"
            label="VeriWork ID"
            value={pagerlookId}
            onChange={(e) => setPagerlookId(e.target.value)}
            disabled={mutation.isPending}
            placeholder="e.g. VW-XXXX-XX"
            error={Boolean(fieldErrors.employeePagerlookId)}
            errorText={fieldErrors.employeePagerlookId}
          />
          {fieldErrors.identifier && (
            <p className="-mt-2 text-xs text-red-600" role="alert">{fieldErrors.identifier}</p>
          )}

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

        {mutation.isPending && <Loader variant="overlay" label="Sending invitation..." />}
      </div>
    </div>
  )
}

export default InviteEmployeeModal

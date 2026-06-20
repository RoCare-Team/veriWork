import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import Loader from '../common/Loader'
import { assignEmployeeOnboarding, enterpriseKeys } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

function AssignEmployeeModal({ employee, onClose, onSuccess }) {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [department, setDepartment] = useState(employee?.department || '')
  const [designation, setDesignation] = useState(employee?.designation || '')

  const mutation = useMutation({
    mutationFn: () =>
      assignEmployeeOnboarding(employee.employeeId || employee.id, {
        department: department.trim(),
        designation: designation.trim(),
      }),
    onSuccess: () => {
      toast('Employee assigned to team', 'success')
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.team })
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Assignment failed', 'error'),
  })

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Assign to Team</h3>
        <p className="mt-1 text-sm text-slate-500">
          {employee?.employeeName || 'Employee'} — verified and ready for department assignment.
        </p>

        <div className="mt-5 space-y-4">
          <Input id="dept" label="Department" value={department} onChange={(e) => setDepartment(e.target.value)} />
          <Input id="desig" label="Designation" value={designation} onChange={(e) => setDesignation(e.target.value)} />
        </div>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button type="button" className="flex-1" onClick={() => mutation.mutate()} disabled={mutation.isPending || !department.trim()}>
            Activate Employee
          </Button>
        </div>

        {mutation.isPending && <Loader variant="overlay" label="Saving..." />}
      </div>
    </div>
  )
}

export default AssignEmployeeModal

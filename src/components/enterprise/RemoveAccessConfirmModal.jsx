import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Loader from '../common/Loader'
import { revokeEmployeeAccess } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'
import { resolveEmployeeId, getEmployeeName } from '../../utils/enterpriseTeamUtils'

function RemoveAccessConfirmModal({ employee, onClose, onSuccess }) {
  const { toast } = useToast()
  const employeeId = resolveEmployeeId(employee)
  const employeeName = getEmployeeName(employee)

  const mutation = useMutation({
    mutationFn: () => revokeEmployeeAccess(employeeId, {}),
    onSuccess: () => {
      toast('Access removed successfully', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => {
      toast(err.message || 'Failed to remove access', 'error')
    },
  })

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 w-full max-w-md rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <h3 className="m-0 text-lg font-extrabold text-slate-900">Remove access to {employeeName}?</h3>
        <p className="mt-2 text-sm text-slate-600">
          Employee will need to approve again if you request access later.
        </p>

        <div className="mt-6 flex gap-3">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 !bg-red-600 hover:!bg-red-700"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || !employeeId}
          >
            Remove Access
          </Button>
        </div>

        {mutation.isPending && <Loader variant="overlay" label="Removing access..." />}
      </div>
    </div>
  )
}

export default RemoveAccessConfirmModal

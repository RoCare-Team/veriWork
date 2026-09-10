import { useState } from 'react'
import Button from '../common/Button'

/**
 * Confirmation for permanently erasing an employee.
 *
 * The delete is irreversible and takes records other companies hold with it, so
 * the button stays disabled until the admin retypes the employee's name or
 * PagerLook ID. That is the same check the server runs, which means a typo
 * fails here instead of deleting the wrong person.
 *
 * Render this only while a delete is pending, keyed on the employee id — the
 * typed confirmation then resets on mount, so a name typed for one employee can
 * never be left sitting in the box when the modal opens on someone else.
 */
function DeleteEmployeeModal({ employee, onClose, onConfirm, busy }) {
  const [confirm, setConfirm] = useState('')

  if (!employee) return null

  const expected = [employee.name, employee.veriworkId].filter(
    (value) => value && value !== '—',
  )
  const matches = expected.some(
    (value) => value.trim().toLowerCase() === confirm.trim().toLowerCase(),
  )

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!matches || busy) return
    onConfirm(confirm.trim())
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/50 p-4 sm:items-center">
      <form onSubmit={handleSubmit} className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
        <h3 className="m-0 text-lg font-bold text-slate-900">Delete {employee.name} permanently?</h3>

        <p className="m-0 mt-2 text-sm text-slate-600">
          This erases the account and everything the platform holds about them — profile,
          documents, Aadhaar KYC, vault, employment verifications, endorsements and company
          roster entries. It cannot be undone.
        </p>

        <p className="m-0 mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm text-amber-800">
          To block access without losing verification history, use <strong>Deactivate</strong> instead.
        </p>

        <label className="mt-4 block text-sm font-semibold text-slate-700">
          Type <span className="font-mono text-slate-900">{expected[0]}</span> to confirm
          <input
            type="text"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            autoComplete="off"
            placeholder={expected[0]}
            className="mt-2 w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm font-normal outline-none focus:border-red-500 focus:ring-4 focus:ring-red-100"
          />
        </label>
        {expected.length > 1 && (
          <p className="m-0 mt-2 text-xs text-slate-500">
            Their PagerLook ID <span className="font-mono">{expected[1]}</span> works too.
          </p>
        )}

        <div className="mt-5 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button type="button" variant="ghost" fullWidth={false} onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button type="submit" variant="danger" fullWidth={false} disabled={busy || !matches}>
            {busy ? 'Deleting…' : 'Delete permanently'}
          </Button>
        </div>
      </form>
    </div>
  )
}

export default DeleteEmployeeModal

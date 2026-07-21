import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import { createCompanyRole, updateCompanyRole } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

const LEVELS = [
  { value: 'none', label: 'No access' },
  { value: 'view', label: 'View only' },
  { value: 'manage', label: 'Manage' },
]

/**
 * Build/edit a custom role: name it, then tick what it may do per module.
 * `role` present = edit mode.
 */
function RoleBuilderModal({ modules, role, onClose, onSuccess }) {
  const { toast } = useToast()
  const isEdit = Boolean(role)

  const [name, setName] = useState(role?.name || '')
  const [description, setDescription] = useState(role?.description || '')
  const [permissions, setPermissions] = useState(() =>
    modules.reduce((acc, m) => {
      acc[m.id] = role?.permissions?.[m.id] || 'none'
      return acc
    }, {}),
  )

  const setLevel = (moduleId, level) => setPermissions((p) => ({ ...p, [moduleId]: level }))

  const mutation = useMutation({
    mutationFn: () => {
      const body = { name: name.trim(), description: description.trim(), permissions }
      return isEdit ? updateCompanyRole(role.id, body) : createCompanyRole(body)
    },
    onSuccess: () => {
      toast(isEdit ? 'Role updated' : 'Role created', 'success')
      onSuccess?.()
      onClose()
    },
    onError: (err) => toast(err.message || 'Could not save the role', 'error'),
  })

  const grantedCount = Object.values(permissions).filter((l) => l !== 'none').length

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
        >
          <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M5 5l10 10M15 5L5 15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
          </svg>
        </button>

        <h3 className="m-0 pr-10 text-lg font-extrabold text-slate-900">
          {isEdit ? 'Edit role' : 'Create a role'}
        </h3>
        <p className="m-0 mt-1 text-sm text-slate-500">
          Name the role, then choose exactly what it can do. Anything set to “No access” won’t even
          appear in their sidebar.
        </p>

        <form
          className="mt-5"
          onSubmit={(e) => {
            e.preventDefault()
            mutation.mutate()
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              id="role-name"
              label="Role name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. HR Executive"
              disabled={mutation.isPending}
            />
            <Input
              id="role-desc"
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Optional"
              disabled={mutation.isPending}
            />
          </div>

          <div className="mt-5">
            <div className="flex items-baseline justify-between">
              <p className="m-0 text-sm font-bold text-slate-900">Permissions</p>
              <span className="text-xs text-slate-400">
                {grantedCount} of {modules.length} modules granted
              </span>
            </div>

            <div className="mt-3 overflow-hidden rounded-xl border border-slate-200">
              {modules.map((m, i) => (
                <div
                  key={m.id}
                  className={`flex flex-wrap items-center justify-between gap-3 px-4 py-3 ${
                    i > 0 ? 'border-t border-slate-100' : ''
                  }`}
                >
                  <span className="text-sm font-semibold text-slate-800">{m.label}</span>
                  <div className="flex gap-1 rounded-lg bg-slate-100 p-1">
                    {LEVELS.map((lvl) => (
                      <button
                        key={lvl.value}
                        type="button"
                        onClick={() => setLevel(m.id, lvl.value)}
                        disabled={mutation.isPending}
                        className={`rounded-md px-3 py-1.5 text-xs font-semibold transition ${
                          permissions[m.id] === lvl.value
                            ? 'bg-white text-brand-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                      >
                        {lvl.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={mutation.isPending}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={mutation.isPending || name.trim().length < 2}>
              {mutation.isPending ? 'Saving…' : isEdit ? 'Save changes' : 'Create role'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RoleBuilderModal

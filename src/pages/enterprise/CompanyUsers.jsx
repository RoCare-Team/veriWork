import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import Loader from '../../components/common/Loader'
import AddCompanyUserModal from '../../components/enterprise/AddCompanyUserModal'
import RoleBuilderModal from '../../components/enterprise/RoleBuilderModal'
import {
  enterpriseKeys,
  fetchCompanyUsers,
  fetchRoles,
  revokeCompanyUserInvite,
  updateCompanyUserRole,
  removeCompanyUser,
  deleteCompanyRole,
  resetCompanyUserPassword,
} from '../../api/enterprise'
import { usePermissions } from '../../hooks/usePermissions'
import { useToast } from '../../context/ToastContext'
import { getInitials, formatDate } from '../../utils/formatters'

function unwrap(res) {
  return res?.data || res || {}
}

const PRESET_BADGE = {
  owner: 'bg-indigo-50 text-indigo-700',
  admin: 'bg-brand-600/10 text-brand-600',
  hr_manager: 'bg-emerald-50 text-emerald-700',
  recruiter: 'bg-amber-50 text-amber-700',
  viewer: 'bg-slate-100 text-slate-600',
}

function RoleBadge({ roleKey, label, isCustom }) {
  const cls = isCustom ? 'bg-purple-50 text-purple-700' : PRESET_BADGE[roleKey] || PRESET_BADGE.viewer
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${cls}`}>
      {label || roleKey}
    </span>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function PermissionSummary({ permissions, modules }) {
  const granted = modules.filter((m) => permissions?.[m.id] && permissions[m.id] !== 'none')
  if (!granted.length) return <p className="m-0 mt-2 text-xs text-slate-400">No access granted yet.</p>
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {granted.map((m) => (
        <span
          key={m.id}
          className={`rounded-md px-2 py-0.5 text-[10px] font-semibold ${
            permissions[m.id] === 'manage' ? 'bg-brand-600/10 text-brand-600' : 'bg-slate-100 text-slate-500'
          }`}
        >
          {m.label}
          {permissions[m.id] === 'view' ? ' · view' : ''}
        </span>
      ))}
    </div>
  )
}

function CompanyUsers() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const { can, roleLabel } = usePermissions()
  const [showAdd, setShowAdd] = useState(false)
  const [editRole, setEditRole] = useState(null)
  const [showRoleBuilder, setShowRoleBuilder] = useState(false)

  const usersQuery = useQuery({ queryKey: enterpriseKeys.companyUsers, queryFn: fetchCompanyUsers })
  const rolesQuery = useQuery({ queryKey: enterpriseKeys.roles, queryFn: fetchRoles })

  const payload = unwrap(usersQuery.data)
  const rolesPayload = unwrap(rolesQuery.data)

  const users = payload.users || []
  const invites = payload.pendingInvites || []
  const assignablePresets = payload.assignableRoles || []
  const modules = rolesPayload.modules || []
  const presetRoles = rolesPayload.presetRoles || []
  const customRoles = rolesPayload.customRoles || []

  const canManage = can('company_users', 'manage')

  // Presets the actor may assign + every custom role, as one dropdown list.
  const roleOptions = [
    ...presetRoles
      .filter((r) => assignablePresets.includes(r.key))
      .map((r) => ({ value: r.key, label: r.label, description: r.description, isCustom: false })),
    ...customRoles.map((r) => ({
      value: r.id,
      label: r.name,
      description: r.description,
      isCustom: true,
    })),
  ]
  const presetKeys = presetRoles.map((r) => r.key)

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.companyUsers })
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.roles })
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.myPermissions })
  }

  const roleMutation = useMutation({
    mutationFn: ({ userId, value }) =>
      updateCompanyUserRole(userId, presetKeys.includes(value) ? { companyRole: value } : { companyRoleId: value }),
    onSuccess: () => {
      toast('Role updated', 'success')
      refresh()
    },
    onError: (err) => toast(err.message || 'Failed to update role', 'error'),
  })

  const removeMutation = useMutation({
    mutationFn: (userId) => removeCompanyUser(userId),
    onSuccess: () => {
      toast('User removed', 'success')
      refresh()
    },
    onError: (err) => toast(err.message || 'Failed to remove user', 'error'),
  })

  const revokeMutation = useMutation({
    mutationFn: (inviteId) => revokeCompanyUserInvite(inviteId),
    onSuccess: () => {
      toast('Invite revoked', 'success')
      refresh()
    },
    onError: (err) => toast(err.message || 'Failed to revoke invite', 'error'),
  })

  const deleteRoleMutation = useMutation({
    mutationFn: (roleId) => deleteCompanyRole(roleId),
    onSuccess: () => {
      toast('Role deleted', 'success')
      refresh()
    },
    onError: (err) => toast(err.message || 'Failed to delete role', 'error'),
  })

  const passwordMutation = useMutation({
    mutationFn: ({ userId, password }) => resetCompanyUserPassword(userId, password),
    onSuccess: (res) => {
      const data = unwrap(res)
      toast(data.message || 'Password updated', 'success')
    },
    onError: (err) => toast(err.message || 'Failed to reset password', 'error'),
  })

  const promptPassword = (user) => {
    const entered = window.prompt(`Set a new password for ${user.email} (min 8 characters)`)
    if (entered === null) return
    // Trim: this password is read off the screen and handed over, so a stray
    // space would lock them out with no way to tell.
    const password = entered.trim()
    if (password.length < 8) {
      toast('Password must be at least 8 characters', 'error')
      return
    }
    passwordMutation.mutate({ userId: user.id, password })
    toast(`New password for ${user.email}: ${password}`, 'info')
  }

  if (usersQuery.isLoading) return <Loader variant="fullPage" label="Loading company users..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="m-0 text-xl font-extrabold text-slate-900 md:text-2xl">Company Users</h1>
            <p className="m-0 mt-0.5 text-sm text-slate-500">
              Create roles, decide what each can access, and give your staff a login.
            </p>
          </div>
          {canManage && (
            <div className="flex shrink-0 gap-2">
              <button
                type="button"
                onClick={() => {
                  setEditRole(null)
                  setShowRoleBuilder(true)
                }}
                className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Create role
              </button>
              <button
                type="button"
                onClick={() => setShowAdd(true)}
                className="flex items-center gap-2 rounded-xl bg-brand-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700"
              >
                <PlusIcon />
                Add team member
              </button>
            </div>
          )}
        </div>

        {usersQuery.error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {usersQuery.error.message}
          </p>
        )}

        {/* Members */}
        <section className="mt-8">
          <h2 className="m-0 mb-4 text-base font-bold text-slate-900">Members</h2>
          <div className="flex flex-col gap-3">
            {users.map((u) => (
              <article
                key={u.id}
                className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center sm:justify-between md:p-5"
              >
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-600">
                    {getInitials(u.email)}
                  </div>
                  <div className="min-w-0">
                    <p className="m-0 truncate text-sm font-bold text-slate-900">
                      {u.email} {u.isYou && <span className="text-xs font-medium text-slate-400">(you)</span>}
                    </p>
                    <p className="m-0 mt-0.5 text-xs text-slate-500">
                      Added {u.createdAt ? formatDate(u.createdAt) : '—'}
                    </p>
                  </div>
                </div>

                <div className="flex shrink-0 flex-wrap items-center gap-2">
                  {canManage && !u.isYou && !u.isOwner ? (
                    <select
                      value={u.roleKey || ''}
                      onChange={(e) => roleMutation.mutate({ userId: u.id, value: e.target.value })}
                      disabled={roleMutation.isPending}
                      className="h-9 rounded-lg border border-slate-200 bg-white px-2.5 text-xs font-semibold text-slate-700 outline-none focus:border-brand-500"
                    >
                      {roleOptions.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <RoleBadge roleKey={u.roleKey} label={u.roleLabel} isCustom={u.isCustomRole} />
                  )}

                  {canManage && !u.isYou && (
                    <button
                      type="button"
                      onClick={() => promptPassword(u)}
                      disabled={passwordMutation.isPending}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-50 disabled:opacity-50"
                    >
                      Reset password
                    </button>
                  )}

                  {canManage && !u.isYou && !u.isOwner && (
                    <button
                      type="button"
                      onClick={() => removeMutation.mutate(u.id)}
                      disabled={removeMutation.isPending}
                      className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                    >
                      Remove
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* Pending invites */}
        {invites.length > 0 && (
          <section className="mt-10">
            <h2 className="m-0 mb-4 text-base font-bold text-slate-900">Pending invites</h2>
            <div className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm">
              <div className="divide-y divide-slate-100">
                {invites.map((inv) => (
                  <div key={inv.id} className="flex items-center justify-between gap-4 px-4 py-4 md:px-5">
                    <div className="min-w-0">
                      <p className="m-0 truncate text-sm font-bold text-slate-900">{inv.email}</p>
                      <p className="m-0 mt-0.5 truncate text-xs text-slate-500">
                        Invited {formatDate(inv.invitedAt)} · expires {formatDate(inv.expiresAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <RoleBadge roleKey={inv.roleKey} label={inv.roleLabel} />
                      {canManage && (
                        <button
                          type="button"
                          onClick={() => revokeMutation.mutate(inv.id)}
                          disabled={revokeMutation.isPending}
                          className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Custom roles */}
        <section className="mt-10">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="m-0 text-base font-bold text-slate-900">Your roles</h2>
              <p className="m-0 mt-0.5 text-sm text-slate-500">
                Roles you created, with exactly the access you picked.
              </p>
            </div>
          </div>

          {customRoles.length > 0 ? (
            <div className="grid gap-3 sm:grid-cols-2">
              {customRoles.map((role) => (
                <div key={role.id} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <RoleBadge roleKey={role.id} label={role.name} isCustom />
                      {role.description && (
                        <p className="m-0 mt-2 text-xs text-slate-600">{role.description}</p>
                      )}
                    </div>
                    {canManage && (
                      <div className="flex shrink-0 gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setEditRole(role)
                            setShowRoleBuilder(true)
                          }}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteRoleMutation.mutate(role.id)}
                          disabled={deleteRoleMutation.isPending}
                          className="rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                  <PermissionSummary permissions={role.permissions} modules={modules} />
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-8 text-center">
              <p className="m-0 text-sm font-semibold text-slate-700">No custom roles yet</p>
              <p className="m-0 mt-1 text-xs text-slate-400">
                Create one to grant a very specific set of access.
              </p>
            </div>
          )}
        </section>

        {/* Built-in roles reference */}
        <section className="mt-10">
          <h2 className="m-0 mb-1 text-base font-bold text-slate-900">Built-in roles</h2>
          <p className="m-0 mb-4 text-sm text-slate-500">
            Ready-made presets. Your role: <strong className="text-slate-700">{roleLabel}</strong>
          </p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {presetRoles.map((role) => (
              <div key={role.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <RoleBadge roleKey={role.key} label={role.label} />
                <p className="m-0 mt-2 text-xs text-slate-600">{role.description}</p>
                <PermissionSummary permissions={role.permissions} modules={modules} />
              </div>
            ))}
          </div>
        </section>
      </div>

      {showAdd && (
        <AddCompanyUserModal
          roleOptions={roleOptions}
          presetKeys={presetKeys}
          onClose={() => setShowAdd(false)}
          onSuccess={refresh}
        />
      )}

      {showRoleBuilder && (
        <RoleBuilderModal
          modules={modules}
          role={editRole}
          onClose={() => {
            setShowRoleBuilder(false)
            setEditRole(null)
          }}
          onSuccess={refresh}
        />
      )}
    </EnterpriseLayout>
  )
}

export default CompanyUsers

import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import Button from '../common/Button'
import Input from '../common/Input'
import { createCompanyUser, inviteCompanyUser } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'

/** Turn the selected option back into the shape the API wants. */
function roleBody(value, presetKeys) {
  return presetKeys.includes(value) ? { companyRole: value } : { companyRoleId: value }
}

function AddCompanyUserModal({ roleOptions, presetKeys, onClose, onSuccess }) {
  const { toast } = useToast()
  // Direct = admin sets the password now. Invite = email them a set-password link.
  const [mode, setMode] = useState('direct')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [roleValue, setRoleValue] = useState(roleOptions[0]?.value || '')
  const [error, setError] = useState('')
  const [created, setCreated] = useState(null)
  const [invite, setInvite] = useState(null)
  const [copied, setCopied] = useState(false)

  const selected = roleOptions.find((r) => r.value === roleValue)

  /*
   * Trim the password before sending. This is an admin-set password that gets
   * read off the screen and handed over, so a stray leading/trailing space
   * (autofill, copy-paste) would silently lock the person out forever. What the
   * admin sees on the confirmation screen must be exactly what was stored.
   */
  const cleanPassword = password.trim()

  const createMutation = useMutation({
    mutationFn: () =>
      createCompanyUser({
        email: email.trim(),
        password: cleanPassword,
        ...roleBody(roleValue, presetKeys),
      }),
    onSuccess: (res) => {
      const data = res?.data || res
      setCreated({ email: email.trim(), password: cleanPassword, roleLabel: data.roleLabel })
      toast('Account created', 'success')
      onSuccess?.()
    },
    onError: (err) => setError(err.message || 'Could not create the account'),
  })

  const inviteMutation = useMutation({
    mutationFn: () =>
      inviteCompanyUser({
        email: email.trim(),
        name: name.trim(),
        ...roleBody(roleValue, presetKeys),
      }),
    onSuccess: (res) => {
      const data = res?.data || res
      setInvite(data)
      toast(data.message || 'Invite sent', data.emailSent ? 'success' : 'info')
      onSuccess?.()
    },
    onError: (err) => setError(err.message || 'Could not send the invite'),
  })

  const busy = createMutation.isPending || inviteMutation.isPending

  const submit = (e) => {
    e.preventDefault()
    setError('')
    if (!roleValue) {
      setError('Select a role')
      return
    }
    if (mode === 'direct') {
      if (cleanPassword.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
      createMutation.mutate()
    } else {
      inviteMutation.mutate()
    }
  }

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast('Could not copy', 'error')
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <button type="button" className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onClose} aria-label="Close" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-3xl bg-white p-6 shadow-2xl sm:rounded-3xl">
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

        <h3 className="m-0 pr-10 text-lg font-extrabold text-slate-900">Add team member</h3>

        {/* Created — show the credentials once so they can be handed over */}
        {created ? (
          <div className="mt-5 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="m-0 text-sm font-bold text-slate-800">Account ready</p>
            <p className="m-0 mt-1 text-xs text-slate-600">
              Share these credentials. They can sign in at the employer login right away.
            </p>
            <div className="mt-3 space-y-2 rounded-lg border border-slate-200 bg-white p-3 text-sm">
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Email</span>
                <span className="font-semibold text-slate-900">{created.email}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Password</span>
                <span className="font-mono font-semibold text-slate-900">{created.password}</span>
              </div>
              <div className="flex justify-between gap-3">
                <span className="text-slate-500">Role</span>
                <span className="font-semibold text-slate-900">{created.roleLabel}</span>
              </div>
            </div>
            <div className="mt-4 flex gap-3">
              <Button
                type="button"
                variant="secondary"
                className="flex-1"
                onClick={() => copy(`Email: ${created.email}\nPassword: ${created.password}`)}
              >
                {copied ? 'Copied!' : 'Copy credentials'}
              </Button>
              <Button type="button" className="flex-1" onClick={onClose}>
                Done
              </Button>
            </div>
          </div>
        ) : invite ? (
          <div className="mt-5 rounded-xl border border-blue-100 bg-blue-50 p-4">
            <p className="m-0 text-sm font-bold text-slate-800">Invite created for {invite.email}</p>
            <p className="m-0 mt-1 text-xs text-slate-600">
              {invite.emailSent
                ? 'We emailed them a link to set their password.'
                : 'Email not sent — share this link so they can set their password.'}
            </p>
            <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2">
              <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{invite.inviteLink}</span>
              <button
                type="button"
                onClick={() => copy(invite.inviteLink)}
                className="shrink-0 rounded-md bg-brand-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-brand-700"
              >
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            <Button type="button" className="mt-4 w-full" onClick={onClose}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="mt-4 flex rounded-xl bg-slate-100 p-1">
              {[
                { id: 'direct', label: 'Set password' },
                { id: 'invite', label: 'Email invite' },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => {
                    setMode(t.id)
                    setError('')
                  }}
                  className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
                    mode === t.id ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
            <p className="m-0 mt-2 text-xs text-slate-500">
              {mode === 'direct'
                ? 'You set the password and hand it over — works without any email setup.'
                : 'They get a link and choose their own password. Needs SMTP configured.'}
            </p>

            <form className="mt-4 flex flex-col gap-4" onSubmit={submit}>
              {/* autoComplete="off" + non-standard names: this form creates an account
                  for someone else, so the browser must not autofill the admin's own
                  saved credentials into it. */}
              <Input
                id="cu-email"
                name="new-member-email"
                label="Work Email"
                type="email"
                required
                autoComplete="off"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@yourcompany.com"
                hint="This is their login ID"
                disabled={busy}
              />

              {mode === 'invite' && (
                <Input
                  id="cu-name"
                  label="Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Optional"
                  disabled={busy}
                />
              )}

              {mode === 'direct' && (
                <Input
                  id="cu-password"
                  name="new-member-password"
                  label="Password"
                  type="text"
                  required
                  autoComplete="off"
                  spellCheck="false"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  hint="Visible on purpose — this is what you hand over"
                  disabled={busy}
                />
              )}

              <div>
                <label className="text-[13px] font-semibold text-ink-body">Role</label>
                <select
                  value={roleValue}
                  onChange={(e) => setRoleValue(e.target.value)}
                  disabled={busy}
                  className="mt-1.5 h-11 w-full rounded-ctl border border-line bg-surface px-3 text-sm outline-none focus:border-brand-500 focus:ring-2 focus:ring-brand-500/25"
                >
                  {roleOptions.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                      {r.isCustom ? ' (custom)' : ''}
                    </option>
                  ))}
                </select>
                <p className="m-0 mt-1.5 min-h-4 text-xs text-slate-500">{selected?.description || ''}</p>
              </div>

              {error && <p className="m-0 text-xs font-medium text-danger">{error}</p>}

              <div className="mt-1 flex gap-3">
                <Button type="button" variant="secondary" className="flex-1" onClick={onClose} disabled={busy}>
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={busy || !email.trim()}>
                  {busy ? 'Working…' : mode === 'direct' ? 'Create account' : 'Send invite'}
                </Button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  )
}

export default AddCompanyUserModal

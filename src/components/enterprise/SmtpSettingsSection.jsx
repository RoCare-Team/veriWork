import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { enterpriseKeys, fetchSmtpSettings, updateSmtpSettings, sendSmtpTest } from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'
import Button from '../common/Button'

const EMPTY = {
  host: '',
  port: 587,
  secure: false,
  username: '',
  password: '',
  senderName: '',
  senderEmail: '',
}

function unwrap(res) {
  return res?.data || res || {}
}

function SmtpSettingsSection() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [form, setForm] = useState(EMPTY)
  const [hasPassword, setHasPassword] = useState(false)

  const { data, isLoading } = useQuery({
    queryKey: enterpriseKeys.smtpSettings,
    queryFn: fetchSmtpSettings,
  })

  const settings = unwrap(data)

  useEffect(() => {
    if (!data) return
    const s = unwrap(data)
    setForm({
      host: s.host || '',
      port: s.port || 587,
      secure: Boolean(s.secure),
      username: s.username || '',
      password: '',
      senderName: s.senderName || '',
      senderEmail: s.senderEmail || s.defaultSenderEmail || '',
    })
    setHasPassword(Boolean(s.hasPassword))
  }, [data])

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value
    setForm((f) => ({ ...f, [key]: value }))
  }

  const saveMutation = useMutation({
    mutationFn: () =>
      updateSmtpSettings({
        host: form.host.trim(),
        port: Number(form.port) || 587,
        secure: form.secure,
        username: form.username.trim(),
        // Only send password if the user typed a new one (write-only field)
        ...(form.password ? { password: form.password } : {}),
        senderName: form.senderName.trim(),
        senderEmail: form.senderEmail.trim(),
      }),
    onSuccess: (res) => {
      const s = unwrap(res)
      setHasPassword(Boolean(s.hasPassword))
      setForm((f) => ({ ...f, password: '' }))
      queryClient.setQueryData(enterpriseKeys.smtpSettings, res)
      toast(s.configured ? 'SMTP settings saved' : 'SMTP settings saved (incomplete — add a password to enable sending)', 'success')
    },
    onError: (err) => toast(err.message || 'Failed to save SMTP settings', 'error'),
  })

  const testMutation = useMutation({
    mutationFn: () => sendSmtpTest({}),
    onSuccess: (res) => {
      const r = unwrap(res)
      toast(r.sent ? `Test email sent to ${r.to}` : 'Test not sent — check configuration', r.sent ? 'success' : 'error')
    },
    onError: (err) => toast(err.message || 'SMTP test failed', 'error'),
  })

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <h3 className="m-0 text-base font-bold text-slate-900">SMTP Settings</h3>
        <p className="mt-3 text-sm text-slate-500">Loading…</p>
      </section>
    )
  }

  const inputClass =
    'mt-2 h-11 w-full rounded-xl border border-slate-200 bg-white px-3.5 text-sm text-slate-800 outline-none focus:border-[#1e3a8a]'

  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="m-0 text-base font-bold text-slate-900">SMTP Settings</h3>
          <p className="m-0 mt-1 text-xs text-slate-500">
            Configure your mail server once — all employment verification emails are sent from here.
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${
            settings.configured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'
          }`}
        >
          {settings.configured ? 'Active' : 'Not configured'}
        </span>
      </div>

      <form
        className="mt-5 space-y-4"
        onSubmit={(e) => {
          e.preventDefault()
          saveMutation.mutate()
        }}
      >
        <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
          <div>
            <label className="text-sm font-semibold text-slate-700">SMTP Host</label>
            <input
              type="text"
              value={form.host}
              onChange={update('host')}
              placeholder="smtp.yourprovider.com"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Port</label>
            <input
              type="number"
              value={form.port}
              onChange={update('port')}
              placeholder="587"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Username</label>
            <input
              type="text"
              value={form.username}
              onChange={update('username')}
              placeholder="mailer@yourcompany.com"
              autoComplete="off"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Password</label>
            <input
              type="password"
              value={form.password}
              onChange={update('password')}
              placeholder={hasPassword ? '•••••••• (unchanged)' : 'SMTP password / app key'}
              autoComplete="new-password"
              className={inputClass}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-sm font-semibold text-slate-700">Sender Name</label>
            <input
              type="text"
              value={form.senderName}
              onChange={update('senderName')}
              placeholder="Your Company HR"
              className={inputClass}
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-slate-700">Sender Email</label>
            <input
              type="email"
              value={form.senderEmail}
              onChange={update('senderEmail')}
              placeholder={settings.defaultSenderEmail || 'no-reply@yourcompany.com'}
              className={inputClass}
            />
            <p className="mt-1 text-[11px] text-slate-400">
              Defaults to your registered email{settings.defaultSenderEmail ? ` (${settings.defaultSenderEmail})` : ''}.
            </p>
          </div>
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.secure} onChange={update('secure')} />
          <span className="font-semibold text-slate-700">Use SSL/TLS (secure connection, usually port 465)</span>
        </label>

        <div className="flex flex-wrap gap-3 pt-1">
          <Button type="submit" disabled={saveMutation.isPending}>
            {saveMutation.isPending ? 'Saving…' : 'Save SMTP settings'}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => testMutation.mutate()}
            disabled={testMutation.isPending || !settings.configured}
          >
            {testMutation.isPending ? 'Sending…' : 'Send test email'}
          </Button>
        </div>
        {!settings.configured && (
          <p className="m-0 text-[11px] text-slate-400">
            Save a complete configuration (host, username, password, sender email) to enable test emails and live sending.
          </p>
        )}
      </form>
    </section>
  )
}

export default SmtpSettingsSection

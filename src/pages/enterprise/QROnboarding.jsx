import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import {
  createQrOnboarding,
  deleteQrOnboarding,
  enterpriseKeys,
  fetchQrOnboarding,
  setQrOnboardingActive,
} from '../../api/enterprise'
import { useToast } from '../../context/ToastContext'
import { formatDate } from '../../utils/formatters'

function unwrap(res) {
  return res?.data || res || {}
}

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text)
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        } catch {
          /* clipboard blocked */
        }
      }}
      className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold transition ${
        copied
          ? 'bg-emerald-50 text-emerald-700'
          : 'border border-brand-600/30 bg-brand-600/5 text-brand-600 hover:bg-brand-600/10'
      }`}
    >
      {copied ? 'Copied!' : 'Copy link'}
    </button>
  )
}

function QrCard({ qr, onToggle, onDelete, busy }) {
  const download = () => {
    const a = document.createElement('a')
    a.href = qr.qrImage
    a.download = `${qr.label.replace(/\s+/g, '-').toLowerCase()}-qr.png`
    a.click()
  }

  return (
    <article className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-col gap-4 p-5 sm:flex-row">
        <img
          src={qr.qrImage}
          alt={`QR code for ${qr.label}`}
          className={`h-32 w-32 shrink-0 rounded-xl border border-slate-100 ${
            qr.isActive ? '' : 'opacity-40 grayscale'
          }`}
        />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0">
              <h3 className="m-0 truncate text-base font-bold text-slate-900">{qr.label}</h3>
              <p className="m-0 mt-0.5 text-xs text-slate-500">
                {[qr.designation, qr.department].filter(Boolean).join(' · ') || 'Any role'} ·{' '}
                {formatDate(qr.createdAt)}
              </p>
            </div>
            <span
              className={`shrink-0 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${
                qr.isActive ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
              }`}
            >
              {qr.isActive ? 'Active' : 'Paused'}
            </span>
          </div>

          <div className="mt-3 flex gap-5">
            <div>
              <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Scans</p>
              <p className="m-0 text-lg font-extrabold text-slate-900">{qr.scans}</p>
            </div>
            <div>
              <p className="m-0 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Invited</p>
              <p className="m-0 text-lg font-extrabold text-brand-600">{qr.joined}</p>
            </div>
          </div>

          <div className="mt-3 flex items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2">
            <span className="min-w-0 flex-1 truncate text-xs text-slate-600">{qr.joinLink}</span>
            <CopyButton text={qr.joinLink} />
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={download}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Download QR
            </button>
            <button
              type="button"
              onClick={() => onToggle(qr)}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
            >
              {qr.isActive ? 'Pause' : 'Activate'}
            </button>
            <button
              type="button"
              onClick={() => onDelete(qr)}
              disabled={busy}
              className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </article>
  )
}

function QROnboarding() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [label, setLabel] = useState('')
  const [department, setDepartment] = useState('')
  const [designation, setDesignation] = useState('')

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.qr,
    queryFn: fetchQrOnboarding,
  })

  const qrCodes = unwrap(data).qrCodes || []
  const refresh = () => queryClient.invalidateQueries({ queryKey: enterpriseKeys.qr })

  const createMutation = useMutation({
    mutationFn: () =>
      createQrOnboarding({
        label: label.trim(),
        ...(department.trim() ? { department: department.trim() } : {}),
        ...(designation.trim() ? { designation: designation.trim() } : {}),
      }),
    onSuccess: () => {
      toast('QR code generated', 'success')
      setLabel('')
      setDepartment('')
      setDesignation('')
      refresh()
    },
    onError: (err) => toast(err.message || 'Failed to generate QR code', 'error'),
  })

  const toggleMutation = useMutation({
    mutationFn: (qr) => setQrOnboardingActive(qr.id, !qr.isActive),
    onSuccess: () => refresh(),
    onError: (err) => toast(err.message || 'Failed to update QR code', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (qr) => deleteQrOnboarding(qr.id),
    onSuccess: () => {
      toast('QR code deleted', 'success')
      refresh()
    },
    onError: (err) => toast(err.message || 'Failed to delete QR code', 'error'),
  })

  const busy = toggleMutation.isPending || deleteMutation.isPending

  if (isLoading) return <Loader variant="fullPage" label="Loading QR codes..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <div>
          <h1 className="m-0 text-xl font-extrabold text-slate-900 md:text-2xl">QR &amp; Onboarding</h1>
          <p className="m-0 mt-0.5 text-sm text-slate-500">
            Print or share a QR — candidates scan it and fill the same details you'd enter when
            inviting them. Track them under{' '}
            <Link to="/company/team" className="font-semibold text-brand-600 no-underline hover:underline">
              Team Management → Pending invitations
            </Link>
            .
          </p>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </p>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-[380px_1fr]">
          <section className="h-fit rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="m-0 text-base font-bold text-slate-900">Create QR code</h2>
            <p className="m-0 mt-1 text-xs text-slate-500">
              Give it a label so you can tell campaigns apart.
            </p>
            <form
              className="mt-4 flex flex-col gap-4"
              onSubmit={(e) => {
                e.preventDefault()
                createMutation.mutate()
              }}
            >
              <Input
                id="qr-label"
                label="Campaign Label"
                required
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                placeholder="Campus Hiring 2026"
                disabled={createMutation.isPending}
              />
              <Input
                id="qr-department"
                label="Department"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Optional"
                hint="Pre-fills for whoever scans this code"
                disabled={createMutation.isPending}
              />
              <Input
                id="qr-designation"
                label="Role / Designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                placeholder="Optional"
                disabled={createMutation.isPending}
              />
              <Button type="submit" className="w-full" disabled={createMutation.isPending || !label.trim()}>
                {createMutation.isPending ? 'Generating…' : 'Generate QR Code'}
              </Button>
            </form>
          </section>

          <section>
            <h2 className="m-0 mb-4 text-base font-bold text-slate-900">
              Your QR codes{qrCodes.length > 0 ? ` (${qrCodes.length})` : ''}
            </h2>
            {qrCodes.length > 0 ? (
              <div className="flex flex-col gap-4">
                {qrCodes.map((qr) => (
                  <QrCard
                    key={qr.id}
                    qr={qr}
                    busy={busy}
                    onToggle={(item) => toggleMutation.mutate(item)}
                    onDelete={(item) => deleteMutation.mutate(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
                <p className="m-0 text-sm font-semibold text-slate-700">No QR codes yet</p>
                <p className="m-0 mt-1 text-xs text-slate-400">
                  Create one and share it at drives, walk-ins or on your careers page.
                </p>
              </div>
            )}
          </section>
        </div>
      </div>
    </EnterpriseLayout>
  )
}

export default QROnboarding

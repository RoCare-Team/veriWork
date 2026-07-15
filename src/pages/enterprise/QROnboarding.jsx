import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import { createQrOnboarding, enterpriseKeys, fetchQrOnboarding } from '../../api/enterprise'

function QROnboarding() {
  const queryClient = useQueryClient()
  const [label, setLabel] = useState('')
  const [error, setError] = useState('')
  const [latestCode, setLatestCode] = useState(null)

  const { data: qrList = [], isLoading, error: fetchError } = useQuery({
    queryKey: enterpriseKeys.qr,
    queryFn: fetchQrOnboarding,
  })

  const createMutation = useMutation({
    mutationFn: () => createQrOnboarding(label.trim()),
    onSuccess: (data) => {
      setError('')
      setLabel('')
      setLatestCode(data.code)
      queryClient.invalidateQueries({ queryKey: enterpriseKeys.qr })
    },
    onError: (err) => setError(err.message || 'Failed to create QR code'),
  })

  const handleCreate = (e) => {
    e.preventDefault()
    if (!label.trim()) {
      setError('Enter a label for this QR code')
      return
    }
    createMutation.mutate()
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading QR codes..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader title="QR & Onboarding" />

        <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-slate-500">
          Generate secure entry points for new hires with department-specific routing and verification tokens.
        </p>

        {fetchError && <p className="mb-4 text-sm text-red-600">{fetchError.message}</p>}

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
            <h3 className="m-0 mb-4 text-base font-bold text-slate-900">Create QR Code</h3>
            <form onSubmit={handleCreate} className="flex flex-col gap-4">
              <Input
                id="qr-label"
                label="Campaign Label"
                placeholder="Campus Hiring 2026"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                disabled={createMutation.isPending}
              />
              {error && <p className="m-0 text-sm text-red-600">{error}</p>}
              <Button type="submit" disabled={createMutation.isPending}>
                {createMutation.isPending ? 'Generating...' : 'Generate QR Code'}
              </Button>
            </form>

            {latestCode && (
              <div className="mt-6 rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm font-semibold text-slate-700">
                Latest code: {latestCode}
              </div>
            )}

            <div className="mt-6 flex aspect-square max-h-[200px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="grid grid-cols-4 gap-1 p-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-6 w-6 rounded-sm ${i % 3 === 0 ? 'bg-[#005fd6]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>
          </section>

          <section>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="m-0 text-base font-bold text-slate-900">Recent Generations</h3>
            </div>
            <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
              {qrList.length > 0 ? (
                qrList.map((item, i) => (
                  <div
                    key={item._id}
                    className={`flex items-center gap-3 px-4 py-4 ${i > 0 ? 'border-t border-slate-100' : ''}`}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-50 text-slate-500">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 truncate text-sm font-semibold text-slate-900">{item.label}</p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {item.code} · {item.scans} scans · {item.joined} joined
                        {!item.isActive && ' · Inactive'}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-sm text-slate-500">No QR codes yet</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </EnterpriseLayout>
  )
}

export default QROnboarding

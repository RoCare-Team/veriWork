import { useState } from 'react'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import Button from '../../components/common/Button'
import Select from '../../components/common/Select'
import { DEPARTMENTS, QR_RECENT } from '../../utils/enterpriseData'

const ONBOARDING_TOOLS = [
  {
    id: 'permanent',
    title: 'Permanent Company QR',
    description: 'Static QR for office reception or recruitment flyers.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
        <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="3" height="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    id: 'temporary',
    title: 'Temporary Joining Link',
    description: 'Expires in 24 hours. Best for specific hiring batches.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="12" cy="13" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path d="M12 9v4l2 2M10 2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'bulk',
    title: 'Bulk Onboarding',
    description: 'Upload CSV to generate personalized QR codes for 50+ hires.',
    icon: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

const SECURITY_LEVELS = ['Standard', 'Strict (2FA)', 'Single Use']

function QROnboarding() {
  const [department, setDepartment] = useState('Engineering')
  const [security, setSecurity] = useState('Standard')

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader
          title="QR & Onboarding"
          action={
            <button
              type="button"
              className="flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              aria-label="Info"
            >
              i
            </button>
          }
        />

        <p className="-mt-4 mb-8 max-w-2xl text-sm leading-relaxed text-slate-500">
          Generate secure entry points for new hires with department-specific
          routing and verification tokens.
        </p>

        <div className="grid grid-cols-1 gap-8 xl:grid-cols-2">
          {/* Left column */}
          <div className="space-y-8">
            <section>
              <h3 className="m-0 mb-4 text-base font-bold text-slate-900">
                Onboarding Tools
              </h3>
              <div className="flex flex-col gap-3">
                {ONBOARDING_TOOLS.map((tool) => (
                  <button
                    key={tool.id}
                    type="button"
                    className="flex items-center gap-4 rounded-2xl border border-slate-100 bg-white p-4 text-left shadow-sm transition hover:border-slate-200 hover:shadow-md"
                  >
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-50 text-[#1a3a8f]">
                      {tool.icon}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="m-0 text-sm font-bold text-slate-900">{tool.title}</p>
                      <p className="mt-0.5 text-xs leading-relaxed text-slate-500">
                        {tool.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-slate-300">›</span>
                  </button>
                ))}
              </div>
            </section>

            <section>
              <div className="mb-4 flex items-center justify-between">
                <h3 className="m-0 text-base font-bold text-slate-900">
                  Recent Generations
                </h3>
                <button type="button" className="text-xs font-semibold text-[#1a3a8f] hover:underline">
                  View History
                </button>
              </div>
              <div className="rounded-2xl border border-slate-100 bg-white shadow-sm">
                {QR_RECENT.map((item, i) => (
                  <div
                    key={item.id}
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
                      <p className="m-0 truncate text-sm font-semibold text-slate-900">
                        {item.title}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">{item.meta}</p>
                    </div>
                    <button
                      type="button"
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50 hover:text-[#1a3a8f]"
                      aria-label="Download"
                    >
                      ↓
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column — QR Generator */}
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
            <div className="mb-5 flex items-center justify-between">
              <h3 className="m-0 text-base font-bold text-slate-900">QR Generator</h3>
              <button
                type="button"
                className="rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-bold text-green-700"
              >
                Live Preview
              </button>
            </div>

            <div className="mb-5 rounded-xl bg-slate-50 px-4 py-3 font-mono text-sm font-semibold text-slate-600">
              ID: VW-ENG-2024-X
            </div>

            <Select
              id="department"
              label="Department Routing"
              options={DEPARTMENTS}
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />

            <div className="mt-5">
              <p className="mb-2 text-sm font-semibold text-slate-800">Security Level</p>
              <div className="flex flex-wrap gap-2">
                {SECURITY_LEVELS.map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setSecurity(level)}
                    className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                      security === level
                        ? 'border-[#1a3a8f] bg-blue-50 text-[#1a3a8f]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {level}
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-6 flex aspect-square max-h-[200px] w-full items-center justify-center rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50">
              <div className="grid grid-cols-4 gap-1 p-4">
                {Array.from({ length: 16 }).map((_, i) => (
                  <div
                    key={i}
                    className={`h-6 w-6 rounded-sm ${i % 3 === 0 ? 'bg-[#1a3a8f]' : 'bg-transparent'}`}
                  />
                ))}
              </div>
            </div>

            <Button type="button" className="mt-6">
              Download High-Res QR
            </Button>
          </section>
        </div>
      </div>
    </EnterpriseLayout>
  )
}

export default QROnboarding

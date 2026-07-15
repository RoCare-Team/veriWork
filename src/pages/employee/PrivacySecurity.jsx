import { useState } from 'react'
import { Link } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SectionTitle from '../../components/common/SectionTitle'
import Toggle from '../../components/employee/Toggle'
import { FingerprintIcon, LockIcon, ShieldCheckIcon } from '../../components/common/Icons'
import { ACTIVE_SESSIONS } from '../../utils/employeePortalData'

function PrivacySecurity() {
  const [recruiterAccess, setRecruiterAccess] = useState(true)
  const [documentPrivacy, setDocumentPrivacy] = useState(true)
  const [accessHistory, setAccessHistory] = useState(true)
  const [biometric, setBiometric] = useState(true)

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Privacy & Security"
        subtitle="Control who can access your credentials"
      />

      <section>
        <SectionTitle>Consent Control</SectionTitle>
        <div className="mt-5 flex flex-col gap-3">
          <div className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
            <div className="flex items-start gap-3">
              <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#005fd6]" />
              <div className="flex-1">
                <p className="m-0 text-sm font-bold text-slate-900">Recruiter Access</p>
                <p className="m-0 mt-1 text-xs text-slate-500 md:text-sm">
                  Require approval for recruiters to view your full profile.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={recruiterAccess}
                onClick={() => setRecruiterAccess(!recruiterAccess)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${recruiterAccess ? 'bg-[#005fd6]' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${recruiterAccess ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#005fd6]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M3 10s3-5 7-5 7 5 7 5-3 5-7 5-7-5-7-5Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" stroke="currentColor" strokeWidth="1.5" />
                <path d="M3 3l14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="flex-1">
                <p className="m-0 text-sm font-bold text-slate-900">Document Privacy</p>
                <p className="m-0 mt-1 text-xs text-slate-500 md:text-sm">
                  Hide sensitive documents until explicit request is approved.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={documentPrivacy}
                onClick={() => setDocumentPrivacy(!documentPrivacy)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${documentPrivacy ? 'bg-[#005fd6]' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${documentPrivacy ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
            <div className="flex items-start gap-3">
              <svg className="mt-0.5 h-5 w-5 shrink-0 text-[#005fd6]" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
                <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
              <div className="flex-1">
                <p className="m-0 text-sm font-bold text-slate-900">Access History</p>
                <p className="m-0 mt-1 text-xs text-slate-500 md:text-sm">
                  Keep a log of everyone who viewed your credentials.
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={accessHistory}
                onClick={() => setAccessHistory(!accessHistory)}
                className={`relative h-7 w-12 shrink-0 rounded-full transition ${accessHistory ? 'bg-[#005fd6]' : 'bg-slate-200'}`}
              >
                <span className={`absolute top-0.5 h-6 w-6 rounded-full bg-white shadow transition ${accessHistory ? 'left-[22px]' : 'left-0.5'}`} />
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-8">
        <SectionTitle>Security Settings</SectionTitle>
        <div className="mt-5 flex flex-col gap-3">
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
            <div className="flex items-center gap-3">
              <ShieldCheckIcon className="h-5 w-5 text-[#005fd6]" />
              <div>
                <p className="m-0 text-sm font-bold text-slate-900">Two-Factor Auth</p>
                <p className="m-0 text-xs text-slate-500">Highly Recommended</p>
              </div>
            </div>
            <button type="button" className="rounded-xl border border-[#005fd6] px-4 py-2 text-sm font-semibold text-[#005fd6] hover:bg-blue-50">
              Enable
            </button>
          </div>

          <Toggle
            id="biometric-login"
            label="Biometric Login"
            icon={<FingerprintIcon className="h-5 w-5 text-slate-400" />}
            checked={biometric}
            onChange={setBiometric}
          />
        </div>
      </section>

      <section className="mt-8">
        <div className="mb-4 flex items-center justify-between">
          <SectionTitle>Active Sessions</SectionTitle>
          <button type="button" className="text-sm font-semibold text-red-500 hover:underline">
            Log out all
          </button>
        </div>
        <div className="flex flex-col gap-3">
          {ACTIVE_SESSIONS.map((session) => (
            <div
              key={session.id}
              className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 md:p-5"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <rect x="5.5" y="2.5" width="9" height="15" rx="2" stroke="currentColor" strokeWidth="1.5" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="m-0 text-sm font-bold text-slate-900">
                  {session.device}
                  {session.current && (
                    <span className="ml-2 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700">
                      Current
                    </span>
                  )}
                </p>
                <p className="m-0 mt-0.5 text-xs text-slate-500">
                  {session.location} &bull; {session.status}
                </p>
              </div>
              {!session.current && (
                <button type="button" className="text-red-400 hover:text-red-600" aria-label="Log out device">
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M7 10H15M12 7l3 3-3 3M5 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      <Link
        to="/employee/settings"
        className="mt-8 inline-block text-sm font-semibold text-[#005fd6] no-underline hover:underline"
      >
        ← Back to Settings
      </Link>
    </EmployeeLayout>
  )
}

export default PrivacySecurity

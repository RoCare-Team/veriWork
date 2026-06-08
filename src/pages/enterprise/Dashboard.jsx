import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import StatCard from '../../components/enterprise/StatCard'
import JoinRequestCard from '../../components/enterprise/JoinRequestCard'
import FraudAlertCard from '../../components/enterprise/FraudAlertCard'
import ActivityChart from '../../components/enterprise/ActivityChart'
import Button from '../../components/common/Button'

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="14" cy="8" r="2" stroke="currentColor" strokeWidth="1.3" />
      <path d="M12 17c0-2 1.5-3.5 3.5-3.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function HandIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M8 10V5a1.5 1.5 0 0 1 3 0v5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M11 10V4a1.5 1.5 0 0 1 3 0v7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M5 10V7a1.5 1.5 0 0 1 3 0v6l-1 4H6l-1-4" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
    </svg>
  )
}

function ShieldIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 7v4M10 13h.01" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

const JOIN_REQUESTS = [
  { initials: 'AM', name: 'Arjun Mehta', role: 'Senior Dev • Engineering', employeeScore: 824 },
  { initials: 'PS', name: 'Priya Sharma', role: 'Product Manager • Product', employeeScore: 798 },
  { initials: 'RK', name: 'Rahul Kumar', role: 'Data Analyst • Analytics', employeeScore: 771 },
]

const FRAUD_ALERTS = [
  {
    title: 'Document Tampering Detected',
    description: 'Suspicious edit patterns found in uploaded certificate.',
  },
  {
    title: 'Identity Mismatch Alert',
    description: 'Employee ID does not match government records.',
  },
]

function Dashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(searchParams.get('verified') === 'true')

  useEffect(() => {
    if (!showSuccess) return
    const timer = window.setTimeout(() => {
      setShowSuccess(false)
      setSearchParams({}, { replace: true })
    }, 6000)
    return () => window.clearTimeout(timer)
  }, [showSuccess, setSearchParams])

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 pb-24 md:px-6 md:py-8 lg:px-8">
        <div className="hidden lg:block">
          <PageHeader
            title="Workforce Overview"
            subtitle="Monitor verification activity and team metrics"
          />
        </div>

        <div className="mb-6 lg:hidden">
          <h2 className="m-0 text-xl font-extrabold tracking-tight text-slate-900">
            Workforce Overview
          </h2>
        </div>

        {showSuccess && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm md:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
              ✓
            </div>
            <div>
              <p className="m-0 text-sm font-bold text-green-800">
                Verification submitted successfully!
              </p>
              <p className="mt-1 text-sm leading-relaxed text-green-700/80">
                Your company profile is under review. Welcome to your employer
                dashboard.
              </p>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
          <StatCard icon={<PeopleIcon />} label="Total Employees" value="1,284" accent="blue" trend="+12" />
          <StatCard icon={<CheckIcon />} label="Verified" value="1,156" accent="green" trend="90%" />
          <StatCard icon={<HandIcon />} label="Join Requests" value="24" accent="orange" trend="New" />
          <StatCard icon={<ShieldIcon />} label="Fraud Alerts" value="3" accent="red" trend="Active" />
        </div>

        {/* Chart + Join requests */}
        <div className="mt-6 grid grid-cols-1 gap-5 xl:mt-8 xl:grid-cols-5 xl:gap-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-3 xl:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-base font-bold text-slate-900">
                  Verification Activity
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">Weekly verification trend</p>
              </div>
              <select className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600 outline-none focus:border-[#1a3a8f]">
                <option>Last 7 Days</option>
                <option>Last 30 Days</option>
              </select>
            </div>
            <ActivityChart />
          </section>

          <section className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="m-0 text-base font-bold text-slate-900">
                  Pending Join Requests
                </h3>
                <p className="mt-0.5 text-xs text-slate-400">{JOIN_REQUESTS.length} awaiting review</p>
              </div>
              <Link to="/enterprise/join-requests" className="text-xs font-semibold text-[#1a3a8f] hover:underline">
                View All
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {JOIN_REQUESTS.map((req) => (
                <JoinRequestCard key={req.initials} {...req} />
              ))}
            </div>
          </section>
        </div>

        {/* Fraud alerts + QR CTA */}
        <div className="mt-6 grid grid-cols-1 gap-5 xl:mt-8 xl:grid-cols-3 xl:gap-6">
          <section className="xl:col-span-2">
            <div className="mb-4">
              <h3 className="m-0 text-base font-bold text-slate-900">
                Real-time Fraud Alerts
              </h3>
              <p className="mt-0.5 text-xs text-slate-400">Requires immediate attention</p>
            </div>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              {FRAUD_ALERTS.map((alert) => (
                <FraudAlertCard key={alert.title} {...alert} />
              ))}
            </div>
          </section>

          <section className="flex flex-col justify-center rounded-2xl border border-slate-100 bg-gradient-to-br from-[#1a3a8f] to-[#2747b2] p-6 text-white shadow-lg">
            <p className="m-0 text-xs font-bold uppercase tracking-widest text-white/60">
              Quick Action
            </p>
            <h3 className="mt-2 text-lg font-extrabold leading-snug">
              Generate Joining QR for new employees
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Share a secure QR code so employees can join and verify instantly.
            </p>
            <Link to="/enterprise/qr-onboarding">
              <Button type="button">Generate Joining QR</Button>
            </Link>
          </section>
        </div>
      </div>

      {/* Mobile fixed CTA */}
      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-md xl:hidden">
        <Link to="/enterprise/qr-onboarding">
          <Button type="button">Generate Joining QR</Button>
        </Link>
      </div>
    </EnterpriseLayout>
  )
}

export default Dashboard

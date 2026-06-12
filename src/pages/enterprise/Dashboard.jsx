import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import StatCard from '../../components/enterprise/StatCard'
import JoinRequestCard from '../../components/enterprise/JoinRequestCard'
import ActivityChart from '../../components/enterprise/ActivityChart'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { enterpriseKeys, fetchDashboard, fetchJoinRequests } from '../../api/enterprise'
import { useAuth } from '../../context/AuthContext'
import { getInitials } from '../../utils/formatters'

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

function Dashboard() {
  const navigate = useNavigate()
  const { company, updateCompanyState } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(searchParams.get('verified') === 'true')

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.dashboard,
    queryFn: fetchDashboard,
  })

  useEffect(() => {
    if (error?.status === 403) {
      updateCompanyState({ ...company, approvalStatus: 'submitted' })
      navigate('/enterprise/pending-approval', { replace: true })
    }
  }, [error, navigate, company, updateCompanyState])

  const { data: joinRequests = [] } = useQuery({
    queryKey: enterpriseKeys.joinRequests,
    queryFn: fetchJoinRequests,
  })

  const pendingRequests = useMemo(
    () =>
      joinRequests
        .filter((r) => r.status === 'pending')
        .slice(0, 3)
        .map((r) => ({
          initials: getInitials(r.name),
          name: r.name,
          role: `${r.role}${r.department ? ` • ${r.department}` : ''}`,
          employeeScore: r.employeeScore,
        })),
    [joinRequests],
  )

  useEffect(() => {
    if (!showSuccess) return
    const timer = window.setTimeout(() => {
      setShowSuccess(false)
      setSearchParams({}, { replace: true })
    }, 6000)
    return () => window.clearTimeout(timer)
  }, [showSuccess, setSearchParams])

  if (isLoading) return <Loader variant="fullPage" label="Loading dashboard..." />

  const stats = dashboard?.stats || {}

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 pb-24 md:px-6 md:py-8 lg:px-8">
        <div className="hidden lg:block">
          <PageHeader title="Workforce Overview" subtitle="Monitor verification activity and team metrics" />
        </div>

        <div className="mb-6 lg:hidden">
          <h2 className="m-0 text-xl font-extrabold tracking-tight text-slate-900">Workforce Overview</h2>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        {showSuccess && (
          <div className="mb-6 flex items-start gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 shadow-sm md:p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-green-100 text-xl text-green-700">
              ✓
            </div>
            <div>
              <p className="m-0 text-sm font-bold text-green-800">Verification submitted successfully!</p>
              <p className="mt-1 text-sm leading-relaxed text-green-700/80">
                Your company profile is under review. Welcome to your employer dashboard.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
          <StatCard icon={<PeopleIcon />} label="Total Candidates" value={String(stats.totalCandidates ?? 0)} accent="blue" />
          <StatCard icon={<CheckIcon />} label="Approved" value={String(stats.approvedEmployees ?? 0)} accent="green" />
          <StatCard icon={<HandIcon />} label="Join Requests" value={String(stats.pendingRequests ?? 0)} accent="orange" trend="Pending" />
          <StatCard icon={<ShieldIcon />} label="Avg VeriScore" value={String(stats.avgVeriScore ?? 0)} accent="red" />
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:mt-8 xl:grid-cols-5 xl:gap-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-3 xl:p-6">
            <div className="mb-5 flex items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-base font-bold text-slate-900">Verification Activity</h3>
                <p className="mt-0.5 text-xs text-slate-400">Weekly verification trend</p>
              </div>
            </div>
            <ActivityChart />
          </section>

          <section className="xl:col-span-2">
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h3 className="m-0 text-base font-bold text-slate-900">Pending Join Requests</h3>
                <p className="mt-0.5 text-xs text-slate-400">{pendingRequests.length} awaiting review</p>
              </div>
              <Link to="/enterprise/join-requests" className="text-xs font-semibold text-[#1a3a8f] hover:underline">
                View All
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              {pendingRequests.length > 0 ? (
                pendingRequests.map((req) => <JoinRequestCard key={req.name + req.role} {...req} />)
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No pending requests
                </p>
              )}
            </div>
          </section>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:mt-8 xl:grid-cols-3 xl:gap-6">
          <section className="flex flex-col justify-center rounded-2xl border border-slate-100 bg-gradient-to-br from-[#1a3a8f] to-[#2747b2] p-6 text-white shadow-lg xl:col-span-3">
            <p className="m-0 text-xs font-bold uppercase tracking-widest text-white/60">Quick Action</p>
            <h3 className="mt-2 text-lg font-extrabold leading-snug">Generate Joining QR for new employees</h3>
            <p className="mt-2 text-sm leading-relaxed text-white/70">
              Share a secure QR code so employees can join and verify instantly.
            </p>
            <Link to="/enterprise/qr-onboarding" className="mt-4 inline-block">
              <Button type="button">Generate Joining QR</Button>
            </Link>
          </section>
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-md xl:hidden">
        <Link to="/enterprise/qr-onboarding">
          <Button type="button">Generate Joining QR</Button>
        </Link>
      </div>
    </EnterpriseLayout>
  )
}

export default Dashboard

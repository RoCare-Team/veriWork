import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import StatCard from '../../components/enterprise/StatCard'
import JoinRequestCard from '../../components/enterprise/JoinRequestCard'
import PendingInvitationCard from '../../components/enterprise/PendingInvitationCard'
import EmployeeOnboardingTrendChart from '../../components/enterprise/EmployeeOnboardingTrendChart'
import {
  DepartmentDonutChart,
  TrustScoreBarChart,
} from '../../components/enterprise/InsightsCharts'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import {
  enterpriseKeys,
  fetchDashboard,
  fetchInsights,
  fetchJoinRequests,
  fetchPendingInvitations,
  fetchTeam,
} from '../../api/enterprise'
import { useAuth } from '../../context/AuthContext'
import {
  normalizeJoinRequests,
  normalizePendingInvitations,
  buildDashboardPendingItems,
  resolveDashboardStats,
  buildEmployeeOnboardingTrend,
  buildDepartmentDistribution,
  buildDepartmentTrustBars,
  buildTrustScoreDistribution,
} from '../../utils/dashboardUtils'

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" />
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
    </svg>
  )
}

function ChartCard({ title, subtitle, children, className = '' }) {
  return (
    <section className={`rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:p-6 ${className}`}>
      <div className="mb-5">
        <h3 className="m-0 text-base font-bold text-slate-900">{title}</h3>
        {subtitle && <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>}
      </div>
      {children}
    </section>
  )
}

function Dashboard() {
  const navigate = useNavigate()
  const { company, updateCompanyState } = useAuth()
  const [searchParams, setSearchParams] = useSearchParams()
  const [showSuccess, setShowSuccess] = useState(searchParams.get('verified') === 'true')

  const dashboardQuery = useQuery({
    queryKey: enterpriseKeys.dashboard,
    queryFn: fetchDashboard,
  })

  const teamQuery = useQuery({
    queryKey: enterpriseKeys.team,
    queryFn: fetchTeam,
  })

  const joinRequestsQuery = useQuery({
    queryKey: enterpriseKeys.joinRequests,
    queryFn: fetchJoinRequests,
    retry: false,
  })

  const invitationsQuery = useQuery({
    queryKey: enterpriseKeys.invitationsPending,
    queryFn: fetchPendingInvitations,
    retry: false,
  })

  const insightsQuery = useQuery({
    queryKey: enterpriseKeys.insights,
    queryFn: fetchInsights,
    retry: false,
  })

  const { error } = dashboardQuery

  useEffect(() => {
    if (error?.status === 403) {
      updateCompanyState({ ...company, approvalStatus: 'submitted' })
      navigate('/enterprise/pending-approval', { replace: true })
    }
  }, [error, navigate, company, updateCompanyState])

  const joinRequests = useMemo(
    () => normalizeJoinRequests(joinRequestsQuery.data),
    [joinRequestsQuery.data],
  )

  const pendingInvitations = useMemo(
    () => normalizePendingInvitations(invitationsQuery.data),
    [invitationsQuery.data],
  )

  const stats = useMemo(
    () =>
      resolveDashboardStats(dashboardQuery.data, {
        teamData: teamQuery.data,
        joinRequests,
        pendingInvitations,
      }),
    [dashboardQuery.data, teamQuery.data, joinRequests, pendingInvitations],
  )

  const onboardingTrend = useMemo(
    () =>
      buildEmployeeOnboardingTrend({
        joinRequests,
        invitations: pendingInvitations,
        teamData: teamQuery.data,
        dashboard: dashboardQuery.data,
        insights: insightsQuery.data,
      }),
    [
      joinRequests,
      pendingInvitations,
      teamQuery.data,
      dashboardQuery.data,
      insightsQuery.data,
    ],
  )

  const departmentData = useMemo(
    () =>
      buildDepartmentDistribution(teamQuery.data).length
        ? buildDepartmentDistribution(teamQuery.data)
        : insightsQuery.data?.departmentDistribution || [],
    [teamQuery.data, insightsQuery.data],
  )

  const trustBars = useMemo(() => {
    const fromTeam = buildDepartmentTrustBars(teamQuery.data)
    if (fromTeam.length) return fromTeam
    const dist = buildTrustScoreDistribution(teamQuery.data)
    if (dist.some((b) => b.count > 0)) return dist
    return insightsQuery.data?.trustScoreDistribution || []
  }, [teamQuery.data, insightsQuery.data])

  const pendingItems = useMemo(
    () => buildDashboardPendingItems(joinRequests, pendingInvitations, 4),
    [joinRequests, pendingInvitations],
  )

  const pendingLoading = joinRequestsQuery.isLoading || invitationsQuery.isLoading

  useEffect(() => {
    if (!showSuccess) return
    const timer = window.setTimeout(() => {
      setShowSuccess(false)
      setSearchParams({}, { replace: true })
    }, 6000)
    return () => window.clearTimeout(timer)
  }, [showSuccess, setSearchParams])

  if (dashboardQuery.isLoading) return <Loader variant="fullPage" label="Loading dashboard..." />

  const trustChartTitle = buildDepartmentTrustBars(teamQuery.data).length
    ? 'Avg Trust by Department'
    : 'Trust Score Distribution'

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
          <StatCard icon={<PeopleIcon />} label="Total Candidates" value={String(stats.totalCandidates)} accent="blue" />
          <StatCard icon={<CheckIcon />} label="Approved" value={String(stats.approvedEmployees)} accent="green" />
          <StatCard
            icon={<HandIcon />}
            label="Join Requests"
            value={String(stats.pendingRequests)}
            accent="orange"
            trend={stats.pendingRequests > 0 ? 'Pending' : undefined}
          />
          <StatCard icon={<ShieldIcon />} label="Avg VeriScore" value={String(stats.avgVeriScore || '—')} accent="red" />
        </div>

        {/* Main trend + join requests */}
        <div className="mt-6 grid grid-cols-1 gap-5 xl:mt-8 xl:grid-cols-5 xl:gap-6">
          <ChartCard
            title={onboardingTrend.title}
            subtitle={onboardingTrend.subtitle}
            className="xl:col-span-3"
          >
            <EmployeeOnboardingTrendChart
              labels={onboardingTrend.labels}
              series={onboardingTrend.series}
              height={280}
            />
          </ChartCard>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2 xl:p-6">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="m-0 text-base font-bold text-slate-900">Pending Join Requests</h3>
                <p className="mt-0.5 text-xs text-slate-400">
                  {stats.pendingRequests} awaiting review
                  {stats.pendingInvitations > 0 && stats.pendingJoinRequests > 0
                    ? ` · ${stats.pendingJoinRequests} join · ${stats.pendingInvitations} invite`
                    : ''}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                {stats.pendingJoinRequests > 0 && (
                  <Link to="/enterprise/join-requests" className="text-xs font-semibold text-[#1a3a8f] hover:underline">
                    Join requests
                  </Link>
                )}
                {stats.pendingInvitations > 0 && (
                  <Link to="/company/team" className="text-xs font-semibold text-[#1a3a8f] hover:underline">
                    Invitations
                  </Link>
                )}
                {stats.pendingRequests === 0 && (
                  <Link to="/enterprise/join-requests" className="text-xs font-semibold text-[#1a3a8f] hover:underline">
                    View All
                  </Link>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {pendingLoading ? (
                <p className="m-0 py-8 text-center text-sm text-slate-500">Loading pending requests...</p>
              ) : pendingItems.length > 0 ? (
                pendingItems.map((item) =>
                  item.kind === 'invitation' ? (
                    <PendingInvitationCard
                      key={item.id}
                      initials={item.initials}
                      name={item.name}
                      email={item.email}
                      department={item.department}
                      invitedAt={item.invitedAt}
                    />
                  ) : (
                    <JoinRequestCard
                      key={item.id}
                      initials={item.initials}
                      name={item.name}
                      role={item.role}
                      employeeScore={item.employeeScore}
                    />
                  ),
                )
              ) : (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-8 text-center">
                  <p className="m-0 text-sm font-medium text-slate-500">No pending requests</p>
                  <Link
                    to="/company/team"
                    className="mt-2 inline-block text-xs font-semibold text-[#1a3a8f] no-underline hover:underline"
                  >
                    Invite employees →
                  </Link>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Department + trust charts */}
        <div className="mt-5 grid grid-cols-1 gap-5 xl:mt-6 xl:grid-cols-2 xl:gap-6">
          <ChartCard title="Department Split" subtitle="Headcount across your teams">
            <DepartmentDonutChart data={departmentData} />
          </ChartCard>

          <ChartCard title={trustChartTitle} subtitle="VeriScore breakdown for your workforce">
            <TrustScoreBarChart data={trustBars} />
          </ChartCard>
        </div>

        <section className="mt-6 flex flex-col justify-center rounded-2xl border border-slate-100 bg-gradient-to-br from-[#1a3a8f] to-[#2747b2] p-6 text-white shadow-lg xl:mt-8">
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

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-100 bg-white/95 p-4 backdrop-blur-md xl:hidden">
        <Link to="/enterprise/qr-onboarding">
          <Button type="button">Generate Joining QR</Button>
        </Link>
      </div>
    </EnterpriseLayout>
  )
}

export default Dashboard

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
import SkeletonBlock from '../../components/enterprise/SkeletonBlock'
import Button from '../../components/common/Button'
import Card from '../../components/common/Card'
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

function AlertIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 6.25v4.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="13.4" r="0.85" fill="currentColor" />
    </svg>
  )
}

function InboxIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.75 11.5h3.5l1 2h5.5l1-2h3.5M2.75 11.5l2-6.25a1.25 1.25 0 0 1 1.19-.85h8.12a1.25 1.25 0 0 1 1.19.85l2 6.25M2.75 11.5v3a1.25 1.25 0 0 0 1.25 1.25h12a1.25 1.25 0 0 0 1.25-1.25v-3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function QrIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="2.75" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.75" y="2.75" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.75" y="11.75" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11.75 11.75h2.5M17.25 11.75v2.6M11.75 14.6v2.65h2.5M17.25 17.25h-2.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
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
      {/* pb-28 clears the fixed mobile CTA bar; xl: drops it since the bar hides. */}
      <div className="px-4 py-6 pb-28 md:px-6 md:py-8 xl:pb-8">
        <PageHeader title="Workforce Overview" subtitle="Monitor verification activity and team metrics" />

        {error && (
          <div
            role="alert"
            className="mb-5 flex items-start gap-3 rounded-xl border border-hairline bg-danger-bg p-4 shadow-xs"
          >
            <span className="mt-0.5 shrink-0 text-danger">
              <AlertIcon />
            </span>
            <p className="m-0 text-sm font-medium text-danger">{error.message}</p>
          </div>
        )}

        {showSuccess && (
          <div className="animate-fade-in mb-5 flex items-start gap-3 rounded-xl border border-hairline bg-success-bg p-4 shadow-xs">
            <span className="mt-0.5 shrink-0 text-success">
              <CheckIcon />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-sm font-semibold text-success">Verification submitted successfully</p>
              <p className="m-0 mt-0.5 text-[13px] leading-relaxed text-ink-body">
                Your company profile is under review. Welcome to your employer dashboard.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4 xl:gap-5">
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
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-5">
          <Card title={onboardingTrend.title} subtitle={onboardingTrend.subtitle} className="xl:col-span-3">
            <EmployeeOnboardingTrendChart
              labels={onboardingTrend.labels}
              series={onboardingTrend.series}
              height={280}
            />
          </Card>

          <Card
            title="Pending Join Requests"
            subtitle={`${stats.pendingRequests} awaiting review${
              stats.pendingInvitations > 0 && stats.pendingJoinRequests > 0
                ? ` · ${stats.pendingJoinRequests} join · ${stats.pendingInvitations} invite`
                : ''
            }`}
            action={
              <div className="flex flex-col items-end gap-1">
                {stats.pendingJoinRequests > 0 && (
                  <Link
                    to="/enterprise/join-requests"
                    className="rounded text-xs font-semibold text-brand-600 no-underline outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  >
                    Join requests
                  </Link>
                )}
                {stats.pendingInvitations > 0 && (
                  <Link
                    to="/company/team"
                    className="rounded text-xs font-semibold text-brand-600 no-underline outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  >
                    Invitations
                  </Link>
                )}
                {stats.pendingRequests === 0 && (
                  <Link
                    to="/enterprise/join-requests"
                    className="rounded text-xs font-semibold text-brand-600 no-underline outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  >
                    View all
                  </Link>
                )}
              </div>
            }
            className="xl:col-span-2"
          >
            <div className="flex flex-col gap-3">
              {pendingLoading ? (
                <div className="flex flex-col gap-3" aria-busy="true" aria-label="Loading pending requests">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-3 rounded-ctl border border-hairline p-3">
                      <SkeletonBlock className="h-9 w-9 shrink-0 rounded-full" />
                      <div className="min-w-0 flex-1">
                        <SkeletonBlock className="h-3.5 w-28" />
                        <SkeletonBlock className="mt-1.5 h-3 w-20" />
                      </div>
                    </div>
                  ))}
                </div>
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
                <div className="flex flex-col items-center rounded-ctl border border-dashed border-line px-4 py-10 text-center">
                  <span className="flex h-10 w-10 items-center justify-center rounded-full bg-canvas text-ink-faint">
                    <InboxIcon />
                  </span>
                  <p className="m-0 mt-3 text-sm font-semibold text-ink-strong">You&apos;re all caught up</p>
                  <p className="m-0 mt-1 max-w-[26ch] text-xs leading-relaxed text-ink-muted">
                    New join requests and invitations will land here for review.
                  </p>
                  <Link
                    to="/company/team"
                    className="mt-3 rounded text-xs font-semibold text-brand-600 no-underline outline-none hover:underline focus-visible:ring-2 focus-visible:ring-brand-500/40"
                  >
                    Invite employees →
                  </Link>
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Department + trust charts */}
        <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-2">
          <Card title="Department Split" subtitle="Headcount across your teams">
            <DepartmentDonutChart data={departmentData} />
          </Card>

          <Card title={trustChartTitle} subtitle="VeriScore breakdown for your workforce">
            <TrustScoreBarChart data={trustBars} />
          </Card>
        </div>

        {/* Quick action: a brand wash, not a slab of navy paint. */}
        <section className="mt-5 flex flex-col gap-4 rounded-xl border border-brand-100 bg-brand-50 p-5 shadow-xs md:flex-row md:items-center md:justify-between xl:p-6">
          <div className="flex items-start gap-4">
            <span className="hidden h-10 w-10 shrink-0 items-center justify-center rounded-ctl bg-brand-600 text-white sm:flex">
              <QrIcon />
            </span>
            <div className="min-w-0">
              <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-brand-500">Quick Action</p>
              <h3 className="m-0 mt-1 text-[15px] font-semibold tracking-tight text-brand-900">
                Generate a joining QR for new employees
              </h3>
              <p className="m-0 mt-1 text-[13px] leading-relaxed text-ink-body">
                Share a secure QR code so employees can join and verify instantly.
              </p>
            </div>
          </div>
          <Link to="/enterprise/qr-onboarding" className="shrink-0 no-underline">
            <Button type="button" fullWidth={false} className="hidden md:inline-flex">
              Generate Joining QR
            </Button>
          </Link>
        </section>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-surface/90 p-4 backdrop-blur-md xl:hidden">
        <Link to="/enterprise/qr-onboarding" className="no-underline">
          <Button type="button">Generate Joining QR</Button>
        </Link>
      </div>
    </EnterpriseLayout>
  )
}

export default Dashboard

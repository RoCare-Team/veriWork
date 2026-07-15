import { useQuery } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import PageHeader from '../../components/enterprise/PageHeader'
import StatCard from '../../components/enterprise/StatCard'
import {
  WorkforceGrowthChart,
  DepartmentDonutChart,
  TrustScoreBarChart,
} from '../../components/enterprise/InsightsCharts'
import { StatCardSkeleton, ChartSkeleton } from '../../components/enterprise/SkeletonBlock'
import { enterpriseKeys, fetchInsights } from '../../api/enterprise'

function PeopleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" />
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

function CheckIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4" y="3" width="12" height="14" rx="1" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8 7h1M8 10h1M8 13h1M11 7h1M11 10h1M11 13h1" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function MiniStat({ label, value, accent }) {
  const accents = {
    green: 'border-l-green-500',
    amber: 'border-l-amber-400',
    red: 'border-l-red-500',
    blue: 'border-l-[#005fd6]',
  }
  return (
    <div className={`rounded-2xl border border-slate-100 border-l-4 bg-white p-4 shadow-sm ${accents[accent] || accents.blue}`}>
      <p className="m-0 text-2xl font-extrabold text-slate-900">{value}</p>
      <p className="mt-1 text-xs font-medium text-slate-500">{label}</p>
    </div>
  )
}

function CompanyInsights() {
  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.insights,
    queryFn: fetchInsights,
  })

  const metrics = data?.metrics || data || {}
  const verification = data?.verificationAnalytics || {}
  const verifiedCount = metrics.verifiedEmployees ?? 0
  const totalEmployees = metrics.totalEmployees ?? 0
  const verifiedLabel =
    totalEmployees > 0 ? `${verifiedCount} of ${totalEmployees}` : String(verifiedCount)

  return (
    <EnterpriseLayout>
      <div className="px-4 py-5 md:px-6 md:py-8 lg:px-8">
        <PageHeader title="Company Insights" subtitle="Workforce analytics and verification trends" />

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        <div className="grid grid-cols-2 gap-3 xl:grid-cols-4 xl:gap-5">
          {isLoading ? (
            Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)
          ) : (
            <>
              <StatCard icon={<PeopleIcon />} label="Total Employees" value={String(totalEmployees)} accent="blue" />
              <StatCard
                icon={<ShieldIcon />}
                label="Average Trust Score"
                value={`${metrics.averageTrustScore ?? 0}/900`}
                accent="green"
              />
              <StatCard
                icon={<CheckIcon />}
                label="Verified Employees"
                value={verifiedLabel}
                accent="orange"
                trend={totalEmployees > 0 ? `${Math.round((verifiedCount / totalEmployees) * 100)}%` : undefined}
              />
              <StatCard
                icon={<BuildingIcon />}
                label="Active Departments"
                value={String(metrics.activeDepartments ?? 0)}
                accent="red"
              />
            </>
          )}
        </div>

        <div className="mt-6 grid grid-cols-1 gap-5 xl:mt-8 xl:grid-cols-2 xl:gap-6">
          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:p-6">
            <h3 className="m-0 text-base font-bold text-slate-900">Workforce Growth</h3>
            <p className="mt-0.5 text-xs text-slate-400">Employee count over time</p>
            <div className="mt-5">
              {isLoading ? <ChartSkeleton className="h-48" /> : <WorkforceGrowthChart data={data?.workforceGrowth || []} />}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:p-6">
            <h3 className="m-0 text-base font-bold text-slate-900">Department Distribution</h3>
            <p className="mt-0.5 text-xs text-slate-400">Headcount by department</p>
            <div className="mt-5">
              {isLoading ? <ChartSkeleton className="h-48" /> : <DepartmentDonutChart data={data?.departmentDistribution || []} />}
            </div>
          </section>

          <section className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:col-span-2 xl:p-6">
            <h3 className="m-0 text-base font-bold text-slate-900">Trust Score Distribution</h3>
            <p className="mt-0.5 text-xs text-slate-400">Employee count by score range</p>
            <div className="mt-5">
              {isLoading ? <ChartSkeleton className="h-52" /> : <TrustScoreBarChart data={data?.trustScoreDistribution || []} />}
            </div>
          </section>
        </div>

        <section className="mt-6 rounded-2xl border border-slate-100 bg-white p-5 shadow-sm xl:mt-8 xl:p-6">
          <h3 className="m-0 text-base font-bold text-slate-900">Verification Analytics</h3>
          <p className="mt-0.5 text-xs text-slate-400">Request outcomes across your workforce</p>
          <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
            {isLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-200/70" />
              ))
            ) : (
              <>
                <MiniStat label="Total Verification Requests" value={String(verification.totalRequests ?? verification.total ?? 0)} accent="blue" />
                <MiniStat label="Approved" value={String(verification.approved ?? 0)} accent="green" />
                <MiniStat label="Pending" value={String(verification.pending ?? 0)} accent="amber" />
                <MiniStat label="Rejected" value={String(verification.rejected ?? 0)} accent="red" />
              </>
            )}
          </div>
        </section>
      </div>
    </EnterpriseLayout>
  )
}

export default CompanyInsights

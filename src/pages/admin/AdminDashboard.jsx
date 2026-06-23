import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { adminKeys, fetchAdminDashboard } from '../../api/admin'

function StatCard({ label, value, accent, to }) {
  const colors = {
    amber: 'border-amber-100 bg-amber-50 text-amber-800',
    green: 'border-green-100 bg-green-50 text-green-800',
    blue: 'border-blue-100 bg-blue-50 text-blue-800',
    purple: 'border-purple-100 bg-purple-50 text-purple-800',
    slate: 'border-slate-100 bg-white text-slate-800',
  }

  const card = (
    <div className={`rounded-3xl border p-5 shadow-sm transition hover:shadow-md ${colors[accent] || colors.slate}`}>
      <p className="m-0 text-3xl font-extrabold">{value ?? 0}</p>
      <p className="m-0 mt-1 text-sm font-medium opacity-80">{label}</p>
    </div>
  )

  if (to) {
    return (
      <Link to={to} className="no-underline">
        {card}
      </Link>
    )
  }

  return card
}

function AdminDashboard() {
  const { data, isLoading, error } = useQuery({
    queryKey: adminKeys.dashboard,
    queryFn: fetchAdminDashboard,
  })

  const stats = data?.stats || data || {}

  if (isLoading) return <Loader variant="fullPage" label="Loading admin dashboard..." />

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <div className="mb-8">
          <h2 className="m-0 text-2xl font-extrabold text-slate-900">Platform Overview</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">
            Enterprise approvals, employee registrations, and platform health
          </p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        <div className="mb-8">
          <h3 className="m-0 mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Employees</h3>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard
              label="Total Employees"
              value={stats.totalEmployees}
              accent="purple"
              to="/admin/employees"
            />
            <StatCard
              label="Profile Complete"
              value={stats.employeesProfileComplete}
              accent="blue"
              to="/admin/employees?status=complete"
            />
            <StatCard
              label="Fully Verified"
              value={stats.employeesVerified}
              accent="green"
              to="/admin/employees?status=verified"
            />
            <StatCard
              label="Incomplete Profiles"
              value={Math.max(0, (stats.totalEmployees || 0) - (stats.employeesProfileComplete || 0))}
              accent="amber"
              to="/admin/employees?status=incomplete"
            />
          </div>
        </div>

        <div className="mb-8">
          <h3 className="m-0 mb-4 text-sm font-bold uppercase tracking-wide text-slate-500">Companies</h3>
          <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
            <StatCard label="Pending Review" value={stats.pending ?? stats.pendingApprovals} accent="amber" to="/admin/companies" />
            <StatCard label="Approved Companies" value={stats.approved ?? stats.approvedCompanies} accent="green" to="/admin/companies/approved" />
            <StatCard label="Rejected" value={stats.rejected ?? stats.rejectedCompanies} accent="slate" to="/admin/companies/rejected" />
            <StatCard label="Total Enterprises" value={stats.total ?? stats.totalEnterprises} accent="blue" to="/admin/companies/all" />
          </div>
        </div>

        <section className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <h3 className="m-0 text-lg font-bold text-slate-900">Employee Management</h3>
            <p className="m-0 mt-2 max-w-xl text-sm text-slate-500">
              View all registered employees, their verification status, scores, and full profile details.
            </p>
            <Link to="/admin/employees" className="mt-5 inline-block">
              <Button type="button" fullWidth={false}>
                View All Employees
              </Button>
            </Link>
          </div>

          <div className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
            <h3 className="m-0 text-lg font-bold text-slate-900">Company Approvals</h3>
            <p className="m-0 mt-2 max-w-xl text-sm text-slate-500">
              New enterprise registrations appear here after onboarding. Approve them to unlock their employer dashboard.
            </p>
            <Link to="/admin/companies" className="mt-5 inline-block">
              <Button type="button" fullWidth={false}>
                Review Pending Companies
              </Button>
            </Link>
          </div>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard

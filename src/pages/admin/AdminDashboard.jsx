import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { adminKeys, fetchAdminDashboard } from '../../api/admin'

function StatCard({ label, value, accent }) {
  const colors = {
    amber: 'border-amber-100 bg-amber-50 text-amber-800',
    green: 'border-green-100 bg-green-50 text-green-800',
    blue: 'border-blue-100 bg-blue-50 text-blue-800',
    slate: 'border-slate-100 bg-white text-slate-800',
  }
  return (
    <div className={`rounded-3xl border p-5 shadow-sm ${colors[accent] || colors.slate}`}>
      <p className="m-0 text-3xl font-extrabold">{value ?? 0}</p>
      <p className="m-0 mt-1 text-sm font-medium opacity-80">{label}</p>
    </div>
  )
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
          <p className="m-0 mt-1 text-sm text-slate-500">Enterprise registration approvals and compliance</p>
        </div>

        {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

        <div className="grid grid-cols-2 gap-4 xl:grid-cols-4">
          <StatCard label="Pending Review" value={stats.pending ?? stats.pendingApprovals ?? stats.pendingRegistrations} accent="amber" />
          <StatCard label="Approved Companies" value={stats.approved ?? stats.approvedCompanies} accent="green" />
          <StatCard label="Rejected" value={stats.rejected ?? stats.rejectedCompanies} accent="slate" />
          <StatCard label="Total Enterprises" value={stats.total ?? stats.totalEnterprises} accent="blue" />
        </div>

        <section className="mt-8 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <h3 className="m-0 text-lg font-bold text-slate-900">Quick Actions</h3>
          <p className="m-0 mt-2 max-w-xl text-sm text-slate-500">
            New enterprise registrations appear here after they complete onboarding. Approve them to unlock their employer
            dashboard.
          </p>
          <Link to="/admin/companies" className="mt-5 inline-block">
            <Button type="button" fullWidth={false}>
              Review Pending Companies
            </Button>
          </Link>
        </section>
      </div>
    </AdminLayout>
  )
}

export default AdminDashboard

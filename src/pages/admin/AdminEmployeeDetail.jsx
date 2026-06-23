import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import { adminKeys, fetchAdminEmployee } from '../../api/admin'
import { formatDate } from '../../utils/formatters'
import { mediaUrl } from '../../lib/mediaUrl'

function DetailRow({ label, value }) {
  return (
    <div className="flex flex-col gap-1 border-b border-slate-100 py-3 last:border-0 sm:flex-row sm:items-start sm:justify-between">
      <span className="text-sm font-semibold text-slate-500">{label}</span>
      <span className="text-sm font-medium text-slate-900 sm:max-w-[65%] sm:text-right">{value || '—'}</span>
    </div>
  )
}

function EducationBlock({ title, rows }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
      <h4 className="m-0 text-sm font-bold text-slate-900">{title}</h4>
      <div className="mt-3 space-y-1">
        {rows.map(([label, value]) => (
          <div key={label} className="flex justify-between gap-4 text-sm">
            <span className="text-slate-500">{label}</span>
            <span className="font-medium text-slate-800">{value || '—'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function AdminEmployeeDetail() {
  const { id } = useParams()

  const { data: employee, isLoading, error } = useQuery({
    queryKey: adminKeys.employee(id),
    queryFn: () => fetchAdminEmployee(id),
    enabled: Boolean(id),
  })

  if (isLoading) return <Loader variant="fullPage" label="Loading employee..." />

  if (error || !employee) {
    return (
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <p className="text-sm text-red-600">{error?.message || 'Employee not found'}</p>
          <Link to="/admin/employees" className="mt-4 inline-block text-sm font-semibold text-[#1a3a8f]">
            Back to employees
          </Link>
        </div>
      </AdminLayout>
    )
  }

  const photo = mediaUrl(employee.photoUrl)
  const education = employee.education

  return (
    <AdminLayout>
      <div className="px-4 py-6 md:px-8 md:py-8">
        <Link to="/admin/employees" className="text-sm font-semibold text-[#1a3a8f] no-underline hover:underline">
          ← Back to employees
        </Link>

        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {photo ? (
                <img src={photo} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1a3a8f]/10 text-2xl font-bold text-[#1a3a8f]">
                  {employee.initials}
                </span>
              )}
              <div>
                <h2 className="m-0 text-2xl font-extrabold text-slate-900">{employee.name}</h2>
                <p className="m-0 mt-1 text-sm text-slate-500">{employee.role} · {employee.company}</p>
                <p className="m-0 mt-1 font-mono text-xs text-slate-400">{employee.veriworkId}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="rounded-full bg-[#1a3a8f]/10 px-3 py-1 text-sm font-bold text-[#1a3a8f]">
                Score {employee.employeeScore}
              </span>
              {employee.isVerified && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">Verified</span>
              )}
              {employee.profileSetupComplete && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">Profile Complete</span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-2">
          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="m-0 text-lg font-bold text-slate-900">Contact & Identity</h3>
            <div className="mt-4">
              <DetailRow label="Email" value={employee.email} />
              <DetailRow label="Phone" value={employee.phone} />
              <DetailRow label="Date of Birth" value={employee.dateOfBirth} />
              <DetailRow label="Gender" value={employee.gender} />
              <DetailRow label="City" value={employee.currentCity} />
              <DetailRow label="Auth Provider" value={employee.authProvider} />
              <DetailRow label="Joined" value={formatDate(employee.createdAt)} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm">
            <h3 className="m-0 text-lg font-bold text-slate-900">Work & Verification</h3>
            <div className="mt-4">
              <DetailRow label="Current Role" value={employee.role} />
              <DetailRow label="Current Company" value={employee.company} />
              <DetailRow label="Linked Companies" value={employee.linkedCompanyLabel} />
              <DetailRow label="Total Experience" value={employee.totalExperience} />
              <DetailRow label="Aadhaar Verified" value={employee.aadhaarVerified ? 'Yes' : 'No'} />
              <DetailRow label="Biometric Verified" value={employee.biometricVerified ? 'Yes' : 'No'} />
              <DetailRow label="DigiLocker Used" value={employee.digilockerUsed ? 'Yes' : 'No'} />
              <DetailRow label="Endorsements" value={String(employee.endorsements)} />
            </div>
          </section>

          <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
            <h3 className="m-0 text-lg font-bold text-slate-900">Address</h3>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Current Address</p>
                <p className="m-0 mt-2 text-sm text-slate-800">{employee.currentAddress || '—'}</p>
              </div>
              <div className="rounded-2xl bg-slate-50 p-4">
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-500">Permanent Address</p>
                <p className="m-0 mt-2 text-sm text-slate-800">{employee.permanentAddress || '—'}</p>
              </div>
            </div>
          </section>

          {education && (
            <section className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm xl:col-span-2">
              <h3 className="m-0 text-lg font-bold text-slate-900">Education</h3>
              <div className="mt-4 grid gap-4 lg:grid-cols-3">
                <EducationBlock
                  title="Class 10th"
                  rows={[
                    ['Board', education.class10?.board],
                    ['School', education.class10?.school],
                    ['Year', education.class10?.passingYear],
                    ['Percentage', education.class10?.percentage],
                  ]}
                />
                <EducationBlock
                  title="Class 12th"
                  rows={[
                    ['Board', education.class12?.board],
                    ['School', education.class12?.school],
                    ['Stream', education.class12?.stream],
                    ['Year', education.class12?.passingYear],
                    ['Percentage', education.class12?.percentage],
                  ]}
                />
                <EducationBlock
                  title="Graduation"
                  rows={[
                    ['Degree', education.graduation?.degree],
                    ['College', education.graduation?.college],
                    ['University', education.graduation?.university],
                    ['Year', education.graduation?.passingYear],
                    ['Percentage', education.graduation?.percentage],
                  ]}
                />
              </div>
            </section>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

export default AdminEmployeeDetail

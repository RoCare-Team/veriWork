import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import AdminLayout from '../../layouts/AdminLayout'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import DeleteEmployeeModal from '../../components/admin/DeleteEmployeeModal'
import {
  adminKeys,
  deleteAdminEmployee,
  fetchAdminEmployee,
  setAdminEmployeeStatus,
} from '../../api/admin'
import { useToast } from '../../context/ToastContext'
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
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const { data: employee, isLoading, error } = useQuery({
    queryKey: adminKeys.employee(id),
    queryFn: () => fetchAdminEmployee(id),
    enabled: Boolean(id),
  })

  const statusMutation = useMutation({
    mutationFn: (isActive) => setAdminEmployeeStatus(id, isActive),
    onSuccess: (_, isActive) => {
      queryClient.invalidateQueries({ queryKey: adminKeys.employee(id) })
      queryClient.invalidateQueries({ queryKey: ['admin', 'employees'] })
      toast(
        isActive ? 'Employee reactivated' : 'Employee deactivated — they can no longer log in',
        isActive ? 'success' : 'info',
      )
    },
    onError: (err) => toast(err.message || 'Could not update the employee', 'error'),
  })

  const deleteMutation = useMutation({
    mutationFn: (confirm) => deleteAdminEmployee(id, confirm),
    onSuccess: () => {
      // The record this page renders no longer exists, so drop it from the
      // cache and leave before React Query can refetch a 404.
      queryClient.removeQueries({ queryKey: adminKeys.employee(id) })
      queryClient.invalidateQueries({ queryKey: ['admin', 'employees'] })
      toast('Employee permanently deleted', 'success')
      navigate('/admin/employees', { replace: true })
    },
    onError: (err) => toast(err.message || 'Could not delete the employee', 'error'),
  })

  if (isLoading) return <Loader variant="fullPage" label="Loading employee..." />

  if (error || !employee) {
    return (
      <AdminLayout>
        <div className="px-4 py-8 md:px-8">
          <p className="text-sm text-red-600">{error?.message || 'Employee not found'}</p>
          <Link to="/admin/employees" className="mt-4 inline-block text-sm font-semibold text-[#1e3a8a]">
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
        <Link to="/admin/employees" className="text-sm font-semibold text-[#1e3a8a] no-underline hover:underline">
          ← Back to employees
        </Link>

        <div className="mt-5 rounded-3xl border border-slate-100 bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-4">
              {photo ? (
                <img src={photo} alt="" className="h-20 w-20 rounded-2xl object-cover" />
              ) : (
                <span className="flex h-20 w-20 items-center justify-center rounded-2xl bg-[#1e3a8a]/10 text-2xl font-bold text-[#1e3a8a]">
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
              <span className="rounded-full bg-[#1e3a8a]/10 px-3 py-1 text-sm font-bold text-[#1e3a8a]">
                Score {employee.employeeScore}
              </span>
              {!employee.isActive && (
                <span className="rounded-full bg-slate-200 px-3 py-1 text-sm font-semibold text-slate-600">Deactivated</span>
              )}
              {employee.isVerified && (
                <span className="rounded-full bg-green-50 px-3 py-1 text-sm font-semibold text-green-700">Verified</span>
              )}
              {employee.profileSetupComplete && (
                <span className="rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">Profile Complete</span>
              )}
            </div>
          </div>
        </div>

        <section className="mt-6 rounded-3xl border border-red-100 bg-red-50/40 p-6 shadow-sm">
          <h3 className="m-0 text-lg font-bold text-slate-900">Account actions</h3>
          <p className="m-0 mt-1 max-w-2xl text-sm text-slate-600">
            {employee.isActive
              ? 'Deactivating blocks login and ends their sessions immediately, but keeps every verification record companies rely on. Deleting erases the account and all of it — permanently.'
              : 'This account is deactivated and cannot log in. Restore it to give access back, or delete it permanently to erase everything the platform holds.'}
          </p>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <Button
              type="button"
              variant="secondary"
              fullWidth={false}
              onClick={() => statusMutation.mutate(!employee.isActive)}
              disabled={statusMutation.isPending || deleteMutation.isPending}
            >
              {statusMutation.isPending
                ? 'Saving…'
                : employee.isActive
                  ? 'Deactivate account'
                  : 'Restore account'}
            </Button>
            <Button
              type="button"
              variant="danger"
              fullWidth={false}
              onClick={() => setConfirmingDelete(true)}
              disabled={statusMutation.isPending || deleteMutation.isPending}
            >
              Delete permanently
            </Button>
          </div>
        </section>

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

            {employee.aadhaarKyc && (
              <div className="mt-5 rounded-2xl border border-slate-100 bg-slate-50/70 p-4">
                <div className="flex items-center justify-between gap-3">
                  <h4 className="m-0 text-sm font-bold text-slate-900">Aadhaar KYC</h4>
                  <Link
                    to={`/admin/aadhaar-requests/${employee.aadhaarKyc.id}`}
                    className="text-sm font-semibold text-[#1e3a8a] no-underline hover:underline"
                  >
                    Review →
                  </Link>
                </div>
                <div className="mt-2 space-y-1 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Status</span>
                    <span className="font-semibold capitalize text-slate-800">{employee.aadhaarKyc.status}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Number</span>
                    <span className="font-mono text-slate-800">{employee.aadhaarKyc.aadhaarMasked}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Submitted</span>
                    <span className="text-slate-800">{formatDate(employee.aadhaarKyc.submittedAt)}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-slate-500">Face match</span>
                    <span className="text-slate-800">
                      {employee.aadhaarKyc.faceMatchMatched
                        ? `Matched (${employee.aadhaarKyc.faceMatchSimilarity}%)`
                        : 'Not matched'}
                    </span>
                  </div>
                </div>
                {employee.aadhaarKyc.rejectionReason && (
                  <p className="m-0 mt-2 text-xs text-red-600">{employee.aadhaarKyc.rejectionReason}</p>
                )}
              </div>
            )}
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

      {confirmingDelete && (
        <DeleteEmployeeModal
          employee={employee}
          busy={deleteMutation.isPending}
          onClose={() => setConfirmingDelete(false)}
          onConfirm={(confirm) => deleteMutation.mutate(confirm)}
        />
      )}
    </AdminLayout>
  )
}

export default AdminEmployeeDetail

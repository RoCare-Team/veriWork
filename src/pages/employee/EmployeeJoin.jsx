import { useEffect } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmployeeAuthLayout from '../../layouts/EmployeeAuthLayout'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { fetchPublicEmployeeInvitation } from '../../api/public'
import { setInvitationSession } from '../../utils/invitationSession'

function EmployeeJoin() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const token = params.get('token') || ''

  const { data, isLoading, error } = useQuery({
    queryKey: ['public', 'employee-invitation', token],
    queryFn: () => fetchPublicEmployeeInvitation(token),
    enabled: Boolean(token),
    retry: false,
  })

  const invitation = data?.invitation || data

  useEffect(() => {
    if (!token || !invitation) return
    setInvitationSession({
      token,
      email: invitation.employeeEmail || invitation.email || '',
      companyName: invitation.companyName || '',
    })
  }, [token, invitation])

  if (!token) {
    return (
      <EmployeeAuthLayout>
        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="m-0 text-sm text-red-600">Invalid invitation link — missing token.</p>
          <Link to="/employee" className="mt-4 inline-block text-sm font-semibold text-[#1a3a8f] no-underline hover:underline">
            Go to employee home
          </Link>
        </div>
      </EmployeeAuthLayout>
    )
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading invitation..." />

  if (error || !invitation) {
    return (
      <EmployeeAuthLayout>
        <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 text-center shadow-sm">
          <p className="m-0 text-sm text-red-600">{error?.message || 'Invitation not found or expired.'}</p>
          <Link to="/employee" className="mt-4 inline-block text-sm font-semibold text-[#1a3a8f] no-underline hover:underline">
            Go to employee home
          </Link>
        </div>
      </EmployeeAuthLayout>
    )
  }

  const companyName = invitation.companyName || 'a company'
  const requiresRegistration = invitation.requiresRegistration !== false

  return (
    <EmployeeAuthLayout>
      <div className="mx-auto w-full max-w-md rounded-3xl border border-slate-100 bg-white p-8 shadow-sm">
        <p className="m-0 text-xs font-bold uppercase tracking-wider text-[#1a3a8f]">Workforce invitation</p>
        <h1 className="m-0 mt-2 text-2xl font-extrabold text-slate-900">
          You&apos;re invited by {companyName}
        </h1>

        <dl className="m-0 mt-6 space-y-3 rounded-2xl bg-slate-50 p-4 text-sm">
          <div className="flex justify-between gap-3">
            <dt className="font-semibold text-slate-500">Department</dt>
            <dd className="m-0 font-medium text-slate-900">{invitation.department || '—'}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="font-semibold text-slate-500">Role</dt>
            <dd className="m-0 font-medium text-slate-900">{invitation.designation || '—'}</dd>
          </div>
          {(invitation.employeeEmail || invitation.email) && (
            <div className="flex justify-between gap-3">
              <dt className="font-semibold text-slate-500">Email</dt>
              <dd className="m-0 font-medium text-slate-900">{invitation.employeeEmail || invitation.email}</dd>
            </div>
          )}
        </dl>

        {requiresRegistration && (
          <p className="m-0 mt-4 text-sm text-slate-600">
            Create your VeriWork account to join the team. You&apos;ll be added automatically after profile setup.
          </p>
        )}

        <div className="mt-6 flex flex-col gap-3">
          <Button type="button" className="w-full" onClick={() => navigate('/employee/otp?from=join')}>
            Continue with OTP
          </Button>
          <Link to="/employee" className="text-center text-sm font-semibold text-slate-500 no-underline hover:underline">
            Back to home
          </Link>
        </div>
      </div>
    </EmployeeAuthLayout>
  )
}

export default EmployeeJoin

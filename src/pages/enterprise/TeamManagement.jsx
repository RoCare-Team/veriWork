import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import InviteEmployeeModal from '../../components/enterprise/InviteEmployeeModal'
import PendingInvitationsTab from '../../components/enterprise/PendingInvitationsTab'
import SendAccessRequestModal from '../../components/enterprise/SendAccessRequestModal'
import RemoveAccessConfirmModal from '../../components/enterprise/RemoveAccessConfirmModal'
import AssignEmployeeModal from '../../components/enterprise/AssignEmployeeModal'
import TeamEmployeeRow from '../../components/enterprise/TeamEmployeeRow'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { enterpriseKeys, fetchTeam } from '../../api/enterprise'
import {
  extractTeamEmployees,
  resolveEmployeeId,
  getEmployeeName,
} from '../../utils/enterpriseTeamUtils'

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="9" cy="8" r="3.2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      <path d="M16 5.2a3 3 0 0 1 0 5.6M17.5 19a5.5 5.5 0 0 0-3-4.9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function TeamManagement() {
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [accessRequestEmployee, setAccessRequestEmployee] = useState(null)
  const [removeAccessEmployee, setRemoveAccessEmployee] = useState(null)
  const [assignEmployee, setAssignEmployee] = useState(null)

  const refreshTeam = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.team })
  }

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.team,
    queryFn: fetchTeam,
  })

  const linkedEmployees = extractTeamEmployees(data)

  const handleInviteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.team })
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.invitationsPending })
    setShowInvite(false)
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading team..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#005fd6]/10 text-[#005fd6]">
              <UsersIcon />
            </div>
            <div>
              <h1 className="m-0 text-xl font-extrabold text-slate-900 md:text-2xl">Team Management</h1>
              <p className="m-0 mt-0.5 text-sm text-slate-500">
                Employees who accepted your invite and created their profile appear here.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl bg-[#005fd6] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#004bab]"
          >
            <PlusIcon />
            Invite Employee
          </button>
        </div>

        {error && (
          <p className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </p>
        )}

        {/* Employees */}
        <section className="mt-8">
          <div className="mb-4 flex items-baseline justify-between gap-3">
            <div>
              <h2 className="m-0 text-base font-bold text-slate-900">Your employees</h2>
              <p className="m-0 mt-1 text-sm text-slate-500">
                Invited users who joined and completed their profile
              </p>
            </div>
            {linkedEmployees.length > 0 && (
              <span className="shrink-0 rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                {linkedEmployees.length} member{linkedEmployees.length !== 1 ? 's' : ''}
              </span>
            )}
          </div>

          {linkedEmployees.length > 0 ? (
            <div className="grid gap-3">
              {linkedEmployees.map((emp) => (
                <TeamEmployeeRow
                  key={resolveEmployeeId(emp)}
                  employee={emp}
                  onRequestAccess={setAccessRequestEmployee}
                  onRemoveAccess={setRemoveAccessEmployee}
                  onAssign={setAssignEmployee}
                />
              ))}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-10 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                <PlusIcon />
              </div>
              <p className="m-0 text-sm font-semibold text-slate-700">No employees yet</p>
              <p className="m-0 mt-1 text-xs text-slate-400">
                Once someone accepts your invite and creates their profile, they will show up here.
              </p>
              <div className="mt-6 flex justify-center">
                <Button type="button" onClick={() => setShowInvite(true)} fullWidth={false}>
                  Invite Employee
                </Button>
              </div>
            </div>
          )}
        </section>

        {/* Pending invitations */}
        <section className="mt-10">
          <h2 className="m-0 text-base font-bold text-slate-900">Pending invitations</h2>
          <p className="m-0 mt-1 text-sm text-slate-500">Invited but not yet registered or accepted</p>
          <div className="mt-4">
            <PendingInvitationsTab />
          </div>
        </section>
      </div>

      {showInvite && (
        <InviteEmployeeModal onClose={() => setShowInvite(false)} onSuccess={handleInviteSuccess} />
      )}

      {accessRequestEmployee && (
        <SendAccessRequestModal
          employeeId={resolveEmployeeId(accessRequestEmployee)}
          employeeName={getEmployeeName(accessRequestEmployee)}
          defaultRequestType="full_profile_access"
          onClose={() => setAccessRequestEmployee(null)}
          onSuccess={refreshTeam}
        />
      )}

      {removeAccessEmployee && (
        <RemoveAccessConfirmModal
          employee={removeAccessEmployee}
          onClose={() => setRemoveAccessEmployee(null)}
          onSuccess={refreshTeam}
        />
      )}

      {assignEmployee && (
        <AssignEmployeeModal
          employee={assignEmployee}
          onClose={() => setAssignEmployee(null)}
          onSuccess={refreshTeam}
        />
      )}
    </EnterpriseLayout>
  )
}

export default TeamManagement

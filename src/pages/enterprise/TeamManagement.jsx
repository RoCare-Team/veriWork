import { useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import EnterpriseLayout from '../../layouts/EnterpriseLayout'
import InviteEmployeeModal from '../../components/enterprise/InviteEmployeeModal'
import DepartmentEmployeeSection from '../../components/enterprise/DepartmentEmployeeSection'
import PendingInvitationsTab from '../../components/enterprise/PendingInvitationsTab'
import SendAccessRequestModal from '../../components/enterprise/SendAccessRequestModal'
import RemoveAccessConfirmModal from '../../components/enterprise/RemoveAccessConfirmModal'
import Loader from '../../components/common/Loader'
import Button from '../../components/common/Button'
import { enterpriseKeys, fetchTeam } from '../../api/enterprise'
import { extractTeamDepartments, resolveEmployeeId, getEmployeeName } from '../../utils/enterpriseTeamUtils'

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 3v12M3 9h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

function UsersIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}

function TeamStats({ departments, totalLinked }) {
  const linked = departments.filter(
    (d) => (d.employeeCount ?? 0) > 0 || (d.employees?.length ?? 0) > 0
  )
  if (!linked.length) return null

  return (
    <div className="mb-8">
      <p className="m-0 mb-3 text-[11px] font-semibold uppercase tracking-widest text-slate-400">
        Department Overview
      </p>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        <div className="col-span-1 rounded-xl bg-[#1a3a8f] p-5">
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-blue-200">Total</p>
          <p className="m-0 mt-2 text-3xl font-extrabold leading-none text-white">{totalLinked}</p>
          <p className="m-0 mt-1.5 text-xs font-medium text-blue-200">
            linked employee{totalLinked !== 1 ? 's' : ''}
          </p>
        </div>
        {linked.map((dept) => {
          const count = dept.employeeCount ?? dept.employees?.length ?? 0
          return (
            <div
              key={dept.name}
              className="rounded-xl border border-slate-100 bg-white p-5 shadow-sm"
            >
              <p className="m-0 truncate text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                {dept.name}
              </p>
              <p className="m-0 mt-2 text-3xl font-extrabold leading-none text-slate-900">{count}</p>
              {dept.averageTrustScore != null && (
                <span className="mt-2.5 inline-flex rounded-md bg-blue-50 px-2 py-0.5 text-[11px] font-semibold text-[#1a3a8f]">
                  avg {dept.averageTrustScore}
                </span>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function SectionLabel({ icon, title, count, countLabel }) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-500">
        {icon}
      </div>
      <div className="flex items-baseline gap-2.5">
        <h2 className="m-0 text-base font-bold text-slate-900">{title}</h2>
        {count != null && (
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-500">
            {count} {countLabel}
          </span>
        )}
      </div>
      <div className="ml-2 h-px flex-1 bg-slate-100" />
    </div>
  )
}

function TeamManagement() {
  const queryClient = useQueryClient()
  const [showInvite, setShowInvite] = useState(false)
  const [accessRequestEmployee, setAccessRequestEmployee] = useState(null)
  const [removeAccessEmployee, setRemoveAccessEmployee] = useState(null)

  const refreshTeam = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.team })
  }

  const { data, isLoading, error } = useQuery({
    queryKey: enterpriseKeys.team,
    queryFn: fetchTeam,
  })

  const departments = extractTeamDepartments(data)
  const linkedDepartments = departments.filter(
    (d) => (d.employeeCount ?? 0) > 0 || (d.employees?.length ?? 0) > 0
  )
  const totalLinked = linkedDepartments.reduce(
    (sum, d) => sum + (d.employeeCount ?? d.employees?.length ?? 0),
    0
  )

  const handleInviteSuccess = () => {
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.team })
    queryClient.invalidateQueries({ queryKey: enterpriseKeys.invitationsPending })
    setShowInvite(false)
  }

  if (isLoading) return <Loader variant="fullPage" label="Loading team..." />

  return (
    <EnterpriseLayout>
      <div className="px-4 py-6 md:px-6 md:py-8 lg:px-8">
        <div className="mb-8 flex items-start justify-between gap-4">
          <div>
            <h1 className="m-0 text-xl font-extrabold text-slate-900">Team Management</h1>
            <p className="m-0 mt-1 text-sm text-slate-500">
              Manage your linked workforce and employee access
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowInvite(true)}
            className="flex shrink-0 items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-800 shadow-sm transition hover:bg-slate-50"
          >
            <PlusIcon />
            <span className="hidden sm:inline">Invite Employee</span>
          </button>
        </div>

        {error && (
          <p className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </p>
        )}

        {totalLinked > 0 ? (
          <div>
            <TeamStats departments={departments} totalLinked={totalLinked} />

            <div className="mb-10">
              <SectionLabel
                icon={<UsersIcon />}
                title="Linked Employees"
                count={totalLinked}
                countLabel={totalLinked !== 1 ? 'employees' : 'employee'}
              />
              <div className="space-y-5">
                {linkedDepartments.map((dept) => (
                  <DepartmentEmployeeSection
                    key={dept.name}
                    department={dept.name}
                    prefetchedEmployees={dept.employees}
                    onRequestAccess={setAccessRequestEmployee}
                    onRemoveAccess={setRemoveAccessEmployee}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionLabel icon={<ClockIcon />} title="Pending Invitations" />
              <PendingInvitationsTab />
            </div>
          </div>
        ) : (
          <>
            <div className="mb-10 rounded-2xl border border-dashed border-slate-200 bg-white p-12 text-center">
              <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-400">
                <UsersIcon />
              </div>
              <p className="m-0 text-sm font-semibold text-slate-600">No employees linked yet.</p>
              <p className="m-0 mt-1 text-xs text-slate-400">
                Send invitations to start building your workforce.
              </p>
              <div className="mt-6">
                <Button type="button" onClick={() => setShowInvite(true)} fullWidth={false}>
                  Invite Employee
                </Button>
              </div>
            </div>

            <div>
              <SectionLabel icon={<ClockIcon />} title="Pending Invitations" />
              <PendingInvitationsTab />
            </div>
          </>
        )}
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
    </EnterpriseLayout>
  )
}

export default TeamManagement

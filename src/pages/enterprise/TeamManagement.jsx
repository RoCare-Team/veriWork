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

        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">

          <div>

            <h1 className="m-0 text-xl font-bold text-slate-900">Team Management</h1>

            <p className="m-0 mt-1 text-sm text-slate-500">

              Employees who accepted your invite and created their profile appear here.

            </p>

          </div>

          <button

            type="button"

            onClick={() => setShowInvite(true)}

            className="flex shrink-0 items-center gap-2 rounded-lg bg-[#1a3a8f] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#152b6e]"

          >

            <PlusIcon />

            Invite Employee

          </button>

        </div>



        {error && (

          <p className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">

            {error.message}

          </p>

        )}



        <section className="mb-10">

          <div className="mb-4 flex items-baseline justify-between gap-3">

            <div>

              <h2 className="m-0 text-base font-semibold text-slate-900">Your employees</h2>

              <p className="m-0 mt-1 text-sm text-slate-500">

                Invited users who joined and completed their profile

              </p>

            </div>

            {linkedEmployees.length > 0 && (

              <span className="shrink-0 text-xs font-medium text-slate-400">

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

            <div className="rounded-xl border border-dashed border-slate-200 bg-white p-10 text-center">

              <p className="m-0 text-sm font-medium text-slate-600">No employees yet</p>

              <p className="m-0 mt-1 text-xs text-slate-400">

                Once someone accepts your invite and creates their profile, they will show up here.

              </p>

              <div className="mt-6">

                <Button type="button" onClick={() => setShowInvite(true)} fullWidth={false}>

                  Invite Employee

                </Button>

              </div>

            </div>

          )}

        </section>



        <section>

          <h2 className="m-0 text-base font-semibold text-slate-900">Pending invitations</h2>

          <p className="m-0 mt-1 text-sm text-slate-500">

            Invited but not yet registered or accepted

          </p>

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


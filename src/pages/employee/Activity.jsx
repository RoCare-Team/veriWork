import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SegmentTabs from '../../components/employee/SegmentTabs'
import ActivityRequestCard from '../../components/employee/ActivityRequestCard'
import Loader from '../../components/common/Loader'
import {
  employeeKeys,
  fetchActivity,
  updateActivity,
  fetchInvitations,
  acceptInvitation,
  rejectInvitation,
  fetchEmployeeAccessRequests,
  approveAccessRequest,
  rejectAccessRequest,
} from '../../api/employee'
import { getInvitationStatusStyle, formatRequestType, getAccessRequestStatusStyle } from '../../utils/enterpriseTeamUtils'
import { formatAccessDate } from '../../utils/formatters'
import { useToast } from '../../context/ToastContext'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'requests', label: 'Requests' },
  { id: 'updates', label: 'Updates' },
]

function mapItem(item) {
  return {
    id: item._id || item.id,
    title: item.title,
    company: item.company,
    message: item.message,
    time: new Date(item.createdAt).toLocaleDateString(),
    status: item.status,
    type: item.type,
  }
}

function InvitationStatusBadge({ status }) {
  const style = getInvitationStatusStyle(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

function AccessStatusBadge({ status }) {
  const style = getAccessRequestStatusStyle(status)
  return (
    <span className={`inline-flex rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide ${style.bg} ${style.color}`}>
      {style.label}
    </span>
  )
}

function Activity() {
  const { toast } = useToast()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')

  const activityQuery = useQuery({
    queryKey: employeeKeys.activity(activeTab),
    queryFn: () => fetchActivity(activeTab),
  })

  const invitationsQuery = useQuery({
    queryKey: employeeKeys.invitations,
    queryFn: fetchInvitations,
  })

  const accessQuery = useQuery({
    queryKey: employeeKeys.accessRequests,
    queryFn: fetchEmployeeAccessRequests,
  })

  const invitations = invitationsQuery.data?.invitations || invitationsQuery.data || []
  const pendingInvitations = invitations.filter((i) => i.status === 'pending')
  const accessRequests = accessQuery.data?.requests || accessQuery.data || []
  const pendingAccess = accessRequests.filter((r) => r.status === 'pending')

  const requests = useMemo(
    () => (activityQuery.data?.pendingRequests || []).map(mapItem).filter((i) => i.status === 'pending'),
    [activityQuery.data?.pendingRequests],
  )
  const updates = useMemo(
    () => (activityQuery.data?.recentUpdates || []).map(mapItem),
    [activityQuery.data?.recentUpdates],
  )

  const activityMutation = useMutation({
    mutationFn: ({ id, status }) => updateActivity(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['employee', 'activity'] }),
  })

  const acceptInvitationMutation = useMutation({
    mutationFn: acceptInvitation,
    onSuccess: () => {
      toast('Invitation accepted', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.invitations })
    },
    onError: (err) => toast(err.message || 'Failed to accept', 'error'),
  })

  const rejectInvitationMutation = useMutation({
    mutationFn: rejectInvitation,
    onSuccess: () => {
      toast('Invitation rejected', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.invitations })
    },
    onError: (err) => toast(err.message || 'Failed to reject', 'error'),
  })

  const approveAccessMutation = useMutation({
    mutationFn: approveAccessRequest,
    onSuccess: () => {
      toast('Access approved', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.accessRequests })
    },
    onError: (err) => toast(err.message || 'Failed to approve', 'error'),
  })

  const rejectAccessMutation = useMutation({
    mutationFn: rejectAccessRequest,
    onSuccess: () => {
      toast('Access rejected', 'success')
      queryClient.invalidateQueries({ queryKey: employeeKeys.accessRequests })
    },
    onError: (err) => toast(err.message || 'Failed to reject', 'error'),
  })

  const actionPending =
    acceptInvitationMutation.isPending ||
    rejectInvitationMutation.isPending ||
    approveAccessMutation.isPending ||
    rejectAccessMutation.isPending

  const isLoading = activityQuery.isLoading || invitationsQuery.isLoading || accessQuery.isLoading

  if (isLoading) return <Loader variant="fullPage" label="Loading activity..." />

  const hasPending =
    pendingInvitations.length > 0 || pendingAccess.length > 0 || requests.length > 0

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Activity" subtitle="Manage invitations, access requests, and updates" />
      {(activityQuery.error || invitationsQuery.error || accessQuery.error) && (
        <p className="mb-4 text-sm text-red-600">
          {activityQuery.error?.message || invitationsQuery.error?.message || accessQuery.error?.message}
        </p>
      )}

      <SegmentTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6 space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        {(activeTab === 'all' || activeTab === 'requests') && (
          <section className="lg:col-span-2">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <h2 className="m-0 text-sm font-bold text-slate-800">Pending Requests</h2>
              <div className="flex gap-3">
                <Link to="/employee/invitations" className="text-xs font-semibold text-[#1e3a8a] no-underline hover:underline">
                  All invitations
                </Link>
                <Link to="/employee/access-requests" className="text-xs font-semibold text-[#1e3a8a] no-underline hover:underline">
                  All access requests
                </Link>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {pendingInvitations.map((inv) => {
                const id = inv.invitationId || inv._id || inv.id
                return (
                  <article key={`inv-${id}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="m-0 text-xs font-bold uppercase tracking-wide text-[#1e3a8a]">Company Invitation</p>
                        <h3 className="m-0 mt-1 text-base font-bold text-slate-900">{inv.companyName}</h3>
                        <p className="m-0 mt-1 text-sm text-slate-600">{inv.department} · {inv.designation}</p>
                      </div>
                      <InvitationStatusBadge status={inv.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => rejectInvitationMutation.mutate(id)}
                        disabled={actionPending}
                        className="h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => acceptInvitationMutation.mutate(id)}
                        disabled={actionPending}
                        className="h-11 rounded-xl bg-[#1e3a8a] text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Accept
                      </button>
                    </div>
                  </article>
                )
              })}

              {pendingAccess.map((req) => {
                const id = req._id || req.id
                return (
                  <article key={`access-${id}`} className="rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="m-0 text-xs font-bold uppercase tracking-wide text-purple-700">Access Request</p>
                        <h3 className="m-0 mt-1 text-base font-bold text-slate-900">{req.companyName}</h3>
                        <p className="m-0 mt-1 text-sm text-slate-600">{formatRequestType(req.requestType)}</p>
                        <p className="m-0 mt-1 text-xs text-slate-400">{formatAccessDate(req.requestedAt || req.createdAt)}</p>
                      </div>
                      <AccessStatusBadge status={req.status} />
                    </div>
                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => rejectAccessMutation.mutate(id)}
                        disabled={actionPending}
                        className="h-11 rounded-xl border border-slate-200 text-sm font-semibold text-slate-700 disabled:opacity-50"
                      >
                        Reject
                      </button>
                      <button
                        type="button"
                        onClick={() => approveAccessMutation.mutate(id)}
                        disabled={actionPending}
                        className="h-11 rounded-xl bg-[#1e3a8a] text-sm font-semibold text-white disabled:opacity-50"
                      >
                        Approve
                      </button>
                    </div>
                  </article>
                )
              })}

              {requests.map((item) => (
                <ActivityRequestCard
                  key={item.id}
                  item={item}
                  onApprove={() => activityMutation.mutate({ id: item.id, status: 'approved' })}
                  onDeny={() => activityMutation.mutate({ id: item.id, status: 'denied' })}
                />
              ))}

              {!hasPending && (
                <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
                  No pending requests
                </p>
              )}
            </div>
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'updates') && (
          <section className={activeTab === 'all' ? '' : 'lg:col-span-2'}>
            <h2 className="m-0 mb-4 text-sm font-bold text-slate-800">Recent Updates</h2>
            <div className="flex flex-col gap-3">
              {updates.length > 0 ? (
                updates.map((item) => (
                  <ActivityRequestCard key={item.id} item={item} showActions={false} />
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No recent updates</p>
              )}
            </div>
          </section>
        )}
      </div>
    </EmployeeLayout>
  )
}

export default Activity

import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SegmentTabs from '../../components/employee/SegmentTabs'
import ActivityRequestCard from '../../components/employee/ActivityRequestCard'
import Loader from '../../components/common/Loader'
import { employeeKeys, fetchActivity, updateActivity } from '../../api/employee'

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

function Activity() {
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const { data = [], isLoading, error } = useQuery({
    queryKey: employeeKeys.activity,
    queryFn: fetchActivity,
  })

  const items = useMemo(() => data.map(mapItem), [data])
  const requests = items.filter((i) => i.status === 'pending')
  const updates = items.filter((i) => i.status !== 'pending')

  const actionMutation = useMutation({
    mutationFn: ({ id, status }) => updateActivity(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: employeeKeys.activity }),
  })

  if (isLoading) return <Loader variant="fullPage" label="Loading activity..." />

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Activity" subtitle="Manage access requests and updates" />
      {error && <p className="mb-4 text-sm text-red-600">{error.message}</p>}

      <SegmentTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6 space-y-8 lg:grid lg:grid-cols-2 lg:gap-8 lg:space-y-0">
        {(activeTab === 'all' || activeTab === 'requests') && (
          <section>
            <h2 className="m-0 mb-4 text-sm font-bold text-slate-800">Pending Requests</h2>
            <div className="flex flex-col gap-3">
              {requests.length > 0 ? (
                requests.map((item) => (
                  <ActivityRequestCard
                    key={item.id}
                    item={item}
                    onApprove={() => actionMutation.mutate({ id: item.id, status: 'approved' })}
                    onDeny={() => actionMutation.mutate({ id: item.id, status: 'denied' })}
                  />
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">No pending requests</p>
              )}
            </div>
          </section>
        )}

        {(activeTab === 'all' || activeTab === 'updates') && (
          <section>
            <h2 className="m-0 mb-4 text-sm font-bold text-slate-800">Recent Updates</h2>
            <div className="flex flex-col gap-3">
              {updates.map((item) => (
                <ActivityRequestCard key={item.id} item={item} showActions={false} />
              ))}
            </div>
          </section>
        )}
      </div>
    </EmployeeLayout>
  )
}

export default Activity

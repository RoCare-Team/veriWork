import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SegmentTabs from '../../components/employee/SegmentTabs'
import ActivityRequestCard from '../../components/employee/ActivityRequestCard'
import Button from '../../components/common/Button'
import { isVerificationComplete } from '../../store/employeeStore'
import { PENDING_REQUESTS, ACTIVITY_UPDATES } from '../../utils/employeePortalData'

const TABS = [
  { id: 'all', label: 'All' },
  { id: 'requests', label: 'Requests' },
  { id: 'updates', label: 'Updates' },
]

function Activity() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('all')
  const [requests, setRequests] = useState(PENDING_REQUESTS)

  useEffect(() => {
    if (!isVerificationComplete()) {
      navigate('/employee/verification', { replace: true })
    }
  }, [navigate])

  const showRequests = activeTab === 'all' || activeTab === 'requests'
  const showUpdates = activeTab === 'all' || activeTab === 'updates'

  const pendingCount = useMemo(() => requests.length, [requests])

  const handleApprove = (id) => setRequests((prev) => prev.filter((r) => r.id !== id))
  const handleDeny = (id) => setRequests((prev) => prev.filter((r) => r.id !== id))

  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Activity"
        subtitle="Manage access requests and track verification updates"
      />

      <SegmentTabs tabs={TABS} active={activeTab} onChange={setActiveTab} />

      <div className="mt-6 space-y-8 md:mt-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 lg:space-y-0">
        {showRequests && (
          <section>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="m-0 text-sm font-bold text-slate-800 md:text-base">Pending Requests</h2>
              {pendingCount > 0 && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-[#1a3a8f]">
                  {pendingCount} New
                </span>
              )}
            </div>
            <div className="flex flex-col gap-3 md:gap-4">
              {requests.length > 0 ? (
                requests.map((item) => (
                  <ActivityRequestCard
                    key={item.id}
                    item={item}
                    onApprove={handleApprove}
                    onDeny={handleDeny}
                  />
                ))
              ) : (
                <p className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
                  No pending requests
                </p>
              )}
            </div>
          </section>
        )}

        {showUpdates && (
          <section>
            <h2 className="m-0 mb-4 text-sm font-bold text-slate-800 md:text-base">Recent Updates</h2>
            <div className="flex flex-col gap-3 md:gap-4">
              {ACTIVITY_UPDATES.map((item) => (
                <ActivityRequestCard key={item.id} item={item} showActions={false} />
              ))}
            </div>
          </section>
        )}
      </div>

      <Link to="/employee/settings/privacy" className="mt-8 block no-underline lg:mt-10">
        <Button type="button" variant="secondary">
          Privacy Settings
        </Button>
      </Link>
    </EmployeeLayout>
  )
}

export default Activity

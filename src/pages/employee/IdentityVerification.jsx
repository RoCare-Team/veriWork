import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import VerificationProgressCard from '../../components/employee/VerificationProgressCard'
import VerificationStepCard from '../../components/employee/VerificationStepCard'
import VerificationStepBar from '../../components/employee/VerificationStepBar'
import VerificationFlowGuide from '../../components/employee/VerificationFlowGuide'
import SecurityFooter from '../../components/employee/SecurityFooter'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import { LockIcon } from '../../components/common/Icons'
import { employeeKeys, fetchVerificationStatus } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'
import { getVerificationNextRoute, mapVerificationSteps } from '../../utils/employeeApiUtils'

function IdentityVerification() {
  const { profile } = useAuth()
  const { data: status, isLoading, error } = useQuery({
    queryKey: employeeKeys.verification,
    queryFn: fetchVerificationStatus,
  })

  const steps = useMemo(
    () => mapVerificationSteps(status?.steps, status?.currentStep),
    [status],
  )

  const nextRoute = useMemo(() => getVerificationNextRoute(status), [status])

  const profileIncomplete =
    status?.profileSetupComplete === false ||
    (status?.currentStep === 'profile' && !status?.isComplete)

  if (isLoading) return <Loader variant="fullPage" label="Loading verification..." />

  if (error) {
    return (
      <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
        <EmployeePageHeader title="Identity Verification" subtitle="Unable to load status" />
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error.message}</p>
      </EmployeeLayout>
    )
  }

  if (profileIncomplete) {
    return (
      <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
        <VerificationStepBar currentStep="profile" className="mb-6" />
        <EmployeePageHeader title="Identity Verification" subtitle="Complete your profile first" />
        <VerificationFlowGuide />
        <Link to="/employee/profile-setup" className="mt-6 block no-underline">
          <Button type="button">Create Your Profile</Button>
        </Link>
      </EmployeeLayout>
    )
  }

  const complete = status.isComplete

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
      <VerificationStepBar currentStep={status.currentStep} className="mb-6" />
      <EmployeePageHeader
        title="Identity Verification"
        subtitle={`${profile?.name || 'Your account'} · ${profile?.veriworkId || ''}`}
      />

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="lg:sticky lg:top-24">
          <VerificationProgressCard
            percent={status.verificationPercent ?? 0}
            currentStep={status.currentStep}
            message={complete ? 'Your identity is fully verified!' : 'Keep going!'}
          />
          <div className="mt-5"><VerificationFlowGuide /></div>
        </div>

        <div>
          <h2 className="m-0 mb-4 text-sm font-bold text-slate-800">3 simple steps to verify</h2>
          {steps.length > 0 ? (
            <div className="flex flex-col gap-3">
              {steps.map((step) => (
                <VerificationStepCard key={step.id} step={step} />
              ))}
            </div>
          ) : (
            <p className="rounded-2xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">
              No verification steps available
            </p>
          )}
          <Link to={nextRoute} className="mt-6 block no-underline">
            <Button type="button">
              {complete ? 'View Your Employee Score' : 'Continue Verification'}
            </Button>
          </Link>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
            <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#005fd6]" />
            <p className="m-0 text-sm text-slate-600">Your data is encrypted end-to-end.</p>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default IdentityVerification

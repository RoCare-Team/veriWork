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
import { VERIFICATION_STEPS } from '../../utils/employeeConstants'
import { employeeKeys, fetchVerificationStatus } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'

function resolveStepStatus(stepId, status, currentStep) {
  const done = {
    profile: status.profileSetupComplete,
    aadhaar: status.aadhaarVerified,
    biometric: status.biometricVerified,
  }
  if (done[stepId]) return 'completed'
  if (stepId === currentStep) return 'current'
  const order = ['profile', 'aadhaar', 'biometric']
  if (order.indexOf(stepId) > order.indexOf(currentStep)) return 'locked'
  return 'pending'
}

function IdentityVerification() {
  const { profile } = useAuth()
  const { data: status, isLoading, error } = useQuery({
    queryKey: employeeKeys.verification,
    queryFn: fetchVerificationStatus,
  })

  const steps = useMemo(() => {
    if (!status) return VERIFICATION_STEPS
    return VERIFICATION_STEPS.map((step) => {
      const stepStatus = resolveStepStatus(step.id, status, status.currentStep)
      const canNavigate = stepStatus === 'current' || stepStatus === 'pending'
      return { ...step, status: stepStatus, to: canNavigate ? step.to : undefined }
    })
  }, [status])

  const nextRoute = useMemo(() => {
    if (!status) return '/employee/profile-setup'
    if (status.currentStep === 'profile') return '/employee/profile-setup'
    if (status.currentStep === 'aadhaar') return '/employee/verification/aadhaar'
    if (status.currentStep === 'biometric') return '/employee/verification/biometric'
    return '/employee/score'
  }, [status])

  if (isLoading) return <Loader variant="fullPage" label="Loading verification..." />

  if (error) {
    return (
      <EmployeeLayout>
        <p className="text-red-600">{error.message || 'Failed to load verification status'}</p>
      </EmployeeLayout>
    )
  }

  if (!status?.profileSetupComplete) {
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
      <EmployeePageHeader title="Identity Verification" subtitle={`${profile?.name} · ${profile?.veriworkId}`} />

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8">
        <div className="lg:sticky lg:top-24">
          <VerificationProgressCard
            percent={status.verificationPercent}
            currentStep={status.currentStep}
            message={complete ? 'Your identity is fully verified!' : 'Keep going!'}
          />
          <div className="mt-5"><VerificationFlowGuide /></div>
        </div>

        <div>
          <h2 className="m-0 mb-4 text-sm font-bold text-slate-800">3 simple steps to verify</h2>
          <div className="flex flex-col gap-3">
            {steps.map((step) => (
              <VerificationStepCard key={step.id} step={step} />
            ))}
          </div>
          <Link to={nextRoute} className="mt-6 block no-underline">
            <Button type="button">
              {complete ? 'View Your Employee Score' : 'Continue Verification'}
            </Button>
          </Link>
          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
            <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1a3a8f]" />
            <p className="m-0 text-sm text-slate-600">Your data is encrypted end-to-end.</p>
          </div>
        </div>
      </div>
    </EmployeeLayout>
  )
}

export default IdentityVerification

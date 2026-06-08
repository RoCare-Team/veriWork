import { useMemo } from 'react'

import { Link } from 'react-router-dom'

import EmployeeLayout from '../../layouts/EmployeeLayout'

import EmployeePageHeader from '../../components/employee/PageHeader'

import VerificationProgressCard from '../../components/employee/VerificationProgressCard'

import VerificationStepCard from '../../components/employee/VerificationStepCard'

import VerificationStepBar from '../../components/employee/VerificationStepBar'

import VerificationFlowGuide from '../../components/employee/VerificationFlowGuide'

import SecurityFooter from '../../components/employee/SecurityFooter'

import Button from '../../components/common/Button'

import { LockIcon } from '../../components/common/Icons'

import { VERIFICATION_STEPS } from '../../utils/employeeConstants'

import {

  getCurrentVerificationStep,

  getEmployeeProfile,

  getEmployeeData,

  getVerificationPercent,

  isProfileSetupComplete,

  isVerificationComplete,

} from '../../store/employeeStore'



function resolveStepStatus(stepId, profile, currentStep) {

  const done = {

    profile: profile.profileSetupComplete,

    aadhaar: profile.aadhaarVerified,

    biometric: profile.biometricVerified,

  }



  if (done[stepId]) return 'completed'

  if (stepId === currentStep) return 'current'



  const order = ['profile', 'aadhaar', 'biometric']

  const stepIndex = order.indexOf(stepId)

  const currentIndex = order.indexOf(currentStep)

  if (stepIndex > currentIndex) return 'locked'

  return 'pending'

}



function IdentityVerification() {

  const profile = getEmployeeData()

  const display = getEmployeeProfile()

  const currentStep = getCurrentVerificationStep()

  const complete = isVerificationComplete()

  const percent = getVerificationPercent()



  const steps = useMemo(

    () =>

      VERIFICATION_STEPS.map((step) => {

        const status = resolveStepStatus(step.id, profile, currentStep)

        const canNavigate = status === 'current' || status === 'pending'

        return {

          ...step,

          status,

          to: canNavigate ? step.to : undefined,

        }

      }),

    [profile, currentStep],

  )



  const nextRoute = useMemo(() => {

    if (currentStep === 'profile') return '/employee/profile-setup'

    if (currentStep === 'aadhaar') return '/employee/verification/aadhaar'

    if (currentStep === 'biometric') return '/employee/verification/biometric'

    return '/employee/score'

  }, [currentStep])



  const nextLabel = useMemo(() => {

    if (currentStep === 'profile') return 'Complete Profile'

    if (currentStep === 'aadhaar') return 'Verify Aadhaar'

    if (currentStep === 'biometric') return 'Start Biometric Check'

    return 'View Your Employee Score'

  }, [currentStep])



  if (!isProfileSetupComplete()) {

    return (

      <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>

        <VerificationStepBar currentStep="profile" className="mb-6" />

        <EmployeePageHeader

          title="Identity Verification"

          subtitle="Complete your profile first to begin verification"

        />

        <VerificationFlowGuide />

        <Link to="/employee/profile-setup" className="mt-6 block no-underline">

          <Button type="button">Create Your Profile</Button>

        </Link>

      </EmployeeLayout>

    )

  }



  return (

    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>

      <VerificationStepBar currentStep={currentStep} className="mb-6" />



      <EmployeePageHeader

        title="Identity Verification"

        subtitle={`${display.name} · ${display.veriworkId}`}

      />



      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">

        <div className="lg:sticky lg:top-24">

          <VerificationProgressCard

            percent={percent}

            currentStep={currentStep}

            message={

              complete

                ? 'Your identity is fully verified!'

                : percent >= 66

                  ? 'One step left!'

                  : percent >= 33

                    ? 'Good progress!'

                    : 'Let\'s get started'

            }

          />



          <div className="mt-5">

            <VerificationFlowGuide />

          </div>



          {complete && (

            <div className="mt-4 rounded-2xl border border-green-200 bg-green-50 p-4 text-center md:p-5">

              <p className="m-0 text-sm font-semibold text-green-800 md:text-base">

                All 3 steps complete! Your Professional ID is ready.

              </p>

            </div>

          )}



          <div className="mt-6 hidden items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 md:flex lg:mt-8">

            <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1a3a8f]" />

            <div>

              <p className="m-0 text-sm font-bold text-[#1a3a8f]">Privacy-First Encryption</p>

              <p className="m-0 mt-1 text-xs leading-relaxed text-slate-600 md:text-sm">

                Your data is encrypted end-to-end and never shared without your consent.

              </p>

            </div>

          </div>

        </div>



        <div>

          <section>

            <h2 className="m-0 mb-1 text-sm font-bold text-slate-800 md:text-base">

              3 simple steps to verify

            </h2>

            <p className="m-0 mb-4 text-xs text-slate-500 md:text-sm">

              Complete each step in order. Later steps unlock after the previous one is done.

            </p>

            <div className="flex flex-col gap-3 md:gap-4">

              {steps.map((step) => (

                <VerificationStepCard key={step.id} step={step} />

              ))}

            </div>

          </section>



          <Link to={nextRoute} className="mt-6 block no-underline md:mt-8">

            <Button type="button">{nextLabel}</Button>

          </Link>



          <div className="mt-6 flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 md:mt-8 md:hidden">

            <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1a3a8f]" />

            <div>

              <p className="m-0 text-sm font-bold text-[#1a3a8f]">Privacy-First Encryption</p>

              <p className="m-0 mt-1 text-xs leading-relaxed text-slate-600">

                Your data is encrypted end-to-end and never shared without your consent.

              </p>

            </div>

          </div>

        </div>

      </div>

    </EmployeeLayout>

  )

}



export default IdentityVerification


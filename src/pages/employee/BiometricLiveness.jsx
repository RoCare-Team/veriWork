import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import CameraCapture from '../../components/employee/CameraCapture'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { ShieldCheckIcon } from '../../components/common/Icons'
import VerificationStepBar, { VerificationBackLink } from '../../components/employee/VerificationStepBar'
import {
  getEmployeeData,
  getEmployeeProfile,
  isProfileSetupComplete,
  markBiometricVerified,
} from '../../store/employeeStore'

function BiometricLiveness() {
  const navigate = useNavigate()
  const { aadhaarVerified } = getEmployeeData()
  const profile = getEmployeeProfile()
  const firstName = profile.name.split(' ')[0]
  const [capturedImage, setCapturedImage] = useState(null)
  const [isVerifying, setIsVerifying] = useState(false)
  const [matchResult, setMatchResult] = useState(null)

  useEffect(() => {
    if (!isProfileSetupComplete()) {
      navigate('/employee/profile-setup', { replace: true })
      return
    }
    if (!aadhaarVerified) navigate('/employee/verification/aadhaar', { replace: true })
  }, [aadhaarVerified, navigate])

  const handleCapture = (image) => {
    setCapturedImage(image)
    if (!image) setMatchResult(null)
  }

  const handleVerify = async () => {
    if (!capturedImage) return

    setIsVerifying(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1500))
    setIsVerifying(false)
    setMatchResult('success')
    markBiometricVerified(capturedImage)
    await new Promise((resolve) => window.setTimeout(resolve, 1000))
    navigate('/employee/score')
  }

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
      <VerificationBackLink />
      <VerificationStepBar currentStep="biometric" className="mb-6" />
      <EmployeePageHeader
        title="Step 3 — Biometric Liveness"
        subtitle={`Hi ${firstName}, follow the on-screen prompts to verify your face`}
      />

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
        <div className="lg:sticky lg:top-24">
          <CameraCapture liveness userName={firstName} onCapture={handleCapture} />
        </div>

        <div className="mt-6 space-y-5 lg:mt-0 lg:space-y-6">
          <section>
            <h2 className="m-0 text-base font-bold text-slate-900 md:text-lg">Liveness Check</h2>
            <p className="mt-1.5 text-sm leading-relaxed text-slate-500 md:text-base">
              Keep your face in the oval. When detected, the frame turns{' '}
              <strong className="text-green-600">green</strong> and you&apos;ll be asked to move
              left and right.
            </p>
          </section>

          <ol className="m-0 flex flex-col gap-2 p-0 list-none text-sm text-slate-600">
            <li className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">1</span>
              Face detected → green frame
            </li>
            <li className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">2</span>
              {firstName}, move face left
            </li>
            <li className="flex items-center gap-2 rounded-xl bg-slate-50 px-3 py-2.5">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-200 text-xs font-bold">3</span>
              {firstName}, move face right
            </li>
          </ol>

          {capturedImage && matchResult !== 'success' && (
            <div className="rounded-2xl border border-green-200 bg-green-50 p-4 md:p-5">
              <p className="m-0 text-sm font-semibold text-green-800">
                {firstName}, face scan complete! Tap below to finish verification.
              </p>
            </div>
          )}

          {matchResult === 'success' && (
            <div className="flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 p-4 md:p-5">
              <ShieldCheckIcon className="h-5 w-5 shrink-0 text-green-600" />
              <p className="m-0 text-sm font-semibold text-green-800 md:text-base">
                Face match successful! Updating your VeriScore...
              </p>
            </div>
          )}

          <Button
            type="button"
            disabled={!capturedImage || isVerifying || matchResult === 'success'}
            onClick={handleVerify}
          >
            {isVerifying ? 'Matching face...' : 'Verify & Continue'}
          </Button>
        </div>
      </div>

      {isVerifying && <Loader variant="overlay" label="Running liveness check..." />}
    </EmployeeLayout>
  )
}

export default BiometricLiveness

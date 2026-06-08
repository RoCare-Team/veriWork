import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import DigiLockerButton from '../../components/employee/DigiLockerButton'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { LockIcon, IdCardIcon } from '../../components/common/Icons'
import VerificationStepBar, { VerificationBackLink } from '../../components/employee/VerificationStepBar'
import { getEmployeeData, isProfileSetupComplete, markAadhaarVerified } from '../../store/employeeStore'

function formatAadhaar(value) {
  const digits = value.replace(/\D/g, '').slice(0, 12)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function AadhaarVerification() {
  const navigate = useNavigate()
  const { aadhaarVerified } = getEmployeeData()
  const [method, setMethod] = useState('digilocker')
  const [aadhaar, setAadhaar] = useState('')
  const [consent, setConsent] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [digilockerLoading, setDigilockerLoading] = useState(false)

  const digits = aadhaar.replace(/\s/g, '')
  const otpValid = digits.length === 12 && consent

  useEffect(() => {
    if (!isProfileSetupComplete()) {
      navigate('/employee/profile-setup', { replace: true })
      return
    }
    if (aadhaarVerified) navigate('/employee/verification/biometric', { replace: true })
  }, [aadhaarVerified, navigate])

  const goNext = () => navigate('/employee/verification/biometric')

  const handleDigiLocker = async () => {
    setDigilockerLoading(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1800))
    markAadhaarVerified({ viaDigilocker: true })
    setDigilockerLoading(false)
    goNext()
  }

  const handleOtpSubmit = async (e) => {
    e.preventDefault()
    if (!otpValid) return

    setIsSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 1200))
    markAadhaarVerified({ viaDigilocker: false })
    setIsSubmitting(false)
    goNext()
  }

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
      <VerificationBackLink />
      <VerificationStepBar currentStep="aadhaar" className="mb-6" />
      <EmployeePageHeader
        title="Step 2 — Aadhaar Linking"
        subtitle="Verify your government ID via DigiLocker or OTP"
      />

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
        <div className="space-y-5 lg:sticky lg:top-24">
          <div className="flex items-start gap-3 rounded-2xl border border-blue-100 bg-blue-50/80 p-4 md:p-5">
            <LockIcon className="mt-0.5 h-5 w-5 shrink-0 text-[#1a3a8f]" />
            <div>
              <p className="m-0 text-sm font-bold text-[#1a3a8f] md:text-base">Privacy-First Encryption</p>
              <p className="m-0 mt-1 text-xs leading-relaxed text-slate-600 md:text-sm">
                Your Aadhaar is fetched securely from DigiLocker. Data is encrypted using
                AES-256 and stored in an ISO 27001 certified vault.
              </p>
            </div>
          </div>

          {method === 'digilocker' && (
            <div className="hidden rounded-2xl border border-purple-100 bg-purple-50/60 p-5 lg:block">
              <p className="m-0 text-xs font-semibold uppercase tracking-wide text-purple-700">
                Why DigiLocker?
              </p>
              <ul className="m-0 mt-3 list-none space-y-2 p-0 text-sm text-slate-600">
                <li>• Government-issued digital locker</li>
                <li>• No manual Aadhaar entry needed</li>
                <li>• Instant e-KYC document fetch</li>
                <li>• UIDAI compliant verification</li>
              </ul>
            </div>
          )}
        </div>

        <div>
          {method === 'digilocker' ? (
            <div className="flex flex-col gap-5 md:gap-6">
              <section>
                <h2 className="m-0 text-base font-bold text-slate-900 md:text-lg">Verify with DigiLocker</h2>
                <p className="mt-1.5 text-sm leading-relaxed text-slate-500 md:text-base">
                  Link your DigiLocker account to fetch Aadhaar e-KYC documents instantly.
                </p>
              </section>

              <div className="rounded-2xl border border-purple-100 bg-purple-50/60 p-4 lg:hidden">
                <p className="m-0 text-xs font-semibold uppercase tracking-wide text-purple-700">
                  Recommended
                </p>
                <p className="m-0 mt-1 text-sm text-slate-600">
                  Government-issued digital locker for secure document sharing.
                </p>
              </div>

              <DigiLockerButton onClick={handleDigiLocker} loading={digilockerLoading} />

              <button
                type="button"
                onClick={() => setMethod('otp')}
                className="text-center text-sm font-semibold text-[#1a3a8f] hover:underline md:text-base"
              >
                Other Verification Methods
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-5 md:gap-6" onSubmit={handleOtpSubmit} noValidate>
              <div>
                <h2 className="m-0 text-base font-bold text-slate-900 md:text-lg">Enter Aadhaar Number</h2>
                <p className="mt-1.5 text-sm text-slate-500 md:text-base">
                  Verify manually via OTP sent to your registered mobile.
                </p>
                <div className="mt-4 md:mt-5">
                  <Input
                    id="aadhaar"
                    label="Aadhaar Number"
                    type="text"
                    inputMode="numeric"
                    placeholder="0000 0000 0000"
                    value={aadhaar}
                    onChange={(e) => setAadhaar(formatAadhaar(e.target.value))}
                    leftIcon={<IdCardIcon className="h-[18px] w-[18px]" />}
                    disabled={isSubmitting}
                    autoComplete="off"
                  />
                </div>
              </div>

              <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-slate-100 bg-white p-4 md:p-5">
                <input
                  type="checkbox"
                  checked={consent}
                  onChange={(e) => setConsent(e.target.checked)}
                  className="mt-0.5 h-4 w-4 shrink-0 rounded border-slate-300 text-[#1a3a8f] focus:ring-[#1a3a8f]"
                  disabled={isSubmitting}
                />
                <span className="text-xs leading-relaxed text-slate-600 md:text-sm">
                  I authorize VeriWork to fetch my identity details from UIDAI for
                  employment verification purposes.
                </span>
              </label>

              <Button type="submit" disabled={!otpValid || isSubmitting}>
                {isSubmitting ? 'Verifying...' : 'Verify via OTP'}
              </Button>

              <button
                type="button"
                onClick={() => setMethod('digilocker')}
                className="text-center text-sm font-semibold text-[#1a3a8f] hover:underline md:text-base"
              >
                Back to DigiLocker
              </button>
            </form>
          )}
        </div>
      </div>

      {(isSubmitting || digilockerLoading) && (
        <Loader
          variant="overlay"
          label={digilockerLoading ? 'Connecting to DigiLocker...' : 'Sending OTP...'}
        />
      )}
    </EmployeeLayout>
  )
}

export default AadhaarVerification

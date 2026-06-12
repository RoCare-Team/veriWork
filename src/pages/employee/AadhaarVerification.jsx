import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Button from '../../components/common/Button'
import Input from '../../components/common/Input'
import Loader from '../../components/common/Loader'
import DigiLockerButton from '../../components/employee/DigiLockerButton'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { LockIcon, IdCardIcon } from '../../components/common/Icons'
import VerificationStepBar, { VerificationBackLink } from '../../components/employee/VerificationStepBar'
import { employeeKeys, verifyAadhaar } from '../../api/employee'

function formatAadhaar(value) {
  const digits = value.replace(/\D/g, '').slice(0, 12)
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

function AadhaarVerification() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [method, setMethod] = useState('digilocker')
  const [aadhaar, setAadhaar] = useState('')
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState('')

  const digits = aadhaar.replace(/\s/g, '')
  const otpValid = digits.length === 12 && consent

  const mutation = useMutation({
    mutationFn: (m) => verifyAadhaar(m),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.verification })
      queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
      navigate('/employee/verification/biometric')
    },
    onError: (err) => setError(err.message || 'Verification failed'),
  })

  const handleDigiLocker = () => mutation.mutate('digilocker')
  const handleOtpSubmit = (e) => {
    e.preventDefault()
    if (!otpValid) return
    mutation.mutate('otp')
  }

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Bank-Grade Security Protocol" />}>
      <VerificationBackLink />
      <VerificationStepBar currentStep="aadhaar" className="mb-6" />
      <EmployeePageHeader title="Step 2 — Aadhaar Linking" subtitle="Verify via DigiLocker or OTP" />

      {error && <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="lg:grid lg:grid-cols-2 lg:gap-8">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/80 p-4">
          <LockIcon className="h-5 w-5 text-[#1a3a8f]" />
          <p className="mt-2 text-sm text-slate-600">Aadhaar data is encrypted and never stored in plain text.</p>
        </div>

        <div>
          {method === 'digilocker' ? (
            <div className="flex flex-col gap-4">
              <DigiLockerButton onClick={handleDigiLocker} loading={mutation.isPending} />
              <button type="button" onClick={() => setMethod('otp')} className="text-sm font-semibold text-[#1a3a8f] hover:underline">
                Other Verification Methods
              </button>
            </div>
          ) : (
            <form className="flex flex-col gap-4" onSubmit={handleOtpSubmit}>
              <Input id="aadhaar" label="Aadhaar Number" value={aadhaar} onChange={(e) => setAadhaar(formatAadhaar(e.target.value))} leftIcon={<IdCardIcon className="h-[18px] w-[18px]" />} />
              <label className="flex items-start gap-3 text-sm text-slate-600">
                <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} className="mt-1" />
                I authorize VeriWork to fetch my identity from UIDAI.
              </label>
              <Button type="submit" disabled={!otpValid || mutation.isPending}>Verify via OTP</Button>
              <button type="button" onClick={() => setMethod('digilocker')} className="text-sm font-semibold text-[#1a3a8f] hover:underline">
                Back to DigiLocker
              </button>
            </form>
          )}
        </div>
      </div>

      {mutation.isPending && <Loader variant="overlay" label="Verifying Aadhaar..." />}
    </EmployeeLayout>
  )
}

export default AadhaarVerification

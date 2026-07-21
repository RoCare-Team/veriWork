import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import EmployeeAuthLayout from '../../layouts/EmployeeAuthLayout'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import PhoneInput from '../../components/employee/PhoneInput'
import OtpInput from '../../components/employee/OtpInput'
import Toggle from '../../components/employee/Toggle'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { FingerprintIcon } from '../../components/common/Icons'
import { sendEmployeeOtp, verifyEmployeeOtp } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { isEmployeeSession } from '../../lib/authStorage'
import { normalizePhone } from '../../lib/api'

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

function EmployeeLogin() {
  const navigate = useNavigate()
  const { loginEmployee } = useAuth()
  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [biometric, setBiometric] = useState(true)
  const [resendSeconds, setResendSeconds] = useState(0)
  const [error, setError] = useState('')

  const phoneDigits = phone.replace(/\D/g, '')
  const fullPhone = normalizePhone(countryCode, phone)
  const isPhoneValid = phoneDigits.length >= 10
  const isOtpValid = otp.length === 6
  const isReturningFlow = isEmployeeSession()

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendSeconds])

  const sendOtpMutation = useMutation({
    mutationFn: () => sendEmployeeOtp(fullPhone),
    onSuccess: () => {
      setError('')
      setOtpSent(true)
      setOtp('')
      setResendSeconds(30)
    },
    onError: (err) => setError(err.message || 'Failed to send OTP'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => verifyEmployeeOtp(fullPhone, otp),
    onSuccess: (data) => {
      setError('')
      loginEmployee(data)
      navigate(data.homeRoute || '/employee/profile-setup')
    },
    onError: (err) => setError(err.message || 'Invalid OTP'),
  })

  const handleSendOtp = (e) => {
    e.preventDefault()
    if (!isPhoneValid) return
    sendOtpMutation.mutate()
  }

  const handleVerifyOtp = (e) => {
    e.preventDefault()
    if (!isOtpValid) return
    verifyMutation.mutate()
  }

  const handleResend = () => {
    if (resendSeconds > 0) return
    sendOtpMutation.mutate()
  }

  const isSubmitting = sendOtpMutation.isPending || verifyMutation.isPending

  return (
    <EmployeeAuthLayout
      heroTitle={isReturningFlow ? 'Welcome Back' : 'Build Your PagerLook Score'}
      heroSubtitle="Sign in with phone OTP. Dev mock code: 123456"
    >
      <div className="flex flex-col gap-7 md:gap-8">
        <section className="text-center lg:text-left">
          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-[#1e3a8a] md:text-3xl">
            Sign In
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 md:text-base">
            Enter your phone number to access your profile and PagerLook Score.
          </p>
        </section>

        {error && (
          <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <form
          className="flex flex-col gap-4"
          onSubmit={otpSent ? handleVerifyOtp : handleSendOtp}
          noValidate
        >
          {otpSent ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[#1e3a8a]">
                    OTP Sent
                  </p>
                  <p className="m-0 mt-1 text-sm text-slate-700 md:text-base">
                    Code sent to <strong>{fullPhone}</strong>
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => { setOtpSent(false); setOtp('') }}
                  className="shrink-0 text-xs font-semibold text-[#1e3a8a] hover:underline md:text-sm"
                >
                  Change
                </button>
              </div>
            </div>
          ) : (
            <PhoneInput
              countryCode={countryCode}
              onCountryCodeChange={setCountryCode}
              value={phone}
              onChange={(e) => setPhone(formatPhone(e.target.value))}
              disabled={isSubmitting}
            />
          )}

          {otpSent && (
            <div className="animate-fade-in">
              <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} />
              <div className="mt-3 flex items-center justify-between text-sm">
                <span className="text-slate-500">Didn&apos;t receive code?</span>
                {resendSeconds > 0 ? (
                  <span className="font-semibold text-slate-400">Resend in {resendSeconds}s</span>
                ) : (
                  <button type="button" onClick={handleResend} className="font-semibold text-[#1e3a8a] hover:underline">
                    Resend OTP
                  </button>
                )}
              </div>
            </div>
          )}

          <Button type="submit" disabled={isSubmitting || (otpSent ? !isOtpValid : !isPhoneValid)}>
            {isSubmitting
              ? otpSent ? 'Verifying...' : 'Sending...'
              : otpSent ? 'Verify OTP' : 'Send OTP'}
          </Button>
        </form>

        <Toggle
          id="biometric"
          label="Enable Biometric Login"
          icon={<FingerprintIcon className="h-5 w-5 text-slate-400" />}
          checked={biometric}
          onChange={setBiometric}
        />

        <p className="m-0 text-center text-sm text-slate-500 lg:text-left">
          Employer?{' '}
          <Link to="/enterprise/login" className="font-bold text-[#1e3a8a] no-underline hover:underline">
            Enterprise Portal
          </Link>
        </p>

        <SecurityFooter text="Aadhaar Encrypted & Secure" />
      </div>

      {isSubmitting && (
        <Loader variant="overlay" label={otpSent ? 'Verifying OTP...' : 'Sending OTP...'} />
      )}
    </EmployeeAuthLayout>
  )
}

export default EmployeeLogin

import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import EmployeeAuthLayout from '../../layouts/EmployeeAuthLayout'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import PhoneInput from '../../components/employee/PhoneInput'
import OtpInput, { DEFAULT_OTP_LENGTH } from '../../components/employee/OtpInput'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { sendEmployeeOtp, verifyEmployeeOtp } from '../../api/auth'
import { useAuth } from '../../context/AuthContext'
import { normalizePhone } from '../../lib/api'
import { useToast } from '../../context/ToastContext'
import { hasInvitationSession } from '../../utils/invitationSession'

function formatPhone(value) {
  const digits = value.replace(/\D/g, '').slice(0, 10)
  if (digits.length <= 5) return digits
  return `${digits.slice(0, 5)} ${digits.slice(5)}`
}

function EmployeeOtp() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const fromJoin = searchParams.get('from') === 'join'
  const { loginEmployee } = useAuth()
  const { toast } = useToast()
  const [countryCode, setCountryCode] = useState('+91')
  const [phone, setPhone] = useState('')
  const [otpSent, setOtpSent] = useState(false)
  const [otp, setOtp] = useState('')
  const [resendSeconds, setResendSeconds] = useState(0)
  // How many digits the code has — the send response tells us, since the SMS
  // gateway (4 digits) and the demo/mock codes (6) differ.
  const [otpLength, setOtpLength] = useState(DEFAULT_OTP_LENGTH)
  const [error, setError] = useState('')
  // Remembers the last code we auto-submitted so the same digits never fire
  // twice (incl. React StrictMode's double effect invoke).
  const autoSubmittedRef = useRef('')

  const phoneDigits = phone.replace(/\D/g, '')
  const fullPhone = normalizePhone(countryCode, phone)
  const isPhoneValid = phoneDigits.length >= 10
  const isOtpValid = otp.length === otpLength

  useEffect(() => {
    if (resendSeconds <= 0) return
    const timer = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000)
    return () => window.clearTimeout(timer)
  }, [resendSeconds])

  const sendOtpMutation = useMutation({
    mutationFn: () => sendEmployeeOtp(fullPhone),
    onSuccess: (data) => {
      setError('')
      setOtpSent(true)
      setOtp('')
      autoSubmittedRef.current = ''
      setOtpLength(data?.otpLength || DEFAULT_OTP_LENGTH)
      setResendSeconds(data?.resendInSeconds || 30)
      toast(data?.message || 'OTP sent to your phone', 'success')
    },
    onError: (err) => setError(err.message || 'Failed to send OTP'),
  })

  const verifyMutation = useMutation({
    mutationFn: () => verifyEmployeeOtp(fullPhone, otp),
    onSuccess: (data) => {
      setError('')
      loginEmployee(data)
      toast('Phone verified successfully', 'success')
      if (fromJoin || hasInvitationSession()) {
        navigate('/employee/profile-setup')
        return
      }
      navigate(data.homeRoute || '/employee/profile-setup')
    },
    onError: (err) => {
      // Allow another attempt: clearing the ref lets a re-entered code re-fire.
      autoSubmittedRef.current = ''
      setError(err.message || 'Invalid OTP')
    },
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

  // Auto-verify the moment every digit is entered — no button press needed.
  // The ref guard ensures each distinct code is submitted at most once.
  useEffect(() => {
    if (
      otpSent &&
      isOtpValid &&
      !verifyMutation.isPending &&
      autoSubmittedRef.current !== otp
    ) {
      autoSubmittedRef.current = otp
      verifyMutation.mutate()
    }
  }, [otp, otpSent, isOtpValid]) // eslint-disable-line react-hooks/exhaustive-deps

  const isSubmitting = sendOtpMutation.isPending || verifyMutation.isPending

  return (
    <EmployeeAuthLayout
      heroTitle="Sign in with Phone"
      heroSubtitle="We'll send a one-time code to verify your number."
    >
      <div className="flex flex-col gap-7 md:gap-8">
        <section className="text-center lg:text-left">
          <Link to="/employee" className="text-sm font-semibold text-[#1e3a8a] no-underline hover:underline">
            ← Back
          </Link>
          <h1 className="m-0 mt-3 text-2xl font-extrabold tracking-tight text-[#1e3a8a] md:text-3xl">
            Phone OTP Sign In
          </h1>
          <p className="mt-2 text-sm leading-relaxed text-slate-500 md:text-base">
            Enter your mobile number to receive a verification code.
          </p>
        </section>

        {error && (
          <p className="m-0 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {error}
          </p>
        )}

        <form className="flex flex-col gap-4" onSubmit={otpSent ? handleVerifyOtp : handleSendOtp} noValidate>
          {otpSent ? (
            <div className="rounded-2xl border border-blue-100 bg-blue-50/50 p-4 md:p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[#1e3a8a]">OTP Sent</p>
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
              <OtpInput value={otp} onChange={setOtp} disabled={isSubmitting} length={otpLength} />
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

          {/* Once the code is sent, verification is automatic on the last digit —
              the button only stays for the "Send OTP" step / manual retry. */}
          {!otpSent && (
            <Button type="submit" disabled={isSubmitting || !isPhoneValid}>
              {sendOtpMutation.isPending ? 'Sending...' : 'Send OTP'}
            </Button>
          )}
          {otpSent && (
            <p className="m-0 text-center text-xs text-slate-400">
              {verifyMutation.isPending
                ? 'Verifying…'
                : `Enter the ${otpLength}-digit code — it verifies automatically.`}
            </p>
          )}
        </form>

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

export default EmployeeOtp

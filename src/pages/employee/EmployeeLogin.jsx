import { useEffect, useMemo, useState } from 'react'

import { Link, useNavigate } from 'react-router-dom'

import EmployeeAuthLayout from '../../layouts/EmployeeAuthLayout'

import Button from '../../components/common/Button'

import Loader from '../../components/common/Loader'

import SocialLoginButton from '../../components/employee/SocialLoginButton'

import PhoneInput from '../../components/employee/PhoneInput'

import OtpInput from '../../components/employee/OtpInput'

import Toggle from '../../components/employee/Toggle'

import SecurityFooter from '../../components/employee/SecurityFooter'

import { GoogleIcon, LinkedInIcon, FingerprintIcon } from '../../components/common/Icons'

import {

  getEmployeeHomeRoute,

  hasVerifiedProfileOnDevice,

  lookupProfileByPhone,

  setEmployeeSession,

} from '../../store/employeeStore'

import { buildDisplayProfile } from '../../utils/employeeProfileUtils'



function formatPhone(value) {

  const digits = value.replace(/\D/g, '').slice(0, 10)

  if (digits.length <= 5) return digits

  return `${digits.slice(0, 5)} ${digits.slice(5)}`

}



function EmployeeLogin() {

  const navigate = useNavigate()

  const [countryCode, setCountryCode] = useState('+91')

  const [phone, setPhone] = useState('')

  const [otpSent, setOtpSent] = useState(false)

  const [otp, setOtp] = useState('')

  const [biometric, setBiometric] = useState(true)

  const [isSubmitting, setIsSubmitting] = useState(false)

  const [resendSeconds, setResendSeconds] = useState(0)



  const phoneDigits = phone.replace(/\D/g, '')

  const fullPhone = `${countryCode} ${phone}`.trim()

  const isPhoneValid = phoneDigits.length >= 10

  const isOtpValid = otp.length === 6

  const returningVerified = useMemo(() => {

    if (!isPhoneValid) return null

    const existing = lookupProfileByPhone(fullPhone)

    if (!existing) return null

    return buildDisplayProfile(existing)

  }, [fullPhone, isPhoneValid])



  const isReturningFlow = hasVerifiedProfileOnDevice() || Boolean(returningVerified?.isVerified)



  useEffect(() => {

    if (resendSeconds <= 0) return

    const timer = window.setTimeout(() => setResendSeconds((s) => s - 1), 1000)

    return () => window.clearTimeout(timer)

  }, [resendSeconds])



  const completeLogin = (phoneOverride) => {

    const resolvedPhone = phoneOverride || (otpSent ? fullPhone : `social_${Date.now()}`)

    setEmployeeSession({ phone: resolvedPhone })

    navigate(getEmployeeHomeRoute())

  }



  const handleSocialLogin = async () => {

    setIsSubmitting(true)

    await new Promise((resolve) => window.setTimeout(resolve, 800))

    setIsSubmitting(false)

    completeLogin(`social_${Date.now()}`)

  }



  const handleSendOtp = async (e) => {

    e.preventDefault()

    if (!isPhoneValid) return



    setIsSubmitting(true)

    await new Promise((resolve) => window.setTimeout(resolve, 1000))

    setIsSubmitting(false)

    setOtpSent(true)

    setOtp('')

    setResendSeconds(30)

  }



  const handleVerifyOtp = async (e) => {

    e.preventDefault()

    if (!isOtpValid) return



    setIsSubmitting(true)

    await new Promise((resolve) => window.setTimeout(resolve, 1000))

    setIsSubmitting(false)

    completeLogin()

  }



  const handleResend = async () => {

    if (resendSeconds > 0) return

    setIsSubmitting(true)

    await new Promise((resolve) => window.setTimeout(resolve, 800))

    setIsSubmitting(false)

    setOtp('')

    setResendSeconds(30)

  }



  const handleChangeNumber = () => {

    setOtpSent(false)

    setOtp('')

    setResendSeconds(0)

  }



  return (

    <EmployeeAuthLayout

      heroTitle={isReturningFlow ? 'Welcome Back' : 'Build Your VeriScore'}

      heroSubtitle={

        isReturningFlow

          ? 'Sign in to access your verified profile, Employee Score, and job history.'

          : 'Verify your identity and build a CIBIL-like score companies trust for hiring.'

      }

    >

      <div className="flex flex-col gap-7 md:gap-8">

        <section className="text-center lg:text-left">

          <h1 className="m-0 text-2xl font-extrabold tracking-tight text-[#1a3a8f] md:text-3xl">

            {returningVerified?.isVerified ? `Welcome back, ${returningVerified.name.split(' ')[0]}` : 'Sign In'}

          </h1>

          <p className="mt-2 text-sm leading-relaxed text-slate-500 md:text-base">

            {returningVerified?.isVerified

              ? `Your VeriScore is ${returningVerified.employeeScore}. Sign in to continue.`

              : 'Enter your phone number or use social login to access your profile.'}

          </p>

        </section>



        {returningVerified?.isVerified && !otpSent && (

          <div className="rounded-2xl border border-green-200 bg-green-50 p-4 md:p-5">

            <div className="flex items-center justify-between gap-3">

              <div>

                <p className="m-0 text-xs font-bold uppercase tracking-wide text-green-700">

                  Verified Profile Found

                </p>

                <p className="m-0 mt-1 text-sm font-semibold text-slate-800">{returningVerified.name}</p>

                <p className="m-0 text-xs text-slate-500">{returningVerified.veriworkId}</p>

              </div>

              <div className="text-center">

                <p className="m-0 text-2xl font-extrabold text-[#1a3a8f]">{returningVerified.employeeScore}</p>

                <p className="m-0 text-[10px] font-bold uppercase text-slate-400">VeriScore</p>

              </div>

            </div>

          </div>

        )}



        {!otpSent && !returningVerified?.isVerified && (

          <>

            <section>

              <p className="m-0 mb-3 text-sm font-bold text-slate-800 md:text-base">New here?</p>

              <div className="flex flex-col gap-3">

                <SocialLoginButton icon={<GoogleIcon />} onClick={handleSocialLogin} disabled={isSubmitting}>

                  Continue with Google

                </SocialLoginButton>

                <SocialLoginButton icon={<LinkedInIcon />} onClick={handleSocialLogin} disabled={isSubmitting}>

                  Continue with LinkedIn

                </SocialLoginButton>

              </div>

            </section>



            <div className="relative text-center">

              <span className="absolute inset-x-0 top-1/2 border-t border-slate-200" />

              <span className="relative bg-slate-50 px-4 text-xs font-semibold tracking-widest text-slate-400 md:text-sm">

                OR

              </span>

            </div>

          </>

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

                  <p className="m-0 text-xs font-semibold uppercase tracking-wide text-[#1a3a8f]">

                    OTP Sent

                  </p>

                  <p className="m-0 mt-1 text-sm text-slate-700 md:text-base">

                    Code sent to <strong>{fullPhone}</strong>

                  </p>

                </div>

                <button

                  type="button"

                  onClick={handleChangeNumber}

                  className="shrink-0 text-xs font-semibold text-[#1a3a8f] hover:underline md:text-sm"

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

                  <button

                    type="button"

                    onClick={handleResend}

                    className="font-semibold text-[#1a3a8f] hover:underline"

                  >

                    Resend OTP

                  </button>

                )}

              </div>

            </div>

          )}



          <Button

            type="submit"

            disabled={isSubmitting || (otpSent ? !isOtpValid : !isPhoneValid)}

          >

            {isSubmitting

              ? otpSent

                ? 'Verifying...'

                : 'Sending...'

              : otpSent

                ? returningVerified?.isVerified

                  ? 'Sign In to Your Profile'

                  : 'Verify OTP'

                : returningVerified?.isVerified

                  ? 'Send OTP to Sign In'

                  : 'Send OTP'}

          </Button>

        </form>



        {!returningVerified?.isVerified && (

          <p className="m-0 text-center text-xs text-slate-500">

            New user? OTP login creates your unique profile automatically.

          </p>

        )}



        <Toggle

          id="biometric"

          label="Enable Biometric Login"

          icon={<FingerprintIcon className="h-5 w-5 text-slate-400" />}

          checked={biometric}

          onChange={setBiometric}

        />



        <p className="m-0 text-center text-sm text-slate-500 lg:text-left">

          Employer?{' '}

          <Link to="/enterprise/login" className="font-bold text-[#1a3a8f] no-underline hover:underline">

            Enterprise Portal

          </Link>

          {' · '}

          <Link to="/" className="font-semibold text-slate-500 no-underline hover:text-[#1a3a8f]">

            Home

          </Link>

        </p>



        <SecurityFooter text="Aadhaar Encrypted & Secure" />

      </div>



      {isSubmitting && (

        <Loader variant="overlay" label={otpSent ? 'Signing you in...' : 'Sending OTP...'} />

      )}

    </EmployeeAuthLayout>

  )

}



export default EmployeeLogin


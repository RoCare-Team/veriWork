import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import VerificationStepBar from '../../components/employee/VerificationStepBar'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { BriefcaseIcon } from '../../components/common/Icons'
import {
  completeProfileSetup,
  getEmployeeData,
  getEmployeeProfile,
  isProfileSetupComplete,
  updateEmployeeProfile,
} from '../../store/employeeStore'

function UserIcon({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ProfileSetup() {
  const navigate = useNavigate()
  const data = getEmployeeData()
  const existing = getEmployeeProfile()
  const isEditing = isProfileSetupComplete()
  const [name, setName] = useState(existing.name === 'New User' ? '' : existing.name)
  const [role, setRole] = useState(existing.role === 'Professional' ? '' : existing.role)
  const [email, setEmail] = useState(existing.email || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isValid = name.trim().length >= 2

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!isValid) return

    setIsSubmitting(true)
    await new Promise((resolve) => window.setTimeout(resolve, 800))

    if (isEditing) {
      updateEmployeeProfile({
        name: name.trim(),
        role: role.trim(),
        email: email.trim(),
        skills: role.trim() ? [role.trim()] : [],
      })
      setIsSubmitting(false)
      navigate('/employee/professional-id')
      return
    }

    completeProfileSetup({ name, role, email })
    setIsSubmitting(false)
    navigate('/employee/verification')
  }

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Your profile is private & encrypted" />}>
      <VerificationStepBar currentStep="profile" className="mb-6" />

      <EmployeePageHeader
        title={isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
        subtitle={isEditing ? 'Update your identity details' : 'Step 1 of 3 — This account is unique to you'}
      />

      <div className="lg:grid lg:grid-cols-2 lg:items-start lg:gap-8 xl:gap-10">
        <div className="mb-6 rounded-2xl border border-slate-100 bg-slate-50 p-5 md:p-6 lg:mb-0">
          <p className="m-0 text-xs font-semibold uppercase tracking-wide text-slate-400">
            Your VeriWork ID
          </p>
          <p className="m-0 mt-2 font-mono text-lg font-extrabold text-[#1a3a8f]">
            {existing.veriworkId}
          </p>
          <p className="m-0 mt-3 text-sm leading-relaxed text-slate-600">
            Each phone number gets its own profile, verification progress, and job history.
            Signing in with a different number creates a completely separate account.
          </p>
          {data.phone && (
            <p className="m-0 mt-4 text-sm text-slate-500">
              Signed in as <strong className="text-slate-800">{data.phone}</strong>
            </p>
          )}
        </div>

        <form className="flex flex-col gap-5" onSubmit={handleSubmit} noValidate>
          <Input
            id="full-name"
            label="Full Name"
            placeholder="e.g. Priya Sharma"
            value={name}
            onChange={(e) => setName(e.target.value)}
            leftIcon={<UserIcon />}
            disabled={isSubmitting}
            autoComplete="name"
          />
          <Input
            id="role"
            label="Current Role (optional)"
            placeholder="e.g. Software Engineer"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            leftIcon={<BriefcaseIcon className="h-[18px] w-[18px]" />}
            disabled={isSubmitting}
          />
          <Input
            id="email"
            label="Email (optional)"
            type="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            leftIcon={<span className="text-sm font-semibold">@</span>}
            disabled={isSubmitting}
            autoComplete="email"
          />

          <Button type="submit" disabled={!isValid || isSubmitting}>
            {isSubmitting
              ? 'Saving profile...'
              : isEditing
                ? 'Save Changes'
                : 'Save & Continue to Verification'}
          </Button>
        </form>
      </div>

      {isSubmitting && <Loader variant="overlay" label="Creating your profile..." />}
    </EmployeeLayout>
  )
}

export default ProfileSetup

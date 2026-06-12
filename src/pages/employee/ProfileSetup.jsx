import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import Input from '../../components/common/Input'
import Button from '../../components/common/Button'
import Loader from '../../components/common/Loader'
import VerificationStepBar from '../../components/employee/VerificationStepBar'
import SecurityFooter from '../../components/employee/SecurityFooter'
import { BriefcaseIcon } from '../../components/common/Icons'
import { employeeKeys, updateProfile } from '../../api/employee'
import { useAuth } from '../../context/AuthContext'

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
  const queryClient = useQueryClient()
  const { profile, updateProfileState } = useAuth()
  const isEditing = profile?.profileSetupComplete === true

  const [name, setName] = useState(profile?.name && profile.name !== 'New User' ? profile.name : '')
  const [role, setRole] = useState(profile?.role && profile.role !== 'Professional' ? profile.role : '')
  const [email, setEmail] = useState(profile?.email || '')
  const [error, setError] = useState('')

  const mutation = useMutation({
    mutationFn: () =>
      updateProfile({
        name: name.trim(),
        role: role.trim(),
        email: email.trim(),
        skills: role.trim() ? [role.trim()] : [],
      }),
    onSuccess: (data) => {
      updateProfileState(data)
      queryClient.invalidateQueries({ queryKey: employeeKeys.profile })
      navigate(isEditing ? '/employee/professional-id' : '/employee/verification')
    },
    onError: (err) => setError(err.message || 'Failed to save profile'),
  })

  const isValid = name.trim().length >= 2

  return (
    <EmployeeLayout footer={<SecurityFooter variant="shield" text="Your profile is private & encrypted" />}>
      <VerificationStepBar currentStep="profile" className="mb-6" />
      <EmployeePageHeader
        title={isEditing ? 'Edit Your Profile' : 'Create Your Profile'}
        subtitle={isEditing ? 'Update your identity details' : 'Step 1 of 3 — This account is unique to you'}
      />

      {error && (
        <p className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>
      )}

      <form
        className="flex max-w-xl flex-col gap-5"
        onSubmit={(e) => { e.preventDefault(); if (isValid) mutation.mutate() }}
        noValidate
      >
        <Input id="full-name" label="Full Name" value={name} onChange={(e) => setName(e.target.value)} leftIcon={<UserIcon />} disabled={mutation.isPending} />
        <Input id="role" label="Current Role" value={role} onChange={(e) => setRole(e.target.value)} leftIcon={<BriefcaseIcon className="h-[18px] w-[18px]" />} disabled={mutation.isPending} />
        <Input id="email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} leftIcon={<span className="text-sm font-semibold">@</span>} disabled={mutation.isPending} />
        <Button type="submit" disabled={!isValid || mutation.isPending}>
          {mutation.isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Save & Continue'}
        </Button>
      </form>

      {mutation.isPending && <Loader variant="overlay" label="Saving profile..." />}
    </EmployeeLayout>
  )
}

export default ProfileSetup

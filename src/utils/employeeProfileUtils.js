import { calculateEmployeeScore, getScoreRating } from './employeeScoreUtils'
import { buildPublicProfileUrl } from '../lib/publicProfileUrl'

export function getInitials(name = '') {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  if (parts.length === 0) return 'U'
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase()
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
}

export function generateVeriworkId() {
  const a = Math.random().toString(36).slice(2, 6).toUpperCase()
  const b = Math.random().toString(36).slice(2, 4).toUpperCase()
  return `VW-${a}-${b}`
}

export function generatePublicSlug(profileId) {
  const suffix = profileId.replace(/\D/g, '').slice(-6) || Math.random().toString(36).slice(2, 8)
  return `user_${suffix}`
}

export function phoneToProfileId(phone) {
  if (!phone || phone === 'social') return `social_${Date.now()}`
  if (phone.startsWith('social_')) return phone
  const digits = phone.replace(/\D/g, '')
  return digits ? `p_${digits}` : `social_${Date.now()}`
}

export function getVerificationPercent(profile) {
  let percent = 0
  if (profile.profileSetupComplete) percent += 33
  if (profile.aadhaarVerified) percent += 33
  if (profile.biometricVerified) percent += 34
  return percent
}

export function isVerificationComplete(profile) {
  return (
    profile.profileSetupComplete &&
    profile.aadhaarVerified &&
    profile.biometricVerified
  )
}

export function getCurrentVerificationStep(profile) {
  if (!profile.profileSetupComplete) return 'profile'
  if (!profile.aadhaarVerified) return 'aadhaar'
  if (!profile.biometricVerified) return 'biometric'
  return 'complete'
}

export function buildDisplayProfile(profile) {
  const name = profile.name?.trim() || 'New User'
  const jobHistory = profile.jobHistory || []
  const verifiedJobs = jobHistory.filter((j) => j.status === 'verified').length
  const verificationPercent = getVerificationPercent(profile)
  const employeeScore = calculateEmployeeScore(profile)
  const scoreRating = getScoreRating(employeeScore)

  return {
    name,
    initials: getInitials(name),
    role: profile.role?.trim() || 'Professional',
    company: profile.company?.trim() || '',
    experience:
      jobHistory.length > 0
        ? `${jobHistory.length} role${jobHistory.length > 1 ? 's' : ''} added`
        : 'Getting started',
    verificationPercent,
    employeeScore,
    scoreRating,
    trustScore: employeeScore,
    verifiedJobs,
    endorsements: profile.endorsements || 0,
    veriworkId: profile.veriworkId,
    publicProfileUrl: buildPublicProfileUrl(profile),
    skills:
      profile.skills?.length > 0
        ? profile.skills
        : profile.role?.trim()
          ? [profile.role.trim()]
          : ['Building profile'],
    phone: profile.phone,
    email: profile.email || '',
    isVerified: isVerificationComplete(profile),
  }
}

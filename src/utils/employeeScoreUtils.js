import { isVerificationComplete } from './employeeProfileUtils'

export const SCORE_MIN = 300
export const SCORE_MAX = 1000

export function calculateEmployeeScore(profile) {
  if (!profile) return SCORE_MIN

  let score = SCORE_MIN

  if (profile.profileSetupComplete) score += 50
  if (profile.aadhaarVerified) score += 120
  if (profile.biometricVerified) score += 130
  if (profile.digilockerUsed) score += 25

  const jobs = profile.jobHistory || []
  const verifiedJobs = jobs.filter((j) => j.status === 'verified').length
  const pendingJobs = jobs.filter((j) => j.status === 'in_process').length

  score += verifiedJobs * 45
  score += pendingJobs * 12
  score += Math.min(jobs.length * 8, 40)
  score += Math.min((profile.endorsements || 0) * 8, 60)

  return Math.min(SCORE_MAX, Math.max(SCORE_MIN, Math.round(score)))
}

// The six PagerLook trust bands (must mirror scoreService.js on the backend).
export function getScoreRating(score) {
  if (score >= 951) {
    return {
      label: 'Elite Trust', tier: 'A+',
      color: 'text-purple-600', bg: 'bg-purple-50', border: 'border-purple-200', bar: 'bg-purple-600',
      description: 'Elite trust. Fully verified across identity, employment and compliance.',
    }
  }
  if (score >= 851) {
    return {
      label: 'Excellent', tier: 'A',
      color: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-200', bar: 'bg-emerald-500',
      description: 'Top-tier verified professional. Highly trusted by employers.',
    }
  }
  if (score >= 751) {
    return {
      label: 'Good', tier: 'B',
      color: 'text-[#1e3a8a]', bg: 'bg-blue-50', border: 'border-blue-200', bar: 'bg-[#1e3a8a]',
      description: 'Strong, reliable profile. Employers can hire with confidence.',
    }
  }
  if (score >= 601) {
    return {
      label: 'Fair', tier: 'C',
      color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200', bar: 'bg-amber-500',
      description: 'Building trust. Verify more employment and education records.',
    }
  }
  if (score >= 451) {
    return {
      label: 'Needs Improvement', tier: 'D',
      color: 'text-orange-600', bg: 'bg-orange-50', border: 'border-orange-200', bar: 'bg-orange-500',
      description: 'Getting started. Complete identity and add verified jobs to improve.',
    }
  }
  return {
    label: 'High Risk', tier: 'E',
    color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', bar: 'bg-red-500',
    description: 'High risk. Start verifying your identity and employment to build trust.',
  }
}

export function getScoreFactors(profile) {
  const jobs = profile?.jobHistory || []
  const verifiedJobs = jobs.filter((j) => j.status === 'verified').length
  const pendingJobs = jobs.filter((j) => j.status === 'in_process').length

  return [
    {
      id: 'profile',
      label: 'Profile completeness',
      points: profile?.profileSetupComplete ? 50 : 0,
      max: 50,
      tip: 'Add your name and professional role',
      done: profile?.profileSetupComplete,
    },
    {
      id: 'aadhaar',
      label: 'Aadhaar verification',
      points: profile?.aadhaarVerified ? 120 + (profile.digilockerUsed ? 25 : 0) : 0,
      max: 145,
      tip: 'Verify via DigiLocker for maximum points',
      done: profile?.aadhaarVerified,
    },
    {
      id: 'biometric',
      label: 'Biometric liveness',
      points: profile?.biometricVerified ? 130 : 0,
      max: 130,
      tip: 'Complete face match with your ID photo',
      done: profile?.biometricVerified,
    },
    {
      id: 'jobs',
      label: 'Employment records',
      points: verifiedJobs * 45 + pendingJobs * 12 + Math.min(jobs.length * 8, 40),
      max: 200,
      tip: 'Add and verify job history to boost score',
      done: jobs.length > 0,
    },
    {
      id: 'endorsements',
      label: 'Peer endorsements',
      points: Math.min((profile?.endorsements || 0) * 8, 60),
      max: 60,
      tip: 'Get endorsed by colleagues and managers',
      done: (profile?.endorsements || 0) > 0,
    },
  ]
}

export function getScorePercentile(score) {
  if (score >= 951) return 'Top 2% of professionals'
  if (score >= 851) return 'Top 10% of professionals'
  if (score >= 751) return 'Top 25% of professionals'
  if (score >= 601) return 'Top 50% of professionals'
  if (score >= 451) return 'Building your ranking'
  return 'Not yet ranked'
}

export function isVerifiedProfile(profile) {
  return isVerificationComplete(profile)
}

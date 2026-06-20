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

export function getScoreRating(score) {
  if (score >= 800) {
    return {
      label: 'Excellent',
      tier: 'A+',
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      bar: 'bg-emerald-500',
      description: 'Top-tier verified professional. Highly trusted by employers.',
    }
  }
  if (score >= 700) {
    return {
      label: 'Good',
      tier: 'A',
      color: 'text-[#1a3a8f]',
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      bar: 'bg-[#1a3a8f]',
      description: 'Strong identity and work history. Reliable for hiring decisions.',
    }
  }
  if (score >= 600) {
    return {
      label: 'Fair',
      tier: 'B',
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      bar: 'bg-amber-500',
      description: 'Building trust. Complete verification and job records to improve.',
    }
  }
  if (score >= 450) {
    return {
      label: 'Developing',
      tier: 'C',
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-200',
      bar: 'bg-orange-500',
      description: 'Early stage profile. Finish identity verification to unlock score.',
    }
  }
  return {
    label: 'New',
    tier: '—',
    color: 'text-slate-500',
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    bar: 'bg-slate-400',
    description: 'Start verification to build your Employee Score.',
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
  if (score >= 800) return 'Top 5% of professionals'
  if (score >= 700) return 'Top 20% of professionals'
  if (score >= 600) return 'Top 45% of professionals'
  if (score >= 450) return 'Building your ranking'
  return 'Not yet ranked'
}

export function isVerifiedProfile(profile) {
  return isVerificationComplete(profile)
}

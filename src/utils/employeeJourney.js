/**
 * The employee onboarding journey — defined once, rendered identically everywhere.
 *
 * Three steps. Only the first is required; the other two are optional and each
 * carries score, so a user can stop at any point and still have a usable profile.
 *
 * Identity is ONE step that contains two checks (Aadhaar + Face). The Aadhaar and
 * Face pages therefore both report `identity` as the current step — otherwise the
 * journey appeared to change shape as you moved between screens.
 */
export const JOURNEY_STEPS = [
  {
    id: 'profile',
    label: 'Basic details',
    title: 'Your details',
    description: 'Name, role and contact details',
    required: true,
    points: 100,
    path: '/employee/profile-setup',
  },
  {
    id: 'education',
    label: 'Education',
    title: 'Education',
    description: '10th, 12th and graduation',
    required: false,
    points: 45,
    // Deep-link straight to the education step — coming back from the score page
    // should not dump the user on basic details again.
    path: '/employee/profile-setup?step=education',
  },
  {
    id: 'identity',
    label: 'Identity',
    title: 'Aadhaar & Face',
    description: 'Aadhaar e-KYC and a live face check',
    required: false,
    points: 200,
    path: '/employee/verification',
  },
]

/** True once at least one education level is fully filled. */
export function hasAnyEducation(profile) {
  const edu = profile?.education || {}
  return (
    Boolean(edu.class10?.board && edu.class10?.school) ||
    Boolean(edu.class12?.board && edu.class12?.school) ||
    Boolean(edu.graduation?.degree && edu.graduation?.college)
  )
}

/** Which steps a profile has actually finished. */
export function getCompletedJourneySteps(profile) {
  if (!profile) return []
  return [
    ...(profile.profileSetupComplete ? ['profile'] : []),
    ...(hasAnyEducation(profile) ? ['education'] : []),
    // Identity only counts when BOTH checks are done — that's what earns the badge.
    ...(profile.aadhaarVerified && profile.biometricVerified ? ['identity'] : []),
  ]
}

/** Steps still worth doing, with why they matter. */
export function getMissingJourneySteps(profile) {
  const done = getCompletedJourneySteps(profile)
  return JOURNEY_STEPS.filter((s) => !done.includes(s.id) && !s.required)
}

/** Map the backend's verification step to a journey step id. */
export function toJourneyStep(backendStep) {
  if (backendStep === 'aadhaar' || backendStep === 'biometric') return 'identity'
  return backendStep
}

import { isPortalUnlocked } from './employeeProfileUtils'

export function getEmployeeHomeRoute(profile) {
  if (!profile) return '/employee/login'
  if (!profile.profileSetupComplete) return '/employee/profile-setup'
  // Only Aadhaar routes you back to verification — the face match is optional,
  // so skipping it must not trap you on the verification page every login.
  if (!isPortalUnlocked(profile)) return '/employee/verification'
  return '/employee/score'
}

export function dataUrlToFile(dataUrl, filename = 'biometric.jpg') {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i)
  return new File([bytes], filename, { type: mime })
}

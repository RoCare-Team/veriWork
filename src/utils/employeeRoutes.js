export function getEmployeeHomeRoute(profile) {
  if (!profile) return '/employee/login'
  if (!profile.profileSetupComplete) return '/employee/profile-setup'
  if (!profile.isVerified && !profile.biometricVerified) return '/employee/verification'
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

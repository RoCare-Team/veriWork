import {
  buildDisplayProfile,
  generatePublicSlug,
  generateVeriworkId,
  getCurrentVerificationStep as calcCurrentStep,
  getVerificationPercent as calcVerificationPercent,
  isVerificationComplete as checkVerificationComplete,
  phoneToProfileId,
} from '../utils/employeeProfileUtils'
import { calculateEmployeeScore } from '../utils/employeeScoreUtils'

const LEGACY_KEY = 'veriwork_employee'
const PROFILES_KEY = 'veriwork_employee_profiles'
const SESSION_KEY = 'veriwork_employee_session'

function createEmptyProfile(id, phone) {
  return {
    id,
    phone,
    name: '',
    role: '',
    company: '',
    email: '',
    skills: [],
    profileSetupComplete: false,
    aadhaarVerified: false,
    biometricVerified: false,
    digilockerUsed: false,
    profilePhoto: null,
    jobHistory: [],
    veriworkId: generateVeriworkId(),
    publicSlug: generatePublicSlug(id),
    endorsements: 0,
    createdAt: new Date().toISOString(),
  }
}

function readProfiles() {
  try {
    const raw = localStorage.getItem(PROFILES_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function writeProfiles(profiles) {
  localStorage.setItem(PROFILES_KEY, JSON.stringify(profiles))
}

function readSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return { isLoggedIn: false, activeProfileId: null }
    return JSON.parse(raw)
  } catch {
    return { isLoggedIn: false, activeProfileId: null }
  }
}

function writeSession(session) {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
}

function migrateLegacyStore() {
  if (localStorage.getItem(PROFILES_KEY)) return

  try {
    const raw = localStorage.getItem(LEGACY_KEY)
    if (!raw) return

    const legacy = JSON.parse(raw)
    const phone = legacy.phone || 'legacy_user'
    const id = phoneToProfileId(phone)
    const profile = {
      ...createEmptyProfile(id, phone),
      ...legacy,
      id,
      profileSetupComplete: legacy.profileSetupComplete ?? Boolean(legacy.name),
      name: legacy.name || '',
      publicSlug: legacy.publicSlug || generatePublicSlug(id),
      veriworkId: legacy.veriworkId || generateVeriworkId(),
      jobHistory: legacy.jobHistory || [],
    }

    writeProfiles({ [id]: profile })
    writeSession({
      isLoggedIn: legacy.isLoggedIn === true,
      activeProfileId: legacy.isLoggedIn ? id : null,
    })
    localStorage.removeItem(LEGACY_KEY)
  } catch {
    /* ignore corrupt legacy data */
  }
}

migrateLegacyStore()

function getActiveProfileId() {
  return readSession().activeProfileId
}

function getActiveProfile() {
  const id = getActiveProfileId()
  if (!id) return null
  return readProfiles()[id] || null
}

function saveActiveProfile(updates) {
  const id = getActiveProfileId()
  if (!id) return null

  const profiles = readProfiles()
  const current = profiles[id] || createEmptyProfile(id, '')
  profiles[id] = { ...current, ...updates }
  writeProfiles(profiles)
  return profiles[id]
}

function getOrCreateProfile(phone) {
  const id = phoneToProfileId(phone)
  const profiles = readProfiles()

  if (!profiles[id]) {
    profiles[id] = createEmptyProfile(id, phone)
    writeProfiles(profiles)
  }

  return { id, profile: profiles[id] }
}

export function getEmployeeData() {
  const profile = getActiveProfile()
  if (!profile) {
    return createEmptyProfile('guest', '')
  }
  return profile
}

export function getEmployeeProfile() {
  return buildDisplayProfile(getEmployeeData())
}

export function isEmployeeLoggedIn() {
  const session = readSession()
  return session.isLoggedIn === true && Boolean(session.activeProfileId)
}

export function setEmployeeSession({ phone = '' } = {}) {
  const resolvedPhone = phone || `social_${Date.now()}`
  const { id } = getOrCreateProfile(resolvedPhone)

  writeSession({ isLoggedIn: true, activeProfileId: id })
  return readProfiles()[id]
}

export function clearEmployeeSession() {
  writeSession({ isLoggedIn: false, activeProfileId: null })
}

export function updateEmployeeProfile(fields) {
  return saveActiveProfile(fields)
}

export function completeProfileSetup({ name, role = '', email = '' }) {
  const trimmedName = name.trim()
  const slugBase = trimmedName.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
  const profile = getEmployeeData()

  return saveActiveProfile({
    name: trimmedName,
    role: role.trim(),
    email: email.trim(),
    profileSetupComplete: true,
    publicSlug: slugBase ? `${slugBase}_${profile.id.slice(-4)}` : profile.publicSlug,
    skills: role.trim() ? [role.trim()] : [],
  })
}

export function isProfileSetupComplete() {
  return getEmployeeData().profileSetupComplete === true
}

export function markAadhaarVerified({ viaDigilocker = false } = {}) {
  return saveActiveProfile({
    aadhaarVerified: true,
    digilockerUsed: viaDigilocker,
  })
}

export function markBiometricVerified(profilePhoto) {
  const updates = { biometricVerified: true }
  if (profilePhoto) updates.profilePhoto = profilePhoto
  return saveActiveProfile(updates)
}

export function getVerificationPercent() {
  return calcVerificationPercent(getEmployeeData())
}

export function isVerificationComplete() {
  return checkVerificationComplete(getEmployeeData())
}

export function getCurrentVerificationStep() {
  return calcCurrentStep(getEmployeeData())
}

export function getAllProfiles() {
  return Object.values(readProfiles())
}

export function lookupProfileByPhone(phone) {
  const id = phoneToProfileId(phone)
  return readProfiles()[id] || null
}

export function isProfileVerifiedByPhone(phone) {
  const profile = lookupProfileByPhone(phone)
  return profile ? checkVerificationComplete(profile) : false
}

export function hasVerifiedProfileOnDevice() {
  return getAllProfiles().some((p) => checkVerificationComplete(p))
}

export function getEmployeeHomeRoute() {
  if (!isEmployeeLoggedIn()) return '/employee/login'

  const profile = getEmployeeData()
  if (!profile.profileSetupComplete) return '/employee/profile-setup'
  if (!checkVerificationComplete(profile)) return '/employee/verification'
  return '/employee/score'
}

export function getEmployeeScore() {
  return calculateEmployeeScore(getEmployeeData())
}

export function addJobExperience(job) {
  const profile = getEmployeeData()
  const entry = {
    id: Date.now(),
    title: job.role,
    company: job.companyName,
    duration: job.isPresent ? `${job.joiningDate} - Present` : `${job.joiningDate} - ${job.exitDate}`,
    type: job.employmentType,
    status: 'in_process',
  }

  saveActiveProfile({
    jobHistory: [entry, ...(profile.jobHistory || [])],
  })
  return entry
}

export function getJobHistory() {
  return getEmployeeData().jobHistory || []
}

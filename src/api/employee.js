import { API } from '../constants/routes'
import { api } from '../lib/api'

export const employeeKeys = {
  profile: ['employee', 'profile'],
  professionalId: ['employee', 'professional-id'],
  score: ['employee', 'score'],
  verification: ['employee', 'verification'],
  aadhaarSubmission: ['employee', 'aadhaar-submission'],
  jobs: ['employee', 'jobs'],
  activity: (filter = 'all') => ['employee', 'activity', filter],
  vault: ['employee', 'vault'],
  settings: ['employee', 'settings'],
  invitations: ['employee', 'invitations'],
  accessRequests: ['employee', 'access-requests'],
  endorsements: ['employee', 'endorsements'],
  smtpSettings: ['employee', 'smtp-settings'],
}

export function fetchProfile() {
  return api(API.EMPLOYEE.PROFILE)
}

export function fetchCompanySuggestions(query) {
  const params = new URLSearchParams({ q: query })
  return api(`${API.EMPLOYEE.SUGGEST_COMPANIES}?${params}`)
}

export function fetchRoleSuggestions(query) {
  const params = new URLSearchParams({ q: query })
  return api(`${API.EMPLOYEE.SUGGEST_ROLES}?${params}`)
}

export function updateProfile(body) {
  return api(API.EMPLOYEE.PROFILE, { method: 'PATCH', body })
}

export function fetchScore() {
  return api(API.EMPLOYEE.SCORE)
}

export function fetchVerificationStatus() {
  return api(API.EMPLOYEE.VERIFICATION_STATUS)
}

export function fetchAadhaarSubmission() {
  return api(API.EMPLOYEE.VERIFICATION_AADHAAR)
}

/**
 * Manual Aadhaar KYC — the card images plus the typed details go to the
 * platform admin queue. Nothing is marked verified until an admin approves.
 */
export function submitAadhaar({
  aadhaarNumber,
  nameOnAadhaar,
  dobOnAadhaar = '',
  genderOnAadhaar = '',
  addressOnAadhaar = '',
  frontImage,
  backImage,
}) {
  const form = new FormData()
  form.append('aadhaarNumber', aadhaarNumber)
  form.append('nameOnAadhaar', nameOnAadhaar)
  form.append('dobOnAadhaar', dobOnAadhaar)
  form.append('genderOnAadhaar', genderOnAadhaar)
  form.append('addressOnAadhaar', addressOnAadhaar)
  form.append('consent', 'true')
  form.append('frontImage', frontImage)
  form.append('backImage', backImage)
  return api(API.EMPLOYEE.VERIFICATION_AADHAAR, { method: 'POST', body: form })
}

/**
 * `selfie` is matched server-side against the photo on the approved Aadhaar
 * card; `poses` are the left/right frames that prove the head actually moved.
 */
export function verifyBiometric(selfieFile, poseFiles = []) {
  const form = new FormData()
  if (selfieFile) form.append('selfie', selfieFile)
  poseFiles.filter(Boolean).forEach((file) => form.append('poses', file))
  return api(API.EMPLOYEE.VERIFICATION_BIOMETRIC, { method: 'POST', body: form })
}

export function fetchJobs() {
  return api(API.EMPLOYEE.JOBS)
}

export function createJob(body) {
  return api(API.EMPLOYEE.JOBS, { method: 'POST', body })
}

export function uploadJobDocument(jobId, file) {
  const form = new FormData()
  form.append('document', file)
  return api(API.EMPLOYEE.JOB_DOCUMENTS(jobId), { method: 'POST', body: form })
}

export function fetchActivity(filter = 'all') {
  const params = new URLSearchParams()
  if (filter && filter !== 'all') params.set('filter', filter)
  const qs = params.toString()
  return api(qs ? `${API.EMPLOYEE.ACTIVITY}?${qs}` : API.EMPLOYEE.ACTIVITY)
}

export function updateActivity(id, status) {
  return api(API.EMPLOYEE.ACTIVITY_ACTION(id), { method: 'PATCH', body: { status } })
}

export function fetchVault() {
  return api(API.EMPLOYEE.VAULT)
}

export function uploadVaultDocument({ category, name, file, size }) {
  const form = new FormData()
  form.append('category', category)
  form.append('name', name)
  if (file) form.append('document', file)
  if (size) form.append('size', size)
  return api(API.EMPLOYEE.VAULT, { method: 'POST', body: form })
}

export function fetchSettings() {
  return api(API.EMPLOYEE.SETTINGS)
}

export function updateSettings(body) {
  return api(API.EMPLOYEE.SETTINGS, { method: 'PATCH', body })
}

export function fetchProfessionalId() {
  return api(API.EMPLOYEE.PROFESSIONAL_ID)
}

export function fetchInvitations() {
  return api(API.EMPLOYEE.INVITATIONS)
}

export function acceptInvitation(id) {
  return api(API.EMPLOYEE.INVITATION_ACCEPT(id), { method: 'POST' })
}

export function rejectInvitation(id) {
  return api(API.EMPLOYEE.INVITATION_REJECT(id), { method: 'POST' })
}

export function fetchEmployeeAccessRequests() {
  return api(API.EMPLOYEE.ACCESS_REQUESTS)
}

export function approveAccessRequest(id) {
  return api(API.EMPLOYEE.ACCESS_REQUEST_APPROVE(id), { method: 'POST' })
}

export function rejectAccessRequest(id) {
  return api(API.EMPLOYEE.ACCESS_REQUEST_REJECT(id), { method: 'POST' })
}

export function fetchEndorsements() {
  return api(API.EMPLOYEE.ENDORSEMENTS)
}

export function createEndorsement(body) {
  return api(API.EMPLOYEE.ENDORSE, { method: 'POST', body })
}

export function fetchJobVerification(jobId) {
  return api(API.EMPLOYEE.JOB_VERIFICATION(jobId))
}

export function createJobVerificationRequest(jobId, body) {
  return api(API.EMPLOYEE.JOB_VERIFICATION_REQUEST(jobId), { method: 'POST', body })
}

export function fetchVerificationRequests() {
  return api(API.EMPLOYEE.VERIFICATION_REQUESTS)
}

export function approveVerificationConsent(id) {
  return api(API.EMPLOYEE.VERIFICATION_CONSENT_APPROVE(id), { method: 'POST' })
}

export function rejectVerificationConsent(id, body) {
  return api(API.EMPLOYEE.VERIFICATION_CONSENT_REJECT(id), { method: 'POST', body })
}

export function fetchVerificationTags() {
  return api(API.EMPLOYEE.VERIFICATION_TAGS)
}

export function uploadJobDocumentWithType(jobId, file, documentType) {
  const form = new FormData()
  form.append('document', file)
  if (documentType) form.append('documentType', documentType)
  return api(API.EMPLOYEE.JOB_DOCUMENTS(jobId), { method: 'POST', body: form })
}

export function fetchEmployeeSmtpSettings() {
  return api(API.EMPLOYEE.SMTP_SETTINGS)
}

export function updateEmployeeSmtpSettings(body) {
  return api(API.EMPLOYEE.SMTP_SETTINGS, { method: 'PUT', body })
}

export function sendEmployeeSmtpTest(body = {}) {
  return api(API.EMPLOYEE.SMTP_TEST, { method: 'POST', body })
}

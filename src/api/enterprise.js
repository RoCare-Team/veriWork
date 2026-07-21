import { API } from '../constants/routes'
import { api } from '../lib/api'

export const enterpriseKeys = {
  onboarding: ['enterprise', 'onboarding'],
  applicationStatus: ['enterprise', 'application', 'status'],
  applicationMessages: ['enterprise', 'application', 'messages'],
  dashboard: ['enterprise', 'dashboard'],
  workforce: ['enterprise', 'workforce'],
  joinRequests: ['enterprise', 'join-requests'],
  qr: ['enterprise', 'qr'],
  team: ['company', 'team'],
  workspace: ['company', 'workspace'],
  invitationsPending: ['company', 'invitations', 'pending'],
  teamDepartment: (department) => ['company', 'team', department],
  accessRequests: (filters) => ['company', 'access-requests', filters],
  insights: ['company', 'insights'],
  employeeProfile: (id) => ['company', 'employee-profile', id],
  employeeDocuments: (id) => ['company', 'employee-documents', id],
  employeeAccessStatus: (id) => ['company', 'employee-access-status', id],
  accessRequestTypes: ['company', 'access-request-types'],
  verificationOutgoing: ['company', 'verification', 'outgoing'],
  verificationIncoming: ['company', 'verification', 'incoming'],
  auditLogs: (filters) => ['company', 'audit-logs', filters],
  smtpSettings: ['company', 'smtp-settings'],
  myPermissions: ['company', 'me', 'permissions'],
  companyUsers: ['company', 'users'],
  roles: ['company', 'roles'],
}

export function fetchOnboarding() {
  return api(API.ENTERPRISE.ONBOARDING)
}

export function updateBasicInfo(body) {
  return api(API.ENTERPRISE.ONBOARDING_BASIC, { method: 'PATCH', body })
}

export function updateRegistration(body) {
  return api(API.ENTERPRISE.ONBOARDING_REGISTRATION, { method: 'PATCH', body })
}

export function uploadOnboardingDocument(docType, file) {
  const form = new FormData()
  form.append('document', file)
  return api(API.ENTERPRISE.ONBOARDING_DOCUMENT(docType), { method: 'POST', body: form })
}

export function submitOnboarding(certified = true) {
  return api(API.ENTERPRISE.ONBOARDING_SUBMIT, { method: 'POST', body: { certified } })
}

export function fetchDashboard() {
  return api(API.ENTERPRISE.DASHBOARD)
}

export function fetchWorkforce() {
  return api(API.ENTERPRISE.WORKFORCE)
}

export function fetchJoinRequests() {
  return api(API.ENTERPRISE.JOIN_REQUESTS)
}

export function updateJoinRequest(id, status) {
  return api(API.ENTERPRISE.JOIN_REQUEST(id), { method: 'PATCH', body: { status } })
}

export function fetchApplicationStatus() {
  return api(API.ENTERPRISE.APPLICATION_STATUS)
}

export function resubmitApplication() {
  return api(API.ENTERPRISE.APPLICATION_RESUBMIT, { method: 'POST', body: {} })
}

export function fetchApplicationMessages() {
  return api(API.ENTERPRISE.APPLICATION_MESSAGES)
}

export function postApplicationMessage(body) {
  return api(API.ENTERPRISE.APPLICATION_MESSAGES, { method: 'POST', body: { body } })
}

export function fetchQrOnboarding() {
  return api(API.ENTERPRISE.QR_ONBOARDING)
}

export function createQrOnboarding(body) {
  return api(API.ENTERPRISE.QR_ONBOARDING, { method: 'POST', body })
}

export function setQrOnboardingActive(id, isActive) {
  return api(API.ENTERPRISE.QR_ONBOARDING_ACTIVE(id), { method: 'PATCH', body: { isActive } })
}

export function deleteQrOnboarding(id) {
  return api(API.ENTERPRISE.QR_ONBOARDING_DELETE(id), { method: 'DELETE' })
}

export function fetchTeam() {
  return api(API.COMPANY.TEAM)
}

export function fetchWorkspace() {
  return api(API.COMPANY.WORKSPACE)
}

export function fetchTeamDepartment(department) {
  return api(API.COMPANY.TEAM_DEPARTMENT(department))
}

export function inviteEmployee(body) {
  return api(API.COMPANY.INVITE_EMPLOYEE, { method: 'POST', body })
}

export function searchCompanyEmployees(query) {
  const params = new URLSearchParams({ q: query })
  return api(`${API.COMPANY.EMPLOYEE_SEARCH}?${params}`)
}

export function fetchPendingInvitations() {
  return api(API.COMPANY.INVITATIONS_PENDING)
}

export function fetchAccessRequests({ status = 'all', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (status && status !== 'all') {
    const apiStatus = status === 'accepted' ? 'approved' : status
    params.set('status', apiStatus)
  }
  return api(`${API.COMPANY.ACCESS_REQUESTS}?${params}`)
}

export function createAccessRequest(body) {
  return api(API.COMPANY.ACCESS_REQUEST, { method: 'POST', body })
}

export function fetchAccessRequestTypes() {
  return api(API.COMPANY.ACCESS_REQUEST_TYPES)
}

export function fetchInsights() {
  return api(API.COMPANY.INSIGHTS)
}

export async function fetchEmployeeProfile(employeeId) {
  try {
    return await api(API.COMPANY.EMPLOYEE_PROFILE(employeeId))
  } catch (err) {
    if (err?.status === 404 && err?.message === 'Route not found') {
      console.error('Use: GET /api/company/employees/:employeeId/profile')
    }
    throw err
  }
}

export function revokeEmployeeAccess(employeeId, body = {}) {
  return api(API.COMPANY.EMPLOYEE_REVOKE_ACCESS(employeeId), { method: 'POST', body })
}

export function fetchEmployeeDocuments(employeeId) {
  return api(API.COMPANY.EMPLOYEE_DOCUMENTS(employeeId))
}

export function fetchEmployeeAccessStatus(employeeId) {
  return api(API.COMPANY.EMPLOYEE_ACCESS_STATUS(employeeId))
}

export function createVerificationRequest(body) {
  return api(API.COMPANY.VERIFICATION_REQUEST, { method: 'POST', body })
}

export function searchPlatformCompanies(query) {
  const params = new URLSearchParams({ q: query })
  return api(`${API.COMPANY.PLATFORM_COMPANIES_SEARCH}?${params}`)
}

export function fetchVerificationOutgoing() {
  return api(API.COMPANY.VERIFICATION_REQUESTS_OUTGOING)
}

export function fetchVerificationIncoming() {
  return api(API.COMPANY.VERIFICATION_REQUESTS_INCOMING)
}

export function fetchEmployeeJobVerificationRecord(employeeId, jobId) {
  return api(API.COMPANY.EMPLOYEE_JOB_VERIFICATION_RECORD(employeeId, jobId))
}

export function assignEmployeeOnboarding(employeeId, body) {
  return api(API.COMPANY.EMPLOYEE_ONBOARDING(employeeId), { method: 'PATCH', body })
}

export function approveVerificationRequest(id, body = {}) {
  return api(API.COMPANY.VERIFICATION_REQUEST_APPROVE(id), { method: 'POST', body })
}

export function rejectVerificationRequest(id, body = {}) {
  return api(API.COMPANY.VERIFICATION_REQUEST_REJECT(id), { method: 'POST', body })
}

export function completeEmailVerification(id, body) {
  return api(API.COMPANY.VERIFICATION_REQUEST_COMPLETE_EMAIL(id), { method: 'POST', body })
}

export function resendVerificationEmail(id) {
  return api(API.COMPANY.VERIFICATION_REQUEST_RESEND_EMAIL(id), { method: 'POST', body: {} })
}

export function reviewHrResponse(id, body) {
  return api(API.COMPANY.VERIFICATION_REQUEST_REVIEW_HR(id), { method: 'POST', body })
}

export function confirmDocumentVerification(id, body = {}) {
  return api(API.COMPANY.VERIFICATION_REQUEST_CONFIRM_DOCUMENT(id), { method: 'POST', body })
}

export function fetchAuditLogs({ action = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (action) params.set('action', action)
  return api(`${API.COMPANY.AUDIT_LOGS}?${params}`)
}

export function fetchMyPermissions() {
  return api(API.COMPANY.ME_PERMISSIONS)
}

export function fetchRoles() {
  return api(API.COMPANY.ROLES)
}

export function fetchCompanyUsers() {
  return api(API.COMPANY.USERS)
}

export function createCompanyUser(body) {
  return api(API.COMPANY.USERS, { method: 'POST', body })
}

export function resetCompanyUserPassword(userId, password) {
  return api(API.COMPANY.USER_PASSWORD(userId), { method: 'POST', body: { password } })
}

export function createCompanyRole(body) {
  return api(API.COMPANY.ROLES, { method: 'POST', body })
}

export function updateCompanyRole(roleId, body) {
  return api(API.COMPANY.ROLE(roleId), { method: 'PATCH', body })
}

export function deleteCompanyRole(roleId) {
  return api(API.COMPANY.ROLE(roleId), { method: 'DELETE' })
}

export function inviteCompanyUser(body) {
  return api(API.COMPANY.USER_INVITE, { method: 'POST', body })
}

export function revokeCompanyUserInvite(inviteId) {
  return api(API.COMPANY.USER_INVITE_REVOKE(inviteId), { method: 'POST', body: {} })
}

/** body is { companyRole } for a preset, or { companyRoleId } for a custom role. */
export function updateCompanyUserRole(userId, body) {
  return api(API.COMPANY.USER_ROLE(userId), { method: 'PATCH', body })
}

export function removeCompanyUser(userId) {
  return api(API.COMPANY.USER_REMOVE(userId), { method: 'DELETE' })
}

export function fetchSmtpSettings() {
  return api(API.COMPANY.SMTP_SETTINGS)
}

export function updateSmtpSettings(body) {
  return api(API.COMPANY.SMTP_SETTINGS, { method: 'PUT', body })
}

export function sendSmtpTest(body = {}) {
  return api(API.COMPANY.SMTP_TEST, { method: 'POST', body })
}

import { API } from '../constants/routes'
import { api } from '../lib/api'

export const enterpriseKeys = {
  onboarding: ['enterprise', 'onboarding'],
  dashboard: ['enterprise', 'dashboard'],
  workforce: ['enterprise', 'workforce'],
  joinRequests: ['enterprise', 'join-requests'],
  qr: ['enterprise', 'qr'],
  team: ['company', 'team'],
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

export function fetchQrOnboarding() {
  return api(API.ENTERPRISE.QR_ONBOARDING)
}

export function createQrOnboarding(label) {
  return api(API.ENTERPRISE.QR_ONBOARDING, { method: 'POST', body: { label } })
}

export function fetchTeam() {
  return api(API.COMPANY.TEAM)
}

export function fetchTeamDepartment(department) {
  return api(API.COMPANY.TEAM_DEPARTMENT(department))
}

export function inviteEmployee(body) {
  return api(API.COMPANY.INVITE_EMPLOYEE, { method: 'POST', body })
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

export function fetchVerificationOutgoing() {
  return api(API.COMPANY.VERIFICATION_REQUESTS_OUTGOING)
}

export function fetchVerificationIncoming() {
  return api(API.COMPANY.VERIFICATION_REQUESTS_INCOMING)
}

export function approveVerificationRequest(id) {
  return api(API.COMPANY.VERIFICATION_REQUEST_APPROVE(id), { method: 'POST' })
}

export function rejectVerificationRequest(id) {
  return api(API.COMPANY.VERIFICATION_REQUEST_REJECT(id), { method: 'POST' })
}

export function completeEmailVerification(id, body) {
  return api(API.COMPANY.VERIFICATION_REQUEST_COMPLETE_EMAIL(id), { method: 'POST', body })
}

export function fetchAuditLogs({ action = '', page = 1, limit = 20 } = {}) {
  const params = new URLSearchParams({ page: String(page), limit: String(limit) })
  if (action) params.set('action', action)
  return api(`${API.COMPANY.AUDIT_LOGS}?${params}`)
}

import { API } from '../constants/routes'
import { api } from '../lib/api'

export const enterpriseKeys = {
  onboarding: ['enterprise', 'onboarding'],
  dashboard: ['enterprise', 'dashboard'],
  workforce: ['enterprise', 'workforce'],
  joinRequests: ['enterprise', 'join-requests'],
  qr: ['enterprise', 'qr'],
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

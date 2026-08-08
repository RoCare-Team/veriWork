import { API } from '../constants/routes'
import { api } from '../lib/api'
import {
  getDevAdminDashboard,
  getDevAdminCompanies,
  getDevAdminCompany,
  getDevAdminEmployees,
  getDevAdminEmployee,
  isDevAdminSession,
  reviewDevAdminCompany,
} from '../lib/devAdmin'
import { normalizeAdminCompanyDetail, normalizeCompanyList } from '../utils/adminCompanyUtils'
import { normalizeAdminEmployee, normalizeAdminEmployeeList } from '../utils/adminEmployeeUtils'

export const adminKeys = {
  dashboard: ['admin', 'dashboard'],
  companies: (status) => ['admin', 'companies', status || 'all'],
  company: (id) => ['admin', 'company', id],
  employees: (status, q) => ['admin', 'employees', status || 'all', q || ''],
  employee: (id) => ['admin', 'employee', id],
  companyMessages: (id) => ['admin', 'company', id, 'messages'],
  aadhaarRequests: (status, q) => ['admin', 'aadhaar-requests', status || 'pending', q || ''],
  aadhaarRequest: (id) => ['admin', 'aadhaar-request', id],
}

export function fetchAdminDashboard() {
  if (isDevAdminSession()) return Promise.resolve(getDevAdminDashboard())
  return api(API.ADMIN.DASHBOARD)
}

export async function fetchAdminCompanies(status) {
  if (isDevAdminSession()) return getDevAdminCompanies(status)

  const path = status ? `${API.ADMIN.COMPANIES}?status=${status}` : API.ADMIN.COMPANIES
  const data = await api(path)
  return normalizeCompanyList(data)
}

export async function fetchAdminCompany(id) {
  if (isDevAdminSession()) {
    const raw = getDevAdminCompany(id)
    return normalizeAdminCompanyDetail(raw)
  }

  const data = await api(API.ADMIN.COMPANY(id))
  return normalizeAdminCompanyDetail(data)
}

export function reviewAdminCompany(id, status, reason) {
  if (isDevAdminSession()) return Promise.resolve(reviewDevAdminCompany(id, status, reason))

  return api(API.ADMIN.REVIEW(id), {
    method: 'PATCH',
    body: { status, ...(reason ? { reason } : {}) },
  })
}

/** Approve or reject a single uploaded document. */
export function reviewAdminCompanyDocument(id, { documentKey, status, reason }) {
  return api(API.ADMIN.REVIEW_DOCUMENT(id), {
    method: 'PATCH',
    body: { documentKey, status, ...(reason ? { reason } : {}) },
  })
}

export function fetchAdminCompanyMessages(id) {
  return api(API.ADMIN.COMPANY_MESSAGES(id))
}

export function postAdminCompanyMessage(id, body) {
  return api(API.ADMIN.COMPANY_MESSAGES(id), { method: 'POST', body: { body } })
}

export async function fetchAdminEmployees({ status = 'all', q = '' } = {}) {
  if (isDevAdminSession()) return getDevAdminEmployees({ status, q })

  const params = new URLSearchParams()
  if (status && status !== 'all') params.set('status', status)
  if (q?.trim()) params.set('q', q.trim())

  const query = params.toString()
  const path = query ? `${API.ADMIN.EMPLOYEES}?${query}` : API.ADMIN.EMPLOYEES
  const data = await api(path)
  return normalizeAdminEmployeeList(data)
}

export async function fetchAdminEmployee(id) {
  if (isDevAdminSession()) {
    const raw = getDevAdminEmployee(id)
    return normalizeAdminEmployee(raw)
  }

  const data = await api(API.ADMIN.EMPLOYEE(id))
  return normalizeAdminEmployee(data)
}

// The offline dev-admin session has no server behind it, and Aadhaar review
// needs the real uploaded card images — so say that plainly instead of
// rendering an empty queue that looks like "nothing to review".
const DEV_ADMIN_UNAVAILABLE =
  'Aadhaar review needs a real admin account — the offline demo admin cannot load submitted cards.'

/** Manual Aadhaar KYC review queue. */
export function fetchAadhaarRequests({ status = 'pending', q = '' } = {}) {
  if (isDevAdminSession()) return Promise.reject(new Error(DEV_ADMIN_UNAVAILABLE))

  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q?.trim()) params.set('q', q.trim())

  const query = params.toString()
  return api(query ? `${API.ADMIN.AADHAAR_REQUESTS}?${query}` : API.ADMIN.AADHAAR_REQUESTS)
}

export function fetchAadhaarRequest(id) {
  if (isDevAdminSession()) return Promise.reject(new Error(DEV_ADMIN_UNAVAILABLE))
  return api(API.ADMIN.AADHAAR_REQUEST(id))
}

export function reviewAadhaarRequest(id, { status, reason, notes }) {
  return api(API.ADMIN.AADHAAR_REQUEST_REVIEW(id), {
    method: 'PATCH',
    body: {
      status,
      ...(reason ? { reason } : {}),
      ...(notes ? { notes } : {}),
    },
  })
}

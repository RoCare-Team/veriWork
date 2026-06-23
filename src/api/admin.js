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

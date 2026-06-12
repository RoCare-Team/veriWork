import { API } from '../constants/routes'
import { api } from '../lib/api'
import {
  getDevAdminDashboard,
  getDevAdminCompanies,
  getDevAdminCompany,
  isDevAdminSession,
  reviewDevAdminCompany,
} from '../lib/devAdmin'
import { normalizeAdminCompanyDetail, normalizeCompanyList } from '../utils/adminCompanyUtils'

export const adminKeys = {
  dashboard: ['admin', 'dashboard'],
  companies: (status) => ['admin', 'companies', status || 'all'],
  company: (id) => ['admin', 'company', id],
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

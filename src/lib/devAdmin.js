import { getAccessToken } from './authStorage'
import { normalizeAdminCompanyDetail, normalizeAdminListItem } from '../utils/adminCompanyUtils'

export const DEV_ADMIN_EMAIL = 'admin@veriwork.com'
export const DEV_ADMIN_PASSWORD = 'Admin@VeriWork123'
export const DEV_ADMIN_TOKEN = 'dev-admin-mock-token'

const STORAGE_KEY = 'veriwork_dev_admin_companies'

const SEED = [
  {
    id: 'dev-co-1',
    company: {
      name: 'Startup Labs Pvt. Ltd.',
      companyLegalName: 'Startup Labs Pvt. Ltd.',
      companyType: 'private_limited',
      industry: 'Technology',
      companySize: '50-200',
      workEmail: 'hr@startuplabs.com',
      contactName: 'Rajesh Kumar',
      phone: '+919876543210',
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      pincode: '400001',
      locality: 'Fort',
      brn: 'U72900MH2015PTC123456',
      taxId: '27AABCU9603R1ZM',
    },
    admin: { email: 'admin@startuplabs.com' },
    onboarding: {
      status: 'submitted',
      submittedAt: new Date().toISOString(),
      documents: {
        incorporation: 'https://example.com/incorporation.pdf',
        registration: 'https://example.com/moa.pdf',
        tax: 'https://example.com/gst.pdf',
        addressProof: 'https://example.com/address.pdf',
        signatoryId: 'https://example.com/id.pdf',
      },
    },
  },
  {
    id: 'dev-co-2',
    company: {
      name: 'Nova HR Solutions',
      companyType: 'llp',
      industry: 'Consulting',
      companySize: '1-50',
      workEmail: 'hr@novahr.com',
      contactName: 'Priya Sharma',
      phone: '+919888877766',
      city: 'Bangalore',
      brn: 'AAB-1234',
      taxId: '29AABCN1234A1Z5',
    },
    admin: { email: 'contact@novahr.com' },
    onboarding: {
      status: 'approved',
      submittedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      documents: {
        incorporation: 'https://example.com/llp-inc.pdf',
        tax: 'https://example.com/gst2.pdf',
      },
    },
  },
]

function loadCompanies() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED))
  return SEED
}

function saveCompanies(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list))
}

export function isDevAdminSession() {
  return getAccessToken() === DEV_ADMIN_TOKEN
}

export function tryDevAdminLogin(email, password) {
  const ok =
    email.trim().toLowerCase() === DEV_ADMIN_EMAIL &&
    password === DEV_ADMIN_PASSWORD
  if (!ok) return null

  loadCompanies()

  return {
    accessToken: DEV_ADMIN_TOKEN,
    refreshToken: 'dev-admin-mock-refresh',
    tokenType: 'Bearer',
    user: {
      id: 'dev-admin-1',
      email: DEV_ADMIN_EMAIL,
      name: 'VeriWork Admin',
      role: 'platform_admin',
    },
    homeRoute: '/admin/dashboard',
  }
}

export function getDevAdminDashboard() {
  const all = loadCompanies()
  const count = (s) => all.filter((r) => r.onboarding?.status === s).length
  return {
    stats: {
      pending: count('submitted'),
      approved: count('approved'),
      rejected: count('rejected'),
      total: all.length,
    },
  }
}

export function getDevAdminCompanies(status) {
  const all = loadCompanies()
  if (!status || status === 'all') return all.map(normalizeAdminListItem)
  if (status === 'submitted') {
    return all
      .filter((r) => r.onboarding?.status === 'submitted' || r.onboarding?.status === 'pending')
      .map(normalizeAdminListItem)
  }
  return all.filter((r) => r.onboarding?.status === status).map(normalizeAdminListItem)
}

export function getDevAdminCompany(id) {
  const item = loadCompanies().find((r) => r.id === id || r._id === id)
  if (!item) throw new Error('Company not found')
  return item
}

export function reviewDevAdminCompany(id, status, reason) {
  const all = loadCompanies()
  const idx = all.findIndex((r) => r.id === id || r._id === id)
  if (idx === -1) throw new Error('Company not found')

  all[idx] = {
    ...all[idx],
    onboarding: {
      ...all[idx].onboarding,
      status,
      ...(status === 'rejected' && reason ? { rejectionReason: reason } : {}),
    },
  }
  saveCompanies(all)

  return {
    message: status === 'approved' ? 'Company approved successfully' : 'Company rejected',
    companyId: id,
    approvalStatus: status,
    isVerified: status === 'approved',
  }
}

export { normalizeAdminCompanyDetail }

import { getAccessToken } from './authStorage'
import { normalizeAdminCompanyDetail, normalizeAdminListItem } from '../utils/adminCompanyUtils'
import { normalizeAdminEmployee, normalizeAdminEmployeeList } from '../utils/adminEmployeeUtils'

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

const DEV_EMPLOYEES = [
  {
    id: 'dev-emp-1',
    userId: 'dev-emp-1',
    profileId: 'dev-profile-1',
    name: 'Aarav Mehta',
    email: 'aarav.mehta@example.com',
    phone: '+919876543210',
    role: 'Software Engineer',
    company: 'Startup Labs Pvt. Ltd.',
    veriworkId: 'VW-100234',
    publicSlug: 'aarav-mehta',
    initials: 'AM',
    photoUrl: null,
    profileSetupComplete: true,
    aadhaarVerified: true,
    biometricVerified: true,
    isVerified: true,
    employeeScore: 742,
    currentCity: 'Mumbai',
    linkedCompanies: ['Startup Labs Pvt. Ltd.'],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    dateOfBirth: '1996-04-12',
    gender: 'male',
    totalExperience: '3-5 years',
    currentAddress: 'Andheri East, Mumbai',
    permanentAddress: 'Andheri East, Mumbai',
    education: {
      class10: { board: 'CBSE', school: 'Delhi Public School', passingYear: '2012', percentage: '88%' },
      class12: { board: 'CBSE', school: 'Delhi Public School', stream: 'Science', passingYear: '2014', percentage: '85%' },
      graduation: { degree: 'B.Tech CSE', college: 'IIT Bombay', university: 'IIT Bombay', passingYear: '2018', percentage: '8.4 CGPA' },
    },
    skills: ['React', 'Node.js'],
    endorsements: 3,
    digilockerUsed: true,
    publicProfileEnabled: true,
    authProvider: 'phone',
  },
  {
    id: 'dev-emp-2',
    userId: 'dev-emp-2',
    profileId: 'dev-profile-2',
    name: 'Priya Sharma',
    email: 'priya.sharma@example.com',
    phone: '+919888877766',
    role: 'HR Manager',
    company: 'Nova HR Solutions',
    veriworkId: 'VW-100567',
    publicSlug: 'priya-sharma',
    initials: 'PS',
    photoUrl: null,
    profileSetupComplete: true,
    aadhaarVerified: true,
    biometricVerified: false,
    isVerified: false,
    employeeScore: 655,
    currentCity: 'Bangalore',
    linkedCompanies: ['Nova HR Solutions'],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    dateOfBirth: '1992-08-21',
    gender: 'female',
    totalExperience: '5-8 years',
    currentAddress: 'Koramangala, Bangalore',
    permanentAddress: 'Koramangala, Bangalore',
    education: {
      class10: { board: 'ICSE', school: 'St. Mary School', passingYear: '2008', percentage: '90%' },
      class12: { board: 'ISC', school: 'St. Mary School', stream: 'Commerce', passingYear: '2010', percentage: '87%' },
      graduation: { degree: 'MBA HR', college: 'Christ University', university: 'Christ University', passingYear: '2014', percentage: '8.1 CGPA' },
    },
    skills: ['Recruitment', 'Payroll'],
    endorsements: 1,
    digilockerUsed: false,
    publicProfileEnabled: true,
    authProvider: 'google',
  },
  {
    id: 'dev-emp-3',
    userId: 'dev-emp-3',
    profileId: 'dev-profile-3',
    name: 'Rohan Verma',
    email: 'rohan.verma@example.com',
    phone: '+919765432109',
    role: 'Professional',
    company: 'Not set',
    veriworkId: 'VW-100890',
    publicSlug: 'rohan-verma',
    initials: 'RV',
    photoUrl: null,
    profileSetupComplete: false,
    aadhaarVerified: false,
    biometricVerified: false,
    isVerified: false,
    employeeScore: 300,
    currentCity: 'Pune',
    linkedCompanies: [],
    isActive: true,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    dateOfBirth: '',
    gender: '',
    totalExperience: '',
    currentAddress: '',
    permanentAddress: '',
    education: null,
    skills: [],
    endorsements: 0,
    digilockerUsed: false,
    publicProfileEnabled: true,
    authProvider: 'phone',
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
      name: 'PagerLook Admin',
      role: 'platform_admin',
    },
    homeRoute: '/admin/dashboard',
  }
}

export function getDevAdminDashboard() {
  const all = loadCompanies()
  const count = (s) => all.filter((r) => r.onboarding?.status === s).length
  const employees = DEV_EMPLOYEES
  return {
    stats: {
      pending: count('submitted'),
      approved: count('approved'),
      rejected: count('rejected'),
      total: all.length,
      totalEmployees: employees.length,
      employeesProfileComplete: employees.filter((e) => e.profileSetupComplete).length,
      employeesVerified: employees.filter((e) => e.isVerified).length,
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

function filterDevEmployees({ status = 'all', q = '' } = {}) {
  let list = [...DEV_EMPLOYEES]
  const query = q?.trim().toLowerCase()

  if (status === 'complete') list = list.filter((e) => e.profileSetupComplete)
  if (status === 'incomplete') list = list.filter((e) => !e.profileSetupComplete)
  if (status === 'verified') list = list.filter((e) => e.isVerified)

  if (query) {
    list = list.filter((e) => (
      e.name?.toLowerCase().includes(query)
      || e.email?.toLowerCase().includes(query)
      || e.phone?.includes(query)
      || e.veriworkId?.toLowerCase().includes(query)
      || e.company?.toLowerCase().includes(query)
      || e.currentCity?.toLowerCase().includes(query)
    ))
  }

  return normalizeAdminEmployeeList(list)
}

export function getDevAdminEmployees(filters) {
  return filterDevEmployees(filters)
}

export function getDevAdminEmployee(id) {
  const item = DEV_EMPLOYEES.find((e) => e.id === id || e.userId === id)
  if (!item) throw new Error('Employee not found')
  return item
}

export { normalizeAdminCompanyDetail }

export const API = {
  BASE: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',

  AUTH: {
    EMPLOYEE_OTP_SEND: '/auth/employee/otp/send',
    EMPLOYEE_OTP_VERIFY: '/auth/employee/otp/verify',
    ENTERPRISE_LOGIN: '/auth/enterprise/login',
    ENTERPRISE_REGISTER: '/auth/enterprise/register',
    ADMIN_LOGIN: '/auth/admin/login',
    REFRESH: '/auth/refresh',
    LOGOUT: '/auth/logout',
  },

  ADMIN: {
    LOGIN: '/auth/admin/login',
    DASHBOARD: '/admin/dashboard',
    COMPANIES: '/admin/companies',
    COMPANY: (id) => `/admin/companies/${id}`,
    REVIEW: (id) => `/admin/companies/${id}/review`,
  },

  EMPLOYEE: {
    PROFILE: '/employee/profile',
    SCORE: '/employee/score',
    VERIFICATION_STATUS: '/employee/verification/status',
    VERIFICATION_AADHAAR: '/employee/verification/aadhaar',
    VERIFICATION_BIOMETRIC: '/employee/verification/biometric',
    JOBS: '/employee/jobs',
    JOB_DOCUMENTS: (id) => `/employee/jobs/${id}/documents`,
    ACTIVITY: '/employee/activity',
    ACTIVITY_ACTION: (id) => `/employee/activity/${id}`,
    VAULT: '/employee/vault',
    SETTINGS: '/employee/settings',
  },

  ENTERPRISE: {
    ONBOARDING: '/enterprise/onboarding',
    ONBOARDING_BASIC: '/enterprise/onboarding/basic-info',
    ONBOARDING_REGISTRATION: '/enterprise/onboarding/registration',
    ONBOARDING_DOCUMENT: (type) => `/enterprise/onboarding/documents/${type}`,
    ONBOARDING_SUBMIT: '/enterprise/onboarding/submit',
    DASHBOARD: '/enterprise/dashboard',
    WORKFORCE: '/enterprise/workforce',
    JOIN_REQUESTS: '/enterprise/join-requests',
    JOIN_REQUEST: (id) => `/enterprise/join-requests/${id}`,
    QR_ONBOARDING: '/enterprise/qr-onboarding',
  },
}

export const MEDIA_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace(
  /\/api\/?$/,
  '',
)

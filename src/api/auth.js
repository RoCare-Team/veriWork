import { API } from '../constants/routes'
import { api } from '../lib/api'
import { tryDevAdminLogin } from '../lib/devAdmin'

export function sendEmployeeOtp(phone) {
  return api(API.AUTH.EMPLOYEE_OTP_SEND, { method: 'POST', body: { phone }, auth: false })
}

export function verifyEmployeeOtp(phone, code) {
  return api(API.AUTH.EMPLOYEE_OTP_VERIFY, {
    method: 'POST',
    body: { phone, code },
    auth: false,
  })
}

export function loginEmployeeGoogle(idToken) {
  return api(API.AUTH.EMPLOYEE_GOOGLE, {
    method: 'POST',
    body: { idToken },
    auth: false,
  })
}

export function loginEnterprise(email, password) {
  return api(API.AUTH.ENTERPRISE_LOGIN, {
    method: 'POST',
    body: { email, password },
    auth: false,
  })
}

export async function loginAdmin(email, password) {
  try {
    const data = await api(API.AUTH.ADMIN_LOGIN, {
      method: 'POST',
      body: { email, password },
      auth: false,
    })
    return {
      accessToken: data.accessToken || data.token,
      refreshToken: data.refreshToken,
      user: {
        ...data.user,
        role: data.user?.role || 'platform_admin',
      },
      homeRoute: '/admin/dashboard',
    }
  } catch (err) {
    if (import.meta.env.VITE_DEV_ADMIN === 'true') {
      const devSession = tryDevAdminLogin(email, password)
      if (devSession) return devSession
    }
    throw err
  }
}

export function normalizeRegisterPhone(phone) {
  const trimmed = phone.trim()
  if (trimmed.startsWith('+')) return trimmed.replace(/\s/g, '')
  const digits = trimmed.replace(/\D/g, '')
  if (digits.length === 10) return `+91${digits}`
  if (digits.length === 12 && digits.startsWith('91')) return `+${digits}`
  return trimmed
}

/**
 * Payload for POST /auth/enterprise/register
 * @see curl example — single call with account + company fields
 */
export function buildEnterpriseRegisterPayload({
  email,
  password,
  confirmPassword,
  companyLegalName,
  companyType,
  industry,
  companySize,
  workEmail,
  contactName,
  phone,
  country,
  city,
  state,
  pincode,
  locality,
  brn,
  taxId,
}) {
  return {
    email: email.trim(),
    password,
    confirmPassword,
    companyLegalName: companyLegalName.trim(),
    ...(companyType ? { companyType } : {}),
    industry,
    companySize,
    workEmail: workEmail.trim(),
    contactName: contactName.trim(),
    phone: normalizeRegisterPhone(phone),
    country: country.trim(),
    city: city?.trim() || '',
    ...(state?.trim() ? { state: state.trim() } : {}),
    ...(pincode?.trim() ? { pincode: pincode.replace(/\D/g, '') } : {}),
    ...(locality?.trim() ? { locality: locality.trim() } : {}),
    ...(brn?.trim() ? { brn: brn.trim().toUpperCase() } : {}),
    ...(taxId?.trim() ? { taxId: taxId.trim().toUpperCase() } : {}),
  }
}

export function registerEnterprise(payload) {
  return api(API.AUTH.ENTERPRISE_REGISTER, { method: 'POST', body: payload, auth: false })
}

export function changePassword(currentPassword, newPassword) {
  return api(API.AUTH.CHANGE_PASSWORD, {
    method: 'POST',
    body: { currentPassword, newPassword },
  })
}

export function logoutApi(refreshToken) {
  if (refreshToken === 'dev-admin-mock-refresh') return Promise.resolve({ ok: true })
  return api(API.AUTH.LOGOUT, {
    method: 'POST',
    body: refreshToken ? { refreshToken } : {},
    auth: false,
  })
}

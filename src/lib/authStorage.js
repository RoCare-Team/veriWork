const ACCESS_KEY = 'veriwork_access_token'
const REFRESH_KEY = 'veriwork_refresh_token'
const USER_KEY = 'veriwork_user'
const ROLE_KEY = 'userRole'
const PROFILE_KEY = 'veriwork_profile'
const COMPANY_KEY = 'veriwork_company'

export function getAccessToken() {
  return localStorage.getItem(ACCESS_KEY)
}

export function getRefreshToken() {
  return localStorage.getItem(REFRESH_KEY)
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getStoredProfile() {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function getStoredCompany() {
  try {
    const raw = localStorage.getItem(COMPANY_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setTokens({ accessToken, refreshToken }) {
  if (accessToken) localStorage.setItem(ACCESS_KEY, accessToken)
  if (refreshToken) localStorage.setItem(REFRESH_KEY, refreshToken)
}

export function setStoredUser(user) {
  if (user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    if (user.role) setUserRole(user.role)
  } else {
    localStorage.removeItem(USER_KEY)
  }
}

export function getUserRole() {
  return localStorage.getItem(ROLE_KEY) || getStoredUser()?.role || null
}

export function setUserRole(role) {
  if (role) localStorage.setItem(ROLE_KEY, role)
  else localStorage.removeItem(ROLE_KEY)
}

export function setStoredProfile(profile) {
  if (profile) localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
  else localStorage.removeItem(PROFILE_KEY)
}

export function setStoredCompany(company) {
  if (company) localStorage.setItem(COMPANY_KEY, JSON.stringify(company))
  else localStorage.removeItem(COMPANY_KEY)
}

export function clearAuthStorage() {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
  localStorage.removeItem(USER_KEY)
  localStorage.removeItem(ROLE_KEY)
  localStorage.removeItem(PROFILE_KEY)
  localStorage.removeItem(COMPANY_KEY)
}

export function isEmployeeSession() {
  return getStoredUser()?.role === 'employee' && Boolean(getAccessToken())
}

export function isEnterpriseSession() {
  return getStoredUser()?.role === 'enterprise_admin' && Boolean(getAccessToken())
}

export function isAdminSession() {
  const role = getUserRole()
  return (
    (role === 'platform_admin' || role === 'super_admin' || role === 'admin') &&
    Boolean(getAccessToken())
  )
}

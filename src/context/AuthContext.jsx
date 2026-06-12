import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import { logoutApi } from '../api/auth'
import { fetchProfile } from '../api/employee'
import {
  clearAuthStorage,
  getRefreshToken,
  getStoredCompany,
  getStoredProfile,
  getStoredUser,
  isAdminSession,
  isEmployeeSession,
  isEnterpriseSession,
  setStoredCompany,
  setStoredProfile,
  setStoredUser,
  setTokens,
} from '../lib/authStorage'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser())
  const [profile, setProfile] = useState(() => getStoredProfile())
  const [company, setCompany] = useState(() => getStoredCompany())
  const [booting, setBooting] = useState(true)

  const isEmployee = user?.role === 'employee'
  const isEnterprise = user?.role === 'enterprise_admin'
  const isAdmin = ['platform_admin', 'super_admin', 'admin'].includes(user?.role)
  const isAuthenticated = Boolean(user && (isEmployee || isEnterprise || isAdmin))

  useEffect(() => {
    async function bootstrap() {
      if (!isEmployeeSession() && !isEnterpriseSession() && !isAdminSession()) {
        setBooting(false)
        return
      }
      try {
        if (isEmployeeSession()) {
          const p = await fetchProfile()
          setProfile(p)
          setStoredProfile(p)
        }
      } catch {
        clearAuthStorage()
        setUser(null)
        setProfile(null)
        setCompany(null)
      } finally {
        setBooting(false)
      }
    }
    bootstrap()
  }, [])

  const loginEmployee = useCallback((data) => {
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    setUser(data.user)
    setProfile(data.profile)
    setStoredUser(data.user)
    setStoredProfile(data.profile)
    setCompany(null)
    setStoredCompany(null)
  }, [])

  const loginAdmin = useCallback((data) => {
    setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    const adminUser = {
      ...data.user,
      role: data.user?.role || 'platform_admin',
    }
    setUser(adminUser)
    setStoredUser(adminUser)
    setProfile(null)
    setStoredProfile(null)
    setCompany(null)
    setStoredCompany(null)
  }, [])

  const loginEnterprise = useCallback((data) => {
    if (data.accessToken) {
      setTokens({ accessToken: data.accessToken, refreshToken: data.refreshToken })
    }
    if (data.user) {
      setUser(data.user)
      setStoredUser(data.user)
    }
    if (data.company) {
      setCompany(data.company)
      setStoredCompany(data.company)
    }
    setProfile(null)
    setStoredProfile(null)
  }, [])

  const updateCompanyState = useCallback((next) => {
    setCompany(next)
    setStoredCompany(next)
  }, [])

  const updateProfileState = useCallback((next) => {
    setProfile(next)
    setStoredProfile(next)
  }, [])

  const logout = useCallback(async () => {
    const refreshToken = getRefreshToken()
    try {
      if (refreshToken) await logoutApi(refreshToken)
    } catch {
      /* ignore */
    }
    clearAuthStorage()
    setUser(null)
    setProfile(null)
    setCompany(null)
  }, [])

  const value = useMemo(
    () => ({
      user,
      profile,
      company,
      isEmployee,
      isEnterprise,
      isAdmin,
      isAuthenticated,
      booting,
      loginEmployee,
      loginAdmin,
      loginEnterprise,
      updateProfileState,
      updateCompanyState,
      logout,
    }),
    [
      user,
      profile,
      company,
      isEmployee,
      isEnterprise,
      isAdmin,
      isAuthenticated,
      booting,
      loginEmployee,
      loginAdmin,
      loginEnterprise,
      updateProfileState,
      updateCompanyState,
      logout,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

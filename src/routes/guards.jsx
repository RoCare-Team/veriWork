import { Navigate, Outlet } from 'react-router-dom'
import Loader from '../components/common/Loader'
import { useAuth } from '../context/AuthContext'
import { getEmployeeHomeRoute } from '../utils/employeeRoutes'
import {
  getEnterpriseHomeRoute,
  isEnterpriseApproved,
  isEnterprisePendingApproval,
  isEnterpriseRejected,
} from '../utils/enterpriseApproval'

export function AdminPortalGuard() {
  const { isAdmin, isAuthenticated, booting } = useAuth()
  if (booting) return <Loader variant="fullPage" label="Loading..." />
  if (!isAuthenticated || !isAdmin) {
    return <Navigate to="/admin/login" replace />
  }
  return <Outlet />
}

export function AdminGuestGuard() {
  const { isAdmin, isAuthenticated, booting } = useAuth()
  if (booting) return <Loader variant="fullPage" label="Loading..." />
  if (isAuthenticated && isAdmin) {
    return <Navigate to="/admin/dashboard" replace />
  }
  return <Outlet />
}

/** Enterprise logged in — onboarding, pending, rejected pages */
export function EnterpriseAuthGuard() {
  const { isEnterprise, isAuthenticated, booting } = useAuth()
  if (booting) return <Loader variant="fullPage" label="Loading..." />
  if (!isAuthenticated || !isEnterprise) {
    return <Navigate to="/enterprise/login" replace />
  }
  return <Outlet />
}

/** Enterprise dashboard — approved companies only */
export function EnterpriseApprovedGuard() {
  const { isEnterprise, isAuthenticated, booting, company } = useAuth()
  if (booting) return <Loader variant="fullPage" label="Loading..." />
  if (!isAuthenticated || !isEnterprise) {
    return <Navigate to="/enterprise/login" replace />
  }
  if (isEnterpriseRejected(company)) {
    return <Navigate to="/enterprise/rejected" replace />
  }
  if (isEnterprisePendingApproval(company)) {
    return <Navigate to="/enterprise/pending-approval" replace />
  }
  if (!isEnterpriseApproved(company)) {
    return <Navigate to={getEnterpriseHomeRoute(company)} replace />
  }
  return <Outlet />
}

export function EnterprisePortalGuard() {
  return <EnterpriseApprovedGuard />
}

export function EnterpriseGuestGuard() {
  const { isEnterprise, isAuthenticated, booting, company } = useAuth()
  if (booting) return <Loader variant="fullPage" label="Loading..." />
  if (isAuthenticated && isEnterprise) {
    return <Navigate to={getEnterpriseHomeRoute(company)} replace />
  }
  return <Outlet />
}

export function EmployeePortalGuard() {
  const { isEmployee, isAuthenticated, booting } = useAuth()
  if (booting) return <Loader variant="fullPage" label="Loading..." />
  if (!isAuthenticated || !isEmployee) {
    return <Navigate to="/employee/login" replace state={{ from: 'portal' }} />
  }
  return <Outlet />
}

export function EmployeeGuestGuard() {
  const { isEmployee, isAuthenticated, booting, profile } = useAuth()
  if (booting) return <Loader variant="fullPage" label="Loading..." />
  if (isAuthenticated && isEmployee) {
    return <Navigate to={getEmployeeHomeRoute(profile)} replace />
  }
  return <Outlet />
}

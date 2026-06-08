import { Navigate, Outlet } from 'react-router-dom'
import { isEnterpriseLoggedIn } from '../store/enterpriseStore'
import { getEmployeeHomeRoute, isEmployeeLoggedIn } from '../store/employeeStore'

export function EnterprisePortalGuard() {
  if (!isEnterpriseLoggedIn()) {
    return <Navigate to="/enterprise/login" replace />
  }
  return <Outlet />
}

export function EnterpriseGuestGuard() {
  if (isEnterpriseLoggedIn()) {
    return <Navigate to="/enterprise/dashboard" replace />
  }
  return <Outlet />
}

export function EmployeePortalGuard() {
  if (!isEmployeeLoggedIn()) {
    return <Navigate to="/employee/login" replace state={{ from: 'portal' }} />
  }
  return <Outlet />
}

export function EmployeeGuestGuard() {
  if (isEmployeeLoggedIn()) {
    return <Navigate to={getEmployeeHomeRoute()} replace />
  }
  return <Outlet />
}

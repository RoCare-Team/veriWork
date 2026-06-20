export function getTrustScoreStyle(score) {
  const n = Number(score) || 0
  if (n >= 700) return { color: 'text-green-600', bg: 'bg-green-50', label: 'High' }
  if (n >= 450) return { color: 'text-amber-600', bg: 'bg-amber-50', label: 'Medium' }
  return { color: 'text-red-600', bg: 'bg-red-50', label: 'Low' }
}

export const EMPLOYMENT_STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'on_leave', label: 'On Leave' },
  { value: 'probation', label: 'Probation' },
  { value: 'terminated', label: 'Terminated' },
]

export function getEmploymentStatusStyle(status) {
  const map = {
    active: { bg: 'bg-green-50', color: 'text-green-700', label: 'Active' },
    on_leave: { bg: 'bg-yellow-50', color: 'text-yellow-700', label: 'On Leave' },
    probation: { bg: 'bg-blue-50', color: 'text-blue-700', label: 'Probation' },
    terminated: { bg: 'bg-red-50', color: 'text-red-700', label: 'Terminated' },
  }
  return map[status] || { bg: 'bg-slate-50', color: 'text-slate-600', label: status || 'Unknown' }
}

export function getAccessRequestStatusStyle(status) {
  const map = {
    accepted: { bg: 'bg-green-50', color: 'text-green-700', label: 'Accepted' },
    approved: { bg: 'bg-green-50', color: 'text-green-700', label: 'Approved' },
    pending: { bg: 'bg-amber-50', color: 'text-amber-700', label: 'Pending' },
    rejected: { bg: 'bg-red-50', color: 'text-red-700', label: 'Rejected' },
  }
  return map[status] || { bg: 'bg-slate-50', color: 'text-slate-600', label: status || 'Unknown' }
}

export function getInvitationStatusStyle(status) {
  const map = {
    pending: { bg: 'bg-blue-50', color: 'text-blue-700', label: 'Invitation Sent' },
    pending_registration: { bg: 'bg-slate-100', color: 'text-slate-600', label: 'Pending Registration' },
    accepted: { bg: 'bg-green-50', color: 'text-green-700', label: 'Accepted' },
    rejected: { bg: 'bg-red-50', color: 'text-red-700', label: 'Rejected' },
  }
  return map[status] || { bg: 'bg-slate-50', color: 'text-slate-600', label: status || 'Unknown' }
}

export function formatRequestType(type) {
  const labels = {
    profile_access: 'Profile Access',
    background_check: 'Background Check',
    verification_data: 'Verification Data',
    full_profile_access: 'Get Full Profile Access',
  }
  if (labels[type]) return labels[type]
  if (!type) return '—'
  return type
    .split('_')
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ')
}

export function getVerificationChannelStyle(channel) {
  const map = {
    platform: { bg: 'bg-blue-50', color: 'text-blue-700', label: 'Platform' },
    email: { bg: 'bg-purple-50', color: 'text-purple-700', label: 'Email' },
  }
  return map[channel] || { bg: 'bg-slate-50', color: 'text-slate-600', label: channel || 'Unknown' }
}

export function getVerificationStatusStyle(status) {
  const map = {
    pending: { bg: 'bg-amber-50', color: 'text-amber-700', label: 'Pending' },
    in_process: { bg: 'bg-blue-50', color: 'text-blue-700', label: 'In Process' },
    in_review: { bg: 'bg-blue-50', color: 'text-blue-700', label: 'Email Sent' },
    hr_responded: { bg: 'bg-purple-50', color: 'text-purple-700', label: 'HR Responded' },
    verified: { bg: 'bg-green-50', color: 'text-green-700', label: 'Verified' },
    approved: { bg: 'bg-green-50', color: 'text-green-700', label: 'Approved' },
    rejected: { bg: 'bg-red-50', color: 'text-red-700', label: 'Rejected' },
    expired: { bg: 'bg-slate-100', color: 'text-slate-600', label: 'Expired' },
    completed: { bg: 'bg-green-50', color: 'text-green-700', label: 'Completed' },
  }
  return map[status] || { bg: 'bg-slate-50', color: 'text-slate-600', label: status || 'Unknown' }
}

export function getOnboardingStageStyle(stage) {
  const map = {
    incoming: { bg: 'bg-slate-100', color: 'text-slate-600', label: 'New' },
    pending_verification: { bg: 'bg-slate-100', color: 'text-slate-600', label: 'Pending verification' },
    verified: { bg: 'bg-slate-100', color: 'text-slate-600', label: 'Ready to assign' },
    active: { bg: 'bg-slate-100', color: 'text-slate-600', label: 'Active' },
  }
  return map[stage] || map.incoming
}

export function employeeHasProfileAccess(employee) {
  const access = employee?.access || {}
  return (
    access.fullProfileAccess === true ||
    access.full_profile_access === true ||
    access.hasAllAccess === true ||
    access.profileAccess === true
  )
}

export function getEmployeeVerifyPath(employeeId) {
  if (!employeeId) return null
  return `/company/team/${encodeURIComponent(employeeId)}?verify=1`
}

/** Resolve employee user id from various API field names */
export function resolveEmployeeId(emp) {
  if (!emp) return null
  return emp.employeeId || emp.id || emp.userId || emp.employeeUserId || emp._id || null
}

export function getEmployeeProfilePath(emp) {
  if (!emp) return null
  if (emp.profilePath) return emp.profilePath
  const id = resolveEmployeeId(emp)
  if (!id) return null
  return `/company/team/${encodeURIComponent(id)}`
}

export function getEmployeeName(emp) {
  return emp?.employeeName || emp?.name || 'Employee'
}

export function getEmployeeRole(emp) {
  return emp?.role || emp?.designation || '—'
}

/** Normalize employees array from team or department API responses */
export function extractDepartmentEmployees(data) {
  if (!data) return []
  if (Array.isArray(data)) return data
  if (Array.isArray(data.employees)) return data.employees
  if (Array.isArray(data.members)) return data.members
  if (Array.isArray(data.department?.employees)) return data.department.employees
  return []
}

export function extractTeamDepartments(data) {
  if (!data) return []
  return data.departments || data || []
}

/** Flatten employees from team overview when API embeds them per department */
export function flattenTeamEmployees(departments) {
  return (departments || []).flatMap((dept) =>
    (dept.employees || []).map((emp) => ({
      ...emp,
      department: emp.department || dept.name,
    })),
  )
}

/** Employees from GET /company/team — top-level array or nested under departments */
export function extractTeamEmployees(data) {
  if (!data) return []
  if (Array.isArray(data.employees) && data.employees.length) return data.employees
  const departments = data.departments || (Array.isArray(data) ? data : [])
  return flattenTeamEmployees(departments)
}

/** Team card access button from API access flags + optional accessButton field */
export function resolveEmployeeAccessButton(employee) {
  if (!employee) return 'request_access'

  if (employee.accessButton === 'pending') return 'pending'
  if (employee.accessButton === 'remove_access') return 'remove_access'
  if (employee.accessButton === 'request_access') return 'request_access'

  const access = employee.access || {}
  const hasFull =
    access.fullProfileAccess === true ||
    access.full_profile_access === true ||
    access.hasAllAccess === true

  if (hasFull) return 'remove_access'

  const hasAny =
    access.hasAnyAccess === true ||
    access.profileAccess === true ||
    access.profile_access === true ||
    access.backgroundCheck === true ||
    access.background_check === true ||
    access.verificationData === true ||
    access.verification_data === true

  if (hasAny) return 'remove_access'

  const pendingFull =
    access.pendingFullProfileAccess === true ||
    access.pending_full_profile_access === true ||
    access.pendingFullProfile === true

  if (pendingFull) return 'pending'

  return 'request_access'
}

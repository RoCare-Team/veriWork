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
    pending: { bg: 'bg-amber-50', color: 'text-amber-700', label: 'Pending' },
    pending_registration: { bg: 'bg-blue-50', color: 'text-blue-700', label: 'Pending Registration' },
    accepted: { bg: 'bg-green-50', color: 'text-green-700', label: 'Accepted' },
    rejected: { bg: 'bg-red-50', color: 'text-red-700', label: 'Rejected' },
  }
  return map[status] || { bg: 'bg-slate-50', color: 'text-slate-600', label: status || 'Unknown' }
}

export function formatRequestType(type) {
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
    approved: { bg: 'bg-green-50', color: 'text-green-700', label: 'Approved' },
    rejected: { bg: 'bg-red-50', color: 'text-red-700', label: 'Rejected' },
    completed: { bg: 'bg-green-50', color: 'text-green-700', label: 'Completed' },
  }
  return map[status] || { bg: 'bg-slate-50', color: 'text-slate-600', label: status || 'Unknown' }
}

/** Resolve employee user id from various API field names */
export function resolveEmployeeId(emp) {
  if (!emp) return null
  return emp.employeeId || emp.userId || emp.employeeUserId || emp.id || emp._id || null
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
      department: dept.name,
    })),
  )
}

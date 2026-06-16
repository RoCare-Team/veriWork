export const COMPANY_ROUTES = {
  DASHBOARD: '/enterprise/dashboard',
  TEAM: '/company/team',
  TEAM_DEPARTMENT: (department) => `/company/team/${encodeURIComponent(department)}`,
  ACCESS_REQUESTS: '/company/access-requests',
  VERIFICATION: '/company/verification',
  INSIGHTS: '/company/insights',
  AUDIT_LOGS: '/company/audit-logs',
}

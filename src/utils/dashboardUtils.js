import {
  extractTeamDepartments,
  extractTeamEmployees,
} from './enterpriseTeamUtils'
import { getInitials } from './formatters'

function pickFirst(obj, keys) {
  if (!obj) return undefined
  for (const key of keys) {
    const val = obj[key]
    if (val != null && val !== '') return val
  }
  return undefined
}

function computeTeamTotals(teamData) {
  const departments = extractTeamDepartments(teamData)
  const linked = departments.filter(
    (d) => (d.employeeCount ?? 0) > 0 || (d.employees?.length ?? 0) > 0,
  )
  const employees = extractTeamEmployees(teamData)

  const totalLinked = linked.reduce(
    (sum, d) => sum + (d.employeeCount ?? d.employees?.length ?? 0),
    0,
  )

  const scores = employees
    .map((e) => Number(e.trustScore ?? e.employeeScore))
    .filter((n) => !Number.isNaN(n) && n > 0)

  const deptScores = linked
    .map((d) => Number(d.averageTrustScore))
    .filter((n) => !Number.isNaN(n) && n > 0)

  let avgTrust = 0
  if (scores.length) {
    avgTrust = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
  } else if (deptScores.length) {
    avgTrust = Math.round(deptScores.reduce((a, b) => a + b, 0) / deptScores.length)
  }

  const activeCount = employees.filter(
    (e) => (e.employmentStatus || 'active') === 'active',
  ).length

  return { totalLinked, avgTrust, activeCount, employees, linkedDepartments: linked }
}

export function normalizeJoinRequests(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.requests)) return data.requests
  if (Array.isArray(data?.joinRequests)) return data.joinRequests
  return []
}

export function normalizePendingInvitations(data) {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.invitations)) return data.invitations
  return []
}

function isPendingJoinRequest(request) {
  const status = String(request?.status || 'pending').toLowerCase()
  return status === 'pending' || status === 'submitted' || status === 'new'
}

export function buildDashboardPendingItems(joinRequests = [], invitations = [], limit = 4) {
  const items = []

  joinRequests.filter(isPendingJoinRequest).forEach((r) => {
    const name = r.name || r.employeeName || 'Candidate'
    items.push({
      kind: 'join_request',
      id: r._id || r.id || name,
      initials: getInitials(name),
      name,
      role: `${r.role || r.designation || '—'}${r.department ? ` • ${r.department}` : ''}`,
      employeeScore: r.employeeScore ?? r.trustScore,
    })
  })

  invitations.forEach((inv) => {
    const email = inv.employeeEmail || inv.email || '—'
    const name = inv.employeeName || email
    items.push({
      kind: 'invitation',
      id: inv.invitationId || inv.id || email,
      initials: getInitials(name !== email ? name : email.split('@')[0]),
      name,
      email,
      department: inv.department || '—',
      invitedAt: inv.invitedAt || inv.createdAt,
    })
  })

  return items.slice(0, limit)
}

export function resolveDashboardStats(
  dashboard,
  { teamData, joinRequests = [], pendingInvitations = [] } = {},
) {
  const raw = dashboard?.stats || dashboard?.metrics || dashboard || {}
  const team = computeTeamTotals(teamData)
  const pendingJoin = joinRequests.filter(isPendingJoinRequest).length
  const pendingInvite = pendingInvitations.length

  const totalCandidates =
    Number(
      pickFirst(raw, [
        'totalCandidates',
        'totalEmployees',
        'linkedEmployees',
        'totalLinked',
        'workforceCount',
      ]),
    ) || team.totalLinked || 0

  const approvedEmployees =
    Number(
      pickFirst(raw, [
        'approvedEmployees',
        'approved',
        'verifiedEmployees',
        'activeEmployees',
      ]),
    ) || team.activeCount || 0

  const pendingRequests =
    Number(
      pickFirst(raw, [
        'pendingRequests',
        'pendingJoinRequests',
        'joinRequestsPending',
      ]),
    ) || (pendingJoin + pendingInvite) || 0

  const avgVeriScore =
    Number(
      pickFirst(raw, ['avgVeriScore', 'averageTrustScore', 'avgTrustScore', 'averageVeriScore']),
    ) || team.avgTrust || 0

  return {
    totalCandidates,
    approvedEmployees,
    pendingRequests,
    pendingJoinRequests: pendingJoin,
    pendingInvitations: pendingInvite,
    avgVeriScore,
  }
}

const DEFAULT_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

function normalizePoint(point, index) {
  if (typeof point === 'number') {
    return { value: point, label: DEFAULT_LABELS[index] || String(index + 1) }
  }
  if (!point || typeof point !== 'object') return { value: 0, label: DEFAULT_LABELS[index] || '' }

  const value = Number(
    point.value ?? point.count ?? point.total ?? point.verifications ?? point.y ?? 0,
  )
  const label =
    point.label ??
    point.day ??
    point.dayLabel ??
    point.name ??
    point.month ??
    DEFAULT_LABELS[index] ??
    String(index + 1)

  return { value: Number.isNaN(value) ? 0 : value, label: String(label) }
}

function normalizeSeries(series, minPoints = 1) {
  if (!Array.isArray(series) || series.length < minPoints) return null
  const normalized = series.map((point, index) => normalizePoint(point, index))
  return {
    values: normalized.map((p) => p.value),
    labels: normalized.map((p) => p.label),
  }
}

export function resolveVerificationActivity(dashboard, insights) {
  const candidates = [
    dashboard?.verificationActivity,
    dashboard?.weeklyVerificationTrend,
    dashboard?.weeklyTrend,
    dashboard?.activityChart,
    dashboard?.stats?.verificationActivity,
    dashboard?.stats?.weeklyVerificationTrend,
    insights?.verificationActivity,
    insights?.verificationAnalytics?.weeklyTrend,
    insights?.verificationAnalytics?.activity,
  ]

  for (const series of candidates) {
    const normalized = normalizeSeries(series, 2)
    if (normalized && normalized.values.some((v) => v > 0)) {
      return {
        ...normalized,
        title: 'Verification Activity',
        subtitle: 'Weekly verification trend',
      }
    }
  }

  return { values: [], labels: [], title: 'Verification Activity', subtitle: 'Weekly verification trend' }
}

export function buildDepartmentDistribution(teamData) {
  const departments = extractTeamDepartments(teamData)
  return departments
    .filter((d) => (d.employeeCount ?? 0) > 0 || (d.employees?.length ?? 0) > 0)
    .map((d) => ({
      department: d.name,
      count: d.employeeCount ?? d.employees?.length ?? 0,
    }))
}

export function buildDepartmentTrustBars(teamData) {
  return buildDepartmentDistribution(teamData)
    .filter((d) => {
      const dept = extractTeamDepartments(teamData).find((x) => x.name === d.department)
      return dept?.averageTrustScore != null
    })
    .map((d) => {
      const dept = extractTeamDepartments(teamData).find((x) => x.name === d.department)
      return {
        department: d.department,
        label: d.department,
        range: d.department,
        count: Number(dept?.averageTrustScore) || 0,
      }
    })
}

export function buildTrustScoreDistribution(teamData) {
  const employees = extractTeamEmployees(teamData)
  const buckets = [
    { range: '700+', label: 'High', min: 700, max: Infinity, count: 0 },
    { range: '450-699', label: 'Medium', min: 450, max: 699, count: 0 },
    { range: '0-449', label: 'Low', min: 0, max: 449, count: 0 },
  ]

  employees.forEach((emp) => {
    const score = Number(emp.trustScore ?? emp.employeeScore)
    if (Number.isNaN(score)) return
    const bucket = buckets.find((b) => score >= b.min && score <= b.max)
    if (bucket) bucket.count += 1
  })

  return buckets.map(({ range, label, count }) => ({ range, label, count }))
}

export function buildDepartmentTrustTrend(teamData) {
  const bars = buildDepartmentTrustBars(teamData)
  if (!bars.length) return null
  return {
    values: bars.map((b) => b.count),
    labels: bars.map((b) => b.department),
    title: 'Trust Score by Department',
    subtitle: 'Average PagerLook Score across teams',
  }
}

export function buildEmployeeTrustTrend(teamData) {
  const employees = extractTeamEmployees(teamData)
  const scored = employees
    .map((emp) => ({
      name: emp.employeeName || emp.name || 'Employee',
      score: Number(emp.trustScore ?? emp.employeeScore),
    }))
    .filter((e) => !Number.isNaN(e.score) && e.score > 0)

  if (scored.length < 2) return null

  return {
    values: scored.map((e) => e.score),
    labels: scored.map((e) => e.name.split(' ')[0]),
    title: 'Employee PagerLook Scores',
    subtitle: 'Trust score per linked employee',
  }
}

export function resolveMainTrendChart(dashboard, insights, teamData) {
  const fromApi = resolveVerificationActivity(dashboard, insights)
  if (fromApi.values.length >= 2) return fromApi

  const fromDept = buildDepartmentTrustTrend(teamData)
  if (fromDept && fromDept.values.length >= 2) return fromDept

  const fromEmployees = buildEmployeeTrustTrend(teamData)
  if (fromEmployees) return fromEmployees

  if (fromDept) return fromDept

  const growth = normalizeSeries(insights?.workforceGrowth, 2)
  if (growth && growth.values.some((v) => v > 0)) {
    return {
      ...growth,
      title: 'Workforce Growth',
      subtitle: 'Linked employees over time',
    }
  }

  return fromApi.values.length
    ? fromApi
    : (fromDept || { values: [], labels: [], title: 'Verification Activity', subtitle: 'Weekly verification trend' })
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function dateKey(date) {
  return startOfDay(date).toISOString().slice(0, 10)
}

function parseChartDate(value) {
  if (!value) return null
  const d = new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

function lastNDays(count = 7) {
  const today = startOfDay(new Date())
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today)
    d.setDate(d.getDate() - (count - 1 - i))
    return d
  })
}

function isPendingOnboardingStatus(status) {
  const s = String(status || 'pending').toLowerCase()
  return ['pending', 'submitted', 'new', 'invited', 'pending_registration'].includes(s)
}

function isApprovedOnboardingStatus(status) {
  const s = String(status || '').toLowerCase()
  return ['approved', 'active', 'verified', 'accepted'].includes(s)
}

function isRejectedOnboardingStatus(status) {
  const s = String(status || '').toLowerCase()
  return ['rejected', 'declined', 'expired', 'cancelled', 'canceled'].includes(s)
}

function extractSeriesValues(source, keys) {
  if (!source) return null
  for (const key of keys) {
    const val = source[key]
    if (Array.isArray(val) && val.length) return val.map((n) => Number(n) || 0)
  }
  return null
}

function resolveApiEmployeeOnboardingTrend(dashboard, insights) {
  const candidates = [
    dashboard?.employeeOnboardingTrend,
    dashboard?.onboardingTrend,
    dashboard?.stats?.employeeOnboardingTrend,
    insights?.employeeOnboardingTrend,
    insights?.verificationAnalytics?.dailyOnboarding,
    insights?.verificationAnalytics?.onboardingTrend,
  ]

  for (const raw of candidates) {
    if (!raw) continue

    if (Array.isArray(raw.labels) && Array.isArray(raw.series) && raw.series.length >= 2) {
      const labels = raw.labels.map(String)
      const series = raw.series
        .map((s, i) => ({
          id: s.id || s.key || `series-${i}`,
          label: s.label || s.name || `Series ${i + 1}`,
          color: s.color,
          values: (s.values || s.data || []).map((v) => Number(v) || 0),
        }))
        .filter((s) => s.values.length === labels.length)

      if (series.length >= 2 && series.some((s) => s.values.some((v) => v > 0))) {
        return {
          labels,
          series: applyOnboardingSeriesColors(series),
          title: raw.title || 'Employee Activity',
          subtitle: raw.subtitle || 'Daily new, pending and approved employees',
        }
      }
    }

    const labels = raw.labels || raw.days
    if (Array.isArray(labels) && labels.length) {
      const newVals = extractSeriesValues(raw, ['new', 'joined', 'received'])
      const pendingVals = extractSeriesValues(raw, ['pending', 'awaiting'])
      const approvedVals = extractSeriesValues(raw, ['approved', 'accepted', 'verified'])
      if (newVals || pendingVals || approvedVals) {
        const len = labels.length
        const series = applyOnboardingSeriesColors([
          { id: 'new', label: 'New', values: newVals || Array(len).fill(0) },
          { id: 'pending', label: 'Pending', values: pendingVals || Array(len).fill(0) },
          { id: 'approved', label: 'Approved', values: approvedVals || Array(len).fill(0) },
        ]).filter((s) => s.values.some((v) => v > 0))

        if (series.length) {
          return {
            labels: labels.map(String),
            series,
            title: 'Employee Activity',
            subtitle: 'Daily new, pending and approved employees',
          }
        }
      }
    }
  }

  return null
}

const ONBOARDING_SERIES_COLORS = {
  new: '#005fd6',
  pending: '#f59e0b',
  approved: '#22c55e',
}

const ONBOARDING_SERIES_FALLBACK = ['#005fd6', '#f59e0b', '#22c55e', '#ef4444']

function applyOnboardingSeriesColors(series) {
  return series.map((s, i) => ({
    ...s,
    color: s.color || ONBOARDING_SERIES_COLORS[s.id] || ONBOARDING_SERIES_FALLBACK[i % ONBOARDING_SERIES_FALLBACK.length],
  }))
}

export function buildEmployeeOnboardingTrend({
  joinRequests = [],
  invitations = [],
  teamData,
  dashboard,
  insights,
} = {}) {
  const fromApi = resolveApiEmployeeOnboardingTrend(dashboard, insights)
  if (fromApi) return fromApi

  const days = lastNDays(7)
  const buckets = days.map((day) => ({
    key: dateKey(day),
    label: day.toLocaleDateString('en-US', { weekday: 'short' }),
    new: 0,
    approved: 0,
    rejected: 0,
  }))
  const bucketMap = Object.fromEntries(buckets.map((b) => [b.key, b]))

  const bump = (date, field) => {
    const key = dateKey(date)
    if (bucketMap[key]) bucketMap[key][field] += 1
  }

  joinRequests.forEach((req) => {
    const created = parseChartDate(req.createdAt || req.submittedAt || req.requestedAt)
    const actionDate = parseChartDate(
      req.approvedAt || req.reviewedAt || req.updatedAt || req.respondedAt,
    )
    const status = req.status

    if (created) bump(created, 'new')
    if (isApprovedOnboardingStatus(status) && actionDate) bump(actionDate, 'approved')
    else if (isRejectedOnboardingStatus(status) && actionDate) bump(actionDate, 'rejected')
  })

  invitations.forEach((inv) => {
    const invited = parseChartDate(inv.invitedAt || inv.createdAt)
    const actionDate = parseChartDate(inv.acceptedAt || inv.updatedAt || inv.respondedAt)
    const status = inv.status

    if (invited) bump(invited, 'new')
    if (isApprovedOnboardingStatus(status) && actionDate) bump(actionDate, 'approved')
    else if (isRejectedOnboardingStatus(status) && actionDate) bump(actionDate, 'rejected')
    else if (isPendingOnboardingStatus(status) && invited) {
      // pending invites count as new on invite day; running pending computed below
    }
  })

  extractTeamEmployees(teamData).forEach((emp) => {
    const joined = parseChartDate(emp.joinedAt || emp.linkedAt || emp.createdAt)
    const status = emp.employmentStatus || emp.status || 'active'
    if (joined && isApprovedOnboardingStatus(status)) bump(joined, 'approved')
  })

  let runningOpen = 0
  const pendingValues = buckets.map((bucket) => {
    runningOpen += bucket.new - bucket.approved - bucket.rejected
    if (runningOpen < 0) runningOpen = 0
    return runningOpen
  })

  const newValues = buckets.map((b) => b.new)
  const approvedValues = buckets.map((b) => b.approved)

  return {
    labels: buckets.map((b) => b.label),
    series: applyOnboardingSeriesColors([
      { id: 'new', label: 'New', values: newValues },
      { id: 'pending', label: 'Pending', values: pendingValues },
      { id: 'approved', label: 'Approved', values: approvedValues },
    ]),
    title: 'Employee Activity',
    subtitle: 'Daily new, pending and approved employees',
  }
}

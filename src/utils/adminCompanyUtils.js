/** Normalize backend admin company list/detail shapes */

export function normalizeAdminListItem(item) {
  const company = item.company || item
  const admin = item.admin || {}
  const onboarding = item.onboarding || {}

  return {
    id: item.id || item._id || item.companyId,
    name: company.name || company.companyLegalName || company.companyName || '—',
    industry: company.industry || '—',
    contact: company.contactName || '—',
    phone: company.phone || '',
    adminEmail: admin.email || item.email || '—',
    workEmail: company.workEmail || '',
    status: onboarding.status || item.approvalStatus || company.approvalStatus || 'draft',
    submittedAt: onboarding.submittedAt || item.submittedAt || company.submittedAt || item.createdAt,
    raw: item,
  }
}

export function normalizeAdminCompanyDetail(app) {
  const company = app.company || app
  const admin = app.admin || {}
  const onboarding = app.onboarding || {}

  return {
    id: app.id || app._id || app.companyId,
    company,
    admin,
    onboarding,
    status: onboarding.status || app.approvalStatus || company.approvalStatus || 'draft',
    rejectionReason: onboarding.rejectionReason || app.rejectionReason || company.rejectionReason,
    documents: onboarding.documents || app.documents || company.documents || {},
    submittedAt: onboarding.submittedAt || app.submittedAt || company.submittedAt,
  }
}

export function normalizeCompanyList(data) {
  const list = Array.isArray(data) ? data : data?.companies || data?.items || data?.list || []
  return list.map(normalizeAdminListItem)
}

export function getEnterpriseApprovalStatus(company) {
  if (!company) return 'draft'
  if (company.approvalStatus) return company.approvalStatus
  if (company.isVerified) return 'approved'
  if (company.onboardingComplete) return 'submitted'
  return 'draft'
}

function getOnboardingStepRoute(company) {
  if (company?.onboardingComplete) return '/enterprise/review'
  const verification = company?.onboarding?.verification || {}
  if (company?.brn || company?.taxId || verification.brn || verification.taxId) {
    return '/enterprise/review'
  }
  if (
    company?.companyLegalName ||
    company?.name ||
    company?.onboarding?.basicInfo?.companyName
  ) {
    return '/enterprise/verify'
  }
  return '/enterprise/register'
}

export function isEnterpriseApproved(company) {
  return getEnterpriseApprovalStatus(company) === 'approved'
}

export function isEnterprisePendingApproval(company) {
  const status = getEnterpriseApprovalStatus(company)
  return status === 'submitted' || status === 'pending'
}

export function isEnterpriseRejected(company) {
  return getEnterpriseApprovalStatus(company) === 'rejected'
}

export function getEnterpriseHomeRoute(company) {
  const status = getEnterpriseApprovalStatus(company)
  if (status === 'rejected') return '/enterprise/rejected'
  if (status === 'submitted' || status === 'pending') return '/enterprise/pending-approval'
  if (status === 'approved') return '/enterprise/dashboard'
  return getOnboardingStepRoute(company)
}

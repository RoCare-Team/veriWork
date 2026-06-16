const STEP_ROUTES = {
  profile: '/employee/profile-setup',
  aadhaar: '/employee/verification/aadhaar',
  biometric: '/employee/verification/biometric',
}

const STEP_ORDER = ['profile', 'aadhaar', 'biometric']

export function mapVerificationSteps(apiSteps, currentStep) {
  if (!Array.isArray(apiSteps) || apiSteps.length === 0) return []

  return apiSteps.map((step, index) => {
    const id = step.id || step.step
    let status = 'locked'

    if (step.complete) {
      status = 'completed'
    } else if (id === currentStep) {
      status = 'current'
    } else {
      const stepIndex = STEP_ORDER.indexOf(id)
      const currentIndex = STEP_ORDER.indexOf(currentStep)
      if (stepIndex >= 0 && currentIndex >= 0 && stepIndex < currentIndex) {
        status = 'pending'
      }
    }

    const canNavigate = status === 'current' || status === 'pending'

    return {
      id,
      step: step.stepNumber ?? index + 1,
      title: step.title,
      subtitle: step.subtitle || '',
      description: step.description,
      status,
      to: canNavigate ? STEP_ROUTES[id] : undefined,
      duration: step.duration,
    }
  })
}

export function getVerificationNextRoute(status) {
  if (!status) return '/employee/profile-setup'
  if (status.isComplete) return '/employee/score'
  if (status.currentStep === 'profile') return '/employee/profile-setup'
  if (status.currentStep === 'aadhaar') return '/employee/verification/aadhaar'
  if (status.currentStep === 'biometric') return '/employee/verification/biometric'
  return '/employee/score'
}

export const VAULT_CATEGORY_META = {
  identity: { label: 'Identity', icon: 'id', color: 'blue' },
  education: { label: 'Education', icon: 'education', color: 'purple' },
  experience: { label: 'Experience', icon: 'briefcase', color: 'green' },
  financial: { label: 'Financial', icon: 'wallet', color: 'orange' },
}

export function mapVaultCategories(categories = []) {
  return categories.map((cat) => {
    const id = cat.id || cat.category
    const meta = VAULT_CATEGORY_META[id] || { label: id, icon: 'id', color: 'blue' }
    return {
      id,
      label: cat.label || meta.label,
      icon: cat.icon || meta.icon,
      color: cat.color || meta.color,
      files: cat.count ?? cat.files ?? 0,
    }
  })
}

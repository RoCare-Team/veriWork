export function normalizeAdminEmployee(item) {
  if (!item) return null

  const linkedCompanies = Array.isArray(item.linkedCompanies) ? item.linkedCompanies : []

  return {
    id: item.id || item.userId,
    userId: item.userId || item.id,
    profileId: item.profileId,
    name: item.name || 'New User',
    email: item.email || '—',
    phone: item.phone || '—',
    role: item.role || 'Professional',
    company: item.company || 'Not set',
    veriworkId: item.veriworkId || '—',
    publicSlug: item.publicSlug || '',
    initials: item.initials || '?',
    photoUrl: item.photoUrl || null,
    profileSetupComplete: Boolean(item.profileSetupComplete),
    aadhaarVerified: Boolean(item.aadhaarVerified),
    biometricVerified: Boolean(item.biometricVerified),
    isVerified: Boolean(item.isVerified),
    employeeScore: item.employeeScore ?? 300,
    currentCity: item.currentCity || '—',
    linkedCompanies,
    linkedCompanyLabel: linkedCompanies.length ? linkedCompanies.join(', ') : '—',
    isActive: item.isActive !== false,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    dateOfBirth: item.dateOfBirth || '',
    gender: item.gender || '',
    totalExperience: item.totalExperience || '',
    currentAddress: item.currentAddress || '',
    permanentAddress: item.permanentAddress || '',
    education: item.education || null,
    skills: item.skills || [],
    endorsements: item.endorsements || 0,
    digilockerUsed: Boolean(item.digilockerUsed),
    publicProfileEnabled: item.publicProfileEnabled !== false,
    authProvider: item.authProvider || 'phone',
  }
}

export function normalizeAdminEmployeeList(list) {
  if (!Array.isArray(list)) return []
  return list.map(normalizeAdminEmployee).filter(Boolean)
}

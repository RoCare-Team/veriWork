const STORAGE_KEY = 'veriwork_onboarding'
const COMPANY_PROFILE_KEY = 'veriwork_company_profile'
const DEFAULT_COMPANY_NAME = 'Acme Technologies Pvt. Ltd.'

const defaultState = {
  basicInfo: {
    companyName: '',
    industry: '',
    companySize: '',
    workEmail: '',
    contactName: '',
    phone: '',
    country: '',
    city: '',
  },
  registration: {
    brn: '',
    taxId: '',
  },
  documents: {},
  certified: false,
}

function readStore() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultState }
    return { ...defaultState, ...JSON.parse(raw) }
  } catch {
    return { ...defaultState }
  }
}

function writeStore(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getOnboardingData() {
  return readStore()
}

export function saveBasicInfo(basicInfo) {
  const data = readStore()
  data.basicInfo = { ...data.basicInfo, ...basicInfo }
  writeStore(data)
  if (basicInfo.companyName?.trim()) {
    saveCompanyProfile({ companyName: basicInfo.companyName.trim() })
  }
  return data
}

function readCompanyProfile() {
  try {
    const raw = localStorage.getItem(COMPANY_PROFILE_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

export function saveCompanyProfile(profile) {
  const existing = readCompanyProfile()
  localStorage.setItem(
    COMPANY_PROFILE_KEY,
    JSON.stringify({ ...existing, ...profile }),
  )
}

export function getCompanyName() {
  const profile = readCompanyProfile()
  if (profile.companyName?.trim()) return profile.companyName.trim()

  const onboarding = readStore()
  if (onboarding.basicInfo.companyName?.trim()) {
    return onboarding.basicInfo.companyName.trim()
  }

  return DEFAULT_COMPANY_NAME
}

export function saveRegistration(registration) {
  const data = readStore()
  data.registration = { ...data.registration, ...registration }
  writeStore(data)
  return data
}

export function saveDocument(docId, fileName) {
  const data = readStore()
  data.documents = { ...data.documents, [docId]: fileName }
  writeStore(data)
  return data
}

export function removeDocument(docId) {
  const data = readStore()
  const { [docId]: _, ...rest } = data.documents
  data.documents = rest
  writeStore(data)
  return data
}

export function setCertified(value) {
  const data = readStore()
  data.certified = value
  writeStore(data)
  return data
}

export function clearOnboarding() {
  localStorage.removeItem(STORAGE_KEY)
}

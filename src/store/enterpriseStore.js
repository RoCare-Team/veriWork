const STORAGE_KEY = 'veriwork_enterprise_session'

const defaultSession = {
  isLoggedIn: false,
  email: '',
}

function readSession() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaultSession }
    return { ...defaultSession, ...JSON.parse(raw) }
  } catch {
    return { ...defaultSession }
  }
}

function writeSession(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function getEnterpriseSession() {
  return readSession()
}

export function isEnterpriseLoggedIn() {
  return readSession().isLoggedIn === true
}

export function setEnterpriseSession({ email = '' } = {}) {
  const session = {
    isLoggedIn: true,
    email: email.trim(),
  }
  writeSession(session)
  return session
}

export function clearEnterpriseSession() {
  localStorage.removeItem(STORAGE_KEY)
}

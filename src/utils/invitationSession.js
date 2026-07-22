/**
 * Details carried from an invite link into signup/profile setup, so a person
 * invited by a company never re-types what the company already entered.
 */
const KEYS = {
  token: 'invitationToken',
  email: 'invitationEmail',
  companyName: 'invitationCompanyName',
  name: 'invitationName',
  phone: 'invitationPhone',
  department: 'invitationDepartment',
  designation: 'invitationDesignation',
}

export function setInvitationSession(details = {}) {
  for (const [field, storageKey] of Object.entries(KEYS)) {
    const value = details[field]
    if (value) sessionStorage.setItem(storageKey, value)
  }
}

export function getInvitationToken() {
  return sessionStorage.getItem(KEYS.token) || ''
}

export function getInvitationEmail() {
  return sessionStorage.getItem(KEYS.email) || ''
}

export function getInvitationCompanyName() {
  return sessionStorage.getItem(KEYS.companyName) || ''
}

/** Everything the invite gave us, for pre-filling the profile form. */
export function getInvitationDetails() {
  return Object.fromEntries(
    Object.entries(KEYS).map(([field, storageKey]) => [field, sessionStorage.getItem(storageKey) || '']),
  )
}

export function clearInvitationSession() {
  for (const storageKey of Object.values(KEYS)) sessionStorage.removeItem(storageKey)
}

export function hasInvitationSession() {
  return Boolean(getInvitationToken())
}

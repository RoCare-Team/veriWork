const TOKEN_KEY = 'invitationToken'
const EMAIL_KEY = 'invitationEmail'
const COMPANY_KEY = 'invitationCompanyName'

export function setInvitationSession({ token, email, companyName }) {
  if (token) sessionStorage.setItem(TOKEN_KEY, token)
  if (email) sessionStorage.setItem(EMAIL_KEY, email)
  if (companyName) sessionStorage.setItem(COMPANY_KEY, companyName)
}

export function getInvitationToken() {
  return sessionStorage.getItem(TOKEN_KEY) || ''
}

export function getInvitationEmail() {
  return sessionStorage.getItem(EMAIL_KEY) || ''
}

export function getInvitationCompanyName() {
  return sessionStorage.getItem(COMPANY_KEY) || ''
}

export function clearInvitationSession() {
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(EMAIL_KEY)
  sessionStorage.removeItem(COMPANY_KEY)
}

export function hasInvitationSession() {
  return Boolean(getInvitationToken())
}

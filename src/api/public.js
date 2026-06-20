import { API } from '../constants/routes'
import { api } from '../lib/api'

export function fetchPublicProfile(slug) {
  return api(API.PUBLIC.PROFILE(slug), { auth: false })
}

export function fetchPublicEmployeeInvitation(token) {
  return api(API.PUBLIC.EMPLOYEE_INVITATION(token), { auth: false })
}

export function fetchPublicEmploymentVerification(token) {
  return api(API.PUBLIC.EMPLOYMENT_VERIFICATION(token), { auth: false })
}

export function submitPublicEmploymentVerification(token, body) {
  return api(API.PUBLIC.EMPLOYMENT_VERIFICATION(token), {
    method: 'POST',
    body,
    auth: false,
  })
}

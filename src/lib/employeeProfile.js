import { API } from '../constants/routes'
import { api } from './api'

export function getProfile() {
  return api(API.EMPLOYEE.PROFILE)
}

export function setupProfile(formData) {
  return api(API.EMPLOYEE.PROFILE_SETUP, { method: 'POST', body: formData })
}

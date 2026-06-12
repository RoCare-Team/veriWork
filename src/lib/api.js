import { API } from '../constants/routes'
import {
  clearAuthStorage,
  getAccessToken,
  getRefreshToken,
  setTokens,
} from './authStorage'

let refreshPromise = null

async function refreshAccessToken() {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('Session expired')

  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const res = await fetch(`${API.BASE}${API.AUTH.REFRESH}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refreshToken }),
        })
        const json = await res.json()
        if (!res.ok || !json.success) {
          clearAuthStorage()
          throw { message: json.message || 'Session expired', details: json.details }
        }
        setTokens({
          accessToken: json.data.accessToken,
          refreshToken: json.data.refreshToken,
        })
        return json.data.accessToken
      } finally {
        refreshPromise = null
      }
    })()
  }
  return refreshPromise
}

async function parseResponse(res) {
  const json = await res.json().catch(() => ({}))
  if (!res.ok || json.success === false) {
    const detailMsg = Array.isArray(json.details)
      ? json.details.map((d) => (typeof d === 'string' ? d : d.message)).filter(Boolean).join('. ')
      : ''
    throw {
      message: detailMsg || json.message || `Request failed (${res.status})`,
      details: json.details,
      status: res.status,
    }
  }
  return json.data
}

export async function api(path, options = {}, retried = false) {
  const { method = 'GET', body, headers = {}, auth = true } = options
  const isFormData = body instanceof FormData

  const reqHeaders = { ...headers }
  if (!isFormData) reqHeaders['Content-Type'] = 'application/json'

  if (auth) {
    const token = getAccessToken()
    if (token) reqHeaders.Authorization = `Bearer ${token}`
  }

  const res = await fetch(`${API.BASE}${path}`, {
    method,
    headers: reqHeaders,
    body: body ? (isFormData ? body : JSON.stringify(body)) : undefined,
  })

  if (res.status === 401 && auth && !retried && path !== API.AUTH.REFRESH) {
    try {
      await refreshAccessToken()
      return api(path, options, true)
    } catch (err) {
      throw err
    }
  }

  return parseResponse(res)
}

export function normalizePhone(countryCode, phone) {
  const digits = phone.replace(/\D/g, '')
  const cc = countryCode.replace(/\D/g, '') || '91'
  return `+${cc}${digits}`
}

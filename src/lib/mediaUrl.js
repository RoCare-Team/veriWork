import { MEDIA_BASE } from '../constants/routes'

export function mediaUrl(path) {
  if (!path) return null
  if (path.startsWith('http') || path.startsWith('data:')) return path
  return `${MEDIA_BASE}${path.startsWith('/') ? path : `/${path}`}`
}

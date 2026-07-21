import { getAccessToken } from './authStorage'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api'
const MAX_FILE_SIZE = 10 * 1024 * 1024

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
])

const ALLOWED_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png', '.webp']

/** UI document id → backend docType for POST /enterprise/onboarding/documents/{docType} */
export const ENTERPRISE_DOC_TYPES = {
  incorporation: 'incorporation',
  registration: 'registration',
  taxCertificate: 'tax',
  addressProof: 'addressProof',
  signatoryId: 'signatoryId',
  bankLetter: 'bankLetter',
}

export function getEnterpriseDocType(docId) {
  return ENTERPRISE_DOC_TYPES[docId] || docId
}

/**
 * Read an uploaded document out of the onboarding `documents` map.
 *
 * The UI id and the stored key are not always the same (`taxCertificate` is
 * stored as `tax`), and older records may use either. Always look up through
 * this instead of indexing the map directly, or a document that IS uploaded
 * shows as "Missing".
 */
export function getUploadedDocument(documents, docId) {
  if (!documents) return null
  return documents[docId] || documents[getEnterpriseDocType(docId)] || null
}

const IMAGE_MIME_TYPES = new Set(['image/jpeg', 'image/jpg', 'image/png', 'image/webp'])
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp']

export function validateImageFile(file) {
  if (!file) return 'No file selected'

  if (file.size > MAX_FILE_SIZE) {
    return 'Image must be 10MB or smaller'
  }

  const name = file.name.toLowerCase()
  const hasAllowedExtension = IMAGE_EXTENSIONS.some((ext) => name.endsWith(ext))
  const hasAllowedMime = IMAGE_MIME_TYPES.has(file.type)

  if (!hasAllowedMime && !hasAllowedExtension) {
    return 'Only image files (JPG, PNG, WEBP) are allowed'
  }

  return null
}

export function validateDocumentFile(file) {
  if (!file) return 'No file selected'

  if (file.size > MAX_FILE_SIZE) {
    return 'File must be 10MB or smaller'
  }

  const name = file.name.toLowerCase()
  const hasAllowedExtension = ALLOWED_EXTENSIONS.some((ext) => name.endsWith(ext))
  const hasAllowedMime = ALLOWED_MIME_TYPES.has(file.type)

  if (!hasAllowedMime && !hasAllowedExtension) {
    return 'Only PDF and image files (JPG, PNG) are allowed'
  }

  return null
}

export async function uploadEnterpriseDocument(docType, file) {
  const validationError = validateDocumentFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated. Please sign in again.')
  }

  const form = new FormData()
  form.append('document', file)

  const res = await fetch(`${API_URL}/enterprise/onboarding/documents/${docType}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok || json.success === false) {
    const detailMsg = Array.isArray(json.details)
      ? json.details.map((d) => (typeof d === 'string' ? d : d.message)).filter(Boolean).join('. ')
      : ''
    throw new Error(detailMsg || json.message || `Upload failed (${res.status})`)
  }

  return {
    url: json.data?.url,
    documents: json.data?.documents,
  }
}

export async function uploadEmployeeProfilePhoto(file) {
  const validationError = validateImageFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const token = getAccessToken()
  if (!token) {
    throw new Error('Not authenticated. Please sign in again.')
  }

  const form = new FormData()
  form.append('photo', file)

  const res = await fetch(`${API_URL}/employee/profile/photo`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: form,
  })

  const json = await res.json().catch(() => ({}))

  if (!res.ok || json.success === false) {
    const detailMsg = Array.isArray(json.details)
      ? json.details.map((d) => (typeof d === 'string' ? d : d.message)).filter(Boolean).join('. ')
      : ''
    throw new Error(detailMsg || json.message || `Upload failed (${res.status})`)
  }

  return {
    url: json.data?.url || json.data?.photoUrl,
  }
}

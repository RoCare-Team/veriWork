import { getCompanyTypeConfig } from './enterpriseCompanyTypes'

/** Indian CIN: U72900KA2015PTC082988 */
const CIN_REGEX = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/i

/** LLPIN: AAA-1234 */
const LLPIN_REGEX = /^[A-Z]{3}-[0-9]{4}$/i

/** Udyam: UDYAM-XX-00-0000000 */
const UDYAM_REGEX = /^UDYAM-[A-Z]{2}-[0-9]{2}-[0-9]{7}$/i

/** General registration e.g. FIRM/2020/12345, TR/1234/2018 */
const GENERIC_BRN_REGEX = /^[A-Z0-9][A-Z0-9\-/]{5,24}$/i

/** 15-char GSTIN e.g. 27AABCU9603R1ZM */
const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/

const FORMAT_VALIDATORS = {
  cin: (v) => CIN_REGEX.test(v),
  llpin: (v) => LLPIN_REGEX.test(v),
  udyam: (v) => UDYAM_REGEX.test(v) || GENERIC_BRN_REGEX.test(v),
  generic: (v) => GENERIC_BRN_REGEX.test(v),
}

export function isValidBRN(value, companyType) {
  const v = value.trim()
  if (!v) return false
  if (!companyType) {
    return CIN_REGEX.test(v) || LLPIN_REGEX.test(v) || UDYAM_REGEX.test(v) || GENERIC_BRN_REGEX.test(v)
  }
  const format = getCompanyTypeConfig(companyType).registration.format
  const validate = FORMAT_VALIDATORS[format] || FORMAT_VALIDATORS.generic
  return validate(v)
}

export function getRegistrationHint(companyType) {
  return getCompanyTypeConfig(companyType).registration.hint
}

export function getRegistrationLabel(companyType) {
  return getCompanyTypeConfig(companyType).registration.label
}

export function formatRegistrationInput(value, companyType) {
  const format = getCompanyTypeConfig(companyType).registration.format
  if (format === 'llpin') {
    const clean = value.toUpperCase().replace(/[^A-Z0-9]/g, '')
    if (clean.length <= 3) return clean
    return `${clean.slice(0, 3)}-${clean.slice(3, 7)}`
  }
  if (format === 'udyam') {
    return value.toUpperCase().replace(/[^A-Z0-9\-]/g, '').slice(0, 24)
  }
  return formatBRNInput(value)
}

export function isValidGSTIN(value) {
  return GSTIN_REGEX.test(value.trim().toUpperCase())
}

export function isValidIndianPincode(value) {
  return /^[1-9][0-9]{5}$/.test(value.replace(/\D/g, ''))
}

export function formatBRNInput(value) {
  return value.toUpperCase().replace(/[^A-Z0-9\-/]/g, '').slice(0, 21)
}

export function formatGSTINInput(value) {
  return value.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15)
}

export function formatPincodeInput(value) {
  return value.replace(/\D/g, '').slice(0, 6)
}

export const GSTIN_HINT = '15-character GSTIN (e.g. 27AABCU9603R1ZM)'

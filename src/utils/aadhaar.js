// Client-side mirror of the server's Aadhaar checks (backend src/utils/aadhaar.js)
// so a typo is caught before the user uploads two photos and waits on an admin.
// The server re-validates — this is purely for fast feedback.
const D_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
]

const P_TABLE = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
]

export function aadhaarDigits(value) {
  return String(value || '').replace(/\D/g, '').slice(0, 12)
}

/** "1234 5678 9012" — the grouping printed on the card. */
export function formatAadhaar(value) {
  return aadhaarDigits(value).replace(/(\d{4})(?=\d)/g, '$1 ').trim()
}

/** 12 digits, not starting 0/1, with a valid Verhoeff check digit. */
export function isValidAadhaar(value) {
  const digits = aadhaarDigits(value)
  if (digits.length !== 12) return false
  if (digits[0] === '0' || digits[0] === '1') return false

  let checksum = 0
  const reversed = digits.split('').reverse()
  for (let i = 0; i < reversed.length; i += 1) {
    checksum = D_TABLE[checksum][P_TABLE[i % 8][Number(reversed[i])]]
  }
  return checksum === 0
}

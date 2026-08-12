/**
 * Trimmed, non-empty, case-insensitively deduped email list (order preserved) —
 * the shape the verification APIs expect for `hrContacts`.
 *
 * Mirrors `uniqueEmails` on the server so the list the user sees is the list
 * that actually gets mailed.
 */
export function cleanContacts(contacts = []) {
  const seen = new Set()
  const out = []
  for (const value of contacts) {
    const email = String(value || '').trim()
    if (!email) continue
    const key = email.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    out.push(email)
  }
  return out
}

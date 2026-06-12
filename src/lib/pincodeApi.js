/**
 * India postal pincode lookup (free public API).
 * https://api.postalpincode.in/
 */
export async function lookupIndianPincode(pincode) {
  const clean = pincode.replace(/\D/g, '')
  if (clean.length !== 6) return null

  const res = await fetch(`https://api.postalpincode.in/pincode/${clean}`)
  if (!res.ok) return null

  const json = await res.json()
  const entry = json?.[0]
  if (entry?.Status !== 'Success' || !entry.PostOffice?.length) return null

  const po = entry.PostOffice[0]
  return {
    pincode: clean,
    city: po.District || '',
    locality: po.Name || '',
    state: po.State || '',
    country: 'India',
  }
}

import { formatDate } from './formatters'

export function formatJobPeriod(job) {
  if (job?.duration?.trim()) return job.duration.trim()

  const start = job?.joiningDate ? formatDate(job.joiningDate) : null
  if (!start) return '—'

  if (job?.isPresent) return `${start} – Present`
  if (job?.exitDate) return `${start} – ${formatDate(job.exitDate)}`
  return start
}

export function getJobVerificationBadge(job) {
  const level = job?.verificationLevel || 'none'
  const tagLabel = job?.verificationTag?.label || job?.statusLabel || 'Not Verified'

  const map = {
    employer_verified: {
      label: tagLabel,
      bg: 'bg-green-50',
      border: 'border-green-200',
      text: 'text-green-800',
      dot: 'bg-green-500',
    },
    hr_verified: {
      label: tagLabel,
      bg: 'bg-emerald-50',
      border: 'border-emerald-200',
      text: 'text-emerald-800',
      dot: 'bg-emerald-500',
    },
    document_verified: {
      label: tagLabel,
      bg: 'bg-blue-50',
      border: 'border-blue-200',
      text: 'text-blue-800',
      dot: 'bg-blue-500',
    },
  }

  if (map[level]) return map[level]

  if (job?.status === 'in_process') {
    return {
      label: 'Verification in progress',
      bg: 'bg-amber-50',
      border: 'border-amber-200',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
    }
  }

  return {
    label: tagLabel,
    bg: 'bg-slate-50',
    border: 'border-slate-200',
    text: 'text-slate-600',
    dot: 'bg-slate-400',
  }
}

export function isJobVerified(job) {
  if (!job) return false
  if (job.status === 'verified') return true
  const level = job.verificationLevel || 'none'
  return ['document_verified', 'hr_verified', 'employer_verified'].includes(level)
}

export function companyInitials(company = '') {
  const words = company.trim().split(/\s+/).filter(Boolean)
  if (!words.length) return 'CO'
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase()
  return `${words[0][0]}${words[1][0]}`.toUpperCase()
}

export function companyAccentColor(company = '') {
  const palette = [
    'from-[#1a3a8f] to-[#2747b2]',
    'from-violet-600 to-violet-800',
    'from-teal-600 to-teal-800',
    'from-orange-500 to-orange-700',
    'from-rose-500 to-rose-700',
  ]
  let hash = 0
  for (let i = 0; i < company.length; i += 1) hash = company.charCodeAt(i) + ((hash << 5) - hash)
  return palette[Math.abs(hash) % palette.length]
}

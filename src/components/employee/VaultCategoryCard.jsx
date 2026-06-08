import { Link } from 'react-router-dom'

const COLORS = {
  blue: { bg: 'bg-blue-50', text: 'text-blue-600', bar: 'bg-blue-500' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-600', bar: 'bg-purple-500' },
  green: { bg: 'bg-green-50', text: 'text-green-600', bar: 'bg-green-500' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-600', bar: 'bg-orange-500' },
}

const ICONS = {
  id: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="6" width="16" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="9.5" cy="11.5" r="2" stroke="currentColor" strokeWidth="1.4" />
      <path d="M14 10h4M14 13h3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  ),
  education: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 10l8-4 8 4-8 4-8-4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M20 10v5l-8 4-8-4v-5" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  briefcase: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="4" y="9" width="16" height="11" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M9 9V7a3 3 0 0 1 6 0v2" stroke="currentColor" strokeWidth="1.6" />
    </svg>
  ),
  wallet: (
    <svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="7" width="18" height="12" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="M17 12h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  ),
}

function VaultCategoryCard({ category }) {
  const colors = COLORS[category.color] || COLORS.blue

  const content = (
    <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white p-4 shadow-sm transition hover:border-slate-200 hover:shadow-md md:p-5">
      <button type="button" className="absolute right-3 top-3 text-slate-300" aria-label="More options">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true">
          <circle cx="8" cy="3" r="1.2" />
          <circle cx="8" cy="8" r="1.2" />
          <circle cx="8" cy="13" r="1.2" />
        </svg>
      </button>
      <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl ${colors.bg} ${colors.text}`}>
        {ICONS[category.icon]}
      </div>
      <p className="m-0 text-sm font-bold text-slate-900 md:text-base">{category.label}</p>
      <p className="m-0 mt-1 text-xs text-slate-500 md:text-sm">{category.files} Files</p>
      <div className={`mt-4 h-1 w-full rounded-full ${colors.bar}`} />
    </div>
  )

  if (category.to) {
    return <Link to={category.to} className="no-underline">{content}</Link>
  }

  return content
}

export default VaultCategoryCard

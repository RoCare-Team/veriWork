import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { mediaUrl } from '../../lib/mediaUrl'

function SearchIcon({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path d="M14 14l3 3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3a5 5 0 0 1 5 5v3l1.5 2.5H3.5L5 11V8a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 16a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EmployeeNavbar({ onMenuClick }) {
  const { profile } = useAuth()
  const firstName = profile?.name?.split(' ')[0] || 'User'
  const photo = mediaUrl(profile?.photoUrl)

  return (
    <header className="sticky top-0 z-30 border-b border-slate-100 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6 lg:px-8">
        <button type="button" onClick={onMenuClick} className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden" aria-label="Open menu">
          <MenuIcon />
        </button>

        <div className="hidden min-w-0 lg:block">
          <p className="m-0 text-xs font-medium text-slate-400">Good morning, {firstName}</p>
          <h1 className="m-0 truncate text-lg font-extrabold text-slate-900">{profile?.name}</h1>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/employee/activity" className="relative flex h-10 w-10 items-center justify-center rounded-xl text-slate-600 hover:bg-slate-100" aria-label="Notifications">
            <BellIcon />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
          </Link>

          <div className="ml-1 flex items-center gap-2.5 rounded-xl border border-slate-100 bg-slate-50 py-1.5 pl-1.5 pr-3">
            {photo ? (
              <img src={photo} alt={profile?.name} className="h-8 w-8 rounded-lg object-cover" />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#1a3a8f] text-xs font-bold text-white">
                {profile?.initials}
              </div>
            )}
            <div className="hidden sm:block">
              <p className="m-0 text-xs font-bold text-slate-800">{profile?.name}</p>
              <p className="m-0 text-[10px] text-slate-400">{profile?.role}</p>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default EmployeeNavbar

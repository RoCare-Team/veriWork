import { NavLink, useNavigate } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo'
import { useAuth } from '../../context/AuthContext'

const NAV = [
  {
    to: '/admin/dashboard',
    label: 'Dashboard',
    end: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="2" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
        <rect x="11" y="11" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/admin/companies',
    label: 'Companies',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/admin/employees',
    label: 'Employees',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 17c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5M11 17c0-1.8 1.5-3.2 3.5-3.2.8 0 1.5.2 2.1.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate()
  const { logout, user } = useAuth()

  const handleSignOut = async () => {
    await logout()
    onNavigate?.()
    navigate('/admin/login')
  }

  return (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <BrandLogo size="sm" theme="light" showTagline />
        <p className="mt-2 text-[11px] font-medium text-white/50">Admin Console</p>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                isActive ? 'bg-white/15 text-white' : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <p className="m-0 truncate px-2 text-xs text-white/50">{user?.email}</p>
        <button
          type="button"
          onClick={handleSignOut}
          className="mt-3 w-full rounded-2xl border border-white/15 px-4 py-2.5 text-sm font-semibold text-white/80 transition hover:bg-white/10"
        >
          Sign Out
        </button>
      </div>
    </>
  )
}

function AdminSidebar({ open, onClose }) {
  return (
    <>
      <aside className="hidden w-64 shrink-0 flex-col bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 lg:flex">
        <SidebarContent />
      </aside>

      {open && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button type="button" className="absolute inset-0 bg-slate-900/60" onClick={onClose} aria-label="Close menu" />
          <aside className="relative flex h-full w-72 flex-col bg-gradient-to-b from-slate-900 to-slate-800 shadow-2xl">
            <SidebarContent onNavigate={onClose} />
          </aside>
        </div>
      )}
    </>
  )
}

export default AdminSidebar

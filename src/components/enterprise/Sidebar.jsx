import { NavLink, useNavigate } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo'
import { useAuth } from '../../context/AuthContext'
import { COMPANY_ROUTES } from '../../constants/companyRoutes'

const NAV_ITEMS = [
  {
    to: COMPANY_ROUTES.DASHBOARD,
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
    to: COMPANY_ROUTES.TEAM,
    label: 'Team Management',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="7" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M2 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="14" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.5" />
        <path d="M11 17c0-2.5 2-4 4.5-4" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: COMPANY_ROUTES.ACCESS_REQUESTS,
    label: 'Access Requests',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V5l7-3Z" stroke="currentColor" strokeWidth="1.5" />
        <rect x="8.5" y="9" width="3" height="4" rx="0.5" stroke="currentColor" strokeWidth="1.2" />
      </svg>
    ),
  },
  {
    to: COMPANY_ROUTES.VERIFICATION,
    label: 'Verification',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5l6.5 2.6v4.9c0 3.7-2.8 6.6-6.5 7.5-3.7-.9-6.5-3.8-6.5-7.5V5.1L10 2.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.5 10l1.8 1.8 3.7-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/enterprise/workforce',
    label: 'Workforce',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="8" cy="7" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 17c0-3 2.5-5 5-5s5 2 5 5" stroke="currentColor" strokeWidth="1.5" />
      </svg>
    ),
  },
  {
    to: '/enterprise/join-requests',
    label: 'Join Requests',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 4h12v12H4V4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/enterprise/qr-onboarding',
    label: 'QR & Onboarding',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="2" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
        <rect x="12" y="2" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
        <rect x="2" y="12" width="6" height="6" stroke="currentColor" strokeWidth="1.5" />
        <rect x="14" y="14" width="2" height="2" fill="currentColor" />
      </svg>
    ),
  },
  {
    to: '/enterprise/settings',
    label: 'Settings',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.2 4.2l1.4 1.4M14.4 14.4l1.4 1.4M4.2 15.8l1.4-1.4M14.4 5.6l1.4-1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
]

function SidebarContent({ onNavigate }) {
  const navigate = useNavigate()
  const { logout, company } = useAuth()

  const handleSignOut = async () => {
    await logout()
    onNavigate?.()
    navigate('/enterprise/login')
  }

  return (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <BrandLogo size="sm" theme="light" showTagline />
        <p className="mt-2 text-[11px] font-medium text-white/50">Employer Portal</p>
        {company?.name && (
          <p className="mt-1 truncate text-xs font-semibold text-white/90">{company.name}</p>
        )}
      </div>

      <nav className="flex-1 space-y-1 px-3 py-5">
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.label}
            to={item.to}
            end={item.end}
            onClick={onNavigate}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition ${
                isActive
                  ? 'bg-white/15 text-white shadow-sm'
                  : 'text-white/65 hover:bg-white/10 hover:text-white'
              }`
            }
          >
            <span className="shrink-0 opacity-90">{item.icon}</span>
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-white/10 p-4">
        <button
          type="button"
          onClick={handleSignOut}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/60 transition hover:bg-white/10 hover:text-white"
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
            <path d="M7 10H17M13 6l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M3 4v12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Sign Out
        </button>
      </div>
    </>
  )
}

function Sidebar({ open, onClose }) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-[260px] flex-col bg-gradient-to-b from-[#152b6e] via-[#1a3a8f] to-[#1f3c9f] transition-transform duration-300 lg:static lg:z-auto lg:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <SidebarContent onNavigate={onClose} />
      </aside>
    </>
  )
}

export default Sidebar

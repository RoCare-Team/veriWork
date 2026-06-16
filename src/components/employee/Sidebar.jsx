import { NavLink, useNavigate } from 'react-router-dom'
import { ShieldLogoIcon } from '../common/Icons'
import { useAuth } from '../../context/AuthContext'

const NAV_ITEMS = [
  {
    to: '/employee/verification',
    label: 'Verification',
    end: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5l6.5 2.6v4.9c0 3.7-2.8 6.6-6.5 7.5-3.7-.9-6.5-3.8-6.5-7.5V5.1L10 2.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7.5 10l1.8 1.8 3.7-3.6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    to: '/employee/score',
    label: 'Employee Score',
    requiresVerification: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.5" />
        <path d="M10 6v4l2.5 2.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/employee/professional-id',
    label: 'Professional ID',
    requiresVerification: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="14" height="12" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <circle cx="8" cy="9.5" r="2" stroke="currentColor" strokeWidth="1.3" />
        <path d="M12 8h4M12 11h3" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/employee/job-history',
    label: 'Job History',
    requiresVerification: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="14" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 8h6M7 11h4M7 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/employee/vault',
    label: 'Document Vault',
    requiresVerification: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="14" height="14" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 7h6M7 10h4M7 13h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/employee/invitations',
    label: 'Invitations',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
        <path d="M3 7l7 4 7-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/employee/access-requests',
    label: 'Access Consent',
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M10 2.5l6.5 2.6v4.9c0 3.7-2.8 6.6-6.5 7.5-3.7-.9-6.5-3.8-6.5-7.5V5.1L10 2.5Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M8 10h4M10 8v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/employee/activity',
    label: 'Activity',
    requiresVerification: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
        <path d="M4 4h12v12H4V4Z" stroke="currentColor" strokeWidth="1.5" />
        <path d="M7 10l2 2 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    to: '/employee/settings',
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
  const { profile, logout } = useAuth()
  const verified = profile?.isVerified === true

  const handleSignOut = async () => {
    await logout()
    onNavigate?.()
    navigate('/employee/login')
  }

  return (
    <>
      <div className="border-b border-white/10 px-5 py-6">
        <div className="flex items-center gap-3">
          <div className="grid h-10 w-10 place-items-center rounded-xl bg-white/15">
            <ShieldLogoIcon className="h-6 w-6" />
          </div>
          <div>
            <p className="m-0 text-base font-extrabold text-white">VeriWork</p>
            <p className="m-0 text-[11px] font-medium text-white/50">Employee Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-5">
        {NAV_ITEMS.map((item) => {
          const disabled = item.requiresVerification && !verified

          if (disabled) {
            return (
              <span
                key={item.label}
                className="flex cursor-not-allowed items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-white/30"
                title="Complete verification to unlock"
              >
                <span className="shrink-0 opacity-60">{item.icon}</span>
                {item.label}
              </span>
            )
          }

          return (
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
          )
        })}
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

function EmployeeSidebar({ open, onClose }) {
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

export default EmployeeSidebar

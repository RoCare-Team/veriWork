import { useNavigate } from 'react-router-dom'
import AppSidebar from '../common/AppSidebar'
import { useAuth } from '../../context/AuthContext'
import { COMPANY_ROUTES } from '../../constants/companyRoutes'

/* Icons: 20x20, 1.5 stroke, round caps/joins — one optical weight across the set. */

function DashboardIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="2.75" width="6.5" height="6.5" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.75" y="2.75" width="6.5" height="6.5" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.75" y="10.75" width="6.5" height="6.5" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
      <rect x="10.75" y="10.75" width="6.5" height="6.5" rx="1.75" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function TeamIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="7.75" cy="6.75" r="2.75" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.75 16.25c0-2.9 2.24-4.75 5-4.75s5 1.85 5 4.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M14 4.4a2.6 2.6 0 0 1 0 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M14.75 11.9c1.6.62 2.5 2.06 2.5 4.35" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* Org chart — reads as "the whole workforce", not another single person. */
function WorkforceIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="7.25" y="2.25" width="5.5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.25" y="13.25" width="5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <rect x="12.75" y="13.25" width="5" height="4.5" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 6.75v2.75M4.75 13.25v-1.5a.5.5 0 0 1 .5-.5h9.5a.5.5 0 0 1 .5.5v1.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* Person + plus — an actual request to join, not a generic ticked box. */
function JoinRequestIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="8.25" cy="6.5" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M2.75 16.75c0-3.04 2.46-5 5.5-5 .77 0 1.5.12 2.17.36"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M14.75 11.5v5M12.25 14h5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* Shield + keyhole — access, permission. */
function AccessIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5l6.25 2.4v4.85c0 3.6-2.65 6.4-6.25 7.25-3.6-.85-6.25-3.65-6.25-7.25V4.9L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <circle cx="10" cy="9" r="1.4" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10 10.4v2.1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

/* Shield + check — verified. */
function VerificationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.5l6.25 2.4v4.85c0 3.6-2.65 6.4-6.25 7.25-3.6-.85-6.25-3.65-6.25-7.25V4.9L10 2.5Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M7.4 9.9l1.85 1.85 3.35-3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function QrIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="2.75" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="11.75" y="2.75" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <rect x="2.75" y="11.75" width="5.5" height="5.5" rx="1.25" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M11.75 11.75h2.5M17.25 11.75v2.6M11.75 14.6v2.65h2.5M17.25 17.25h-2.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function SettingsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="2.6" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M10 2.5v1.9M10 15.6v1.9M17.5 10h-1.9M4.4 10H2.5M15.3 4.7l-1.35 1.35M6.05 13.95L4.7 15.3M15.3 15.3l-1.35-1.35M6.05 6.05L4.7 4.7"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* Routes and labels are load-bearing — they match the existing router exactly. */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [{ to: COMPANY_ROUTES.DASHBOARD, label: 'Dashboard', end: true, icon: <DashboardIcon /> }],
  },
  {
    label: 'People',
    items: [
      { to: COMPANY_ROUTES.TEAM, label: 'Team Management', icon: <TeamIcon /> },
      { to: '/enterprise/workforce', label: 'Workforce', icon: <WorkforceIcon /> },
      { to: '/enterprise/join-requests', label: 'Join Requests', icon: <JoinRequestIcon /> },
    ],
  },
  {
    label: 'Trust',
    items: [
      { to: COMPANY_ROUTES.ACCESS_REQUESTS, label: 'Access Requests', icon: <AccessIcon /> },
      { to: COMPANY_ROUTES.VERIFICATION, label: 'Verification', icon: <VerificationIcon /> },
    ],
  },
  {
    label: 'Setup',
    items: [
      { to: '/enterprise/qr-onboarding', label: 'QR & Onboarding', icon: <QrIcon /> },
      { to: '/enterprise/settings', label: 'Settings', icon: <SettingsIcon /> },
    ],
  },
]

function Sidebar({ open, onClose, collapsed = false, onToggleCollapse }) {
  const navigate = useNavigate()
  const { logout, company } = useAuth()

  const handleSignOut = async () => {
    await logout()
    onClose?.()
    navigate('/enterprise/login')
  }

  return (
    <AppSidebar
      open={open}
      onClose={onClose}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      groups={NAV_GROUPS}
      portalLabel="Employer Portal"
      identityName={company?.name}
      onSignOut={handleSignOut}
      navAriaLabel="Enterprise"
    />
  )
}

export default Sidebar

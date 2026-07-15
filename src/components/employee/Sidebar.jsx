import { useNavigate } from 'react-router-dom'
import AppSidebar from '../common/AppSidebar'
import { useAuth } from '../../context/AuthContext'

/* Icons: 20x20, 1.5 stroke, round caps/joins — one optical weight across the set. */

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

/* Gauge — a score that moves, not a clock. */
function ScoreIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M3.25 14.5a7.5 7.5 0 1 1 13.5 0"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path d="M10 14.25L13 8.75" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="10" cy="14.5" r="1.25" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function ProfessionalIdIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="4.25" width="14.5" height="11.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="7.5" cy="9.5" r="1.85" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M4.6 13.9c.5-1.35 1.6-2.1 2.9-2.1s2.4.75 2.9 2.1M12.5 8.75h3.25M12.5 11.5h2.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* Briefcase — employment history. */
function JobHistoryIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="6.25" width="14.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M7.25 6.25V4.9a1.4 1.4 0 0 1 1.4-1.4h2.7a1.4 1.4 0 0 1 1.4 1.4v1.35M2.75 10.5h14.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

/* Vault door — documents under lock, not a generic file. */
function VaultIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="3.25" width="14.5" height="13.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="9.75" cy="10" r="3" stroke="currentColor" strokeWidth="1.5" />
      <path d="M9.75 7v-1.4M9.75 14.4V13M12.75 10h1.4M5.35 10h1.4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function InvitationsIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="4.75" width="14.5" height="10.5" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3.25 6.5L10 11l6.75-4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/* Shield + keyhole — consent to access. */
function AccessConsentIcon() {
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

/* Pulse — activity over time. */
function ActivityIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M2.75 10.5h3l2-4.75 3 9 2.25-5.5h4.25"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
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

/*
 * Routes, labels, `end`, and `requiresVerification` are load-bearing — they
 * match the existing router and the profile gating exactly.
 */
const NAV_GROUPS = [
  {
    label: 'Overview',
    items: [
      { to: '/employee/verification', label: 'Verification', end: true, icon: <VerificationIcon /> },
      { to: '/employee/score', label: 'Employee Score', requiresVerification: true, icon: <ScoreIcon /> },
    ],
  },
  {
    label: 'Profile',
    items: [
      {
        to: '/employee/professional-id',
        label: 'Professional ID',
        requiresVerification: true,
        icon: <ProfessionalIdIcon />,
      },
      { to: '/employee/job-history', label: 'Job History', requiresVerification: true, icon: <JobHistoryIcon /> },
      { to: '/employee/vault', label: 'Document Vault', requiresVerification: true, icon: <VaultIcon /> },
    ],
  },
  {
    label: 'Requests',
    items: [
      { to: '/employee/invitations', label: 'Invitations', icon: <InvitationsIcon /> },
      { to: '/employee/access-requests', label: 'Access Consent', icon: <AccessConsentIcon /> },
    ],
  },
  {
    label: 'Account',
    items: [
      { to: '/employee/activity', label: 'Activity', requiresVerification: true, icon: <ActivityIcon /> },
      { to: '/employee/settings', label: 'Settings', icon: <SettingsIcon /> },
    ],
  },
]

function EmployeeSidebar({ open, onClose, collapsed = false, onToggleCollapse }) {
  const navigate = useNavigate()
  const { profile, logout } = useAuth()
  const verified = profile?.isVerified === true

  const handleSignOut = async () => {
    await logout()
    onClose?.()
    navigate('/employee/login')
  }

  // Resolve gating here so AppSidebar stays portal-agnostic.
  const groups = NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      disabled: item.requiresVerification && !verified,
      disabledHint: 'Complete verification to unlock',
    })),
  }))

  return (
    <AppSidebar
      open={open}
      onClose={onClose}
      collapsed={collapsed}
      onToggleCollapse={onToggleCollapse}
      groups={groups}
      portalLabel="Employee Portal"
      identityName={profile?.name}
      onSignOut={handleSignOut}
      navAriaLabel="Employee"
    />
  )
}

export default EmployeeSidebar

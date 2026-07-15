import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'

function SearchIcon({ className = 'h-[18px] w-[18px]' }) {
  return (
    <svg className={className} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="5.75" stroke="currentColor" strokeWidth="1.5" />
      <path d="M13.25 13.25L17 17" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2.75A4.75 4.75 0 0 1 14.75 7.5v2.75l1.25 2.25H4l1.25-2.25V7.5A4.75 4.75 0 0 1 10 2.75Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M8.25 15.25a1.75 1.75 0 0 0 3.5 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

function PlusIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M8 3.5v9M3.5 8h9" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <path d="M4.5 6.5L8 10l3.5-3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Closes a popover on outside pointerdown or Escape, and restores focus. */
function useDismiss(open, onClose, containerRef, triggerRef) {
  useEffect(() => {
    if (!open) return undefined

    const handlePointerDown = (event) => {
      if (!containerRef.current?.contains(event.target)) onClose()
    }
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        onClose()
        triggerRef.current?.focus()
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, containerRef, triggerRef])
}

const NOTIFICATIONS = [
  { id: 1, title: 'New join request', body: 'Priya Nair requested to join Engineering.', time: '12m', tone: 'info' },
  { id: 2, title: 'Verification approved', body: 'Employment check cleared for Rahul Menon.', time: '1h', tone: 'success' },
  { id: 3, title: 'Invitation expiring', body: '2 invitations expire in 48 hours.', time: '3h', tone: 'warning' },
]

const TONE_DOT = {
  info: 'bg-info',
  success: 'bg-success',
  warning: 'bg-warning',
}

function NotificationsMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  useDismiss(open, () => setOpen(false), containerRef, triggerRef)

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Notifications"
        aria-haspopup="menu"
        aria-expanded={open}
        className={`relative flex h-9 w-9 items-center justify-center rounded-ctl text-ink-muted outline-none transition-colors duration-150 ease-swift hover:bg-ink-strong/[0.04] hover:text-ink-strong focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
          open ? 'bg-ink-strong/[0.04] text-ink-strong' : ''
        }`}
      >
        <BellIcon />
        <span className="absolute right-2 top-2 h-1.5 w-1.5 rounded-full bg-danger ring-2 ring-surface" />
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Notifications"
          className="animate-fade-in absolute right-0 z-50 mt-2 w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg"
        >
          <div className="flex items-center justify-between border-b border-hairline px-4 py-3">
            <p className="m-0 text-sm font-semibold text-ink-strong">Notifications</p>
            <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[11px] font-semibold text-brand-600">
              {NOTIFICATIONS.length} new
            </span>
          </div>
          <ul className="m-0 max-h-80 list-none overflow-y-auto p-0">
            {NOTIFICATIONS.map((n) => (
              <li key={n.id}>
                <button
                  type="button"
                  role="menuitem"
                  className="flex w-full items-start gap-3 border-b border-hairline px-4 py-3 text-left outline-none transition-colors duration-150 ease-swift last:border-b-0 hover:bg-canvas focus-visible:bg-canvas"
                >
                  <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${TONE_DOT[n.tone]}`} />
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-[13px] font-semibold text-ink-strong">{n.title}</span>
                      <span className="shrink-0 text-[11px] text-ink-faint tabular">{n.time}</span>
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{n.body}</span>
                  </span>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-hairline p-2">
            <Link
              to="/enterprise/join-requests"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-ctl px-3 py-2 text-center text-xs font-semibold text-brand-600 no-underline outline-none transition-colors duration-150 ease-swift hover:bg-brand-50 focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              View all
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ProfileMenu({ companyName }) {
  const [open, setOpen] = useState(false)
  const containerRef = useRef(null)
  const triggerRef = useRef(null)
  const navigate = useNavigate()
  const { logout } = useAuth()
  useDismiss(open, () => setOpen(false), containerRef, triggerRef)

  // Same contract as the sidebar's Sign Out: clear session, then redirect.
  const handleSignOut = async () => {
    setOpen(false)
    await logout()
    navigate('/enterprise/login')
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label="Account menu"
        className={`flex items-center gap-2 rounded-ctl py-1 pl-1 pr-1.5 outline-none transition-colors duration-150 ease-swift hover:bg-ink-strong/[0.04] focus-visible:ring-2 focus-visible:ring-brand-500/40 sm:pr-2 ${
          open ? 'bg-ink-strong/[0.04]' : ''
        }`}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-[11px] font-bold text-white">
          HR
        </span>
        <span className="hidden min-w-0 text-left sm:block">
          <span className="block truncate text-xs font-semibold leading-tight text-ink-strong">HR Team</span>
          <span className="block truncate text-[11px] leading-tight text-ink-faint">Admin</span>
        </span>
        <span className="hidden text-ink-faint sm:block">
          <ChevronIcon />
        </span>
      </button>

      {open && (
        <div
          role="menu"
          aria-label="Account"
          className="animate-fade-in absolute right-0 z-50 mt-2 w-56 overflow-hidden rounded-xl border border-hairline bg-surface shadow-lg"
        >
          <div className="border-b border-hairline px-4 py-3">
            <p className="m-0 truncate text-sm font-semibold text-ink-strong">HR Team</p>
            <p className="m-0 mt-0.5 truncate text-xs text-ink-muted">{companyName}</p>
          </div>
          <div className="p-1.5">
            <Link
              to="/enterprise/settings"
              role="menuitem"
              onClick={() => setOpen(false)}
              className="block rounded-ctl px-3 py-2 text-sm font-medium text-ink-body no-underline outline-none transition-colors duration-150 ease-swift hover:bg-canvas hover:text-ink-strong focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              Settings
            </Link>
          </div>
          <div className="border-t border-hairline p-1.5">
            <button
              type="button"
              role="menuitem"
              onClick={handleSignOut}
              className="block w-full rounded-ctl px-3 py-2 text-left text-sm font-medium text-danger outline-none transition-colors duration-150 ease-swift hover:bg-danger-bg focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              Sign Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Surface, not canvas: the navbar and sidebar are one continuous white chrome;
// the grey canvas is the workspace they frame.
// shrink-0 rather than sticky: the layout shell pins it — it never scrolls.
function EnterpriseNavbar({ onMenuClick, companyName = 'Acme Technologies Pvt. Ltd.' }) {
  return (
    <header className="z-30 shrink-0 border-b border-hairline bg-surface">
      <div className="flex h-16 items-center gap-2 px-4 md:gap-3 md:px-6">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-ctl text-ink-body outline-none transition-colors duration-150 ease-swift hover:bg-ink-strong/[0.04] focus-visible:ring-2 focus-visible:ring-brand-500/40 lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>

        <div className="relative hidden w-full max-w-md md:block">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint">
            <SearchIcon />
          </span>
          <input
            type="search"
            placeholder="Search employees, requests…"
            aria-label="Search"
            className="peer h-9 w-full rounded-ctl border border-hairline bg-canvas pl-9 pr-16 text-sm text-ink-strong outline-none transition duration-150 ease-swift placeholder:text-ink-faint hover:border-line focus:border-brand-500 focus:bg-surface focus:ring-2 focus:ring-brand-500/25 [&::-webkit-search-cancel-button]:hidden"
          />
          <kbd className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md border border-hairline bg-surface px-1.5 py-0.5 font-sans text-[11px] font-medium text-ink-faint peer-focus:opacity-0">
            ⌘K
          </kbd>
        </div>

        <div className="ml-auto flex items-center gap-1.5 md:gap-2">
          <button
            type="button"
            className="flex h-9 w-9 items-center justify-center rounded-ctl text-ink-muted outline-none transition-colors duration-150 ease-swift hover:bg-ink-strong/[0.04] hover:text-ink-strong focus-visible:ring-2 focus-visible:ring-brand-500/40 md:hidden"
            aria-label="Search"
          >
            <SearchIcon />
          </button>

          <Link
            to="/enterprise/qr-onboarding"
            className="hidden h-9 items-center gap-1.5 rounded-ctl bg-brand-600 px-3 text-[13px] font-semibold text-white no-underline shadow-xs outline-none transition-colors duration-150 ease-swift hover:bg-brand-700 focus-visible:ring-2 focus-visible:ring-brand-500/40 lg:inline-flex"
          >
            <PlusIcon />
            Invite
          </Link>

          <NotificationsMenu />

          <span aria-hidden="true" className="mx-0.5 hidden h-5 w-px bg-hairline sm:block" />

          <ProfileMenu companyName={companyName} />
        </div>
      </div>
    </header>
  )
}

export default EnterpriseNavbar

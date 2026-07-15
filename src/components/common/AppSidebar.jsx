import { NavLink } from 'react-router-dom'
import BrandLogo from './BrandLogo'

/*
 * The one sidebar. Both portals render this — enterprise and employee only
 * supply their nav groups and identity block, so the chrome can't drift apart.
 *
 * `collapsed` is desktop-only: the mobile drawer always renders full width, so
 * rail styling is applied exclusively at `lg:` and labels are hidden with
 * `lg:hidden` rather than unmounted.
 */

/* Panel with a rail — the bar is the sidebar itself. Chevron shows direction. */
function CollapseIcon({ collapsed }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="2.75" y="3.75" width="14.5" height="12.5" rx="2.25" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7.75 3.75v12.5" stroke="currentColor" strokeWidth="1.5" />
      <path
        d={collapsed ? 'M10.9 8.4l1.6 1.6-1.6 1.6' : 'M13.35 8.4L11.75 10l1.6 1.6'}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

function SignOutIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M7.5 10h9M13 6.5l3.5 3.5-3.5 3.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5 4.75V4a1.25 1.25 0 0 0-1.25-1.25h-5A1.25 1.25 0 0 0 3 4v12a1.25 1.25 0 0 0 1.25 1.25h5A1.25 1.25 0 0 0 10.5 16v-.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <rect x="3.75" y="7" width="8.5" height="6" rx="1.5" stroke="currentColor" strokeWidth="1.4" />
      <path d="M5.75 7V5.25a2.25 2.25 0 0 1 4.5 0V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  )
}

export function Tooltip({ label }) {
  return (
    <span
      role="tooltip"
      className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 hidden -translate-y-1/2 whitespace-nowrap rounded-md bg-ink-strong px-2 py-1 text-xs font-medium text-white opacity-0 shadow-md transition-opacity duration-150 ease-swift group-hover:opacity-100 group-focus-visible:opacity-100 lg:block"
    >
      {label}
    </span>
  )
}

const ROW = 'group relative flex items-center gap-3 rounded-ctl px-3 py-2 text-sm font-medium outline-none'

function NavItem({ item, collapsed, onNavigate }) {
  const rail = collapsed ? 'lg:justify-center lg:px-0' : ''

  // Gated items (employee portal: locked until verification) stay visible but
  // inert — they advertise what unlocks, so they must not read as active.
  if (item.disabled) {
    return (
      <span
        className={`${ROW} cursor-not-allowed text-ink-faint ${rail}`}
        title={item.disabledHint || 'Locked'}
        aria-disabled="true"
      >
        <span className="shrink-0 opacity-60">{item.icon}</span>
        <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
        <span className={`ml-auto shrink-0 opacity-70 ${collapsed ? 'lg:hidden' : ''}`}>
          <LockIcon />
        </span>
        {collapsed && <Tooltip label={item.disabledHint || item.label} />}
      </span>
    )
  }

  return (
    <NavLink
      to={item.to}
      end={item.end}
      onClick={onNavigate}
      className={({ isActive }) =>
        [
          ROW,
          'transition-colors duration-150 ease-swift focus-visible:ring-2 focus-visible:ring-brand-500/40',
          rail,
          isActive
            ? 'bg-brand-50 font-semibold text-brand-600'
            : 'text-ink-body hover:bg-ink-strong/[0.04] hover:text-ink-strong',
        ]
          .filter(Boolean)
          .join(' ')
      }
    >
      {({ isActive }) => (
        <>
          {isActive && (
            <span
              aria-hidden="true"
              className="absolute left-0 top-1/2 h-5 w-[3px] -translate-y-1/2 rounded-r-full bg-brand-600"
            />
          )}
          <span className={`shrink-0 ${isActive ? 'text-brand-600' : 'text-ink-muted group-hover:text-ink-body'}`}>
            {item.icon}
          </span>
          <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>{item.label}</span>
          {collapsed && <Tooltip label={item.label} />}
        </>
      )}
    </NavLink>
  )
}

function AppSidebar({
  open,
  onClose,
  collapsed = false,
  onToggleCollapse,
  groups = [],
  portalLabel,
  identityName,
  onSignOut,
  navAriaLabel = 'Main',
}) {
  return (
    <>
      {open && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-ink-strong/40 backdrop-blur-sm lg:hidden"
          onClick={onClose}
          aria-label="Close menu"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 flex-col border-r border-hairline bg-sidebar transition-[transform,width] duration-200 ease-swift lg:static lg:z-auto lg:translate-x-0 ${
          collapsed ? 'lg:w-16' : 'lg:w-64'
        } ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header height matches the navbar so both hairlines land on one line.
            The collapse toggle lives up here, paired with the logo — it's
            chrome, not an afterthought at the bottom of the nav list. */}
        <div
          className={`flex h-16 shrink-0 items-center gap-2 border-b border-hairline px-4 ${
            collapsed ? 'lg:justify-center lg:px-0' : ''
          }`}
        >
          {/* No white chip — the surface is light, the logo just sits on it. */}
          <span className={`min-w-0 ${collapsed ? 'lg:hidden' : ''}`}>
            <BrandLogo size="sm" />
          </span>

          {/* Desktop-only: the mobile drawer is always full width. */}
          <button
            type="button"
            onClick={onToggleCollapse}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            aria-pressed={collapsed}
            className={`group relative ml-auto hidden h-8 w-8 shrink-0 items-center justify-center rounded-ctl text-ink-faint outline-none transition-colors duration-150 ease-swift hover:bg-ink-strong/[0.04] hover:text-ink-strong focus-visible:ring-2 focus-visible:ring-brand-500/40 lg:flex ${
              collapsed ? 'lg:ml-0' : ''
            }`}
          >
            <CollapseIcon collapsed={collapsed} />
            {collapsed && <Tooltip label="Expand sidebar" />}
          </button>
        </div>

        <div className={`shrink-0 px-6 pb-1 pt-4 ${collapsed ? 'lg:hidden' : ''}`}>
          <p className="m-0 text-[11px] font-semibold uppercase tracking-wider text-ink-faint">{portalLabel}</p>
          {identityName && (
            <p className="mt-0.5 truncate text-sm font-semibold text-ink-strong">{identityName}</p>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={navAriaLabel}>
          {groups.map((group) => (
            <div key={group.label} className="mb-4 last:mb-0">
              <p
                className={`m-0 px-3 pb-1.5 text-[11px] font-semibold uppercase tracking-wider text-ink-faint ${
                  collapsed ? 'lg:hidden' : ''
                }`}
              >
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItem key={item.label} item={item} collapsed={collapsed} onNavigate={onClose} />
                ))}
              </div>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-hairline p-3">
          <button
            type="button"
            onClick={onSignOut}
            aria-label="Sign out"
            className={`${ROW} w-full text-ink-muted transition-colors duration-150 ease-swift hover:bg-danger-bg hover:text-danger focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
              collapsed ? 'lg:justify-center lg:px-0' : ''
            }`}
          >
            <span className="shrink-0">
              <SignOutIcon />
            </span>
            <span className={`truncate ${collapsed ? 'lg:hidden' : ''}`}>Sign Out</span>
            {collapsed && <Tooltip label="Sign Out" />}
          </button>
        </div>
      </aside>
    </>
  )
}

export default AppSidebar

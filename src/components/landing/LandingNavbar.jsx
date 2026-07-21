import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo'
import PortalChooserModal from './PortalChooserModal'
import { LANDING_NAV } from '../../utils/landingData'

function MenuIcon({ open }) {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      {open ? (
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      ) : (
        <>
          <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </>
      )}
    </svg>
  )
}

function LandingNavbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [chooserOpen, setChooserOpen] = useState(false)

  const openChooser = () => {
    setMenuOpen(false)
    setChooserOpen(true)
  }

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [menuOpen])

  return (
    // Floating pill header — the bar is a card that hovers over the page rather
    // than a full-width band welded to the top.
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 md:px-6 md:pt-4">
      <div
        className={`mx-auto flex max-w-7xl items-center justify-between gap-3 rounded-full border px-3 py-2 transition-all duration-300 md:px-4 ${
          scrolled
            ? 'border-slate-200/80 bg-white/85 shadow-lg shadow-slate-900/[0.06] backdrop-blur-xl'
            : 'border-transparent bg-white/60 backdrop-blur-md'
        }`}
      >
        <Link to="/" className="shrink-0 pl-1 no-underline" onClick={() => setMenuOpen(false)}>
          <BrandLogo size="lg" />
        </Link>

        {/* Segmented pill — links sit inside their own track. */}
        <nav
          className="hidden items-center gap-0.5 rounded-full bg-slate-100/80 p-1 lg:flex"
          aria-label="Main"
        >
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="rounded-full px-4 py-2 text-sm font-semibold text-slate-600 no-underline transition hover:bg-white hover:text-[#1e3a8a] hover:shadow-sm"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden shrink-0 items-center gap-1 lg:flex">
          <Link
            to="/employee/login"
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-slate-700 no-underline transition hover:bg-slate-100"
          >
            Log in
          </Link>
          <button
            type="button"
            onClick={openChooser}
            className="rounded-full bg-[#1e3a8a] px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-blue-900/20 transition hover:bg-[#172554]"
          >
            Get started
          </button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen && (
        <div className="mx-auto mt-2 max-w-7xl rounded-3xl border border-slate-200 bg-white p-4 shadow-xl lg:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {LANDING_NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className="rounded-xl px-3 py-3 text-sm font-semibold text-slate-700 no-underline hover:bg-slate-50"
              >
                {item.label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex flex-col gap-2 border-t border-slate-100 pt-3">
            <Link
              to="/employee/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-full border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 no-underline"
            >
              Log in
            </Link>
            <button
              type="button"
              onClick={openChooser}
              className="rounded-full bg-[#1e3a8a] py-3 text-center text-sm font-semibold text-white"
            >
              Get started
            </button>
          </div>
        </div>
      )}

      <PortalChooserModal open={chooserOpen} onClose={() => setChooserOpen(false)} />
    </header>
  )
}

export default LandingNavbar

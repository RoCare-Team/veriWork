import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import BrandLogo from '../common/BrandLogo'
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
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'border-b border-slate-200/80 bg-white/90 shadow-sm backdrop-blur-lg'
          : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-5 md:h-[72px] md:px-8 lg:px-10">
        <Link to="/" className="no-underline" onClick={() => setMenuOpen(false)}>
          <BrandLogo size="sm" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Main">
          {LANDING_NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="text-sm font-semibold text-slate-600 no-underline transition hover:text-[#005fd6]"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Link
            to="/employee/login"
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-700 no-underline transition hover:bg-slate-100"
          >
            Sign in
          </Link>
          <Link
            to="/enterprise/register"
            className="rounded-xl bg-[#005fd6] px-5 py-2.5 text-sm font-semibold text-white no-underline shadow-lg shadow-blue-900/15 transition hover:bg-[#004bab]"
          >
            Get started
          </Link>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 lg:hidden"
          onClick={() => setMenuOpen((v) => !v)}
          aria-expanded={menuOpen}
          aria-label={menuOpen ? 'Close menu' : 'Open menu'}
        >
          <MenuIcon open={menuOpen} />
        </button>
      </div>

      {menuOpen && (
        <div className="border-t border-slate-200 bg-white px-5 py-5 lg:hidden">
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
          <div className="mt-4 flex flex-col gap-2 border-t border-slate-100 pt-4">
            <Link
              to="/employee/login"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl border border-slate-200 py-3 text-center text-sm font-semibold text-slate-700 no-underline"
            >
              Sign in
            </Link>
            <Link
              to="/enterprise/register"
              onClick={() => setMenuOpen(false)}
              className="rounded-xl bg-[#005fd6] py-3 text-center text-sm font-semibold text-white no-underline"
            >
              Get started
            </Link>
          </div>
        </div>
      )}
    </header>
  )
}

export default LandingNavbar

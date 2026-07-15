import { useAuth } from '../../context/AuthContext'

function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <path d="M3 6h16M3 11h16M3 16h16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  )
}

function AdminNavbar({ onMenuClick }) {
  const { user } = useAuth()

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="flex h-16 items-center gap-4 px-4 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={onMenuClick}
          className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-700 hover:bg-slate-100 lg:hidden"
          aria-label="Open menu"
        >
          <MenuIcon />
        </button>

        <div className="min-w-0 flex-1">
          <p className="m-0 text-xs font-medium text-slate-400">PagerLook Platform Admin</p>
          <h1 className="m-0 truncate text-lg font-extrabold text-slate-900">Compliance Console</h1>
        </div>

        <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50 py-1.5 pl-1.5 pr-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-800 text-xs font-bold text-white">
            AD
          </div>
          <div className="hidden sm:block">
            <p className="m-0 text-xs font-bold text-slate-800">{user?.name || 'Admin'}</p>
            <p className="m-0 text-[10px] text-slate-400">Super Admin</p>
          </div>
        </div>
      </div>
    </header>
  )
}

export default AdminNavbar

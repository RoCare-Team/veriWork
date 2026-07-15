import { useState } from 'react'
import EmployeeSidebar from '../components/employee/Sidebar'
import EmployeeNavbar from '../components/employee/Navbar'
import useSidebarCollapsed from '../hooks/useSidebarCollapsed'

function EmployeeLayout({ children, footer, fullWidth = false }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, toggleCollapsed] = useSidebarCollapsed()

  const contentWidth = fullWidth
    ? 'mx-auto w-full max-w-[1600px] px-4 py-5 pb-24 md:px-6 md:py-8 lg:px-8 lg:py-8'
    : 'mx-auto w-full max-w-6xl px-4 py-5 pb-24 md:px-6 md:py-8 lg:px-8 lg:py-8 xl:max-w-7xl'

  /*
   * Fixed viewport shell — mirrors EnterpriseLayout. `fixed inset-0` rather
   * than h-dvh: it takes the shell out of flow entirely, so the document has no
   * height and cannot grow a second scrollbar behind <main>. Height-based
   * containment kept leaking one.
   */
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-canvas">
      <EmployeeSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />

      <div className="flex min-w-0 min-h-0 flex-1 flex-col overflow-hidden">
        <EmployeeNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className={contentWidth}>{children}</div>
        </main>

        {footer && (
          <footer className="shrink-0 border-t border-hairline bg-surface px-4 py-4 md:px-6 lg:px-8">
            <div className={fullWidth ? 'mx-auto w-full max-w-[1600px]' : 'mx-auto w-full max-w-6xl xl:max-w-7xl'}>
              {footer}
            </div>
          </footer>
        )}
      </div>
    </div>
  )
}

export default EmployeeLayout

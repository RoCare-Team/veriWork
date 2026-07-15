import { useState } from 'react'
import Sidebar from '../components/enterprise/Sidebar'
import EnterpriseNavbar from '../components/enterprise/Navbar'
import useSidebarCollapsed from '../hooks/useSidebarCollapsed'
import { useAuth } from '../context/AuthContext'

function EnterpriseLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [collapsed, toggleCollapsed] = useSidebarCollapsed()
  const { company } = useAuth()
  const companyName = company?.name || 'Your Company'

  /*
   * Fixed viewport shell. `fixed inset-0` rather than a height: it takes the
   * shell out of flow entirely, so the document has no height and cannot grow a
   * second scrollbar behind <main>, which is the only scroll container.
   * (min-h-screen grew to fit content and scrolled the whole window; h-dvh
   * still leaked a document scrollbar.)
   */
  return (
    <div className="fixed inset-0 flex overflow-hidden bg-canvas">
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
      />

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <EnterpriseNavbar companyName={companyName} onMenuClick={() => setSidebarOpen(true)} />
        <main className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
          <div className="mx-auto w-full max-w-[1600px]">{children}</div>
        </main>
      </div>
    </div>
  )
}

export default EnterpriseLayout

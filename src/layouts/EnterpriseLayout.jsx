import { useState } from 'react'
import Sidebar from '../components/enterprise/Sidebar'
import EnterpriseNavbar from '../components/enterprise/Navbar'
import { getCompanyName } from '../store/onboardingStore'

function EnterpriseLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const companyName = getCompanyName()

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <EnterpriseNavbar
          companyName={companyName}
          onMenuClick={() => setSidebarOpen(true)}
        />
        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

export default EnterpriseLayout

import { useState } from 'react'
import EmployeeSidebar from '../components/employee/Sidebar'
import EmployeeNavbar from '../components/employee/Navbar'

function EmployeeLayout({ children, footer }) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex min-h-screen bg-slate-50">
      <EmployeeSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <EmployeeNavbar onMenuClick={() => setSidebarOpen(true)} />

        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-6xl px-4 py-5 pb-24 md:px-6 md:py-8 lg:px-8 lg:py-8 xl:max-w-7xl">
            {children}
          </div>
        </main>

        {footer && (
          <footer className="border-t border-slate-100 bg-white px-4 py-4 md:px-6 lg:px-8">
            <div className="mx-auto w-full max-w-6xl xl:max-w-7xl">{footer}</div>
          </footer>
        )}
      </div>
    </div>
  )
}

export default EmployeeLayout

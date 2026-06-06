import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import EnterpriseLogin from '../pages/auth/EnterpriseLogin'
import BusinessBasicInfo from '../pages/auth/BusinessBasicInfo'
import CompanyVerification from '../pages/auth/CompanyVerification'
import ReviewSubmission from '../pages/auth/ReviewSubmission'
import Dashboard from '../pages/enterprise/Dashboard'
import Workforce from '../pages/enterprise/Workforce'
import JoinRequests from '../pages/enterprise/JoinRequests'
import QROnboarding from '../pages/enterprise/QROnboarding'
import Settings from '../pages/enterprise/Settings'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/enterprise/login" replace />} />
        <Route path="/enterprise/login" element={<EnterpriseLogin />} />

        {/* Onboarding */}
        <Route path="/enterprise/register" element={<BusinessBasicInfo />} />
        <Route path="/enterprise/verify" element={<CompanyVerification />} />
        <Route path="/enterprise/verification" element={<Navigate to="/enterprise/verify" replace />} />
        <Route path="/enterprise/review" element={<ReviewSubmission />} />

        {/* Enterprise Portal */}
        <Route path="/enterprise/dashboard" element={<Dashboard />} />
        <Route path="/enterprise/workforce" element={<Workforce />} />
        <Route path="/enterprise/join-requests" element={<JoinRequests />} />
        <Route path="/enterprise/qr-onboarding" element={<QROnboarding />} />
        <Route path="/enterprise/settings" element={<Settings />} />

        <Route path="*" element={<Navigate to="/enterprise/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

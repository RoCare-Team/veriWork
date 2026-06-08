import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import EnterpriseLogin from '../pages/auth/EnterpriseLogin'
import BusinessBasicInfo from '../pages/auth/BusinessBasicInfo'
import CompanyVerification from '../pages/auth/CompanyVerification'
import ReviewSubmission from '../pages/auth/ReviewSubmission'
import Dashboard from '../pages/enterprise/Dashboard'
import Workforce from '../pages/enterprise/Workforce'
import JoinRequests from '../pages/enterprise/JoinRequests'
import QROnboarding from '../pages/enterprise/QROnboarding'
import Settings from '../pages/enterprise/Settings'
import EmployeeWelcome from '../pages/employee/EmployeeWelcome'
import EmployeeLogin from '../pages/employee/EmployeeLogin'
import ProfileSetup from '../pages/employee/ProfileSetup'
import IdentityVerification from '../pages/employee/IdentityVerification'
import AadhaarVerification from '../pages/employee/AadhaarVerification'
import BiometricLiveness from '../pages/employee/BiometricLiveness'
import EmployeeScore from '../pages/employee/EmployeeScore'
import ProfessionalId from '../pages/employee/ProfessionalId'
import JobHistory from '../pages/employee/JobHistory'
import AddExperience from '../pages/employee/AddExperience'
import DocumentVault from '../pages/employee/DocumentVault'
import Activity from '../pages/employee/Activity'
import EmployeeSettings from '../pages/employee/EmployeeSettings'
import PrivacySecurity from '../pages/employee/PrivacySecurity'
import Support from '../pages/employee/Support'
import {
  EmployeeGuestGuard,
  EmployeePortalGuard,
  EnterpriseGuestGuard,
  EnterprisePortalGuard,
} from './guards'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Enterprise — auth & onboarding (guest) */}
        <Route element={<EnterpriseGuestGuard />}>
          <Route path="/enterprise/login" element={<EnterpriseLogin />} />
        </Route>
        <Route path="/enterprise/register" element={<BusinessBasicInfo />} />
        <Route path="/enterprise/verify" element={<CompanyVerification />} />
        <Route path="/enterprise/verification" element={<Navigate to="/enterprise/verify" replace />} />
        <Route path="/enterprise/review" element={<ReviewSubmission />} />

        {/* Enterprise — portal (protected) */}
        <Route element={<EnterprisePortalGuard />}>
          <Route path="/enterprise/dashboard" element={<Dashboard />} />
          <Route path="/enterprise/workforce" element={<Workforce />} />
          <Route path="/enterprise/join-requests" element={<JoinRequests />} />
          <Route path="/enterprise/qr-onboarding" element={<QROnboarding />} />
          <Route path="/enterprise/settings" element={<Settings />} />
        </Route>

        {/* Employee — welcome & login (guest) */}
        <Route element={<EmployeeGuestGuard />}>
          <Route path="/employee" element={<EmployeeWelcome />} />
          <Route path="/employee/login" element={<EmployeeLogin />} />
        </Route>

        {/* Employee — portal (protected) */}
        <Route element={<EmployeePortalGuard />}>
          <Route path="/employee/profile-setup" element={<ProfileSetup />} />
          <Route path="/employee/verification" element={<IdentityVerification />} />
          <Route path="/employee/verification/aadhaar" element={<AadhaarVerification />} />
          <Route path="/employee/verification/biometric" element={<BiometricLiveness />} />
          <Route path="/employee/score" element={<EmployeeScore />} />
          <Route path="/employee/professional-id" element={<ProfessionalId />} />
          <Route path="/employee/job-history" element={<JobHistory />} />
          <Route path="/employee/job-history/add" element={<AddExperience />} />
          <Route path="/employee/vault" element={<DocumentVault />} />
          <Route path="/employee/activity" element={<Activity />} />
          <Route path="/employee/settings" element={<EmployeeSettings />} />
          <Route path="/employee/settings/privacy" element={<PrivacySecurity />} />
          <Route path="/employee/settings/support" element={<Support />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes

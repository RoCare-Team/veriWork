import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Home from '../pages/Home'
import EnterpriseLogin from '../pages/auth/EnterpriseLogin'
import BusinessBasicInfo from '../pages/auth/BusinessBasicInfo'
import CompanyVerification from '../pages/auth/CompanyVerification'
import ReviewSubmission from '../pages/auth/ReviewSubmission'
import PendingApproval from '../pages/enterprise/PendingApproval'
import ApplicationRejected from '../pages/enterprise/ApplicationRejected'
import Dashboard from '../pages/enterprise/Dashboard'
import Workforce from '../pages/enterprise/Workforce'
import JoinRequests from '../pages/enterprise/JoinRequests'
import QROnboarding from '../pages/enterprise/QROnboarding'
import Settings from '../pages/enterprise/Settings'
import TeamManagement from '../pages/enterprise/TeamManagement'
import DepartmentDetails from '../pages/enterprise/DepartmentDetails'
import EmployeeProfilePage from '../pages/enterprise/EmployeeProfilePage'
import AccessRequests from '../pages/enterprise/AccessRequests'
import CompanyInsights from '../pages/enterprise/CompanyInsights'
import EmploymentVerification from '../pages/enterprise/EmploymentVerification'
import AuditLogs from '../pages/enterprise/AuditLogs'
import AdminLogin from '../pages/admin/AdminLogin'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminCompanies from '../pages/admin/AdminCompanies'
import AdminCompanyReview from '../pages/admin/AdminCompanyReview'
import EmployeeWelcome from '../pages/employee/EmployeeWelcome'
import EmployeeJoin from '../pages/employee/EmployeeJoin'
import EmployeeOtp from '../pages/employee/EmployeeOtp'
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
import EmployeeInvitations from '../pages/employee/EmployeeInvitations'
import EmployeeAccessConsent from '../pages/employee/EmployeeAccessConsent'
import EmployeeSettings from '../pages/employee/EmployeeSettings'
import PrivacySecurity from '../pages/employee/PrivacySecurity'
import Support from '../pages/employee/Support'
import {
  AdminGuestGuard,
  AdminPortalGuard,
  EmployeeGuestGuard,
  EmployeePortalGuard,
  EnterpriseApprovedGuard,
  EnterpriseAuthGuard,
  EnterpriseGuestGuard,
} from './guards'

function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Public employee join — no auth */}
        <Route path="/employee/join" element={<EmployeeJoin />} />

        {/* Admin */}
        <Route element={<AdminGuestGuard />}>
          <Route path="/admin/login" element={<AdminLogin />} />
        </Route>
        <Route element={<AdminPortalGuard />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/companies/approved" element={<AdminCompanies status="approved" />} />
          <Route path="/admin/companies/rejected" element={<AdminCompanies status="rejected" />} />
          <Route path="/admin/companies/all" element={<AdminCompanies status="all" />} />
          <Route path="/admin/companies/:id" element={<AdminCompanyReview />} />
          <Route path="/admin/companies" element={<AdminCompanies status="submitted" />} />
          <Route path="/admin/enterprise-approvals" element={<Navigate to="/admin/companies" replace />} />
        </Route>

        {/* Enterprise — guest */}
        <Route element={<EnterpriseGuestGuard />}>
          <Route path="/enterprise/login" element={<EnterpriseLogin />} />
        </Route>
        <Route path="/enterprise/register" element={<BusinessBasicInfo />} />

        {/* Enterprise — authenticated (onboarding + approval status) */}
        <Route element={<EnterpriseAuthGuard />}>
          <Route path="/enterprise/verify" element={<CompanyVerification />} />
          <Route path="/enterprise/verification" element={<Navigate to="/enterprise/verify" replace />} />
          <Route path="/enterprise/review" element={<ReviewSubmission />} />
          <Route path="/enterprise/pending-approval" element={<PendingApproval />} />
          <Route path="/enterprise/rejected" element={<ApplicationRejected />} />
          <Route path="/enterprise/application-rejected" element={<Navigate to="/enterprise/rejected" replace />} />
        </Route>

        {/* Enterprise — approved only (dashboard) */}
        <Route element={<EnterpriseApprovedGuard />}>
          <Route path="/enterprise/dashboard" element={<Dashboard />} />
          <Route path="/company/team">
            <Route index element={<TeamManagement />} />
            <Route path="department/:department" element={<DepartmentDetails />} />
            <Route path=":employeeId" element={<EmployeeProfilePage />} />
          </Route>
          <Route path="/company/access-requests" element={<AccessRequests />} />
          <Route path="/company/verification" element={<EmploymentVerification />} />
          <Route path="/company/insights" element={<CompanyInsights />} />
          <Route path="/company/audit-logs" element={<AuditLogs />} />
          <Route path="/enterprise/team">
            <Route index element={<TeamManagement />} />
            <Route path="department/:department" element={<DepartmentDetails />} />
            <Route path=":employeeId" element={<EmployeeProfilePage />} />
          </Route>
          <Route path="/enterprise/access-requests" element={<AccessRequests />} />
          <Route path="/enterprise/insights" element={<CompanyInsights />} />
          <Route path="/enterprise/workforce" element={<Workforce />} />
          <Route path="/enterprise/join-requests" element={<JoinRequests />} />
          <Route path="/enterprise/qr-onboarding" element={<QROnboarding />} />
          <Route path="/enterprise/settings" element={<Settings />} />
        </Route>

        {/* Employee — guest */}
        <Route element={<EmployeeGuestGuard />}>
          <Route path="/employee" element={<EmployeeWelcome />} />
          <Route path="/employee/otp" element={<EmployeeOtp />} />
          <Route path="/employee/login" element={<Navigate to="/employee/otp" replace />} />
        </Route>

        {/* Employee — portal */}
        <Route element={<EmployeePortalGuard />}>
          <Route path="/employee/profile-setup" element={<ProfileSetup />} />
          <Route path="/employee/dashboard" element={<Navigate to="/employee/score" replace />} />
          <Route path="/employee/verification" element={<IdentityVerification />} />
          <Route path="/employee/verification/aadhaar" element={<AadhaarVerification />} />
          <Route path="/employee/verification/biometric" element={<BiometricLiveness />} />
          <Route path="/employee/score" element={<EmployeeScore />} />
          <Route path="/employee/professional-id" element={<ProfessionalId />} />
          <Route path="/employee/job-history" element={<JobHistory />} />
          <Route path="/employee/job-history/add" element={<AddExperience />} />
          <Route path="/employee/vault" element={<DocumentVault />} />
          <Route path="/employee/invitations" element={<EmployeeInvitations />} />
          <Route path="/employee/access-requests" element={<EmployeeAccessConsent />} />
          <Route path="/employee/access-consent" element={<Navigate to="/employee/access-requests" replace />} />
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

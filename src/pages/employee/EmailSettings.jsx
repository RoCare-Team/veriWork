import { Link } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SmtpSettingsSection from '../../components/employee/SmtpSettingsSection'

function EmailSettings() {
  return (
    <EmployeeLayout>
      <EmployeePageHeader
        title="Email & Verification Sending"
        subtitle="Send employment verification requests from your own mailbox"
        action={
          <Link
            to="/employee/settings"
            className="text-sm font-semibold text-[#1e3a8a] no-underline"
          >
            ← Back
          </Link>
        }
      />

      <div className="space-y-6">
        <div className="rounded-2xl border border-blue-100 bg-blue-50/60 p-4 text-sm text-slate-700 md:p-5">
          <p className="m-0 font-semibold text-[#1e3a8a]">How self-verification works</p>
          <ol className="m-0 mt-2 list-decimal space-y-1 pl-4 text-xs text-slate-600">
            <li>You request verification of a past job from Job History.</li>
            <li>A secure request email is sent from your mailbox to your previous HR.</li>
            <li>HR fills the response — it is locked and cannot be edited afterwards.</li>
            <li>The response is analysed and attached to that experience for future employers.</li>
          </ol>
        </div>

        <SmtpSettingsSection />

        <Link
          to="/employee/settings"
          className="inline-block text-sm font-semibold text-[#1e3a8a] no-underline hover:underline"
        >
          ← Back to Settings
        </Link>
      </div>
    </EmployeeLayout>
  )
}

export default EmailSettings

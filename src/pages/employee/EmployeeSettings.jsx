import { Link } from 'react-router-dom'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SettingsRow from '../../components/employee/SettingsRow'
import Toggle from '../../components/employee/Toggle'
import { ShieldCheckIcon } from '../../components/common/Icons'
import { getEmployeeData, getEmployeeProfile } from '../../store/employeeStore'

function UserIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="7" r="3.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4.5 17c0-3 2.5-5 5.5-5s5.5 2 5.5 5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="4.5" y="9" width="11" height="8" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M7 9V6.5a3 3 0 0 1 6 0V9" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path d="M10 3a5 5 0 0 1 5 5v3l1.5 2.5H3.5L5 11V8a5 5 0 0 1 5-5Z" stroke="currentColor" strokeWidth="1.5" />
      <path d="M8.5 16a1.5 1.5 0 0 0 3 0" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function LangIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="7.5" stroke="currentColor" strokeWidth="1.5" />
      <path d="M3 10h14M10 3c2 2.5 2 11.5 0 14M10 3c-2 2.5-2 11.5 0 14" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

function EmployeeSettings() {
  const { profilePhoto } = getEmployeeData()
  const profile = getEmployeeProfile()

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Settings & Support" subtitle="Manage your account and preferences" />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {profilePhoto ? (
              <img src={profilePhoto} alt={profile.name} className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#1a3a8f] text-xl font-bold text-white md:h-20 md:w-20">
                {profile.initials}
              </div>
            )}
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="flex-1">
            <p className="m-0 text-lg font-extrabold text-[#1a3a8f] md:text-xl">{profile.name}</p>
            <p className="m-0 mt-0.5 text-sm text-slate-500 md:text-base">{profile.role}</p>
            <p className="m-0 mt-1 text-xs text-slate-400">{profile.veriworkId}</p>
            <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
              <ShieldCheckIcon className="h-3.5 w-3.5" />
              VeriScore {profile.employeeScore}
            </span>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#1a3a8f] transition hover:bg-blue-100"
            aria-label="Edit profile"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M12 3.5l2.5 2.5-8 8H4v-2.5l8-8Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </button>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="m-0 mb-4 text-sm font-bold text-[#1a3a8f] md:text-base">Account & Security</h2>
        <div className="flex flex-col gap-3">
          <SettingsRow
            icon={<UserIcon />}
            title="Personal Information"
            subtitle="Name, Email, Phone"
            to="/employee/professional-id"
          />
          <SettingsRow
            icon={<LockIcon />}
            title="Privacy & Security"
            subtitle="Consent, 2FA, Sessions"
            to="/employee/settings/privacy"
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="m-0 mb-4 text-sm font-bold text-[#1a3a8f] md:text-base">Preferences</h2>
        <div className="flex flex-col gap-3">
          <SettingsRow
            icon={<BellIcon />}
            title="Notification Settings"
            subtitle="Push, Email, Alerts"
          />
          <SettingsRow
            icon={<LangIcon />}
            title="Language"
            subtitle="English (US)"
          />
          <Toggle
            id="dark-mode"
            label="Email Notifications"
            checked
            onChange={() => {}}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="m-0 mb-4 text-sm font-bold text-[#1a3a8f] md:text-base">Support & Resources</h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:max-w-lg">
          <Link
            to="/employee/settings/support"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm no-underline transition hover:border-slate-200 hover:shadow-md"
          >
            <svg className="h-8 w-8 text-[#1a3a8f]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9.5 9.5a3 3 0 0 1 4.2 0M9 15h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="mt-2 text-sm font-semibold text-slate-800">FAQ</span>
          </Link>
          <Link
            to="/employee/settings/support"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm no-underline transition hover:border-slate-200 hover:shadow-md"
          >
            <svg className="h-8 w-8 text-[#1a3a8f]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 6h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H9l-4 3V8a2 2 0 0 1 2-2Z" stroke="currentColor" strokeWidth="1.6" />
            </svg>
            <span className="mt-2 text-sm font-semibold text-slate-800">Live Chat</span>
          </Link>
        </div>
      </section>
    </EmployeeLayout>
  )
}

export default EmployeeSettings

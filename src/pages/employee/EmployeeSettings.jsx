import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import EmployeeLayout from '../../layouts/EmployeeLayout'
import EmployeePageHeader from '../../components/employee/PageHeader'
import SettingsRow from '../../components/employee/SettingsRow'
import Toggle from '../../components/employee/Toggle'
import Loader from '../../components/common/Loader'
import { ShieldCheckIcon } from '../../components/common/Icons'
import { employeeKeys, fetchProfile, fetchSettings, updateSettings } from '../../api/employee'
import { useToast } from '../../context/ToastContext'
import { mediaUrl } from '../../lib/mediaUrl'

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

function MailIcon() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="1.5" />
      <path d="M4 6l6 4.5L16 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
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
  const queryClient = useQueryClient()
  const { toast } = useToast()
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: employeeKeys.profile,
    queryFn: fetchProfile,
  })
  const { data: settings, isLoading: settingsLoading } = useQuery({
    queryKey: employeeKeys.settings,
    queryFn: fetchSettings,
  })
  const [language, setLanguage] = useState('en-US')

  const patchMutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: employeeKeys.settings })
      toast('Settings updated', 'success')
    },
    onError: (err) => toast(err.message || 'Failed to update settings', 'error'),
  })

  const handleToggle = (field) => (checked) => {
    if (!settings) return
    patchMutation.mutate({
      notificationsEnabled: field === 'notificationsEnabled' ? checked : settings.notificationsEnabled,
      publicProfileEnabled: field === 'publicProfileEnabled' ? checked : settings.publicProfileEnabled,
      language: settings.language || language,
    })
  }

  const handleLanguageChange = (nextLanguage) => {
    setLanguage(nextLanguage)
    if (!settings) return
    patchMutation.mutate({
      notificationsEnabled: settings.notificationsEnabled ?? true,
      publicProfileEnabled: settings.publicProfileEnabled ?? true,
      language: nextLanguage,
    })
  }

  if (profileLoading || settingsLoading) {
    return <Loader variant="fullPage" label="Loading settings..." />
  }

  const photo = mediaUrl(profile?.photoUrl)
  const currentLanguage = settings?.language || language

  return (
    <EmployeeLayout>
      <EmployeePageHeader title="Settings & Support" subtitle="Manage your account and preferences" />

      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm md:p-6">
        <div className="flex items-center gap-4">
          <div className="relative">
            {photo ? (
              <img src={photo} alt={profile?.name} className="h-16 w-16 rounded-full object-cover md:h-20 md:w-20" />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[#005fd6] text-xl font-bold text-white md:h-20 md:w-20">
                {profile?.initials}
              </div>
            )}
            <span className="absolute bottom-0.5 right-0.5 h-3.5 w-3.5 rounded-full border-2 border-white bg-green-500" />
          </div>
          <div className="flex-1">
            <p className="m-0 text-lg font-extrabold text-[#005fd6] md:text-xl">{profile?.name}</p>
            <p className="m-0 mt-0.5 text-sm text-slate-500 md:text-base">{profile?.role}</p>
            <p className="m-0 mt-1 text-xs text-slate-400">{settings?.veriworkId || profile?.veriworkId}</p>
            {profile?.employeeScore != null && (
              <span className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                <ShieldCheckIcon className="h-3.5 w-3.5" />
                VeriScore {profile.employeeScore}
              </span>
            )}
          </div>
          <Link
            to="/employee/profile-setup"
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-[#005fd6] transition hover:bg-blue-100"
            aria-label="Edit profile"
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M12 3.5l2.5 2.5-8 8H4v-2.5l8-5Z" stroke="currentColor" strokeWidth="1.5" />
            </svg>
          </Link>
        </div>
      </div>

      <section className="mt-8">
        <h2 className="m-0 mb-4 text-sm font-bold text-[#005fd6] md:text-base">Account & Security</h2>
        <div className="flex flex-col gap-3">
          <SettingsRow icon={<UserIcon />} title="Personal Information" subtitle="Name, Email, Phone" to="/employee/professional-id" />
          <SettingsRow icon={<MailIcon />} title="Email & Verification Sending" subtitle="SMTP mailbox for self-verification" to="/employee/settings/email" />
          <SettingsRow icon={<LockIcon />} title="Privacy & Security" subtitle="Consent, 2FA, Sessions" to="/employee/settings/privacy" />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="m-0 mb-4 text-sm font-bold text-[#005fd6] md:text-base">Preferences</h2>
        <div className="flex flex-col gap-3">
          <Toggle
            id="notifications-enabled"
            icon={<BellIcon />}
            label="Notification Settings"
            checked={settings?.notificationsEnabled ?? true}
            onChange={handleToggle('notificationsEnabled')}
          />
          <div className="flex items-center justify-between rounded-2xl border border-slate-100 bg-white p-4 shadow-sm md:p-5">
            <div className="flex items-center gap-3.5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
                <LangIcon />
              </div>
              <div>
                <p className="m-0 text-sm font-bold text-slate-900 md:text-base">Language</p>
                <p className="m-0 mt-0.5 text-xs text-slate-500 md:text-sm">Preferred app language</p>
              </div>
            </div>
            <select
              value={currentLanguage}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="en-US">English (US)</option>
              <option value="en-IN">English (India)</option>
              <option value="hi-IN">Hindi</option>
            </select>
          </div>
          <Toggle
            id="public-profile-enabled"
            label="Public Profile Visibility"
            icon={<UserIcon />}
            checked={settings?.publicProfileEnabled ?? true}
            onChange={handleToggle('publicProfileEnabled')}
          />
        </div>
      </section>

      <section className="mt-8">
        <h2 className="m-0 mb-4 text-sm font-bold text-[#005fd6] md:text-base">Support & Resources</h2>
        <div className="grid grid-cols-2 gap-3 md:gap-4 lg:max-w-lg">
          <Link
            to="/employee/settings/support"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm no-underline transition hover:border-slate-200 hover:shadow-md"
          >
            <svg className="h-8 w-8 text-[#005fd6]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6" />
              <path d="M9.5 9.5a3 3 0 0 1 4.2 0M9 15h6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
            <span className="mt-2 text-sm font-semibold text-slate-800">FAQ</span>
          </Link>
          <Link
            to="/employee/settings/support"
            className="flex flex-col items-center justify-center rounded-2xl border border-slate-100 bg-white p-6 text-center shadow-sm no-underline transition hover:border-slate-200 hover:shadow-md"
          >
            <svg className="h-8 w-8 text-[#005fd6]" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
